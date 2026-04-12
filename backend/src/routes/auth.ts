import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";
import { logger } from "../lib/logger";

export const authRouter = Router();

// PATCH /api/auth/profile
authRouter.patch("/profile", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = z.object({ name: z.string().min(2).max(100) }).parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { name },
      select: { id: true, name: true, email: true, plan: true },
    });
    res.json({ user });
  } catch (err) {
    logger.error("Profile update error:", err);
    res.status(500).json({ message: "Update failed." });
  }
});

// DELETE /api/auth/account
authRouter.delete("/account", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.user.delete({ where: { id: req.userId } });
    res.json({ success: true });
  } catch (err) {
    logger.error("Delete account error:", err);
    res.status(500).json({ message: "Account deletion failed." });
  }
});
