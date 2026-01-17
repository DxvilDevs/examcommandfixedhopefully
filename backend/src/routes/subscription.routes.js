import express from "express";
import { z } from "zod";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

export const subscriptionRoutes = express.Router();

/**
 * MVP subscription toggler:
 * In production, swap this for Stripe checkout + webhook that flips plan to PREMIUM.
 */
const schema = z.object({ plan: z.enum(["FREE", "PREMIUM"]) });

subscriptionRoutes.post("/set", authRequired, async (req, res) => {
  const p = schema.parse(req.body);
  const r = await pool.query(
    "UPDATE users SET plan=$1 WHERE id=$2 RETURNING id, email, account_name, preferred_name, role, plan",
    [p.plan, req.user.id]
  );
  res.json(r.rows[0]);
});
