import { DynamoDBClient, PutItemCommand, PutItemCommandInput, PutItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { RegisterDBInfo } from '../domain/register';

const ddbClient = new DynamoDBClient({ region: process.env.REGION });

export class AccessTodoTable {

    public static async registerNewTodo(registerDBInfo: RegisterDBInfo): Promise<PutItemCommandOutput> {

        const params: PutItemCommandInput = {
            TableName: process.env.TODO_TABLE_NAME,
            Item: {
                userName: { S: registerDBInfo.userName },
                todoId: { S: 'hogehoge' },
                title: { S: registerDBInfo.title },
                description: { S: registerDBInfo.description },
                timestamp: { N: '2022' },
            },
        };

        return await ddbClient.send(new PutItemCommand(params))
            .catch(err => {
                console.error('dynamodb put ', err)
                throw err;
            });
    }
}