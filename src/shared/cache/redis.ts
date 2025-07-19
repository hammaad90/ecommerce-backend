// src/shared/cache/redis.ts
import { createClient } from "redis";
import { CONFIG } from "../../config";

let redisClient: ReturnType<typeof createClient> | null = null;

export async function createRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  redisClient = createClient({
    url: CONFIG.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 2000), // Auto-reconnect
    },
  });

  redisClient.on("error", (err) => {
    console.error("Redis Client Error", err);
  });

  await redisClient.connect();
  console.log("Redis connected successfully");

  return redisClient;
}
