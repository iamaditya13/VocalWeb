import { Queue } from "bullmq";
import { createRedisConnection } from "./redis";

const connection = createRedisConnection();

export const websiteGenerationQueue = new Queue("website-generation", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export const monitoringQueue = new Queue("monitoring", {
  connection,
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 20 },
  },
});
