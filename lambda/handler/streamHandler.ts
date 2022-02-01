import { DynamoDBStreamEvent } from "aws-lambda";
import { unmarshall } from "@aws-sdk/util-dynamodb";

import { AccessOpenSearch } from '../infra/accessOpenSearch';
import { logger } from '../logger';

export interface IndexInfo {
    id: string,
    convertedDocument: any[]
}

export const handler = async (event: DynamoDBStreamEvent) => {

    logger.info("DynamoDB to ES synchronize event triggered");
    logger.info({ message: "Received event object:", data: JSON.stringify(event) });

    if (!event["Records"]) {
        logger.info("No records to process. Exiting");
        return;
    }

    for (const record of event
        .Records
        .filter((record: any) => record.dynamodb)) {
        try {

            const keys = record.dynamodb!.Keys;

            logger.info({ message: 'record', data: JSON.stringify(record) });

            // todo idをドキュメントのidにする
            const id = keys?.[process.env.SK!].S;

            if (!id) {
                logger.info(`Can not detect the ID of the document to index. Make sure the DynamoDB document has a field called '${process.env.PK}'`);
                continue;
            }

            if (record.eventName === "REMOVE") {
                logger.info("Deleting document: " + id);

                await AccessOpenSearch.delete(id);

            } else {
                if (!record.dynamodb!.NewImage) {
                    logger.info("Trying to index new document but the DynamoDB stream event did not provide the NewImage. Skipping...");
                    continue;
                }

                logger.info("Indexing document: " + id);
                logger.info("record.dynamodb.NewImage", record.dynamodb!.NewImage);
                const convertedDocument = unmarshall((record.dynamodb!.NewImage) as any);
                logger.info("The full object to store is: ", convertedDocument);

                await AccessOpenSearch.index({ id, convertedDocument } as IndexInfo);
            }
        } catch (e) {
            logger.error("Failed to process DynamoDB row");
            logger.error(record);
            logger.error(e);
        }

    }
};