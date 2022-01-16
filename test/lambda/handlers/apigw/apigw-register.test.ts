import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from 'aws-lambda';
import { handler } from '../../../../lambda/handler/registerHandler';
import { AccessTodoTable } from '../../../../lambda/infra/accessTodoTable';
import { RegisterDBInfo } from '../../../../lambda/domain/register';
import jwt_decode from 'jwt-decode';

jest.mock('jwt-decode');
jest.mock('../../../../lambda/infra/accessTodoTable');

describe('register Input/Output', (): void => {

    test('register domain', async () => {
        const inputEvent: APIGatewayProxyEventV2 = {
            body: JSON.stringify({
                title: 'あれこれ',
                description: 'あれしてこれして',
            }),
            headers: {
                authorization: 'Bearer eyJraWQiOiJpemtQaWU3NDRaUm9kVG1IRlptRyszVEpwaklyaTRXOXJmYWg5ZTBMTGY4PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIyOWY2NzdlYi0zNTIwLTRjZTktOTViYi0xNDFkZjlkMjQ4ZjIiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtbm9ydGhlYXN0LTEuYW1hem9uYXdzLmNvbVwvYXAtbm9ydGhlYXN0LTFfZ1lNMjJBQTYxIiwidmVyc2lvbiI6MiwiY2xpZW50X2lkIjoiMm0xY3RlbHAxaGwwaDA2N2UydDBlMTZxb24iLCJvcmlnaW5fanRpIjoiNjczY2I4YmUtNWRhZC00OTQzLTgxYzctZTMyYjA3OTE3YjlmIiwiZXZlbnRfaWQiOiI5OGZiMTZlYS0zMjI4LTRkZjItOWI4Yy01NWUyMmFhYmMwNGUiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6Im9wZW5pZCIsImF1dGhfdGltZSI6MTY0MjI5NTQ3MywiZXhwIjoxNjQyMjk5MDczLCJpYXQiOjE2NDIyOTU0NzMsImp0aSI6Ijk5N2I5OGU3LTZiNTEtNDY0NC1hZWI5LTJkNDJkNGRlNjc2MyIsInVzZXJuYW1lIjoidGFyYWtvIn0.X50jVLR68z3oXlEOy3zGnXrZsU-ab-LT589hy0aMik0mqoGpelUu6Pmr0bDSVi1Z9BrUV6-z6kPdkBgrQ4fT2p90naugb3WEUgLGaqjRxBR2tjtuQjlZUCdOinMIipNwhakck09sZjNYYUvHZ4gIze8AviwhgpHluY6YfSNCXsH_XI5yFDaJYgg_XUmtFaVLapdv15q6BJ4XXlz4dRDPH7V74Ob_JLXL2C8bW4HT9ph5VYSE3I10XCjW8vUcnZQNFjPXwT2Bzh-ofglozBTOwC8rWGHZZz-jYF_7hmpLSSSpqsbbk3q2iXIhTUdYZh6DO4LAFfEHjjzXRGAx1W6dcA',
            },
        } as any;

        // Tokenをデコードする処理をMock化
        const decodedTokenMock = (jwt_decode as jest.Mock).mockReturnValue({
            sub: '29f677eb-3520-4ce9-95bb-141df9d248f2',
            iss: 'https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_gYM22AA61',
            version: 2,
            client_id: '2m1ctelp1hl0h067e2t0e16qon',
            origin_jti: '673cb8be-5dad-4943-81c7-e32b07917b9f',
            event_id: '98fb16ea-3228-4df2-9b8c-55e22aabc04e',
            token_use: 'access',
            scope: 'openid',
            auth_time: 1642295473,
            exp: 1642299073,
            iat: 1642295473,
            jti: '997b98e7-6b51-4644-aeb9-2d42d4de6763',
            username: 'tarako'
        });

        // DBにPutする処理をMock化
        const registerNewTodoMock = (AccessTodoTable.registerNewTodo as jest.Mock).mockResolvedValue(null);

        const response = await handler(inputEvent);

        // モック化した関数へ渡すパラメタの期待値
        const expectedRegisterDBInfo: RegisterDBInfo = {
            userName: 'tarako',
            title: 'あれこれ',
            description: 'あれしてこれして',
        }

        // ハンドラが返す値の期待値
        const expected = {
            statusCode: 200,
            body: JSON.stringify({
                status: 'OK',
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