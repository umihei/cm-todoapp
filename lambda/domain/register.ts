import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from 'aws-lambda';
import jwt_decode from 'jwt-decode';

interface Response {
    status: string
}

interface DecodedToken {
    sub: string,
    iss: string,
    version: number,
    client_id: string,
    origin_jti: string,
    event_id: string,
    token_use: string,
    scope: string,
    auth_time: number,
    exp: number,
    iat: number,
    jti: string,
    username: string,
}

export const handler: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
    console.log('incoming event ', event);

    console.log('token ', event.headers.authorization);

    const decoded: DecodedToken = jwt_decode(event.headers.authorization!);
    console.log('jwt decoded ', decoded);

    const username = decoded.username;

    return {
        statusCode: 200,
        body: JSON.stringify({
            status: 'OK',
        } as Response),
    };
};