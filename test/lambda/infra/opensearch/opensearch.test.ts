// prepare dummy env var
process.env.OS_INDEX = 'test-index'
process.env.OS_DOMAIN = 'local'

// prepare dummy var
const domain = process.env.OS_DOMAIN
const index = process.env.OS_INDEX
const type = '_doc'

import { HttpRequest } from '@aws-sdk/protocol-http';

import { AccessOpenSearch, client, signer } from '../../../../lambda/infra/accessOpenSearch';

// jest.mock('@elastic/elasticsearch')
// jest.mock('@acuris/aws-es-connection')

describe('opensearch service call', (): void => {

    test('index api ok pattern', async () => {

        signer.sign = jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue(null)
        });

        client.handle = jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue(null)
        });

        // ResponseをResolveする関数をモック化
        AccessOpenSearch.resolveResponse = jest.fn().mockResolvedValue(null);

        const id = 'id';
        const convertedDocument = [{ test: 'test' }];

        const request = new HttpRequest({
            body: JSON.stringify(convertedDocument),
            headers: {
                'Content-Type': 'application/json',
                'host': domain
            },
            hostname: domain,
            method: 'PUT',
            path: index + '/' + type + '/' + id
        })

        await AccessOpenSearch.index({ id, convertedDocument })

        expect(signer.sign).toHaveBeenCalledTimes(1);
        expect(client.handle).toHaveBeenCalledTimes(1);
        expect(AccessOpenSearch.resolveResponse).toHaveBeenCalledTimes(1);

        // signerを呼び出すパラメタが期待通りであるかテスト
        expect(signer.sign).toHaveBeenCalledWith(request);


    })

    test('delete api ok pattern', async () => {

        signer.sign = jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue(null)
        });

        client.handle = jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue(null)
        });

        // ResponseをResolveする関数をモック化
        AccessOpenSearch.resolveResponse = jest.fn().mockReturnValue(null);

        const id = 'id';

        const request = new HttpRequest({
            headers: {
                'Content-Type': 'application/json',
                'host': domain
            },
            hostname: domain,
            method: 'DELETE',
            path: index + '/' + type + '/' + id
        })

        await AccessOpenSearch.delete(id);

        expect(signer.sign).toHaveBeenCalledTimes(1);
        expect(client.handle).toHaveBeenCalledTimes(1);
        expect(AccessOpenSearch.resolveResponse).toHaveBeenCalledTimes(1);

        // signerを呼び出すパラメタが期待通りであるかテスト
        expect(signer.sign).toHaveBeenCalledWith(request);


    })

    test('search api ok pattern', async () => {

        signer.sign = jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue(null)
        });

        client.handle = jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue(null)
        });

        // ResponseをResolveする関数をモック化
        AccessOpenSearch.resolveResponse = jest.fn().mockReturnValue(null);

        const query = 'test';
        const username = 'test';

        const request = new HttpRequest({
            body: JSON.stringify({
                query: {
                    "simple_query_string": {
                        "query": query,
                        "fields": ["title", "description"],
                        "default_operator": "or"
                    }
                }
            }),
            headers: {
                'Content-Type': 'application/json',
                'host': domain
            },
            hostname: domain,
            method: 'POST',
            path: index + '/' + type + '/_search'
        })

        await AccessOpenSearch.search(query, username);

        expect(signer.sign).toHaveBeenCalledTimes(1);
        expect(client.handle).toHaveBeenCalledTimes(1);
        expect(AccessOpenSearch.resolveResponse).toHaveBeenCalledTimes(1);

        // signerを呼び出すパラメタが期待通りであるかテスト
        expect(signer.sign).toHaveBeenCalledWith(request);


    })

    test('get api ok pattern', async () => {

        signer.sign = jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue(null)
        });

        client.handle = jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue(null)
        });

        // ResponseをResolveする関数をモック化
        AccessOpenSearch.resolveResponse = jest.fn().mockReturnValue(null);

        const id = 'id';

        const request = new HttpRequest({
            headers: {
                'Content-Type': 'application/json',
                'host': domain
            },
            hostname: domain,
            method: 'GET',
            path: index + '/' + type + '/' + id
        })

        await AccessOpenSearch.get(id);

        expect(signer.sign).toHaveBeenCalledTimes(1);
        expect(client.handle).toHaveBeenCalledTimes(1);
        expect(AccessOpenSearch.resolveResponse).toHaveBeenCalledTimes(1);

        // signerを呼び出すパラメタが期待通りであるかテスト
        expect(signer.sign).toHaveBeenCalledWith(request);


    })

})