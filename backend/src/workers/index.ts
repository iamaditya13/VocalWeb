import { websiteGenerationWorker } from "./generation.worker";
import { monitoringWorker } from "./monitoring.worker";
import { logger } from "../lib/logger";

export function startWorkers() {
  logger.info("Starting BullMQ workers...");

  websiteGenerationWorker.on("completed", (job) => {
    logger.info(`Generation job completed: ${job.id}`);
  });

  websiteGenerationWorker.on("failed", (job, err) => {
    logger.error(`Generation job failed: ${job?.id}`, err);
  });

  monitoringWorker.on("completed", (job) => {
    logger.info(`Monitoring job completed: ${job.id}`);
  });

  logger.info("All workers started");
}
