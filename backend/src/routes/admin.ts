import { Router, Request, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";

export const adminRouter = Router();

function requireAdmin(req: AuthRequest, res: Response, next: Function): void {
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  if (!req.userEmail || !adminEmails.includes(req.userEmail)) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

adminRouter.use(authenticate);
adminRouter.use(requireAdmin);

// GET /api/admin/stats
adminRouter.get("/stats", async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalWebsites, readyWebsites, failedWebsites, recentLogs] =
      await Promise.all([
        prisma.user.count(),
        prisma.website.count(),
        prisma.website.count({ where: { status: "READY" } }),
        prisma.website.count({ where: { status: "FAILED" } }),
        prisma.monitoringLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
      ]);

    res.json({
      totalUsers,
      totalWebsites,
      readyWebsites,
      failedWebsites,
      recentLogs,
    });
  } catch (err) {
    logger.error("Admin stats error:", err);
    res.status(500).json({ error: "Failed to load admin stats" });
  }
});

// GET /api/admin/websites
adminRouter.get("/websites", async (req: Request, res: Response): Promise<void> => {
  try {
    const websites = await prisma.website.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { name: true, email: true } },
      },
    });
    res.json({ data: websites });
  } catch (err) {
    logger.error("Admin websites error:", err);
    res.status(500).json({ error: "Failed to load websites" });
  }
});

// GET /api/admin/provider-stats
// Returns aggregated analytics per AI provider from MonitoringLog.metadata
adminRouter.get("/provider-stats", async (_req: Request, res: Response): Promise<void> => {
  try {
    const successLogs = await prisma.monitoringLog.findMany({
      where: { type: "generation_success" },
      select: { metadata: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    const failedLogs = await prisma.monitoringLog.findMany({
      where: { type: "generation_failed" },
      select: { metadata: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    const allLogs = [...successLogs, ...failedLogs];

    // Aggregate per-provider
    const counts: Record<string, { success: number; failed: number; totalLatency: number }> = {
      gemini: { success: 0, failed: 0, totalLatency: 0 },
      groq: { success: 0, failed: 0, totalLatency: 0 },
      emergency: { success: 0, failed: 0, totalLatency: 0 },
    };

    let totalGenerations = 0;
    let totalFallback = 0;
    let totalValidationPassed = 0;
    let latencySamples: number[] = [];

    for (const log of successLogs) {
      const meta = log.metadata as Record<string, unknown> | null;
      if (!meta) continue;

      const provider = (meta.provider as string) || "unknown";
      const latency = (meta.latencyMs as number) || 0;
      const fallback = meta.fallbackUsed as boolean;
      const validationPassed = meta.validationPassed as boolean;

      if (counts[provider]) counts[provider].success++;
      if (latency) {
        if (counts[provider]) counts[provider].totalLatency += latency;
        latencySamples.push(latency);
      }
      if (fallback) totalFallback++;
      if (validationPassed) totalValidationPassed++;
      totalGenerations++;
    }

    for (const log of failedLogs) {
      const meta = log.metadata as Record<string, unknown> | null;
      if (!meta) continue;
      const provider = (meta.provider as string) || "unknown";
      if (counts[provider]) counts[provider].failed++;
    }

    const avgLatency =
      latencySamples.length > 0
        ? Math.round(latencySamples.reduce((a, b) => a + b, 0) / latencySamples.length)
        : 0;

    const geminiTotal = counts.gemini.success + counts.gemini.failed;
    const groqTotal = counts.groq.success + counts.groq.failed;
    const emergencyTotal = counts.emergency.success;

    res.json({
      totalGenerations,
      providers: {
        gemini: {
          success: counts.gemini.success,
          failed: counts.gemini.failed,
          successRate: geminiTotal > 0 ? Math.round((counts.gemini.success / geminiTotal) * 100) : 0,
          avgLatencyMs:
            counts.gemini.success > 0
              ? Math.round(counts.gemini.totalLatency / counts.gemini.success)
              : 0,
        },
        groq: {
          success: counts.groq.success,
          failed: counts.groq.failed,
          successRate: groqTotal > 0 ? Math.round((counts.groq.success / groqTotal) * 100) : 0,
          avgLatencyMs:
            counts.groq.success > 0
              ? Math.round(counts.groq.totalLatency / counts.groq.success)
              : 0,
        },
        emergency: {
          used: emergencyTotal,
          rate:
            totalGenerations > 0 ? Math.round((emergencyTotal / totalGenerations) * 100) : 0,
        },
      },
      fallbackRate:
        totalGenerations > 0 ? Math.round((totalFallback / totalGenerations) * 100) : 0,
      validationPassRate:
        totalGenerations > 0 ? Math.round((totalValidationPassed / totalGenerations) * 100) : 0,
      avgGenerationLatencyMs: avgLatency,
    });
  } catch (err) {
    logger.error("Admin provider-stats error:", err);
    res.status(500).json({ error: "Failed to load provider stats" });
  }
});
