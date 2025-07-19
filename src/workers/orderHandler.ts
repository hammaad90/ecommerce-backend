// src/workers/orderHandler.ts
import { SQSHandler, SQSRecord } from "aws-lambda";
import { OrderService } from "../services/order/orderService";
import { logger } from "../shared/logger"; // Named export (consistent with logger.ts)

const orderService = new OrderService();

/**
 * AWS Lambda handler for processing orders from SQS.
 * Each message represents an order that needs processing (e.g., update status, send notifications).
 */
export const handler: SQSHandler = async (event) => {
  logger.info(`Received ${event.Records.length} messages from SQS`);

  // Process each SQS message individually
  for (const record of event.Records as SQSRecord[]) {
    try {
      const orderData = JSON.parse(record.body);
      logger.info(`Processing order with ID: ${orderData.orderId}`);

      // Update order in DB, trigger events, etc.
      await orderService.processOrder(orderData);

      logger.info(`Successfully processed order ID: ${orderData.orderId}`);
    } catch (error) {
      logger.error("Error processing order from SQS", {
        error,
        messageBody: record.body,
      });

      /**
       * Optionally rethrow the error to trigger retry or Dead-Letter Queue (DLQ).
       * Uncomment the line below if you want automatic retries configured via SQS.
       */
      // throw error;
    }
  }
};
