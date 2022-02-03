import { Sha256 } from "@aws-crypto/sha256-browser";
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import { HttpRequest } from '@aws-sdk/protocol-http';
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { IndexInfo } from '../handler/streamHandler';
import { OpenSearchSearchResult } from '../domain/query'

const region = 'ap-northeast-1';
const domain = process.env.OS_DOMAIN as string;
// indexはDynamoDBのテーブル名
const index = (process.env.OS_INDEX as string).toLowerCase();
const type = '_doc';

export const client = new NodeHttpHandler();

export const signer = new SignatureV4({
    credentials: defaultProvider(),
    region: region,
    service: 'es',
    sha256: Sha256
});

export class AccessOpenSearch {

    public static async index({ id, convertedDocument }: IndexInfo) {

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

        console.log('request ', JSON.stringify(request))

        const signedRequest = await signer.sign(request);
        console.log('signedRequest', JSON.stringify(signedRequest))

        const res = await client.handle(signedRequest as any);

        console.log('res', res)
        const { response } = res;
        console.log('response', response)

        return this.resolveResponse(response)

    }

    public static async resolveResponse(response: any) {
        let responseBody: any;
        const body = await new Promise((resolve, reject) => {
            response.body.on('data', (chunk: any) => {
                responseBody += chunk;
            });
            response.body.on('end', () => {
                console.log('Response body: ' + responseBody);
                resolve(responseBody);
            });
            response.body.on('error', (err: any) => {
                console.error(err);
                reject(err)
            })
        });
        return responseBody;
    }

    public static async delete(id: string) {

        const request = new HttpRequest({
            headers: {
                'Content-Type': 'application/json',
                'host': domain
            },
            hostname: domain,
            method: 'DELETE',
            path: index + '/' + type + '/' + id
        })

        console.log('request ', JSON.stringify(request))

        const signedRequest = await signer.sign(request);
        console.log('signedRequest', JSON.stringify(signedRequest))

        const res = await client.handle(signedRequest as any);

        console.log('res', res)
        const { response } = res;
        console.log('response', response)

        return await this.resolveResponse(response)

    }

    public static async get(id: string) {

        const request = new HttpRequest({
            headers: {
                'Content-Type': 'application/json',
                'host': domain
            },
            hostname: domain,
            method: 'GET',
            path: index + '/' + type + '/' + id
        })

        console.log('request ', JSON.stringify(request))

        const signedRequest = await signer.sign(request);
        console.log('signedRequest', JSON.stringify(signedRequest))

        const res = await client.handle(signedRequest as any);

        console.log('res', res)
        const { response } = res;
        console.log('response', response)

        return await this.resolveResponse(response)

    }

    public static async search(query: string, username: string): Promise<OpenSearchSearchResult> {

        const request = new HttpRequest({
            body: JSON.stringify({
                query:
                {
                    "bool": {
                        "must": [
                            {
                                "bool": {
                                    "should": [
                                        { "match": { "title": query } },
                                        { "match": { "description": query } }
                                    ]
                                }
                            },
                            {
                                "bool": {
                                    "must": {
                                        "term": { "userName": username }
                                    }
                                }
                            },
                        ],
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

        console.log('request ', JSON.stringify(request))

        const signedRequest = await signer.sign(request);
        console.log('signedRequest', JSON.stringify(signedRequest))

        const res = await client.handle(signedRequest as any);

        console.log('res', res)
        const { response } = res;
        console.log('response', response)

        return this.resolveResponse(response)


    }

}