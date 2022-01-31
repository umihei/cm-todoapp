import { DynamoDBStreamEvent, AttributeValue } from "aws-lambda";
import { unmarshall, convertToNative, NativeAttributeValue } from "@aws-sdk/util-dynamodb";
import { Client } from "@opensearch-project/opensearch";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { SignatureV4 } from "@aws-sdk/signature-v4"
import { NodeHttpHandler } from "@aws-sdk/node-http-handler"
import { Sha256 } from "@aws-crypto/sha256-browser"


export const handler = async (event: DynamoDBStreamEvent) => {

    const node = process.env.OS_DOMAIN as string;
    const index = (process.env.OS_INDEX as string).toLowerCase();
    const region = 'ap-northeast-1';
    const type = '_doc'

    console.log("DynamoDB to ES synchronize event triggered");
    console.log("Received event object:", JSON.stringify(event));
    console.log("ES domain to use:", node);
    console.log("ES index to use:", index);

    if (!event["Records"]) {
        console.log("No records to process. Exiting");
        return;
    }

    const client = new Client({
        node: `https://${node}`,
    });

    for (const record of event
        .Records
        .filter((record: any) => record.dynamodb)) {
        try {
            let result;

            const keys = record.dynamodb!.Keys;

            console.log(JSON.stringify(record));

            const id = keys?.[process.env.PK!].S;
            // const id = keys?.[process.env.SK!].S;

            if (!id) {
                console.log(`Can not detect the ID of the document to index. Make sure the DynamoDB document has a field called '${process.env.PK}'`);
                continue;
            }

            if (record.eventName === "REMOVE") {
                console.log("Deleting document: " + id);

                // Create the HTTP request
                var request = new HttpRequest({
                    headers: {
                        'Content-Type': 'application/json',
                        'host': node
                    },
                    hostname: node,
                    method: 'DELETE',
                    path: index + '/' + type + '/' + id
                });

                // Sign the request
                var signer = new SignatureV4({
                    credentials: defaultProvider(),
                    region: region,
                    service: 'es',
                    sha256: Sha256
                });

                var signedRequest = await signer.sign(request);

                // Send the request
                const client = new NodeHttpHandler();
                const { response } = await client.handle(signedRequest as any)

                console.log(response.statusCode + ' ' + response.body.statusMessage);
                var responseBody = '';
                await new Promise(() => {
                    response.body.on('data', (chunk: any) => {
                        responseBody += chunk;
                    });
                    response.body.on('end', () => {
                        console.log('Response body: ' + responseBody);
                    });
                }).catch((error) => {
                    console.log('Error: ' + error);
                });

                // result = await client.delete({
                //     index: index,
                //     id: id,
                // });
            } else {
                if (!record.dynamodb!.NewImage) {
                    console.log("Trying to index new document but the DynamoDB stream event did not provide the NewImage. Skipping...");
                    continue;
                }

                console.log("Indexing document: " + id);
                console.log("record.dynamodb.NewImage", record.dynamodb!.NewImage);
                const convertedDocument = unmarshall((record.dynamodb!.NewImage) as any);
                console.log("The full object to store is: ", convertedDocument);

                // Create the HTTP request
                var request = new HttpRequest({
                    body: JSON.stringify(convertedDocument),
                    headers: {
                        'Content-Type': 'application/json',
                        'host': node
                    },
                    hostname: node,
                    method: 'PUT',
                    path: index + '/' + type + '/' + id
                });

                // Sign the request
                var signer = new SignatureV4({
                    credentials: defaultProvider(),
                    region: region,
                    service: 'es',
                    sha256: Sha256
                });

                var signedRequest = await signer.sign(request);

                // Send the request
                const client = new NodeHttpHandler();
                const { response } = await client.handle(signedRequest as any)

                console.log(response.statusCode + ' ' + response.body.statusMessage);
                var responseBody = '';
                await new Promise(() => {
                    response.body.on('data', (chunk: any) => {
                        responseBody += chunk;
                    });
                    response.body.on('end', () => {
                        console.log('Response body: ' + responseBody);
                    });
                }).catch((error) => {
                    console.log('Error: ' + error);
                });

                // result = await client.index({
                //     index: index,
                //     id: id,
                //     body: convertedDocument,
                // })
            }

            console.log(result);
        } catch (e) {
            console.error("Failed to process DynamoDB row");
            console.error(record);
            console.error(e);
        }

    }
};