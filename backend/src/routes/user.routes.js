import express from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

export const userRoutes = express.Router();

userRoutes.get("/me", authRequired, async (req, res) => {
  const r = await pool.query(
    "SELECT id, email, account_name, preferred_name, role, plan FROM users WHERE id=$1",
    [req.user.id]
  );
  res.json(r.rows[0]);
});

const updateSchema = z.object({
  accountName: z.string().min(2).max(40).optional(),
  preferredName: z.string().min(1).max(40).optional(),
  email: z.string().email().optional()
});

userRoutes.put("/me", authRequired, async (req, res) => {
  const p = updateSchema.parse(req.body);

  const r = await pool.query(
    `UPDATE users
     SET account_name = COALESCE($1, account_name),
         preferred_name = COALESCE($2, preferred_name),
         email = COALESCE($3, email)
     WHERE id=$4
     RETURNING id, email, account_name, preferred_name, role, plan`,
    [p.accountName || null, p.preferredName || null, p.email?.toLowerCase().trim() || null, req.user.id]
  );

  res.json(r.rows[0]);
});

const passSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8)
});

userRoutes.put("/me/password", authRequired, async (req, res) => {
  const p = passSchema.parse(req.body);

  const r = await pool.query("SELECT password_hash FROM users WHERE id=$1", [req.user.id]);
  const ok = await bcrypt.compare(p.currentPassword, r.rows[0].password_hash);
  if (!ok) return res.status(401).json({ error: "Wrong current password" });

  const hash = await bcrypt.hash(p.newPassword, 12);
  await pool.query("UPDATE users SET password_hash=$1 WHERE id=$2", [hash, req.user.id]);
  res.json({ ok: true });
});
