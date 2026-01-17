import express from "express";
import { z } from "zod";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

export const statusRoutes = express.Router();

// Public: view issues
statusRoutes.get("/", async (_req, res) => {
  const r = await pool.query(
    "SELECT id, status, title, description, created_at, updated_at FROM issues ORDER BY created_at DESC"
  );
  res.json(r.rows);
});

// Owner-only: add/update
const issueSchema = z.object({
  status: z.enum(["INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"]),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(2000)
});

statusRoutes.post("/", authRequired, requireRole("OWNER"), async (req, res) => {
  const p = issueSchema.parse(req.body);
  const r = await pool.query(
    `INSERT INTO issues (status, title, description)
     VALUES ($1,$2,$3)
     RETURNING id, status, title, description, created_at, updated_at`,
    [p.status, p.title, p.description]
  );
  res.json(r.rows[0]);
});

statusRoutes.put("/:id", authRequired, requireRole("OWNER"), async (req, res) => {
  const id = Number(req.params.id);
  const p = issueSchema.parse(req.body);
  const r = await pool.query(
    `UPDATE issues
     SET status=$1, title=$2, description=$3, updated_at=NOW()
     WHERE id=$4
     RETURNING id, status, title, description, created_at, updated_at`,
    [p.status, p.title, p.description, id]
  );
  res.json(r.rows[0] || null);
});
