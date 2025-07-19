// src/shared/aws/sqs.ts
import { SQS } from "aws-sdk";
import { CONFIG } from "../../config";
import { logger } from "../logger";

const sqs = new SQS({ region: CONFIG.AWS_REGION });

/**
 * Enqueue an order to SQS for background processing
 * @param orderId The order ID to process
 */
export async function enqueueOrder(orderId: string) {
  try {
    const params = {
      QueueUrl: CONFIG.SQS_URL,
      MessageBody: JSON.stringify({ orderId }),
    };

    await sqs.sendMessage(params).promise();
    logger.info(`Order ${orderId} enqueued to SQS`);
  } catch (error) {
    logger.error("Failed to enqueue order to SQS", error as Error);
    throw new Error("SQS enqueue failed");
  }
}

/**
 * Purge the entire queue (used for maintenance/testing)
 */
export async function purgeQueue() {
  try {
    await sqs.purgeQueue({ QueueUrl: CONFIG.SQS_URL }).promise();
    logger.warn(`SQS queue purged: ${CONFIG.SQS_URL}`);
  } catch (error) {
    logger.error("Failed to purge SQS queue", error as Error);
    throw new Error("SQS purge failed");
  }
}
