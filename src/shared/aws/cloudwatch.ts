// src/shared/aws/cloudwatch.ts
import { CloudWatch } from "aws-sdk";
import { logger } from "../logger";
import { CONFIG } from "../../config";

const cloudwatch = new CloudWatch({ region: CONFIG.AWS_REGION });

/**
 * Logs a custom metric to CloudWatch (for dashboards/alarms)
 * @param metricName Name of the metric (e.g., "OrdersProcessed")
 * @param value Numeric value
 * @param unit Metric unit (default: "Count")
 */
export async function logMetric(metricName: string, value: number, unit: string = "Count") {
  try {
    await cloudwatch
      .putMetricData({
        Namespace: "EcommerceApp",
        MetricData: [
          {
            MetricName: metricName,
            Value: value,
            Unit: unit,
          },
        ],
      })
      .promise();

    logger.info(`Metric logged: ${metricName} = ${value}`);
  } catch (error) {
    logger.error("Failed to log metric to CloudWatch", error as Error);
  }
}

/**
 * Logs structured error/info messages to CloudWatch (for monitoring)
 * @param message The log message
 */
export function logMessage(message: string) {
  logger.info(`[CloudWatch] ${message}`);
}
