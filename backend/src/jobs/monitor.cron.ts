import cron from "node-cron";
import { monitoringQueue } from "../lib/queue";
import { logger } from "../lib/logger";

export function startMonitoringCron() {
  // Run health check every day at 2:00 AM
  cron.schedule("0 2 * * *", async () => {
    logger.info("Triggering daily website health check...");
    await monitoringQueue.add("daily-health-check", { type: "check_websites" });
  });

  // Check published links every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    logger.info("Triggering published link check...");
    await monitoringQueue.add("link-check", { type: "check_links" });
  });

  logger.info("Monitoring cron jobs scheduled");
}
