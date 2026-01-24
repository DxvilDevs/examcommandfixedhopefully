import express from "express";
import { z } from "zod";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

export const focusRoutes = express.Router();

/* ===========================
   START FOCUS SESSION
=========================== */
focusRoutes.post("/start", authRequired, async (req, res) => {
  const p = z.object({
    topic: z.string().max(80).optional(),
    task_label: z.string().max(120).optional()
  }).parse(req.body);

  const r = await pool.query(
    `INSERT INTO focus_sessions (user_id, topic, task_label)
     VALUES ($1,$2,$3)
     RETURNING id, started_at, topic`,
    [req.user.id, p.topic || "Focus Session", p.task_label || null]
  );

  res.json(r.rows[0]);
});

/* ===========================
   END FOCUS SESSION
=========================== */
focusRoutes.post("/end", authRequired, async (req, res) => {
  const p = z.object({
    id: z.number().int(),
    minutes: z.number().int().min(1).max(600),
    completed: z.boolean().optional()
  }).parse(req.body);

  const r = await pool.query(
    `UPDATE focus_sessions
     SET ended_at = NOW(),
         minutes = $1,
         completed = $2
     WHERE id = $3 AND user_id = $4
     RETURNING id, minutes, completed, topic`,
    [p.minutes, p.completed ?? true, p.id, req.user.id]
  );

  if (!r.rows[0]) {
    return res.status(404).json({ error: "Session not found" });
  }

  // Auto-log into revisions using the SAME topic
  await pool.query(
    `INSERT INTO revisions (user_id, topic, minutes, confidence)
     VALUES ($1,$2,$3,$4)`,
    [req.user.id, r.rows[0].topic || "Focus Session", p.minutes, 3]
  );

  res.json({ ok: true });
});