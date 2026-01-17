import express from "express";
import { z } from "zod";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

export const legalRoutes = express.Router();

// Public read
legalRoutes.get("/:key", async (req, res) => {
  const key = String(req.params.key).toUpperCase();
  const r = await pool.query("SELECT key, title, content, updated_at FROM legal_docs WHERE key=$1", [key]);
  if (!r.rows[0]) return res.status(404).json({ error: "Not found" });
  res.json(r.rows[0]);
});

// Owner edit
const schema = z.object({
  title: z.string().min(1).max(120),
  content: z.string().min(1).max(50000)
});

legalRoutes.put("/:key", authRequired, requireRole("OWNER"), async (req, res) => {
  const key = String(req.params.key).toUpperCase();
  const p = schema.parse(req.body);
  const r = await pool.query(
    `UPDATE legal_docs
     SET title=$1, content=$2, updated_at=NOW()
     WHERE key=$3
     RETURNING key, title, content, updated_at`,
    [p.title, p.content, key]
  );
  res.json(r.rows[0] || null);
});
