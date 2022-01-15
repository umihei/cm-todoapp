import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from 'aws-lambda';
import { RegisterDomain, RegisterInfo } from '../domain/register';

interface Response {
    status: string
}

export const handler: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
    console.log('incoming event ', event);

    const registerInfo: RegisterInfo = {
        token: event.headers.authorization!,
        title: JSON.parse(event.body!).title,
        description: JSON.parse(event.body!).description,
    }

    console.log('registerInfo, ', registerInfo);
    await RegisterDomain.registerTodo(registerInfo);

    return {
        statusCode: 200,
        body: JSON.stringify({
            status: 'OK',
        } as Response),
    };
};