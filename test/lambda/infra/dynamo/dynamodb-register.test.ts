// prepare dummy env var
process.env.REGION = 'local';
process.env.TODO_TABLE_NAME = 'local-todo';

import { RegisterDBInfo } from '../../../../lambda/domain/register';
import { AccessTodoTable, ddbClient } from '../../../../lambda/infra/accessTodoTable';
import { DynamoDBClient, PutItemCommand, PutItemCommandInput, PutItemCommandOutput } from '@aws-sdk/client-dynamodb';

describe('todo table service call', (): void => {

    test('register', async () => {

        // APIを実行する関数をモック化
        ddbClient.send = jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue(null)
        });

        // PutItemCommandを実行する関数をモック化
        AccessTodoTable.executePutItemCommand = jest.fn().mockReturnValue(null);

        // DBへの登録処理を実行する関数へ渡すパラメタ
        const InputParameter: RegisterDBInfo = {
            userName: 'tarako',
            title: 'あのこと',
            description: 'あれやって，これやって'
        };

        // PutItemCommandへ渡すパラメタの期待値
        const putItemCommandInputParams = {
            TableName: 'local-todo',
            Item: {
                userName: { S: InputParameter.userName },
                todoId: { S: expect.any(String) },
                title: { S: InputParameter.title },
                description: { S: InputParameter.description },
                lastUpdateDateTime: { S: expect.any(String) },
            },
        };

        // DBへの登録処理を実行
        await AccessTodoTable.registerNewTodo(InputParameter)

        // モック化した関数が１回だけコールされたことをテスト
        expect(AccessTodoTable.executePutItemCommand).toHaveBeenCalledTimes(1);

        // PutItemCommandを呼び出すパラメタが期待通りであるかテスト
        expect(AccessTodoTable.executePutItemCommand).toHaveBeenCalledWith(putItemCommandInputParams);

        // モック化した関数が１回だけコールされたことをテスト
        expect(ddbClient.send).toHaveBeenCalledTimes(1);

    });
});