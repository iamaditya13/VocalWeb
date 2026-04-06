import { Request, Response, NextFunction } from "express";
import { createClerkClient } from "@clerk/backend";
import { prisma } from "../lib/prisma";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export interface AuthRequest extends Request {
  userId?: string;
  clerkUserId?: string;
  userEmail?: string;
  userPlan?: string;
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the Clerk session token
    const { sub: clerkUserId } = await clerk.verifyToken(token);

    if (!clerkUserId) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    // Find or provision our DB user from Clerk identity
    let user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });

    if (!user) {
      // First time — fetch user details from Clerk and create DB record
      const clerkUser = await clerk.users.getUser(clerkUserId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;

      if (!email) {
        res.status(401).json({ error: "No email on Clerk account" });
        return;
      }

      // Upsert by email in case they had an old account
      user = await prisma.user.upsert({
        where: { email },
        update: { clerkId: clerkUserId },
        create: {
          clerkId: clerkUserId,
          email,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
          image: clerkUser.imageUrl || null,
        },
      });
    }

    req.userId = user.id;
    req.clerkUserId = clerkUserId;
    req.userEmail = user.email;
    req.userPlan = user.plan;

    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requirePlan(...plans: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userPlan || !plans.includes(req.userPlan)) {
      res.status(403).json({
        error: "This feature requires a paid plan",
        upgrade: true,
      });
      return;
    }
    next();
  };
}
