import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";

export const sitesRouter = Router();

// GET /sites/:slug  — serve published HTML
sitesRouter.get("/:slug", async (req: Request, res: Response): Promise<void> => {
  try {
    const website = await prisma.website.findFirst({
      where: { slug: req.params.slug, status: "READY" },
      select: { htmlContent: true, businessName: true, publishedAt: true },
    });

    if (!website?.htmlContent) {
      res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Site Not Found</title><meta charset="UTF-8">
        <style>body{font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fafafa;color:#18181b;}
        .container{text-align:center;}h1{font-size:2rem;font-weight:700;margin-bottom:0.5rem;}p{color:#71717a;}</style>
        </head><body><div class="container"><h1>404</h1><p>This site doesn't exist or hasn't been published yet.</p>
        <a href="https://vocalweb.ai" style="margin-top:1.5rem;display:inline-block;background:#18181b;color:white;padding:0.75rem 1.5rem;border-radius:0.75rem;text-decoration:none;font-weight:600;font-size:0.875rem;">Create your own →</a>
        </div></body></html>
      `);
      return;
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(website.htmlContent);
  } catch (err) {
    logger.error("Serve site error:", err);
    res.status(500).send("Error loading site.");
  }
});
