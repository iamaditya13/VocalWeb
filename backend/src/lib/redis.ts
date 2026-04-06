import Redis from "ioredis";
import { logger } from "./logger";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
});

redis.on("error", (err) => {
  logger.error("Redis error:", err.message);
});

redis.on("connect", () => {
  logger.info("Redis connected");
});

// Create a separate connection for BullMQ
export function createRedisConnection() {
  return new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}
