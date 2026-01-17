import express from "express";
import { z } from "zod";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

export const statsRoutes = express.Router();

// Premium-only data endpoint; frontend will blur the page for FREE users anyway,
// but we also enforce access here.
statsRoutes.get("/", authRequired, async (req, res) => {
  if (req.user.plan !== "PREMIUM" && req.user.role !== "OWNER") {
    return res.status(403).json({ error: "Premium required" });
  }

  const uid = req.user.id;

  const revisions = await pool.query(
    `SELECT topic, minutes, revised_at
     FROM revisions
     WHERE user_id=$1
     ORDER BY revised_at DESC
     LIMIT 200`,
    [uid]
  );

  // topic distribution
  const byTopic = await pool.query(
    `SELECT topic, COUNT(*)::int AS count, SUM(minutes)::int AS minutes
     FROM revisions
     WHERE user_id=$1
     GROUP BY topic
     ORDER BY count DESC`,
    [uid]
  );

  res.json({ revisions: revisions.rows, byTopic: byTopic.rows });
});

const addSchema = z.object({
  topic: z.string().min(1).max(80),
  minutes: z.number().int().min(5).max(600)
});

statsRoutes.post("/revision", authRequired, async (req, res) => {
  // Allow logging revision for everyone (even FREE), but only PREMIUM sees analytics.
  const p = addSchema.parse(req.body);
  const r = await pool.query(
    `INSERT INTO revisions (user_id, topic, minutes)
     VALUES ($1,$2,$3)
     RETURNING id, topic, minutes, revised_at`,
    [req.user.id, p.topic, p.minutes]
  );
  res.json(r.rows[0]);
});
