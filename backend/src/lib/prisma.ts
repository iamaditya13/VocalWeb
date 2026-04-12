import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      { level: "error", emit: "event" },
      { level: "warn", emit: "event" },
    ],
  });

prisma.$on("error" as never, (e: unknown) => {
  logger.error("Prisma error:", e);
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
