process.env.OS_DOMAIN = 'local';
// indexはDynamoDBのテーブル名
process.env.OS_INDEX = 'local-index';
process.env.SK = 'todoId';

import { DynamoDBStreamEvent } from "aws-lambda";
import { handler, IndexInfo } from '../../../../lambda/handler/streamHandler';
import { AccessOpenSearch } from '../../../../lambda/infra/accessOpenSearch';

// インフラをMock化して，入力が正しくインフラ層に渡っているか確かめる

jest.mock('../../../../lambda/infra/accessOpenSearch');

describe('test dynamodb stream handler', (): void => {

    test('delete ok pattern', async () => {

        const inputEvent: DynamoDBStreamEvent = {
            Records: [
                {
                    "eventID": "9fea4707a8ba272ed1ac404277fc8379",
                    "eventName": "REMOVE",
                    "eventVersion": "1.1",
                    "eventSource": "aws:dynamodb",
                    "awsRegion": "ap-northeast-1",
                    "dynamodb": {
                        "ApproximateCreationDateTime": 1643690562,
                        "Keys": {
                            "userName": {
                                "S": "tarako"
                            },
                            "todoId": {
                                "S": "7c2d2d2e-1bf0-4147-8384-23f4c667ea92"
                            }
                        },
                        "OldImage": {
                            "lastUpdateDateTime": {
                                "S": "2022-02-01T04:26:42.139Z"
                            },
                            "description": {
                                "S": "あれをこうするtest"
                            },
                            "title": {
                                "S": "あのことtest"
                            },
                            "todoId": {
                                "S": "7c2d2d2e-1bf0-4147-8384-23f4c667ea92"
                            },
                            "userName": {
                                "S": "tarako"
                            }
                        },
                        "SequenceNumber": "35011200000000025333805540",
                        "SizeBytes": 211,
                        "StreamViewType": "NEW_AND_OLD_IMAGES"
                    },
                    "eventSourceARN": "arn:aws:dynamodb:ap-northeast-1:414043983357:table/TodoappStack-todoTableC937F2F9-MZKWR8HWO2I7/stream/2022-01-29T06:55:38.088"
                }
            ]
        }

        // DBにPutする処理をMock化
        const deleteDocMock = (AccessOpenSearch.delete as jest.Mock).mockResolvedValue(null);

        const response = await handler(inputEvent);

        console.log(response);

        // OpenSearchのDeleteApi実行が１回だけであることをテスト
        expect(deleteDocMock.mock.calls.length).toBe(1);

        // deleteTodoへ（１回目の呼び出しで）渡すパラメタが期待通りになっているかをテスト
        // 兼オブジェクト変換テスト
        expect(deleteDocMock.mock.calls[0][0]).toEqual(expect.any(String));

        // // レスポンスが期待通りであることをテスト
        // expect(response).toEqual(expected);


    })

    test('index ok pattern', async () => {

        const inputEvent: DynamoDBStreamEvent = {
            Records: [
                {
                    "eventID": "04f2b1265d9675493996dbb2c3bb07f3",
                    "eventName": "INSERT",
                    "eventVersion": "1.1",
                    "eventSource": "aws:dynamodb",
                    "awsRegion": "ap-northeast-1",
                    "dynamodb": {
                        "ApproximateCreationDateTime": 1643701927,
                        "Keys": {
                            "userName": {
                                "S": "tarako"
                            },
                            "todoId": {
                                "S": "109bca6b-6ab0-4c1f-9d54-69aec3710fa2"
                            }
                        },
                        "NewImage": {
                            "lastUpdateDateTime": {
                                "S": "2022-02-01T07:52:06.263Z"
                            },
                            "description": {
                                "S": "あれをこうする"
                            },
                            "title": {
                                "S": "あのこと"
                            },
                            "todoId": {
                                "S": "109bca6b-6ab0-4c1f-9d54-69aec3710fa2"
                            },
                            "userName": {
                                "S": "tarako"
                            }
                        },
                        "SequenceNumber": "35866400000000000411785015",
                        "SizeBytes": 203,
                        "StreamViewType": "NEW_AND_OLD_IMAGES"
                    },
                    "eventSourceARN": "arn:aws:dynamodb:ap-northeast-1:414043983357:table/TodoappStack-todoTableC937F2F9-MZKWR8HWO2I7/stream/2022-01-29T06:55:38.088"
                }
            ]
        }

        // DBにPutする処理をMock化
        const indexDocMock = (AccessOpenSearch.index as jest.Mock).mockResolvedValue(null);

        const response = await handler(inputEvent);

        console.log(response);

        const id = "109bca6b-6ab0-4c1f-9d54-69aec3710fa2";
        const convertedDocument = {
            lastUpdateDateTime: '2022-02-01T07:52:06.263Z',
            description: 'あれをこうする',
            title: 'あのこと',
            todoId: '109bca6b-6ab0-4c1f-9d54-69aec3710fa2',
            userName: 'tarako'
        }

        // OpenSearchのIndexApi実行が１回だけであることをテスト
        expect(indexDocMock.mock.calls.length).toBe(1);

        // deleteTodoへ（１回目の呼び出しで）渡すパラメタが期待通りになっているかをテスト
        // 兼オブジェクト変換テスト
        expect(indexDocMock.mock.calls[0][0]).toEqual({ id, convertedDocument });

        // // レスポンスが期待通りであることをテスト
        // expect(response).toEqual(expected);


    })

    test('no record pattern', async () => {

        const inputEvent: DynamoDBStreamEvent = {

        } as any;

        // DBにPutする処理をMock化
        const indexDocMock = (AccessOpenSearch.index as jest.Mock).mockResolvedValue(null);

        const response = await handler(inputEvent);

        console.log(response);

    })

    test('no id pattern', async () => {

        const inputEvent: DynamoDBStreamEvent = {
            Records: [
                {
                    "eventID": "04f2b1265d9675493996dbb2c3bb07f3",
                    "eventName": "INSERT",
                    "eventVersion": "1.1",
                    "eventSource": "aws:dynamodb",
                    "awsRegion": "ap-northeast-1",
                    "dynamodb": {
                        "ApproximateCreationDateTime": 1643701927,
                        "Keys": {
                            "userName": {
                                "S": "tarako"
                            },
                            "todoId": {
                                "S": ""
                            }
                        },
                        "NewImage": {
                            "lastUpdateDateTime": {
                                "S": "2022-02-01T07:52:06.263Z"
                            },
                            "description": {
                                "S": "あれをこうする"
                            },
                            "title": {
                                "S": "あのこと"
                            },
                            "todoId": {
                                "S": "109bca6b-6ab0-4c1f-9d54-69aec3710fa2"
                            },
                            "userName": {
                                "S": "tarako"
                            }
                        },
                        "SequenceNumber": "35866400000000000411785015",
                        "SizeBytes": 203,
                        "StreamViewType": "NEW_AND_OLD_IMAGES"
                    },
                    "eventSourceARN": "arn:aws:dynamodb:ap-northeast-1:414043983357:table/TodoappStack-todoTableC937F2F9-MZKWR8HWO2I7/stream/2022-01-29T06:55:38.088"
                }
            ]
        }

        // DBにPutする処理をMock化
        const indexDocMock = (AccessOpenSearch.index as jest.Mock).mockResolvedValue(null);

        const response = await handler(inputEvent);

    })

    test('no NewImage pattern', async () => {

        const inputEvent: DynamoDBStreamEvent = {
            Records: [
                {
                    "eventID": "04f2b1265d9675493996dbb2c3bb07f3",
                    "eventName": "INSERT",
                    "eventVersion": "1.1",
                    "eventSource": "aws:dynamodb",
                    "awsRegion": "ap-northeast-1",
                    "dynamodb": {
                        "ApproximateCreationDateTime": 1643701927,
                        "Keys": {
                            "userName": {
                                "S": "tarako"
                            },
                            "todoId": {
                                "S": "109bca6b-6ab0-4c1f-9d54-69aec3710fa2"
                            }
                        },
                        "SequenceNumber": "35866400000000000411785015",
                        "SizeBytes": 203,
                        "StreamViewType": "NEW_AND_OLD_IMAGES"
                    },
                    "eventSourceARN": "arn:aws:dynamodb:ap-northeast-1:414043983357:table/TodoappStack-todoTableC937F2F9-MZKWR8HWO2I7/stream/2022-01-29T06:55:38.088"
                }
            ]
        }

        // DBにPutする処理をMock化
        const indexDocMock = (AccessOpenSearch.index as jest.Mock).mockResolvedValue(null);

        const response = await handler(inputEvent);

    })



})