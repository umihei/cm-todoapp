import { AccessTodoTable } from '../infra/accessTodoTable';
import { logger } from '../logger';
logger.defaultMeta = { requestId: process.env.AWS_REQUESTID };

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
            logger.error({ message: 'dynamodb put error', error: err });
            throw (err);
        }

    };

}