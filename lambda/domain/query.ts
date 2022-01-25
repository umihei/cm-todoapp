import { AccessTodoTable } from '../infra/accessTodoTable';
import { logger } from '../logger';
logger.defaultMeta = { requestId: process.env.AWS_REQUESTID };

export interface QueryDBInfo {
    username: string,
    query?: string
}

export interface Todo extends WithoutUserNameTodo {
    userName: string
}

export interface WithoutUserNameTodo {
    todoId: string,
    title: string,
    description: string
}

export class QueryDomain {

    public static async queryTodo(queryDBInfo: QueryDBInfo) {

        try {
            const response = await AccessTodoTable.queryTodo(queryDBInfo);
            logger.info({ message: 'query response', data: response });
            const withoutUserName: WithoutUserNameTodo = response.map((res: Todo) => {
                return {
                    todoId: res.todoId,
                    title: res.title,
                    description: res.description
                }
            })
            return withoutUserName;
        }
        catch (err) {
            logger.error(err);
            throw (err);
        }

    };

}