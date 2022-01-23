import { AccessTodoTable } from '../infra/accessTodoTable';

export interface RegisterDBInfo {
    username: string,
    title: string,
    description: string,
}

export class RegisterDomain {

    public static async registerTodo(registerDBInfo: RegisterDBInfo) {

        try {
            await AccessTodoTable.registerNewTodo(registerDBInfo);
        }
        catch (err) {
            console.error(err);
            throw (err);
        }

    };

}