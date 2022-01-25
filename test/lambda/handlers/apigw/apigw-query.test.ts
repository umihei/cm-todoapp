import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2WithJWTAuthorizer, Context } from 'aws-lambda';
import { handler } from '../../../../lambda/handler/queryHandler';
import { AccessTodoTable } from '../../../../lambda/infra/accessTodoTable';
import { QueryDBInfo } from '../../../../lambda/domain/query';

jest.mock('../../../../lambda/infra/accessTodoTable');

describe('query Input/Output', (): void => {

    test('query domain ok pattern', async () => {
        const inputEvent: APIGatewayProxyEventV2WithJWTAuthorizer = {
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

        const pseudoReturnVal = [{
            todoId: 'testid',
            title: 'あのこと',
            description: 'あれやこれや'
        }]

        // DBにPutする処理をMock化
        const queryTodoMock = (AccessTodoTable.queryTodo as jest.Mock).mockResolvedValue(pseudoReturnVal);

        const response = await handler(inputEvent, inputContext);

        // モック化した関数へ渡すパラメタの期待値
        const expectedQueryDBInfo: QueryDBInfo = {
            username: 'tarako'
        }

        // ハンドラが返す値の期待値
        const expected = {
            statusCode: 200,
            body: JSON.stringify(
                pseudoReturnVal
            ),
        };

        // DynamodbへのPutが１回だけであることをテスト
        expect(queryTodoMock.mock.calls.length).toBe(1);

        // registerNewTodoへ（１回目の呼び出しで）渡すパラメタが期待通りになっているかをテスト
        // 兼オブジェクト変換テスト
        expect(queryTodoMock.mock.calls[0][0]).toEqual(expectedQueryDBInfo);

        // レスポンスが期待通りであることをテスト
        expect(response).toEqual(expected);

    })

    test('query domain path param is not consistent with jwt username', async () => {
        const inputEvent: APIGatewayProxyEventV2WithJWTAuthorizer = {
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
                username: 'taiko'
            },
            headers: {
                authorization: "test-auth"
            }
        } as any;

        const inputContext: Context = {
            awsRequestId: 'test-id'
        } as any;

        const pseudoReturnVal = [{
            todoId: 'testid',
            title: 'あのこと',
            description: 'あれやこれや'
        }]

        // DBにPutする処理をMock化
        const queryTodoMock = (AccessTodoTable.queryTodo as jest.Mock).mockResolvedValue(pseudoReturnVal);

        const response = await handler(inputEvent, inputContext);

        // ハンドラが返す値の期待値
        const expected = {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Parameter is invalid.',
            }),
        };

        // レスポンスが期待通りであることをテスト
        expect(response).toEqual(expected);

    })

    test('query domain path param username does not exist', async () => {
        const inputEvent: APIGatewayProxyEventV2WithJWTAuthorizer = {
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
            },
            headers: {
                authorization: "test-auth"
            }
        } as any;

        const inputContext: Context = {
            awsRequestId: 'test-id'
        } as any;

        const pseudoReturnVal = [{
            todoId: 'testid',
            title: 'あのこと',
            description: 'あれやこれや'
        }]

        // DBにPutする処理をMock化
        const queryTodoMock = (AccessTodoTable.queryTodo as jest.Mock).mockResolvedValue(pseudoReturnVal);

        const response = await handler(inputEvent, inputContext);

        // ハンドラが返す値の期待値
        const expected = {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Parameter is invalid.',
            }),
        };

        // レスポンスが期待通りであることをテスト
        expect(response).toEqual(expected);

    })

    test('query domain path param does not exist', async () => {
        const inputEvent: APIGatewayProxyEventV2WithJWTAuthorizer = {
            requestContext: {
                authorizer: {
                    jwt: {
                        claims: {
                            username: 'tarako'
                        }
                    }
                }
            },
            headers: {
                authorization: "test-auth"
            }
        } as any;

        const inputContext: Context = {
            awsRequestId: 'test-id'
        } as any;

        const pseudoReturnVal = [{
            todoId: 'testid',
            title: 'あのこと',
            description: 'あれやこれや'
        }]

        // DBにPutする処理をMock化
        const queryTodoMock = (AccessTodoTable.queryTodo as jest.Mock).mockResolvedValue(pseudoReturnVal);

        const response = await handler(inputEvent, inputContext);

        // ハンドラが返す値の期待値
        const expected = {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Parameter is invalid.',
            }),
        };

        // レスポンスが期待通りであることをテスト
        expect(response).toEqual(expected);

    })

    test('query domain fail dynamodb api', async () => {
        const inputEvent: APIGatewayProxyEventV2WithJWTAuthorizer = {
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

        const pseudoReturnVal = [{
            todoId: 'testid',
            title: 'あのこと',
            description: 'あれやこれや'
        }]

        // DBにPutする処理をMock化
        const queryTodoMock = (AccessTodoTable.queryTodo as jest.Mock).mockRejectedValue(null);

        const response = await handler(inputEvent, inputContext);

        // ハンドラが返す値の期待値
        const expected = {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal Server Error.',
            })
        }

        // レスポンスが期待通りであることをテスト
        expect(response).toEqual(expected);

    })
});