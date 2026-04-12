import { Router, Response } from "express";
import { z } from "zod";
import { authenticate, AuthRequest } from "../middleware/auth";
import { logger } from "../lib/logger";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const imagesRouter = Router();
imagesRouter.use(authenticate);

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── GET /api/images/search?q=cafe ─────────────────────────────────────────────
// Proxies Unsplash search so we don't expose the API key to the browser.
imagesRouter.get("/search", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const q = z.string().min(1).max(80).parse(req.query.q);
    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (!key) {
      res.status(503).json({ message: "Image search not configured (UNSPLASH_ACCESS_KEY missing)." });
      return;
    }

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=20&orientation=landscape`;
    const r = await fetch(url, { headers: { Authorization: `Client-ID ${key}` } });
    if (!r.ok) {
      logger.warn(`Unsplash ${r.status}: ${await r.text()}`);
      res.status(502).json({ message: "Image search failed." });
      return;
    }

    const data = (await r.json()) as { results: Array<{ id: string; alt_description?: string; urls: { regular: string; small: string }; user: { name: string; links: { html: string } } }> };
    res.json({
      results: data.results.map((p) => ({
        id: p.id,
        alt: p.alt_description || "",
        url: `${p.urls.regular.split("?")[0]}?auto=format&fit=crop&w=1600&q=80`,
        thumb: p.urls.small,
        credit: { name: p.user.name, link: p.user.links.html },
      })),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid query." });
      return;
    }
    logger.error("Image search error:", err);
    res.status(500).json({ message: "Image search failed." });
  }
});

// ── POST /api/images/upload ───────────────────────────────────────────────────
// Body: { filename, contentType, dataBase64 }  — max ~8MB payload
const uploadSchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().regex(/^image\/(png|jpe?g|webp|gif)$/i),
  dataBase64: z.string().min(100).max(12_000_000),
});

imagesRouter.post("/upload", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = uploadSchema.parse(req.body);
    const ext = (body.contentType.split("/")[1] || "jpg").replace("jpeg", "jpg");
    const id = crypto.randomBytes(10).toString("hex");
    const filename = `${req.userId}-${Date.now()}-${id}.${ext}`;
    const fp = path.join(UPLOAD_DIR, filename);

    const buffer = Buffer.from(body.dataBase64, "base64");
    if (buffer.byteLength > 8 * 1024 * 1024) {
      res.status(413).json({ message: "Image too large (max 8MB)." });
      return;
    }

    fs.writeFileSync(fp, buffer);

    const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
    res.json({ url: `${base}/uploads/${filename}` });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: err.errors[0].message });
      return;
    }
    logger.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed." });
  }
});
