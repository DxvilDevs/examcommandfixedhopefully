import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { ENV } from "../config/env.js";

export async function seedOwnerIfNeeded() {
  if (!ENV.OWNER_EMAIL || !ENV.OWNER_PASSWORD) {
    console.log("Owner seed skipped (OWNER_EMAIL / OWNER_PASSWORD not set).");
    return;
  }

  const email = ENV.OWNER_EMAIL.toLowerCase().trim();
  const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
  if (existing.rows.length) return;

  const hash = await bcrypt.hash(ENV.OWNER_PASSWORD, 12);

  await pool.query(
    `INSERT INTO users (email, password_hash, account_name, preferred_name, role, plan)
     VALUES ($1,$2,'Owner','Adam','OWNER','PREMIUM')`,
    [email, hash]
  );

  console.log(`✅ Seeded OWNER account: ${email} (role=OWNER, plan=PREMIUM)`);
}
