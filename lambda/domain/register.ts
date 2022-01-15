import jwt_decode from 'jwt-decode';
import { AccessTodoTable } from '../infra/accessTodoTable';

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

export interface RegisterInfo {
    token: string,
    title: string,
    description: string,
}

export class RegisterDomain {

    public static async registerTodo(registerInfo: RegisterInfo) {

        const decodedToken: DecodedToken = jwt_decode(registerInfo.token);
        console.log('decoded token, ', decodedToken);
        const userName = decodedToken.username;

        await AccessTodoTable.registerNewTodo();

    };

}