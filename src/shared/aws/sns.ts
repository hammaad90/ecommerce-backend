// src/shared/aws/sns.ts
import { SNS } from "aws-sdk";
import { CONFIG } from "../../config";
import { logger } from "../logger";

const sns = new SNS({ region: CONFIG.AWS_REGION });

/**
 * Publishes a notification to SNS
 * @param subject The notification subject (e.g., "Order Confirmed")
 * @param message The message body
 * @param phoneNumber Optional phone number to send SMS (if topic allows direct publish)
 */
export async function sendNotification(subject: string, message: string, phoneNumber?: string) {
  try {
    if (phoneNumber) {
      // Direct SMS publish
      await sns
        .publish({
          Message: message,
          PhoneNumber: phoneNumber,
        })
        .promise();

      logger.info(`SMS sent to ${phoneNumber}`);
    } else {
      // Publish to SNS topic (subscribers like email endpoints)
      await sns
        .publish({
          TopicArn: CONFIG.SNS_TOPIC_ARN,
          Subject: subject,
          Message: message,
        })
        .promise();

      logger.info(`Notification published to SNS topic: ${subject}`);
    }
  } catch (
