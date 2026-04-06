import { Router, Response } from "express";
import { z } from "zod";
import { authenticate, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { websiteGenerationQueue } from "../lib/queue";
import { logger } from "../lib/logger";
import { validateHTML } from "../services/validator";
import { v4 as uuidv4 } from "uuid";

export const websiteRouter = Router();
websiteRouter.use(authenticate);

const generateSchema = z.object({
  transcript: z.string().min(20).max(5000),
  businessName: z.string().min(1).max(200),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#18181b"),
  sections: z.array(z.string()).min(2).default(["hero", "about", "services", "contact", "footer"]),
});

// POST /api/websites/generate
websiteRouter.post("/generate", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = generateSchema.parse(req.body);
    const userId = req.userId!;

    // Plan limit check
    if (req.userPlan === "FREE") {
      const count = await prisma.website.count({ where: { userId } });
      if (count >= 1) {
        res.status(403).json({
          message: "Free plan allows 1 website. Upgrade to Pro for unlimited websites.",
          upgrade: true,
        });
        return;
      }
    }

    // Create website record
    const website = await prisma.website.create({
      data: {
        userId,
        businessName: body.businessName,
        transcript: body.transcript,
        themeColor: body.themeColor,
        sections: body.sections,
        status: "GENERATING",
      },
    });

    // Queue generation job
    await websiteGenerationQueue.add(
      "generate",
      {
        websiteId: website.id,
        transcript: body.transcript,
        businessName: body.businessName,
        themeColor: body.themeColor,
        sections: body.sections,
        userId,
      },
      { jobId: `website-${website.id}` }
    );

    res.status(202).json({
      id: website.id,
      status: "generating",
      message: "Website generation started.",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: err.errors[0].message });
      return;
    }
    logger.error("Generate website error:", err);
    res.status(500).json({ message: "Failed to start generation." });
  }
});

// GET /api/websites
websiteRouter.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const offset = parseInt(req.query.offset as string) || 0;

    const [total, websites] = await Promise.all([
      prisma.website.count({ where: { userId: req.userId! } }),
      prisma.website.findMany({
        where: { userId: req.userId! },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          businessName: true,
          themeColor: true,
          status: true,
          liveUrl: true,
          slug: true,
          validationPassed: true,
          regenerationCount: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    res.json({ data: websites, total, limit, offset });
  } catch (err) {
    logger.error("Get websites error:", err);
    res.status(500).json({ message: "Failed to fetch websites." });
  }
});

// GET /api/websites/:id
websiteRouter.get("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const website = await prisma.website.findFirst({
      where: { id: req.params.id, userId: req.userId! },
      include: {
        validations: { orderBy: { checkedAt: "desc" }, take: 1 },
      },
    });

    if (!website) {
      res.status(404).json({ message: "Website not found." });
      return;
    }

    res.json({ data: website });
  } catch (err) {
    logger.error("Get website error:", err);
    res.status(500).json({ message: "Failed to fetch website." });
  }
});

// POST /api/websites/:id/regenerate
websiteRouter.post("/:id/regenerate", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const website = await prisma.website.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });

    if (!website) {
      res.status(404).json({ message: "Website not found." });
      return;
    }

    if (website.status === "GENERATING") {
      res.status(409).json({ message: "Website is already being generated." });
      return;
    }

    // Reset status
    await prisma.website.update({
      where: { id: website.id },
      data: { status: "GENERATING", htmlContent: null, validationPassed: false },
    });

    // Log regeneration
    await prisma.regenerationLog.create({
      data: {
        websiteId: website.id,
        triggeredBy: "user",
        success: false,
      },
    });

    // Queue
    await websiteGenerationQueue.add(
      "generate",
      {
        websiteId: website.id,
        transcript: website.transcript,
        businessName: website.businessName,
        themeColor: website.themeColor,
        sections: website.sections,
        userId: website.userId,
        regenerationCount: website.regenerationCount + 1,
      },
      { jobId: `website-${website.id}-regen-${Date.now()}` }
    );

    res.json({ success: true, message: "Regeneration started." });
  } catch (err) {
    logger.error("Regenerate error:", err);
    res.status(500).json({ message: "Regeneration failed." });
  }
});

// POST /api/websites/:id/publish
websiteRouter.post("/:id/publish", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const website = await prisma.website.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });

    if (!website) {
      res.status(404).json({ message: "Website not found." });
      return;
    }

    if (website.status !== "READY") {
      res.status(400).json({ message: "Website is not ready to publish." });
      return;
    }

    // Generate slug if not set
    let slug = website.slug;
    if (!slug) {
      const base = website.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      slug = `${base}-${uuidv4().slice(0, 6)}`;
    }

    const baseUrl = process.env.PUBLISHED_BASE_URL || "https://sites.vocalweb.ai";
    const liveUrl = `${baseUrl}/${slug}`;

    const updated = await prisma.website.update({
      where: { id: website.id },
      data: { slug, liveUrl, publishedAt: new Date() },
    });

    res.json({ success: true, liveUrl: updated.liveUrl });
  } catch (err) {
    logger.error("Publish error:", err);
    res.status(500).json({ message: "Publishing failed." });
  }
});

// DELETE /api/websites/:id
websiteRouter.delete("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const website = await prisma.website.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });

    if (!website) {
      res.status(404).json({ message: "Website not found." });
      return;
    }

    await prisma.website.delete({ where: { id: website.id } });
    res.json({ success: true });
  } catch (err) {
    logger.error("Delete website error:", err);
    res.status(500).json({ message: "Delete failed." });
  }
});

// GET /api/websites/:id/html  (serve published HTML)
websiteRouter.get("/:id/html", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const website = await prisma.website.findFirst({
      where: { id: req.params.id, userId: req.userId! },
      select: { htmlContent: true, businessName: true },
    });

    if (!website?.htmlContent) {
      res.status(404).json({ message: "HTML not available." });
      return;
    }

    res.setHeader("Content-Type", "text/html");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${website.businessName.replace(/\s+/g, "-")}.html"`
    );
    res.send(website.htmlContent);
  } catch (err) {
    logger.error("Get HTML error:", err);
    res.status(500).json({ message: "Failed to retrieve HTML." });
  }
});
