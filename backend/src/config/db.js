import pg from "pg";
import { ENV } from "./env.js";

export const pool = new pg.Pool({
  connectionString: ENV.DATABASE_URL,
  ssl: ENV.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false }
});
