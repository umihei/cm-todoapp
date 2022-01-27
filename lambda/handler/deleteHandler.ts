import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { DeleteDomain, DeleteDBInfo } from '../domain/delete';
import { logger } from '../logger';

interface Response {
    message: string
}

export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer, context: Context): Promise<APIGatewayProxyResultV2> => {

    process.env.AWS_REQUESTID = context.awsRequestId;
    logger.defaultMeta = { requestId: context.awsRequestId };
    logger.info({ message: 'incoming event', data: event });

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

    // TODOの検索に必要な情報を揃える
    const deleteDBInfo: DeleteDBInfo = {
        username: event.pathParameters.username,
        todoid: event.pathParameters.todoid,
    }

    logger.info({ message: 'deleteDBInfo', data: deleteDBInfo });

    let response;
    try {
        response = await DeleteDomain.deleteTodo(deleteDBInfo);
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
        body: JSON.stringify(
            response
        ),
    };
};