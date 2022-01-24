import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { RegisterDomain, RegisterDBInfo } from '../domain/register';
import Ajv from 'ajv';
import * as winston from 'winston';

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss"
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
    ],
});

// validator lib
const ajv = new Ajv();

interface Response {
    message: string
}

export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer, context: Context): Promise<APIGatewayProxyResultV2> => {

    logger.defaultMeta = { requestId: context.awsRequestId };
    logger.info(event);

    // // bodyがあることを確認
    // if (!event.body) {
    //     logger.error('body param is not found.');
    //     return {
    //         statusCode: 400,
    //         body: JSON.stringify({
    //             message: 'Parameter is invalid.',
    //         } as Response),
    //     };
    // }

    // // bodyのスキーマを定義
    // const bodySchema = {
    //     required: ['title', 'description'],
    //     type: 'object',
    //     properties: {
    //         title: {
    //             type: 'string',
    //         },
    //         description: {
    //             type: 'string',
    //         }
    //     }
    // }

    // // bodyのスキーマが正しいことを確認
    // let body;
    // try {
    //     body = JSON.parse(event.body!)
    // } catch (err) {
    //     logger.error('JSON parse error');
    //     return {
    //         statusCode: 400,
    //         body: JSON.stringify({
    //             message: 'Parameter is invalid.',
    //         } as Response),
    //     };
    // }
    // logger.info(body);
    // const validate = ajv.compile(bodySchema);
    // const valid = validate(body);
    // logger.info('validation result: ' + valid);

    // if (!valid) {
    //     console.error('validation error, ', validate.errors);
    //     return {
    //         statusCode: 400,
    //         body: JSON.stringify({
    //             message: 'Parameter is invalid.',
    //         } as Response),
    //     };
    // }

    // // もしauthorizationヘッダがなかったら403を返す（ここに到達した時点では確実にあるはずだが一応）
    // if (!event.headers.authorization) {
    //     console.error('authorization header is not found.')
    //     return {
    //         statusCode: 401,
    //         body: JSON.stringify({
    //             message: 'Unauthorized.',
    //         } as Response),
    //     };
    // }

    // // もしパスパラメタがなかったら400を返す
    // if (!event.pathParameters) {
    //     console.error('path parameter is not found');
    //     return {
    //         statusCode: 400,
    //         body: JSON.stringify({
    //             message: 'Parameter is invalid.',
    //         } as Response),
    //     };
    // }

    // // パスパラメタのusernameがなかったら400を返す
    // if (!event.pathParameters.username) {
    //     console.error('path parameter username is not found');
    //     return {
    //         statusCode: 400,
    //         body: JSON.stringify({
    //             message: 'Parameter is invalid.',
    //         } as Response),
    //     };
    // }

    // // パスパラメタのusernameとjwtトークンに含まれるusernameが一致しなかったら400を返す
    // if (event.pathParameters.username !== (event.requestContext.authorizer.jwt.claims.username)) {
    //     console.error('authentication info is invalid.')
    //     return {
    //         statusCode: 400,
    //         body: JSON.stringify({
    //             message: 'Parameter is invalid.',
    //         } as Response),
    //     };
    // }

    // // TODOの登録に必要な情報を揃える
    // const registerInfo: RegisterDBInfo = {
    //     username: (event.pathParameters!).username as string,
    //     title: JSON.parse(event.body!).title,
    //     description: JSON.parse(event.body!).description,
    // }

    // console.log('registerInfo, ', registerInfo);
    // try {
    //     await RegisterDomain.registerTodo(registerInfo);
    // }
    // catch (err) {
    //     console.error(err);
    //     return {
    //         statusCode: 500,
    //         body: JSON.stringify({
    //             message: 'Internal Server Error.',
    //         } as Response)
    //     }
    // }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'OK',
        } as Response),
    };
};