import { Router, Response, Request } from "express";
import { z } from "zod";
import { authenticate, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";
import crypto from "crypto";

export const billingRouter = Router();

// GET /api/billing/subscription
billingRouter.get("/subscription", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { plan: true },
    });

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.userId },
    });

    res.json({
      plan: user?.plan?.toLowerCase() || "free",
      subscription: subscription || null,
      renewsAt: subscription?.currentPeriodEnd || null,
    });
  } catch (err) {
    logger.error("Get subscription error:", err);
    res.status(500).json({ message: "Failed to get subscription info." });
  }
});

// POST /api/billing/create-checkout
billingRouter.post("/create-checkout", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { planId } = z.object({ planId: z.enum(["pro", "business"]) }).parse(req.body);

    const PLAN_AMOUNTS: Record<string, number> = {
      pro: 99900,      // ₹999 in paise
      business: 299900, // ₹2999 in paise
    };

    const amount = PLAN_AMOUNTS[planId];
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;

    if (!razorpayKeyId) {
      // Return a mock checkout URL for development
      res.json({
        checkoutUrl: `/dashboard/billing?mock_checkout=${planId}`,
        orderId: `mock_order_${Date.now()}`,
      });
      return;
    }

    // Create Razorpay order
    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.userId,
        plan: planId,
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        userId: req.userId!,
        razorpayOrderId: order.id,
        amount,
        currency: "INR",
        status: "PENDING",
        plan: planId.toUpperCase() as "PRO" | "BUSINESS",
      },
    });

    res.json({
      orderId: order.id,
      amount,
      currency: "INR",
      razorpayKeyId,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid plan." });
      return;
    }
    logger.error("Create checkout error:", err);
    res.status(500).json({ message: "Checkout failed. Please try again." });
  }
});

// POST /api/billing/webhook  (Razorpay webhook)
billingRouter.post("/webhook", async (req: Request, res: Response): Promise<void> => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      res.json({ received: true });
      return;
    }

    const signature = req.headers["x-razorpay-signature"] as string;
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      res.status(400).json({ error: "Invalid signature" });
      return;
    }

    const event = req.body;

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const { userId, plan } = payment.notes || {};

      if (userId && plan) {
        const now = new Date();
        const periodEnd = new Date(now.setMonth(now.getMonth() + 1));

        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { plan: plan.toUpperCase() },
          }),
          prisma.payment.updateMany({
            where: { razorpayOrderId: payment.order_id },
            data: { razorpayPaymentId: payment.id, status: "CAPTURED" },
          }),
          prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              plan: plan.toUpperCase(),
              status: "ACTIVE",
              razorpaySubId: payment.id,
              currentPeriodStart: new Date(),
              currentPeriodEnd: periodEnd,
            },
            update: {
              plan: plan.toUpperCase(),
              status: "ACTIVE",
              razorpaySubId: payment.id,
              currentPeriodStart: new Date(),
              currentPeriodEnd: periodEnd,
            },
          }),
        ]);
      }
    }

    res.json({ received: true });
  } catch (err) {
    logger.error("Webhook error:", err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});
