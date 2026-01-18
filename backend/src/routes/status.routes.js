import express from "express";
import { z } from "zod";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

export const statusRoutes = express.Router();

// Public: list incidents
statusRoutes.get("/", async (_req, res) => {
  const r = await pool.query(
    "SELECT id, status, title, description, created_at, updated_at FROM issues ORDER BY created_at DESC"
  );
  res.json(r.rows);
});

// Public: incident timeline
statusRoutes.get("/:id/history", async (req, res) => {
  const id = Number(req.params.id);
  const r = await pool.query(
    `SELECT id, action, status, title, description, created_at
     FROM issue_events
     WHERE issue_id=$1
     ORDER BY created_at DESC`,
    [id]
  );
  res.json(r.rows);
});

// Owner-only: create/update/delete
const issueSchema = z.object({
  status: z.enum(["INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"]),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(2000)
});

async f
