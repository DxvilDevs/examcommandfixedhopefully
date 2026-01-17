import { pool } from "./config/db.js";
import { ENV } from "./config/env.js";
import { createApp } from "./app.js";
import { seedOwnerIfNeeded } from "./services/seedOwner.js";
import fs from "node:fs";
import path from "node:path";

async function ensureSchema() {
  const schemaPath = path.resolve("src/db/schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");
  await pool.query(sql);
}

async function main() {
  await ensureSchema();
  await seedOwnerIfNeeded();

  const app = createApp();
  app.listen(ENV.PORT, () => console.log(`API listening on :${ENV.PORT}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
