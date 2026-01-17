import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { pool } from "../config/db.js";
import { ENV } from "../config/env.js";

export const authRoutes = express.Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  accountName: z.string().min(2).max(40).optional(),
  preferredName: z.string().min(1).max(40).optional()
});

authRoutes.post("/signup", async (req, res) => {
  const p = signupSchema.parse(req.body);
  const email = p.email.toLowerCase().trim();

  const exists = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
  if (exists.rows.length) return res.status(409).json({ error: "Email already in use" });

  const hash = await bcrypt.hash(p.password, 12);
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, account_name, preferred_name)
     VALUES ($1,$2,$3,$4)
     RETURNING id, email, account_name, preferred_name, role, plan`,
    [email, hash, p.accountName || "Account", p.preferredName || "Student"]
  );

  const user = result.rows[0];
  const token = jwt.sign(user, ENV.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

authRoutes.post("/login", async (req, res) => {
  const p = loginSchema.parse(req.body);
  const email = p.email.toLowerCase().trim();

  const result = await pool.query(
    "SELECT id, email, password_hash, account_name, preferred_name, role, plan FROM users WHERE email=$1",
    [email]
  );
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(p.password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const payload = {
    id: user.id,
    email: user.email,
    account_name: user.account_name,
    preferred_name: user.preferred_name,
    role: user.role,
    plan: user.plan
  };

  const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: payload });
});
