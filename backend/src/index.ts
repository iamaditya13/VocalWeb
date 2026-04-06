import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";

import { authRouter } from "./routes/auth";
import { websiteRouter } from "./routes/websites";
import { dashboardRouter } from "./routes/dashboard";
import { billingRouter } from "./routes/billing";
import { adminRouter } from "./routes/admin";
import { sitesRouter } from "./routes/sites";
import { logger } from "./lib/logger";
import { startWorkers } from "./workers";
import { startMonitoringCron } from "./jobs/monitor.cron";
import { prisma } from "./lib/prisma";

const app = express();
const PORT = process.env.PORT || 4000;

// Security
app.use(helmet());
app.use(compression());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Generation-specific stricter limit
const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: "Too many generation requests. Please try again later." },
});

// Logging
app.use(morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/websites", websiteRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/billing", billingRouter);
app.use("/api/admin", adminRouter);
app.use("/sites", sitesRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({
    error: "Something went wrong. Please try again.",
  });
});

async function bootstrap() {
  try {
    await prisma.$connect();
    logger.info("Database connected");

    startWorkers();
    logger.info("Workers started");

    startMonitoringCron();
    logger.info("Monitoring cron started");

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error("Bootstrap failed:", err);
    process.exit(1);
  }
}

bootstrap();

export default app;
