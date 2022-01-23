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
    username: string,
    title: string,
    description: string,
}

export interface RegisterDBInfo {
    username: string,
    title: string,
    description: string,
}

export class RegisterDomain {

    public static async registerTodo(registerInfo: RegisterInfo) {

        // const decodedToken: DecodedToken = jwt_decode(registerInfo.token);
        // console.log('decoded token, ', decodedToken);
        // const userName = decodedToken.username;

        const registerDBInfo: RegisterDBInfo = {
            username: registerInfo.username,
            title: registerInfo.title,
            description: registerInfo.description,
        }

        try {
            await AccessTodoTable.registerNewTodo(registerDBInfo);
        }
        catch (err) {
            console.error(err);
            throw (err);
        }

    };

}