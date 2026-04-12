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
  framework?: "HTML" | "NEXT";
  images?: string[];
}

export const websiteGenerationWorker = new Worker<GenerationJobData>(
  "website-generation",
  async (job: Job<GenerationJobData>) => {
    const {
      websiteId,
      transcript,
      businessName,
      themeColor,
      sections,
      regenerationCount,
      framework = "HTML",
      images = [],
    } = job.data;

    logger.info(`Processing ${framework} generation job for website: ${websiteId}`);

    let lastError: Error | null = null;
    let htmlContent: string | null = null;
    let projectFiles: Record<string, string> | null = null;
    let validationResult: ReturnType<typeof validateHTML> | null = null;
    let providerUsed = "unknown";
    let providerLatencyMs = 0;
    let fallbackUsed = false;
    let providerRetryCount = 0;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        logger.info(`Generation attempt ${attempt}/${MAX_RETRIES} for ${websiteId}`);

        const result = await generateWebsite({
          transcript,
          businessName,
          themeColor,
          sections,
          framework,
          images,
        });

        providerUsed = result.provider;
        providerLatencyMs = result.latencyMs;
        fallbackUsed = result.fallbackUsed;
        providerRetryCount = result.retryCount;

        if (result.framework === "NEXT" && result.projectFiles) {
          projectFiles = result.projectFiles;
          // Light validation: must contain package.json + app/page.tsx
          const hasPkg = Object.keys(projectFiles).some((p) => p.endsWith("package.json"));
          const hasPage = Object.keys(projectFiles).some((p) => /app\/page\.tsx$/.test(p));
          if (!hasPkg || !hasPage) {
            throw new Error("Generated Next.js project is missing package.json or app/page.tsx");
          }
          break;
        }

        if (result.html) {
          htmlContent = result.html;
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

          if (validationResult.passed) break;

          logger.warn(`Validation failed on attempt ${attempt}, repairing…`);
          htmlContent = repairHTML(htmlContent);
          const repairValidation = validateHTML(htmlContent);
          if (repairValidation.passed) {
            validationResult = repairValidation;
            break;
          }
        }

        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      } catch (err) {
        lastError = err as Error;
        logger.error(`Attempt ${attempt} failed for ${websiteId}:`, err);
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 2000 * attempt));
        }
      }
    }

    if (!htmlContent && !projectFiles) {
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

    await prisma.website.update({
      where: { id: websiteId },
      data: {
        htmlContent: htmlContent ?? null,
        projectFiles: projectFiles ?? undefined,
        status: "READY",
        validationPassed: framework === "NEXT" ? true : validationResult?.passed ?? false,
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
        message: `Generated ${framework} via ${providerUsed}`,
        metadata: {
          provider: providerUsed,
          latencyMs: providerLatencyMs,
          fallbackUsed,
          retryCount: providerRetryCount,
          framework,
          fileCount: projectFiles ? Object.keys(projectFiles).length : undefined,
          validationScore: validationResult?.score,
          validationPassed: validationResult?.passed,
        },
      },
    });

    logger.info(
      `Successfully generated ${framework} website: ${websiteId} via ${providerUsed} in ${providerLatencyMs}ms`
    );
    return { websiteId, success: true, provider: providerUsed, framework };
  },
  {
    connection: createRedisConnection(),
    concurrency: 3,
    limiter: { max: 10, duration: 60000 },
  }
);
