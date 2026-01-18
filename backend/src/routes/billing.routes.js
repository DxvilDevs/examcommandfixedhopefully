import express from "express";
import { z } from "zod";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";
import { getSubscriptionDetails } from "../services/paypal.js";

export const billingRoutes = express.Router();

const confirmSchema = z.object({
  subscriptionId: z.string().min(5)
});

// Called after PayPal approves on the frontend
billingRoutes.post("/paypal/confirm", authRequired, async (req, res) => {
  const { subscriptionId } = confirmSchema.parse(req.body);

  const details = await getSubscriptionDetails(subscriptionId);

  // Typical statuses: APPROVAL_PENDING, ACTIVE, SUSPENDED, CANCELLED, EXPIRED
  const status = String(details.status || "").toUpperCase();

  // For MVP: allow ACTIVE (some accounts go ACTIVE immediately on approve)
  // If yours returns APPROVAL_PENDING briefly, you can allow it too.
  const ok = status === "ACTIVE" || status === "APPROVAL_PENDING";
  if (!ok) return res.status(400).json({ error: `Subscription not active: ${status}` });

  // Optional: enforce correct plan
  const expectedPlanId = process.env.PAYPAL_PLAN_ID;
  if (expectedPlanId && details.plan_id && details.plan_id !== expectedPlanId) {
    return res.status(400).json({ error: "Wrong plan" });
  }

  await pool.query(
    `UPDATE users
     SET plan='PREMIUM',
         paypal_subscription_id=$1,
         premium_since=NOW()
     WHERE id=$2`,
    [subscriptionId, req.user.id]
  );

  res.json({ ok: true, status });
});
