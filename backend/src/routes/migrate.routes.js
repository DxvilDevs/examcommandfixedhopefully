import express from "express";
import { pool } from "../config/db.js";

export const migrateRoutes = express.Router();

migrateRoutes.post("/focus-columns", async (req, res) => {
  try {
    await pool.query(`
      ALTER TABLE focus_sessions
      ADD COLUMN IF NOT EXISTS topic TEXT,
      ADD COLUMN IF NOT EXISTS task_label TEXT;
    `);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});