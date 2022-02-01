import { DynamoDBStreamEvent, AttributeValue } from "aws-lambda";
import { unmarshall, convertToNative, NativeAttributeValue } from "@aws-sdk/util-dynamodb";

import { AccessOpenSearch } from '../infra/accessOpenSearch';

export interface IndexInfo {
    id: string,
    convertedDocument: any[]
}

export const handler = async (event: DynamoDBStreamEvent) => {

    console.log("DynamoDB to ES synchronize event triggered");
    console.log("Received event object:", JSON.stringify(event));

    if (!event["Records"]) {
        console.log("No records to process. Exiting");
        return;
    }

    for (const record of event
        .Records
        .filter((record: any) => record.dynamodb)) {
        try {

            const keys = record.dynamodb!.Keys;

            console.log(JSON.stringify(record));

            // todo idをドキュメントのidにする
            const id = keys?.[process.env.SK!].S;

            if (!id) {
                console.log(`Can not detect the ID of the document to index. Make sure the DynamoDB document has a field called '${process.env.PK}'`);
                continue;
            }

            if (record.eventName === "REMOVE") {
                console.log("Deleting document: " + id);

                await AccessOpenSearch.delete(id);

            } else {
                if (!record.dynamodb!.NewImage) {
                    console.log("Trying to index new document but the DynamoDB stream event did not provide the NewImage. Skipping...");
                    continue;
                }

                console.log("Indexing document: " + id);
                console.log("record.dynamodb.NewImage", record.dynamodb!.NewImage);
                const convertedDocument = unmarshall((record.dynamodb!.NewImage) as any);
                console.log("The full object to store is: ", convertedDocument);

                await AccessOpenSearch.index({ id, convertedDocument } as IndexInfo);
            }
        } catch (e) {
            console.error("Failed to process DynamoDB row");
            console.error(record);
            console.error(e);
        }

    }
};