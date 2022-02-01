import { Client } from '@elastic/elasticsearch';
import {
    createAWSConnection,
    awsGetCredentials,
} from "@acuris/aws-es-connection";
import { IndexInfo } from '../handler/streamHandler'

const domain = process.env.OS_DOMAIN as string;
// indexはDynamoDBのテーブル名
const index = (process.env.OS_INDEX as string).toLowerCase();

export class AccessOpenSearch {

    public static async index({ id, convertedDocument }: IndexInfo) {

        const awsCredentials = await awsGetCredentials();
        const AWSConnection = createAWSConnection(awsCredentials);

        const client = new Client({
            node: `https://${domain}`,
            ...AWSConnection,
        });

        return client.index({
            index: index,
            id: id,
            body: convertedDocument,
        })
    }

    public static async get(id: string) {

        const awsCredentials = await awsGetCredentials();
        const AWSConnection = createAWSConnection(awsCredentials);

        const client = new Client({
            node: `https://${domain}`,
            ...AWSConnection,
        });

        return client.get({
            index: index,
            id: id
        })
    }

    public static async delete(id: string) {

        const awsCredentials = await awsGetCredentials();
        const AWSConnection = createAWSConnection(awsCredentials);

        const client = new Client({
            node: `https://${domain}`,
            ...AWSConnection,
        });

        return client.delete({
            index: index,
            id: id
        })
    }

    public static async search(query: string) {

        const awsCredentials = await awsGetCredentials();
        const AWSConnection = createAWSConnection(awsCredentials);

        const client = new Client({
            node: `https://${domain}`,
            ...AWSConnection,
        });

        return client.search({
            index: index,
            body: {
                query: {
                    "bool": {
                        should: [
                            {
                                "match": {
                                    title: query
                                }
                            },
                            {
                                "match": {
                                    description: query
                                }
                            }
                        ]
                    }
                }
            }
        }
        )
    }

}