import { DynamoDBClient, QueryCommand, QueryCommandInput, QueryCommandOutput, GetItemCommand, GetItemCommandInput, GetItemCommandOutput, PutItemCommand, PutItemCommandInput, PutItemCommandOutput, UpdateItemCommand, UpdateItemCommandInput, UpdateItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { RegisterDBInfo } from '../domain/register';
import * as uuid from 'uuid';
import { logger } from '../logger';
import { QueryDBInfo } from '../domain/query';
import { UpdateDBInfo } from '../domain/update';
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

        try {
            return await ddbClient.send(this.executePutItemCommand(params));
        } catch (err) {
            logger.error({ message: 'dynamodb put ', error: err });
            throw (err);
        }
    }

    public static async queryTodo(queryDBinfo: QueryDBInfo): Promise<QueryCommandOutput> {

        const params: QueryCommandInput = {
            TableName: process.env.TODO_TABLE_NAME,
            KeyConditionExpression: "userName = :s",
            ExpressionAttributeValues: {
                ":s": { S: queryDBinfo.username },
            },
        }

        try {
            return ddbClient.send(this.executeQueryCommand(params));
        }
        catch (err) {
            logger.error({ message: 'dynamodb query', error: err });
            throw (err)
        }
    }

    public static async updateTodo(updateDBInfo: UpdateDBInfo): Promise<UpdateItemCommandOutput> {

        const params: UpdateItemCommandInput = {
            TableName: process.env.TODO_TABLE_NAME,
            Key: {
                userName: { S: updateDBInfo.username },
                todoId: { S: updateDBInfo.todoid },
            },
            UpdateExpression: "set title = :t, description = :d, lastUpdateDateTime = :l",
            ExpressionAttributeValues: {
                ":t": { S: updateDBInfo.title },
                ":d": { S: updateDBInfo.description },
                ":l": { S: (new Date()).toISOString() }
            }
        }

        try {
            return ddbClient.send(this.executeUpdateItemCommand(params));
        }
        catch (err) {
            logger.error({ messsage: 'dynamodb update', error: err });
            throw (err);
        }

    }

    public static executePutItemCommand(params: PutItemCommandInput): any {
        return new PutItemCommand(params)
    }

    public static executeQueryCommand(params: QueryCommandInput): any {
        return new QueryCommand(params)
    }

    public static executeUpdateItemCommand(params: UpdateItemCommandInput): any {
        return new UpdateItemCommand(params)
    }

}