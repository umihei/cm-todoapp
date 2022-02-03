import { DynamoDBClient, QueryCommand, QueryCommandInput, QueryCommandOutput, GetItemCommand, GetItemCommandInput, GetItemCommandOutput, PutItemCommand, PutItemCommandInput, PutItemCommandOutput, UpdateItemCommand, UpdateItemCommandInput, UpdateItemCommandOutput, DeleteItemCommand, DeleteItemCommandInput, DeleteItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { RegisterDBInfo } from '../domain/register';
import * as uuid from 'uuid';
import { logger } from '../logger';
import { QueryDBInfo } from '../domain/query';
import { UpdateDBInfo } from '../domain/update';
import { DeleteDBInfo } from '../domain/delete';
logger.defaultMeta = { requestId: process.env.AWS_REQUESTID };

export const ddbClient = new DynamoDBClient({ region: process.env.REGION });

export class AccessTodoTable {

    public static async registerNewTodo(registerDBInfo: RegisterDBInfo): Promise<PutItemCommandOutput> {

        const params: PutItemCommandInput = {
            TableName: process.env.TODO_TABLE_NAME,
            Item: {
                userName: { S: registerDBInfo.username },
                todoId: { S: uuid.v4() },
                title: { S: registerDBInfo.title },
                description: { S: registerDBInfo.description },
                lastUpdateDateTime: { S: (new Date()).toISOString() },
            },
        };

        return ddbClient.send(this.executePutItemCommand(params));

    }

    public static async queryTodo(queryDBinfo: QueryDBInfo): Promise<QueryCommandOutput> {

        const params: QueryCommandInput = {
            TableName: process.env.TODO_TABLE_NAME,
            KeyConditionExpression: "userName = :s",
            ExpressionAttributeValues: {
                ":s": { S: queryDBinfo.username },
            },
        }

        return ddbClient.send(this.executeQueryCommand(params));

    }

    public static async updateTodo(updateDBInfo: UpdateDBInfo): Promise<UpdateItemCommandOutput> {

        let updateExpression = ""
        let expressionAttributeValues = {}

        if (updateDBInfo.title && updateDBInfo.description) {
            updateExpression = "set title = :t, description = :d, lastUpdateDateTime = :l"
            expressionAttributeValues = {
                ":t": { S: updateDBInfo.title },
                ":d": { S: updateDBInfo.description },
                ":l": { S: (new Date()).toISOString() }
            }
        }

        else if (updateDBInfo.title && !updateDBInfo.description) {
            updateExpression = "set title = :t, lastUpdateDateTime = :l"
            expressionAttributeValues = {
                ":t": { S: updateDBInfo.title },
                ":l": { S: (new Date()).toISOString() }
            }
        }

        else if (!updateDBInfo.title && updateDBInfo.description) {
            updateExpression = "set description = :d, lastUpdateDateTime = :l"
            expressionAttributeValues = {
                ":d": { S: updateDBInfo.description },
                ":l": { S: (new Date()).toISOString() }
            }
        }

        const params: UpdateItemCommandInput = {
            TableName: process.env.TODO_TABLE_NAME,
            Key: {
                userName: { S: updateDBInfo.username },
                todoId: { S: updateDBInfo.todoid },
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues
        }

        return ddbClient.send(this.executeUpdateItemCommand(params));

    }

    public static async deleteTodo(deleteDBInfo: DeleteDBInfo): Promise<DeleteItemCommandOutput> {

        const params: DeleteItemCommandInput = {
            TableName: process.env.TODO_TABLE_NAME,
            Key: {
                userName: { S: deleteDBInfo.username },
                todoId: { S: deleteDBInfo.todoid }
            }
        }

        return ddbClient.send(this.executeDeleteItemCommand(params));

    }

    // ハンドラー層とドメイン層のユニットテストを行うため，ddbClientに渡すコマンドを作成する処理を関数化

    public static executePutItemCommand(params: PutItemCommandInput): any {
        return new PutItemCommand(params)
    }

    public static executeQueryCommand(params: QueryCommandInput): any {
        return new QueryCommand(params)
    }

    public static executeUpdateItemCommand(params: UpdateItemCommandInput): any {
        return new UpdateItemCommand(params)
    }

    public static executeDeleteItemCommand(params: DeleteItemCommandInput): any {
        return new DeleteItemCommand(params)
    }

}