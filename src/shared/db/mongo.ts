// src/shared/db/mongo.ts
import mongoose from "mongoose";
import { CONFIG } from "../../config";

let isConnected = false; // To prevent re-connection in Lambda cold starts

export async function connectMongo(): Promise<typeof mongoose> {
  if (isConnected) {
    return mongoose;
  }

  try {
    mongoose.set("strictQuery", true); // Avoids deprecation warnings

    await mongoose.connect(CONFIG.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast if Mongo is down
      maxPoolSize: 10, // Connection pooling for concurrent Lambda invocations
    });

    isConnected = true;
    console.log("MongoDB connected successfully");
    return mongoose;
  } catch (error) {
    console.error("MongoDB connection failed", error);
    throw new Error("Failed to connect to MongoDB");
  }
}
