import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { RegisterDomain, RegisterDBInfo } from '../domain/register';
import Ajv from 'ajv';
import { logger } from '../logger';

// validator lib
const ajv = new Ajv();

interface Response {
    message: string
}

export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer, context: Context): Promise<APIGatewayProxyResultV2> => {

    process.env.AWS_REQUESTID = context.awsRequestId;
    logger.defaultMeta = { requestId: context.awsRequestId };
    logger.info(event);

    // bodyがあることを確認
    if (!event.body) {
        logger.error('body param is not found.');
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Parameter is invalid.',
            } as Response),
        };
    }

    // bodyのスキーマを定義
    const bodySchema = {
        required: ['title', 'description'],
        type: 'object',
        properties: {
            title: {
                type: 'string',
            },
            description: {
                type: 'string',
            }
        }
    }

    // bodyのスキーマが正しいことを確認
    let body;
    try {
        body = JSON.parse(event.body!)
    } catch (err) {
        logger.error('JSON parse error');
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Parameter is invalid.',
            } as Response),
        };
    }
    logger.info({ message: 'body', data: body });
    const validate = ajv.compile(bodySchema);
    const valid = validate(body);
    logger.info({ message: 'validation result: ', isValid: valid });

    if (!valid) {
        logger.error({ message: 'validation error, ', validateError: validate.errors });
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Parameter is invalid.',
            } as Response),
        };
    }

    // もしauthorizationヘッダがなかったら403を返す（ここに到達した時点では確実にあるはずだが一応）
    if (!event.headers.authorization) {
        logger.error('authorization header is not found.')
        return {
            statusCode: 401,
            body: JSON.stringify({
                message: 'Unauthorized.',
            } as Response),
        };
    }

    // もしパスパラメタがなかったら400を返す
    if (!event.pathParameters) {
        logger.error('path parameter is not found');
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Parameter is invalid.',
            } as Response),
        };
    }

    // パスパラメタのusernameがなかったら400を返す
    if (!event.pathParameters.username) {
        logger.error('path parameter username is not found');
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Parameter is invalid.',
            } as Response),
        };
    }

    // パスパラメタのusernameとjwtトークンに含まれるusernameが一致しなかったら400を返す
    if (event.pathParameters.username !== (event.requestContext.authorizer.jwt.claims.username)) {
        logger.error('authentication info is invalid.')
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Parameter is invalid.',
            } as Response),
        };
    }

    // TODOの登録に必要な情報を揃える
    const registerInfo: RegisterDBInfo = {
        username: (event.pathParameters!).username as string,
        title: JSON.parse(event.body!).title,
        description: JSON.parse(event.body!).description,
    }

    logger.info({ message: 'registerInfo', data: registerInfo });
    try {
        await RegisterDomain.registerTodo(registerInfo);
    }
    catch (err) {
        logger.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal Server Error.',
            } as Response)
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'OK',
        } as Response),
    };
};