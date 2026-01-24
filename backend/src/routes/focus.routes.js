import express from "express";
import { z } from "zod";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

export const focusRoutes = express.Router();

const TABLE = "focus_sessions_v2";

focusRoutes.post("/start", authRequired, async (req, res) => {
  const p = z.object({
    topic: z.string().max(80).optional(),
    task_label: z.string().max(120).optional()
  }).parse(req.body);

  const r = await pool.query(
    `INSERT INTO ${TABLE} (user_id, topic, task_label)
     VALUES ($1,$2,$3)
     RETURNING id, started_at, topic, task_label`,
    [req.user.id, p.topic ?? "Focus Session", p.task_label ?? null]
  );

  res.json(r.rows[0]);
});

focusRoutes.post("/end", authRequired, async (req, res) => {
  const p = z.object({
    id: z.number().int(),
    minutes: z.number().int().min(1).max(600),
    completed: z.boolean().optional()
  }).parse(req.body);

  const r = await pool.query(
    `UPDATE ${TABLE}
     SET ended_at = NOW(),
         minutes = $1,
         completed = $2
     WHERE id = $3 AND user_id = $4
     RETURNING id, minutes, completed, topic`,
    [p.minutes, p.completed ?? true, p.id, req.user.id]
  );

  if (!r.rows[0]) return res.status(404).json({ error: "Session not found" });

  // Feed stats
  await pool.query(
    `INSERT INTO revisions (user_id, topic, minutes, confidence)
     VALUES ($1,$2,$3,$4)`,
    [req.user.id, r.rows[0].topic || "Focus Session", p.minutes, 3]
  );

  // ✅ Log gamification activity if completed
  if (r.rows[0].completed) {
    try {
      // Check if gamification record exists
      const { rows: gamRows } = await pool.query(
        `SELECT id FROM user_gamification WHERE user_id = $1`,
        [req.user.id]
      );

      if (!gamRows[0]) {
        await pool.query(
          `INSERT INTO user_gamification (user_id) VALUES ($1)`,
          [req.user.id]
        );
      }

      // Calculate XP based on minutes
      const xpAmount = Math.floor(p.minutes / 25) * 20;

      // Update stats
      await pool.query(
        `UPDATE user_gamification 
         SET focus_sessions_completed = focus_sessions_completed + 1,
             total_study_hours = total_study_hours + $1
         WHERE user_id = $2`,
        [p.minutes / 60, req.user.id]
      );

      // Log XP activity
      await pool.query(
        `INSERT INTO xp_activities (user_id, activity_type, xp_gained, description) 
         VALUES ($1, 'FOCUS', $2, $3)`,
        [req.user.id, xpAmount, `Focus session: ${p.minutes}m`]
      );
    } catch (err) {
      console.error('Failed to log gamification:', err);
    }
  }

  res.json({ ok: true });
});
