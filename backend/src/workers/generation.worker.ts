import { Worker, Job } from "bullmq";
import { createRedisConnection } from "../lib/redis";
import { prisma } from "../lib/prisma";
import { generateWebsite } from "../services/generator";
import { validateHTML, repairHTML } from "../services/validator";
import { logger } from "../lib/logger";

const MAX_RETRIES = 3;

interface GenerationJobData {
  websiteId: string;
  transcript: string;
  businessName: string;
  themeColor: string;
  sections: string[];
  userId: string;
  regenerationCount?: number;
}

export const websiteGenerationWorker = new Worker<GenerationJobData>(
  "website-generation",
  async (job: Job<GenerationJobData>) => {
    const { websiteId, transcript, businessName, themeColor, sections, regenerationCount } =
      job.data;

    logger.info(`Processing generation job for website: ${websiteId}`);

    let lastError: Error | null = null;
    let htmlContent: string | null = null;
    let validationResult = null;
    let providerUsed: string = "unknown";
    let providerLatencyMs: number = 0;
    let fallbackUsed: boolean = false;
    let providerRetryCount: number = 0;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        logger.info(`Generation attempt ${attempt}/${MAX_RETRIES} for ${websiteId}`);

        const result = await generateWebsite({
          transcript,
          businessName,
          themeColor,
          sections,
        });

        htmlContent = result.html;
        providerUsed = result.provider;
        providerLatencyMs = result.latencyMs;
        fallbackUsed = result.fallbackUsed;
        providerRetryCount = result.retryCount;

        // Validate
        validationResult = validateHTML(htmlContent);

        await prisma.validation.create({
          data: {
            websiteId,
            passed: validationResult.passed,
            errors: validationResult.errors,
            warnings: validationResult.warnings,
            attemptNumber: attempt,
          },
        });

        if (validationResult.passed) {
          break;
        }

        // Auto-repair on failure
        logger.warn(`Validation failed on attempt ${attempt}, repairing…`);
        htmlContent = repairHTML(htmlContent);

        const repairValidation = validateHTML(htmlContent);
        if (repairValidation.passed) {
          validationResult = repairValidation;
          break;
        }

        if (attempt < MAX_RETRIES) {
          logger.info(`Retrying generation for ${websiteId}…`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      } catch (err) {
        lastError = err as Error;
        logger.error(`Attempt ${attempt} failed for ${websiteId}:`, err);

        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
        }
      }
    }

    if (!htmlContent) {
      await prisma.website.update({
        where: { id: websiteId },
        data: { status: "FAILED" },
      });

      await prisma.monitoringLog.create({
        data: {
          websiteId,
          type: "generation_failed",
          status: "error",
          message: lastError?.message || "All generation attempts failed",
          metadata: {
            provider: providerUsed,
            latencyMs: providerLatencyMs,
            fallbackUsed,
            retryCount: providerRetryCount,
          },
        },
      });

      throw new Error(lastError?.message || "Website generation failed after all retries");
    }

    // Save successful result
    await prisma.website.update({
      where: { id: websiteId },
      data: {
        htmlContent,
        status: "READY",
        validationPassed: validationResult?.passed ?? false,
        validationErrors: validationResult?.errors ?? [],
        regenerationCount: regenerationCount ?? 0,
        updatedAt: new Date(),
      },
    });

    if (regenerationCount && regenerationCount > 0) {
      await prisma.regenerationLog.updateMany({
        where: { websiteId, success: false },
        data: { success: true },
      });
    }

    await prisma.monitoringLog.create({
      data: {
        websiteId,
        type: "generation_success",
        status: "ok",
        message: `Generated via ${providerUsed}. Validation: ${validationResult?.passed ? "passed" : "partial"}`,
        metadata: {
          provider: providerUsed,
          latencyMs: providerLatencyMs,
          fallbackUsed,
          retryCount: providerRetryCount,
          validationScore: validationResult?.score,
          validationPassed: validationResult?.passed,
        },
      },
    });

    logger.info(
      `Successfully generated website: ${websiteId} via ${providerUsed} in ${providerLatencyMs}ms`
    );
    return { websiteId, success: true, provider: providerUsed };
  },
  {
    connection: createRedisConnection(),
    concurrency: 3,
    limiter: {
      max: 10,
      duration: 60000,
    },
  }
);
