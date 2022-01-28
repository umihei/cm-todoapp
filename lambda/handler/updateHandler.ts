import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { UpdateDomain, UpdateDBInfo } from '../domain/update';
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
    logger.info({ message: 'incoming event', data: event });

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
    const body = JSON.parse(event.body!)
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

    // パスパラメタのtodoidがなかったら400を返す
    if (!event.pathParameters.todoid) {
        logger.error('path parameter todoid is not found');
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Parameter is invalid.',
            } as Response),
        };
    }

    // TODOの更新に必要な情報を揃える
    const updateInfo: UpdateDBInfo = {
        username: event.pathParameters.username,
        todoid: event.pathParameters.todoid,
        title: JSON.parse(event.body).title,
        description: JSON.parse(event.body).description,
    }

    logger.info({ message: 'updateInfo', data: updateInfo });
    try {
        await UpdateDomain.updateTodo(updateInfo);
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