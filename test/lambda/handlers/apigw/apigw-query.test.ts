process.env.OS_DOMAIN = 'local'
process.env.OS_INDEX = 'local'
const type = '_doc'

import { APIGatewayProxyEventV2WithJWTAuthorizer, Context } from 'aws-lambda';
import { handler } from '../../../../lambda/handler/queryHandler';
import { AccessTodoTable } from '../../../../lambda/infra/accessTodoTable';
import { AccessOpenSearch } from '../../../../lambda/infra/accessOpenSearch';
import { QueryDBInfo } from '../../../../lambda/domain/query';

jest.mock('../../../../lambda/infra/accessTodoTable');
jest.mock('../../../../lambda/infra/accessOpenSearch');

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

        const pseudoReturnVal = {
            Items: [{
                todoId: { S: 'testid' },
                title: { S: 'あのこと' },
                description: { S: 'あれやこれや' }
            }]
        }

        // DBにQueryする処理をMock化
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
                [{
                    todoId: 'testid',
                    title: 'あのこと',
                    description: 'あれやこれや'
                }]
            ),
        };

        // DynamodbへのQueryが1回だけであることをテスト
        expect(queryTodoMock.mock.calls.length).toBe(1);

        // queryTodoへ（１回目の呼び出しで）渡すパラメタが期待通りになっているかをテスト
        // 兼オブジェクト変換テスト
        expect(queryTodoMock.mock.calls[0][0]).toEqual(expectedQueryDBInfo);

        // レスポンスが期待通りであることをテスト
        expect(response).toEqual(expected);

    })

    test('query domain with query string ok pattern', async () => {
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
            queryStringParameters: {
                query: 'test'
            },
            headers: {
                authorization: "test-auth"
            }
        } as any;

        const inputContext: Context = {
            awsRequestId: 'test-id'
        } as any;

        const pseudoReturnVal = JSON.stringify({
            "took": 55,
            "timed_out": false,
            "_shards": {
                "total": 5,
                "successful": 5,
                "skipped": 0,
                "failed": 0
            },
            "hits": {
                "total": {
                    "value": 17,
                    "relation": "eq"
                },
                "max_score": 0.9186288,
                "hits": [
                    {
                        "_index": "todoappstack-todotablec937f2f9-mzkwr8hwo2i7",
                        "_type": "_doc",
                        "_id": "4b8bdc1d-aa5b-49a4-a537-fab7b8ba6337",
                        "_score": 0.9186288,
                        "_source": {
                            "lastUpdateDateTime": "2022-02-01T04:58:01.789Z",
                            "description": "テストテスト",
                            "title": "test",
                            "todoId": "4b8bdc1d-aa5b-49a4-a537-fab7b8ba6337",
                            "userName": "tarako"
                        }
                    },
                    {
                        "_index": "todoappstack-todotablec937f2f9-mzkwr8hwo2i7",
                        "_type": "_doc",
                        "_id": "93e194b7-e8f0-4301-a7ae-2778bd72b9a8",
                        "_score": 0,
                        "_source": {
                            "lastUpdateDateTime": "2022-02-02T07:18:18.802Z",
                            "description": "あれをこうする",
                            "title": "あのこと",
                            "todoId": "93e194b7-e8f0-4301-a7ae-2778bd72b9a8",
                            "userName": "tarako"
                        }
                    },
                ]
            }
        })

        // OpenSearchにクエリする処理をMock化
        const queryTodoMock = (AccessOpenSearch.search as jest.Mock).mockResolvedValue(pseudoReturnVal);

        const response = await handler(inputEvent, inputContext);

        // モック化した関数へ渡すパラメタの期待値
        const expectedQueryDBInfo: QueryDBInfo = {
            username: 'tarako',
            query: 'test'
        }

        // ハンドラが返す値の期待値
        const expected = {
            statusCode: 200,
            body: JSON.stringify([
                {
                    "todoId": "4b8bdc1d-aa5b-49a4-a537-fab7b8ba6337",
                    "title": "test",
                    "description": "テストテスト",
                    "lastUpdateDateTime": "2022-02-01T04:58:01.789Z"
                },
                {
                    "todoId": "93e194b7-e8f0-4301-a7ae-2778bd72b9a8",
                    "title": "あのこと",
                    "description": "あれをこうする",
                    "lastUpdateDateTime": "2022-02-02T07:18:18.802Z",
                }
            ]
            ),
        };

        // // DynamodbへのGetが1回だけであることをテスト
        // expect(queryTodoMock.mock.calls.length).toBe(1);

        // // queryTodoへ（１回目の呼び出しで）渡すパラメタが期待通りになっているかをテスト
        // // 兼オブジェクト変換テスト
        // expect(queryTodoMock.mock.calls[0][0]).toEqual('test');

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

        // DBにQueryする処理をMock化
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

        // DBにQueryする処理をMock化
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

        // DBにQueryする処理をMock化
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

        // DBにQueryする処理をMock化
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