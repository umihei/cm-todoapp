import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2WithJWTAuthorizer, Context } from 'aws-lambda';
import { handler } from '../../../../lambda/handler/updateHandler';
import { AccessTodoTable } from '../../../../lambda/infra/accessTodoTable';
import { UpdateDBInfo } from '../../../../lambda/domain/update';

jest.mock('../../../../lambda/infra/accessTodoTable');

describe('update Input/Output', (): void => {

    test('update domain ok pattern', async () => {
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

        // DBにPutする処理をMock化
        const updateTodoMock = (AccessTodoTable.updateTodo as jest.Mock).mockResolvedValue(null);

        const response = await handler(inputEvent, inputContext);

        // モック化した関数へ渡すパラメタの期待値
        const expectedUpdateDBInfo: UpdateDBInfo = {
            username: 'tarako',
            todoid: 'test-todoid',
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
        expect(updateTodoMock.mock.calls.length).toBe(1);

        // registerNewTodoへ（１回目の呼び出しで）渡すパラメタが期待通りになっているかをテスト
        // 兼オブジェクト変換テスト
        expect(updateTodoMock.mock.calls[0][0]).toEqual(expectedUpdateDBInfo);

        // レスポンスが期待通りであることをテスト
        expect(response).toEqual(expected);

    })

    test('update domain body does not exist', async () => {
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

        // DBにPutする処理をMock化
        const updateTodoMock = (AccessTodoTable.updateTodo as jest.Mock).mockResolvedValue(null);

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

    test('update domain body schema validation error', async () => {
        const inputEvent: APIGatewayProxyEventV2WithJWTAuthorizer = {
            body: JSON.stringify({
                title: 'あれこれ',
                description: 2,
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

        // DBにPutする処理をMock化
        const updateTodoMock = (AccessTodoTable.updateTodo as jest.Mock).mockResolvedValue(null);

        const response = await handler(inputEvent, inputContext);

        // モック化した関数へ渡すパラメタの期待値
        const expectedUpdateDBInfo: UpdateDBInfo = {
            username: 'tarako',
            todoid: 'test-todoid',
            title: 'あれこれ',
            description: 'あれしてこれして',
        }

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

    test('update domain path param does not exist', async () => {
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
            headers: {
                authorization: "test-auth"
            }
        } as any;

        const inputContext: Context = {
            awsRequestId: 'test-id'
        } as any;

        // DBにPutする処理をMock化
        const updateTodoMock = (AccessTodoTable.updateTodo as jest.Mock).mockResolvedValue(null);

        const response = await handler(inputEvent, inputContext);

        // モック化した関数へ渡すパラメタの期待値
        const expectedUpdateDBInfo: UpdateDBInfo = {
            username: 'tarako',
            todoid: 'test-todoid',
            title: 'あれこれ',
            description: 'あれしてこれして',
        }

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

    test('update domain path param username does not exist', async () => {
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
                todoid: 'test-todoid'
            },
            headers: {
                authorization: "test-auth"
            }
        } as any;

        const inputContext: Context = {
            awsRequestId: 'test-id'
        } as any;

        // DBにPutする処理をMock化
        const updateTodoMock = (AccessTodoTable.updateTodo as jest.Mock).mockResolvedValue(null);

        const response = await handler(inputEvent, inputContext);

        // モック化した関数へ渡すパラメタの期待値
        const expectedUpdateDBInfo: UpdateDBInfo = {
            username: 'tarako',
            todoid: 'test-todoid',
            title: 'あれこれ',
            description: 'あれしてこれして',
        }

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

    test('update domain path param todoid does not exist', async () => {
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
        const updateTodoMock = (AccessTodoTable.updateTodo as jest.Mock).mockResolvedValue(null);

        const response = await handler(inputEvent, inputContext);

        // モック化した関数へ渡すパラメタの期待値
        const expectedUpdateDBInfo: UpdateDBInfo = {
            username: 'tarako',
            todoid: 'test-todoid',
            title: 'あれこれ',
            description: 'あれしてこれして',
        }

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

    test('update domain path param username is not consistent with jwt token', async () => {
        const inputEvent: APIGatewayProxyEventV2WithJWTAuthorizer = {
            body: JSON.stringify({
                title: 'あれこれ',
                description: 'あれしてこれして',
            }),
            requestContext: {
                authorizer: {
                    jwt: {
                        claims: {
                            username: 'taiko'
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

        // DBにPutする処理をMock化
        const updateTodoMock = (AccessTodoTable.updateTodo as jest.Mock).mockResolvedValue(null);

        const response = await handler(inputEvent, inputContext);

        // モック化した関数へ渡すパラメタの期待値
        const expectedUpdateDBInfo: UpdateDBInfo = {
            username: 'tarako',
            todoid: 'test-todoid',
            title: 'あれこれ',
            description: 'あれしてこれして',
        }

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

    test('update domain fail dynamo api', async () => {
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

        // DBにPutする処理をMock化
        const updateTodoMock = (AccessTodoTable.updateTodo as jest.Mock).mockRejectedValue(null);

        const response = await handler(inputEvent, inputContext);

        // モック化した関数へ渡すパラメタの期待値
        const expectedUpdateDBInfo: UpdateDBInfo = {
            username: 'tarako',
            todoid: 'test-todoid',
            title: 'あれこれ',
            description: 'あれしてこれして',
        }

        // ハンドラが返す値の期待値
        const expected = {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal Server Error.',
            }),
        };

        // レスポンスが期待通りであることをテスト
        expect(response).toEqual(expected);

    })


});