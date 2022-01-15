import { DynamoDBClient, PutItemCommand, PutItemCommandInput, PutItemCommandOutput } from '@aws-sdk/client-dynamodb';

const ddbClient = new DynamoDBClient({ region: process.env.REGION });

export class AccessTodoTable {

    public static async registerNewTodo(): Promise<PutItemCommandOutput | void> {

        const params: PutItemCommandInput = {
            TableName: process.env.TODO_TABLE_NAME,
            Item: {
                userName: { S: 'tarako' },
                todoId: { S: 'hogehoge' },
                title: { S: 'あれこれ' },
                description: { S: 'あれやってこれやって' },
                timestamp: { N: 2022 },
            },
        };

        return await ddbClient.send(new PutItemCommand(params))
            .catch(err => {
                console.error('dynamodb put ', err)
            });
    }
}