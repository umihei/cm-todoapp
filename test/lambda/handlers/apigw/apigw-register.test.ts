import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from 'aws-lambda';
import { handler } from '../../../lambda/handler/registerHandler';

describe('register Input/Output', (): void => {

    test('register domain', async () => {
        const inputEvent: APIGatewayProxyEventV2 = {
            body: JSON.stringify({
                title: 'あれこれ',
                description: 'あれしてこれして',
            }),
            headers: {
                authorization: 'token',
            },
        };

        const response = await handler(inputEvent);

        const expected = {
            statusCode: 200,
            body: JSON.stringify({
                status: 'OK',
            }),
        };

        expect(response).toEqual(expected);

    })

});