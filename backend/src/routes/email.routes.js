import express from "express";
import { z } from "zod";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

export const emailRoutes = express.Router();

// GET /email/settings
emailRoutes.get("/settings", authRequired, async (req, res) => {
  let { rows } = await pool.query(
    `SELECT * FROM email_preferences WHERE user_id = $1`,
    [req.user.id]
  );

  if (!rows[0]) {
    // Create default preferences
    await pool.query(
      `INSERT INTO email_preferences (user_id) VALUES ($1)`,
      [req.user.id]
    );
    rows = await pool.query(
      `SELECT * FROM email_preferences WHERE user_id = $1`,
      [req.user.id]
    );
  }

  const prefs = rows[0];

  res.json({
    weeklyDigest: prefs.weekly_digest,
    dailyReminders: prefs.daily_reminders,
    achievementAlerts: prefs.achievement_alerts,
    overdueTasks: prefs.overdue_tasks,
    preferredTime: prefs.preferred_time
  });
});

// PUT /email/settings
const settingsSchema = z.object({
  weeklyDigest: z.boolean().optional(),
  dailyReminders: z.boolean().optional(),
  achievementAlerts: z.boolean().optional(),
  overdueTasks: z.boolean().optional(),
  preferredTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional()
});

emailRoutes.put("/settings", authRequired, async (req, res) => {
  const p = settingsSchema.parse(req.body);

  // Ensure record exists
  await pool.query(
    `INSERT INTO email_preferences (user_id) 
     VALUES ($1) 
     ON CONFLICT (user_id) DO NOTHING`,
    [req.user.id]
  );

  const { rows } = await pool.query(
    `UPDATE email_preferences 
     SET weekly_digest = COALESCE($1, weekly_digest),
         daily_reminders = COALESCE($2, daily_reminders),
         achievement_alerts = COALESCE($3, achievement_alerts),
         overdue_tasks = COALESCE($4, overdue_tasks),
         preferred_time = COALESCE($5, preferred_time),
         updated_at = NOW()
     WHERE user_id = $6
     RETURNING *`,
    [
      p.weeklyDigest,
      p.dailyReminders,
      p.achievementAlerts,
      p.overdueTasks,
      p.preferredTime,
      req.user.id
    ]
  );

  const prefs = rows[0];

  res.json({
    weeklyDigest: prefs.weekly_digest,
    dailyReminders: prefs.daily_reminders,
    achievementAlerts: prefs.achievement_alerts,
    overdueTasks: prefs.overdue_tasks,
    preferredTime: prefs.preferred_time
  });
});
