import { APIGatewayProxyEventV2WithJWTAuthorizer, Context } from 'aws-lambda';
import { handler } from '../../../../lambda/handler/deleteHandler';
import { AccessTodoTable } from '../../../../lambda/infra/accessTodoTable';
import { DeleteDBInfo } from '../../../../lambda/domain/delete';

// インフラをMock化して，入力と出力をテストする

jest.mock('../../../../lambda/infra/accessTodoTable');

describe('delete Input/Output', (): void => {

    test('delete domain ok pattern', async () => {
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
                username: 'tarako',
                todoid: 'test-todoid'
            },
            headers: {
                authorization: "test-auth"
            }
        } as any;

        const inputContext: Context = {
            awsRequestId: 'test-id'
        } as any;

        // DBにDeleteする処理をMock化
        const deleteTodoMock = (AccessTodoTable.deleteTodo as jest.Mock).mockResolvedValue(null);

        const response = await handler(inputEvent, inputContext);

        // モック化した関数へ渡すパラメタの期待値
        const expectedDeleteDBInfo: DeleteDBInfo = {
            username: 'tarako',
            todoid: 'test-todoid'
        }

        // ハンドラが返す値の期待値
        const expected = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'OK'
            }),
        };

        // DynamodbへのDeleteが１回だけであることをテスト
        expect(deleteTodoMock.mock.calls.length).toBe(1);

        // deleteTodoへ（１回目の呼び出しで）渡すパラメタが期待通りになっているかをテスト
        // 兼オブジェクト変換テスト
        expect(deleteTodoMock.mock.calls[0][0]).toEqual(expectedDeleteDBInfo);

        // レスポンスが期待通りであることをテスト
        expect(response).toEqual(expected);

    })

    test('delete domain path param is not consistent with jwt username', async () => {
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
                username: 'taiko',
                todoid: 'test-todoid'
            },
            headers: {
                authorization: "test-auth"
            }
        } as any;

        const inputContext: Context = {
            awsRequestId: 'test-id'
        } as any;

        // DBにDeleteする処理をMock化
        const deleteTodoMock = (AccessTodoTable.deleteTodo as jest.Mock).mockResolvedValue(null);

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

    test('delete domain path param todoid does not exist', async () => {
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

        // DBにDeleteする処理をMock化
        const deleteTodoMock = (AccessTodoTable.deleteTodo as jest.Mock).mockResolvedValue(null);

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

    test('delete domain path param username does not exist', async () => {
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
                todoid: 'test-todoid'
            },
            headers: {
                authorization: "test-auth"
            }
        } as any;

        const inputContext: Context = {
            awsRequestId: 'test-id'
        } as any;

        // DBにDeleteする処理をMock化
        const deleteTodoMock = (AccessTodoTable.deleteTodo as jest.Mock).mockResolvedValue(null);

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

    test('delete domain path param does not exist', async () => {
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

        // DBにDeleteする処理をMock化
        const deleteTodoMock = (AccessTodoTable.deleteTodo as jest.Mock).mockResolvedValue(null);

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

    test('delete domain fail dynamodb api', async () => {
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
                username: 'tarako',
                todoid: 'test-todoid'
            },
            headers: {
                authorization: "test-auth"
            }
        } as any;

        const inputContext: Context = {
            awsRequestId: 'test-id'
        } as any;

        // DBにDeleteする処理をMock化
        const deleteTodoMock = (AccessTodoTable.deleteTodo as jest.Mock).mockRejectedValue(null);

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