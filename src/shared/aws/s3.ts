// src/shared/aws/s3.ts
import { S3 } from "aws-sdk";
import { CONFIG } from "../../config";
import { logger } from "../logger";

const s3 = new S3({ region: CONFIG.AWS_REGION });

/**
 * Uploads a file to S3
 * @param key The S3 key (path/filename)
 * @param body The file content (Buffer or string)
 * @param contentType MIME type of the file
 */
export async function uploadToS3(key: string, body: Buffer | string, contentType: string) {
  try {
    const result = await s3
      .upload({
        Bucket: CONFIG.S3_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
      .promise();

    logger.info(`File uploaded to S3: ${result.Location}`);
    return result.Location;
  } catch (error) {
    logger.error("S3 upload failed", error as Error);
    throw new Error("Failed to upload file to S3");
  }
}

/**
 * Fetches a file from S3
 * @param key The S3 key
 */
export async function getFromS3(key: string) {
  try {
    const data = await s3
      .getObject({
        Bucket: CONFIG.S3_BUCKET,
        Key: key,
      })
      .promise();

    return data.Body;
  } catch (error) {
    logger.error("S3 fetch failed", error as Error);
    throw new Error("Failed to fetch file from S3");
  }
}

/**
 * Deletes a file from S3
 * @param key The S3 key
 */
export async function deleteFromS3(key: string) {
  try {
    await s3
      .deleteObject({
        Bucket: CONFIG.S3_BUCKET,
        Key: key,
      })
      .promise();

    logger.info(`File deleted from S3: ${key}`);
  } catch (error) {
    logger.error("S3 delete failed", error as Error);
    throw new Error("Failed to delete file from S3");
  }
}
