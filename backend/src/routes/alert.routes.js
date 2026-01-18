import express from "express";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

export const alertsRoutes = express.Router();

alertsRoutes.get("/", authRequired, async (req, res) => {
  const r = await pool.query(
    "SELECT id, type, title, body, meta, read, created_at FROM alerts WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50",
    [req.user.id]
  );
  res.json(r.rows);
});

alertsRoutes.post("/mark-read", authRequired, async (req, res) => {
  await pool.query("UPDATE alerts SET read=true WHERE user_id=$1", [req.user.id]);
  res.json({ ok: true });
});

// Generate alerts on-demand (MVP)
alertsRoutes.post("/refresh", authRequired, async (req, res) => {
  const uid = req.user.id;

  const byTopicQ = await pool.query(
    `SELECT topic, AVG(confidence)::numeric(10,2) AS avg_conf, MAX(revised_at) AS last_revised_at
     FROM revisions
     WHERE user_id=$1
     GROUP BY topic`,
    [uid]
  );

  const now = Date.now();
  const newAlerts = [];

  for (const t of byTopicQ.rows) {
    const last = new Date(t.last_revised_at).getTime();
    const days = (now - last) / (1000*60*60*24);
    const conf = Number(t.avg_conf) || 3;

    if (days >= 7) {
      newAlerts.push({
        type: "OVERDUE",
        title: `Overdue: ${t.topic}`,
        body: `You haven’t revised this topic in ${Math.floor(days)} days.`,
        meta: { topic: t.topic, days: Math.floor(days) }
      });
    }

    if (conf <= 2.2) {
      newAlerts.push({
        type: "WEAK",
        title: `Weak topic: ${t.topic}`,
        body: `Your average confidence is ${conf.toFixed(1)}. Consider revising with a different method.`,
        meta: { topic: t.topic, confidence: conf }
      });
    }
  }

  // Insert only if not duplicated today
  for (const a of newAlerts) {
    await pool.query(
      `INSERT INTO alerts (user_id, type, title, body, meta)
       SELECT $1,$2,$3,$4,$5
       WHERE NOT EXISTS (
         SELECT 1 FROM alerts
         WHERE user_id=$1 AND title=$3 AND created_at::date = NOW()::date
       )`,
      [uid, a.type, a.title, a.body, a.meta]
    );
  }

  res.json({ ok: true });
});
