import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { RegisterDomain, RegisterInfo } from '../domain/register';
import Ajv from 'ajv';

const ajv = new Ajv();

interface Response {
    message: string
}

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    console.log('incoming event ', event);

    // bodyがあることを確認
    if (!event.body) {
        console.error('body param is not found.');
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Parameter is invalid.',
            } as Response),
        };
    }

    // bodyのスキーマを定義
    const bodySchema = {
        required: ['title', 'description'],
        type: 'object',
        properties: {
            title: {
                type: 'string',
            },
            description: {
                type: 'string',
            }
        }
    }

    // bodyのスキーマが正しいことを確認
    let body;
    try {
        body = JSON.parse(event.body!)
    } catch (err) {
        console.error('JSON parse error');
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Parameter is invalid.',
            } as Response),
        };
    }
    console.log('body ', body);
    const validate = ajv.compile(bodySchema);
    const valid = validate(body);
    console.log('valid ', valid);

    if (!valid) {
        console.error('validation error, ', validate.errors);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Parameter is invalid.',
            } as Response),
        };
    }

    // もしauthorizationヘッダがなかったら403を返す（ここに到達した時点では確実にあるはずだが一応）
    if (!event.headers.authorization) {
        console.error('authorization header is not found.')
        return {
            statusCode: 401,
            body: JSON.stringify({
                message: 'Unauthorized.',
            } as Response),
        };
    }

    // TODOの登録に必要な情報
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
            message: 'OK',
        } as Response),
    };
};