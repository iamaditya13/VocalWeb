import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";
import { formatDistanceToNow } from "date-fns";

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);

// GET /api/dashboard/stats
dashboardRouter.get("/stats", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalWebsites, liveWebsites, thisMonthWebsites, latestWebsite, user] =
      await Promise.all([
        prisma.website.count({ where: { userId } }),
        prisma.website.count({ where: { userId, liveUrl: { not: null } } }),
        prisma.website.count({ where: { userId, createdAt: { gte: startOfMonth } } }),
        prisma.website.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true, regenerationCount: true },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { plan: true },
        }),
      ]);

    const plan = user?.plan || "FREE";
    const generationLimit = plan === "FREE" ? 1 : plan === "PRO" ? "∞" : "∞";

    const totalGenerations =
      totalWebsites +
      ((await prisma.regenerationLog.count({ where: { website: { userId } } })) || 0);

    res.json({
      totalWebsites,
      liveWebsites,
      thisMonth: thisMonthWebsites,
      generationsUsed: totalGenerations,
      generationLimit,
      lastGeneratedAgo: latestWebsite
        ? formatDistanceToNow(latestWebsite.createdAt, { addSuffix: true })
        : "—",
      plan,
    });
  } catch (err) {
    logger.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Failed to load stats." });
  }
});
