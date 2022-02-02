// prepare dummy env var
process.env.REGION = 'local';
process.env.TODO_TABLE_NAME = 'local-todo';

import { RegisterDBInfo } from '../../../../lambda/domain/register';
import { QueryDBInfo } from '../../../../lambda/domain/query';
import { UpdateDBInfo } from '../../../../lambda/domain/update';
import { DeleteDBInfo } from '../../../../lambda/domain/delete';
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
            username: 'tarako',
            title: 'あのこと',
            description: 'あれやって，これやって'
        };

        // PutItemCommandへ渡すパラメタの期待値
        const putItemCommandInputParams = {
            TableName: 'local-todo',
            Item: {
                userName: { S: InputParameter.username },
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

    test('query', async () => {

        // APIを実行する関数をモック化
        ddbClient.send = jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue({
                Items: [{
                    test: 'hoge'
                }]
            })
        });

        // PutItemCommandを実行する関数をモック化
        AccessTodoTable.executeQueryCommand = jest.fn().mockReturnValue(null);

        // DBへの登録処理を実行する関数へ渡すパラメタ
        const inputParameter: QueryDBInfo = {
            username: 'tarako'
        };

        // PutItemCommandへ渡すパラメタの期待値
        const queryCommandInputParams = {
            TableName: 'local-todo',
            KeyConditionExpression: "userName = :s",
            ExpressionAttributeValues: {
                ":s": { S: inputParameter.username },
            },
        };

        // DBへの登録処理を実行
        await AccessTodoTable.queryTodo(inputParameter)

        // モック化した関数が１回だけコールされたことをテスト
        expect(AccessTodoTable.executeQueryCommand).toHaveBeenCalledTimes(1);

        // PutItemCommandを呼び出すパラメタが期待通りであるかテスト
        expect(AccessTodoTable.executeQueryCommand).toHaveBeenCalledWith(queryCommandInputParams);

        // モック化した関数が１回だけコールされたことをテスト
        expect(ddbClient.send).toHaveBeenCalledTimes(1);

    });

    test('update', async () => {

        // APIを実行する関数をモック化
        ddbClient.send = jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue({
                Items: [{
                    test: 'hoge'
                }]
            })
        });

        // UpdateItemCommandを実行する関数をモック化
        AccessTodoTable.executeUpdateItemCommand = jest.fn().mockReturnValue(null);

        // DBへの更新処理を実行する関数へ渡すパラメタ
        const inputParameter: UpdateDBInfo = {
            username: 'tarako',
            todoid: 'test-todoid',
            title: 'test-title',
            description: 'test-description'
        };

        // updateItemCommandへ渡すパラメタの期待値
        const updateItemCommandInputParams = {
            TableName: process.env.TODO_TABLE_NAME,
            Key: {
                userName: { S: inputParameter.username },
                todoId: { S: inputParameter.todoid },
            },
            UpdateExpression: "set title = :t, description = :d, lastUpdateDateTime = :l",
            ExpressionAttributeValues: {
                ":t": { S: inputParameter.title },
                ":d": { S: inputParameter.description },
                ":l": { S: expect.any(String) }
            }
        }

        // DBへの更新処理を実行
        await AccessTodoTable.updateTodo(inputParameter)

        // モック化した関数が１回だけコールされたことをテスト
        expect(AccessTodoTable.executeUpdateItemCommand).toHaveBeenCalledTimes(1);

        // PutItemCommandを呼び出すパラメタが期待通りであるかテスト
        expect(AccessTodoTable.executeUpdateItemCommand).toHaveBeenCalledWith(updateItemCommandInputParams);

        // モック化した関数が１回だけコールされたことをテスト
        expect(ddbClient.send).toHaveBeenCalledTimes(1);

    });

    test('delete', async () => {

        // APIを実行する関数をモック化
        ddbClient.send = jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue({
                Items: [{
                    test: 'hoge'
                }]
            })
        });

        // UpdateItemCommandを実行する関数をモック化
        AccessTodoTable.executeDeleteItemCommand = jest.fn().mockReturnValue(null);

        // DBへの更新処理を実行する関数へ渡すパラメタ
        const inputParameter: DeleteDBInfo = {
            username: 'tarako',
            todoid: 'test-todoid'
        };

        // updateItemCommandへ渡すパラメタの期待値
        const deleteItemCommandInputParams = {
            TableName: process.env.TODO_TABLE_NAME,
            Key: {
                userName: { S: inputParameter.username },
                todoId: { S: inputParameter.todoid }
            }
        }

        // DBへの更新処理を実行
        await AccessTodoTable.deleteTodo(inputParameter)

        // モック化した関数が１回だけコールされたことをテスト
        expect(AccessTodoTable.executeDeleteItemCommand).toHaveBeenCalledTimes(1);

        // PutItemCommandを呼び出すパラメタが期待通りであるかテスト
        expect(AccessTodoTable.executeDeleteItemCommand).toHaveBeenCalledWith(deleteItemCommandInputParams);

        // モック化した関数が１回だけコールされたことをテスト
        expect(ddbClient.send).toHaveBeenCalledTimes(1);

    });

});