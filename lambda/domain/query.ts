import { AccessTodoTable } from '../infra/accessTodoTable';
import { AccessOpenSearch } from '../infra/accessOpenSearch';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { logger } from '../logger';
logger.defaultMeta = { requestId: process.env.AWS_REQUESTID };

export interface QueryDBInfo {
    username: string,
    query?: string
}

export interface TodoFull extends Todo {
    lastUpdateDateTime: string
}

export interface Todo extends WithoutUserNameTodo {
    userName: string
}

export interface WithoutUserNameTodo {
    todoId: string,
    title: string,
    description: string
}

export interface OpenSearchSearchResult {
    hits: hits
}

export interface hits {
    hits: innerHits[]
}

export interface innerHits {
    _source: TodoFull
}

export class QueryDomain {

    public static async queryTodo(queryDBInfo: QueryDBInfo) {

        try {

            if (queryDBInfo.query) {
                const response = await AccessOpenSearch.search(queryDBInfo.query, queryDBInfo.username);
                logger.info({ message: 'open search search result', data: response });
                const todos = response.hits.hits.map(todo => todo._source)
                logger.info({ message: 'todos', data: todos });
                return todos
            }
            const response = await AccessTodoTable.queryTodo(queryDBInfo);
            logger.info({ message: 'response', data: response })
            const { Items } = response;
            logger.info({ message: 'Items', data: Items })
            const todoList = Items!.map((i) => unmarshall(i))
            logger.info({ message: 'query response', data: todoList });
            const withoutUserName = todoList.map((res) => {
                return {
                    todoId: res.todoId,
                    title: res.title,
                    description: res.description,
                    lastUpdateDateTime: res.lastUpdateDateTime
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