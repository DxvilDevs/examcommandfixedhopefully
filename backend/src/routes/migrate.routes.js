import express from "express";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

export const migrateRoutes = express.Router();

/**
 * One-time migration: add missing columns to focus_sessions.
 * Keep this route temporarily, run it once, then delete it.
 *
 * SECURITY: Only allow OWNER users.
 */
migrateRoutes.post("/focus-columns", authRequired, async (req, res) => {
  try {
    // Only allow owner to run migrations
    if (req.user?.role !== "OWNER") {
      return res.status(403).json({ error: "Forbidden" });
    }

    await pool.query(`
      ALTER TABLE focus_sessions
      ADD COLUMN IF NOT EXISTS topic TEXT,
      ADD COLUMN IF NOT EXISTS task_label TEXT;
    `);

    res.json({ ok: true, message: "focus_sessions columns ensured" });
  } catch (err) {
    console.error("MIGRATION ERROR:", err);
    res.status(500).json({ error: err.message || "Migration failed" });
  }
});