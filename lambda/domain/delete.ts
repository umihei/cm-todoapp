import { AccessTodoTable } from '../infra/accessTodoTable';
import { logger } from '../logger';
logger.defaultMeta = { requestId: process.env.AWS_REQUESTID };

export interface DeleteDBInfo {
    username: string,
    todoid: string,
}

export class DeleteDomain {

    public static async deleteTodo(deleteDBInfo: DeleteDBInfo) {

        try {
            await AccessTodoTable.deleteTodo(deleteDBInfo);
        }
        catch (err) {
            logger.error(err);
            throw (err);
        }

    };

}