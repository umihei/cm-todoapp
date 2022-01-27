import { AccessTodoTable } from '../infra/accessTodoTable';
import { logger } from '../logger';
logger.defaultMeta = { requestId: process.env.AWS_REQUESTID };

export interface UpdateDBInfo {
    username: string,
    todoid: string,
    title: string,
    description: string,
}

export class UpdateDomain {

    public static async updateTodo(updateDBInfo: UpdateDBInfo) {

        try {
            await AccessTodoTable.updateTodo(updateDBInfo);
        }
        catch (err) {
            logger.error(err);
            throw (err);
        }

    };

}