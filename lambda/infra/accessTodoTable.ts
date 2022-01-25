import { DynamoDBClient, QueryCommand, QueryCommandInput, QueryCommandOutput, GetItemCommand, GetItemCommandInput, GetItemCommandOutput, PutItemCommand, PutItemCommandInput, PutItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { RegisterDBInfo } from '../domain/register';
import * as uuid from 'uuid';
import { logger } from '../logger';
import { QueryDBInfo } from '../domain/query';
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

    public static async queryTodo(queryDBinfo: QueryDBInfo): Promise<any> {

        const params: QueryCommandInput = {
            TableName: process.env.TODO_TABLE_NAME,
            KeyConditionExpression: "userName = :s",
            ExpressionAttributeValues: {
                ":s": { S: queryDBinfo.username },
            },
        }

        try {
            const res: QueryCommandOutput = await ddbClient.send(this.executeQueryCommand(params));
            const { Items } = res;
            return Items!.map((i) => unmarshall(i))

        }
        catch (err) {
            logger.error({ message: 'dynamodb query', error: err });
            throw (err)
        }
    }

    public static executePutItemCommand(params: PutItemCommandInput): any {
        return new PutItemCommand(params)
    }

    public static executeQueryCommand(params: QueryCommandInput): any {
        return new QueryCommand(params)
    }

}