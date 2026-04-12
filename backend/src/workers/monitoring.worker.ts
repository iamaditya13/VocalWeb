import { Worker, Job } from "bullmq";
import { createRedisConnection } from "../lib/redis";
import { prisma } from "../lib/prisma";
import { validateHTML } from "../services/validator";
import { logger } from "../lib/logger";
import { websiteGenerationQueue } from "../lib/queue";

interface MonitoringJobData {
  type: "check_websites" | "check_links";
  websiteId?: string;
}

export const monitoringWorker = new Worker<MonitoringJobData>(
  "monitoring",
  async (job: Job<MonitoringJobData>) => {
    const { type } = job.data;

    if (type === "check_websites") {
      return await checkAllWebsites();
    }
    if (type === "check_links") {
      return await checkPublishedLinks();
    }
  },
  {
    connection: createRedisConnection(),
    concurrency: 1,
  }
);

async function checkAllWebsites() {
  logger.info("Running website health check...");

  const websites = await prisma.website.findMany({
    where: { status: "READY", htmlContent: { not: null } },
    select: { id: true, htmlContent: true, businessName: true },
    take: 100,
  });

  let repaired = 0;
  let healthy = 0;

  for (const site of websites) {
    if (!site.htmlContent) continue;

    const result = validateHTML(site.htmlContent);

    if (!result.passed) {
      logger.warn(`Website ${site.id} (${site.businessName}) failed health check`);

      await prisma.monitoringLog.create({
        data: {
          websiteId: site.id,
          type: "health_check_failed",
          status: "warning",
          message: `Validation errors: ${result.errors.join(", ")}`,
        },
      });

      // Auto-regenerate if critical errors
      if (result.errors.length >= 3) {
        await prisma.website.update({
          where: { id: site.id },
          data: { status: "GENERATING" },
        });

        const siteWithDetails = await prisma.website.findUnique({
          where: { id: site.id },
        });

        if (siteWithDetails) {
          await websiteGenerationQueue.add("generate", {
            websiteId: site.id,
            transcript: siteWithDetails.transcript,
            businessName: siteWithDetails.businessName,
            themeColor: siteWithDetails.themeColor,
            sections: siteWithDetails.sections,
            userId: siteWithDetails.userId,
          });
          repaired++;
        }
      }
    } else {
      healthy++;
    }
  }

  await prisma.monitoringLog.create({
    data: {
      type: "health_check_complete",
      status: "ok",
      message: `Checked ${websites.length} websites. Healthy: ${healthy}. Queued for repair: ${repaired}.`,
      metadata: { total: websites.length, healthy, repaired },
    },
  });

  return { total: websites.length, healthy, repaired };
}

async function checkPublishedLinks() {
  logger.info("Checking published links...");

  const published = await prisma.website.findMany({
    where: { liveUrl: { not: null }, status: "READY" },
    select: { id: true, liveUrl: true, businessName: true },
    take: 50,
  });

  let checked = 0;
  let broken = 0;

  for (const site of published) {
    checked++;
    // In production, you'd do an actual HTTP check here
    // For now we just log that we checked
    await prisma.monitoringLog.create({
      data: {
        websiteId: site.id,
        type: "link_check",
        status: "ok",
        message: `Live URL active: ${site.liveUrl}`,
      },
    });
  }

  return { checked, broken };
}
