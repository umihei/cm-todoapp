import { DynamoDBClient, PutItemCommand, PutItemCommandInput, PutItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { RegisterDBInfo } from '../domain/register';
import * as uuid from 'uuid';

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
            console.error('dynamodb put ', err);
            throw (err);
        }
    }

    public static executePutItemCommand(params: PutItemCommandInput): any {
        return new PutItemCommand(params)
    }
}