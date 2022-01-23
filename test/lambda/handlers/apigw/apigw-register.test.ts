import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2WithJWTAuthorizer, Context } from 'aws-lambda';
import { handler } from '../../../../lambda/handler/registerHandler';
import { AccessTodoTable } from '../../../../lambda/infra/accessTodoTable';
import { RegisterDBInfo } from '../../../../lambda/domain/register';

jest.mock('../../../../lambda/infra/accessTodoTable');

describe('register Input/Output', (): void => {

    test('register domain', async () => {
        const inputEvent: APIGatewayProxyEventV2WithJWTAuthorizer = {
            body: JSON.stringify({
                title: 'あれこれ',
                description: 'あれしてこれして',
            }),
            requestContext: {
                authorizer: {
                    jwt: {
                        claims: {
                            username: 'tarako'
                        }
                    }
                }
            },
            pathParameters: {
                username: 'tarako'
            },
            headers: {
                authorization: "test-auth"
            }
        } as any;

        const inputContext: Context = {
            awsRequestId: 'test-id'
        } as any;

        // DBにPutする処理をMock化
        const registerNewTodoMock = (AccessTodoTable.registerNewTodo as jest.Mock).mockResolvedValue(null);

        const response = await handler(inputEvent, inputContext);

        // モック化した関数へ渡すパラメタの期待値
        const expectedRegisterDBInfo: RegisterDBInfo = {
            username: 'tarako',
            title: 'あれこれ',
            description: 'あれしてこれして',
        }

        // ハンドラが返す値の期待値
        const expected = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'OK',
            }),
        };

        // DynamodbへのPutが１回だけであることをテスト
        expect(registerNewTodoMock.mock.calls.length).toBe(1);

        // registerNewTodoへ（１回目の呼び出しで）渡すパラメタが期待通りになっているかをテスト
        // 兼オブジェクト変換テスト
        expect(registerNewTodoMock.mock.calls[0][0]).toEqual(expectedRegisterDBInfo);

        // レスポンスが期待通りであることをテスト
        expect(response).toEqual(expected);

    })

});