// src/config.ts
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const CONFIG = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 4000,

  // Database
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",

  // AWS
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  S3_BUCKET: process.env.S3_BUCKET || "my-ecommerce-bucket",
  SQS_URL: process.env.SQS_URL || "",
  SQS_ARN: process.env.SQS_ARN || "",
  SNS_TOPIC_ARN: process.env.SNS_TOPIC_ARN || "",

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info", // <-- Added

  // Security (JWT secret, etc.)
  JWT_SECRET: process.env.JWT_SECRET || "supersecretkey",

  // Payment
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
};
