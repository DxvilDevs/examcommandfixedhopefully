import express from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth.js";
import { buildTodaysPlan } from "../services/planEngine.js";

export const planRoutes = express.Router();

planRoutes.get("/today", authRequired, async (req, res) => {
  const q = z.object({ minutes: z.coerce.number().int().min(15).max(240).optional() }).parse(req.query);
  const plan = await buildTodaysPlan(req.user.id, q.minutes ?? 90);
  res.json(plan);
});
