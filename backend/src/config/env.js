import dotenv from "dotenv";
dotenv.config();

function req(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const ENV = {
  PORT: process.env.PORT || 8080,
  DATABASE_URL: req("DATABASE_URL"),
  JWT_SECRET: req("JWT_SECRET"),

  // Owner seeding (set these on Render; DO NOT commit secrets)
  OWNER_EMAIL: process.env.OWNER_EMAIL || null,
  OWNER_PASSWORD: process.env.OWNER_PASSWORD || null
};
