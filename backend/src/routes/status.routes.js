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

async function logEvent(issueId, action, issueRow) {
  await pool.query(
    `INSERT INTO issue_events (issue_id, action, status, title, description)
     VALUES ($1,$2,$3,$4,$5)`,
    [issueId, action, issueRow.status, issueRow.title, issueRow.description]
  );
}

statusRoutes.post("/", authRequired, requireRole("OWNER"), async (req, res) => {
  const p = issueSchema.parse(req.body);

  const r = await pool.query(
    `INSERT INTO issues (status, title, description)
     VALUES ($1,$2,$3)
     RETURNING id, status, title, description, created_at, updated_at`,
    [p.status, p.title, p.description]
  );

  const issue = r.rows[0];
  await logEvent(issue.id, "CREATED", issue);

  res.json(issue);
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

  const issue = r.rows[0];
  if (!issue) return res.status(404).json({ error: "Not found" });

  await logEvent(issue.id, "UPDATED", issue);
  res.json(issue);
});

statusRoutes.delete("/:id", authRequired, requireRole("OWNER"), async (req, res) => {
  const id = Number(req.params.id);

  const existing = await pool.query(
    "SELECT id, status, title, description FROM issues WHERE id=$1",
    [id]
  );
  const issue = existing.rows[0];
  if (!issue) return res.status(404).json({ error: "Not found" });

  await logEvent(issue.id, "DELETED", issue);

  await pool.query("DELETE FROM issues WHERE id=$1", [id]);
  res.json({ ok: true });
});
