import express from "express";
import { z } from "zod";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";


export const statsRoutes = express.Router();

function requirePremium(req, res) {
  if (req.user.plan !== "PREMIUM" && req.user.role !== "OWNER") {
    res.status(403).json({ error: "Premium required" });
    return false;
  }
  return true;
}

/**
 * Simple forgetting curve model:
 * retention(t) = exp(-t / tau)
 * tau increases with revision count + time spent + confidence.
 * Next review when retention drops below threshold (e.g. 0.72).
 */
function computeTau({ revCount, totalMinutes, avgConfidence }) {
  const base = 2.5; // days
  const countBoost = 1 + Math.min(3, revCount) * 0.65;
  const timeBoost = 1 + Math.min(6, totalMinutes / 60) * 0.25; // up to +150%
  const confBoost = 0.75 + (Math.min(5, Math.max(1, avgConfidence)) / 5) * 0.65; // 0.88..1.4ish
  return base * countBoost * timeBoost * confBoost; // days
}

function retentionAtDays(tDays, tauDays) {
  return Math.exp(-tDays / tauDays);
}

function daysUntilThreshold(tauDays, threshold) {
  // threshold = exp(-t/tau) => t = -tau ln(threshold)
  return -tauDays * Math.log(threshold);
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

// Premium: full stats
statsRoutes.get("/", authRequired, async (req, res) => {
  if (!requirePremium(req, res)) return;

  const uid = req.user.id;

  // Next exam
  const nextExamQ = await pool.query(
    "SELECT label, exam_date FROM exams WHERE user_id=$1 AND exam_date >= CURRENT_DATE ORDER BY exam_date ASC LIMIT 1",
    [uid]
  );
  const nextExam = nextExamQ.rows[0] || null;

  // Revisions (last 180)
  const revisionsQ = await pool.query(
    `SELECT topic, minutes, confidence, revised_at
     FROM revisions
     WHERE user_id=$1
     ORDER BY revised_at DESC
     LIMIT 180`,
    [uid]
  );
  const revisions = revisionsQ.rows;

  // By topic aggregates
  const byTopicQ = await pool.query(
    `SELECT topic,
            COUNT(*)::int AS count,
            SUM(minutes)::int AS minutes,
            AVG(confidence)::numeric(10,2) AS avg_conf,
            MAX(revised_at) AS last_revised_at
     FROM revisions
     WHERE user_id=$1
     GROUP BY topic
     ORDER BY last_revised_at DESC`,
    [uid]
  );
  const byTopic = byTopicQ.rows;

  // Daily minutes (last 30 days)
  const dailyQ = await pool.query(
    `SELECT DATE(revised_at) AS day, SUM(minutes)::int AS minutes
     FROM revisions
     WHERE user_id=$1 AND revised_at >= NOW() - INTERVAL '30 days'
     GROUP BY DATE(revised_at)
     ORDER BY day ASC`,
    [uid]
  );
  const dailyMinutes = dailyQ.rows;

  // Momentum events (last 30 days)
  const momentumQ = await pool.query(
    `SELECT created_at, delta, score_after
     FROM momentum_events
     WHERE user_id=$1 AND created_at >= NOW() - INTERVAL '30 days'
     ORDER BY created_at ASC`,
    [uid]
  );
  const momentumEvents = momentumQ.rows;

  // Compute forgetting + overdue
  const now = Date.now();
  const threshold = 0.72;

  const topicModels = byTopic.map((t) => {
    const revCount = t.count;
    const totalMinutes = t.minutes;
    const avgConfidence = Number(t.avg_conf) || 3;

    const tau = computeTau({ revCount, totalMinutes, avgConfidence }); // days

    const last = new Date(t.last_revised_at).getTime();
    const daysSince = (now - last) / (1000 * 60 * 60 * 24);
    const currentRetention = retentionAtDays(daysSince, tau);

    const targetDays = daysUntilThreshold(tau, threshold);
    const nextReviewAt = new Date(last + targetDays * 24 * 60 * 60 * 1000);

    // build curve points for chart: -14..+14 around now
    const points = [];
    for (let i = -14; i <= 14; i++) {
      const d = clamp(daysSince + i, 0, 365);
      points.push({ x: i, y: retentionAtDays(d, tau) });
    }

    return {
      topic: t.topic,
      revCount,
      totalMinutes,
      avgConfidence,
      lastRevisedAt: t.last_revised_at,
      tauDays: Number(tau.toFixed(2)),
      currentRetention: Number(currentRetention.toFixed(3)),
      nextReviewAt: nextReviewAt.toISOString(),
      curve: points
    };
  });

  const overdue = topicModels
    .filter((m) => new Date(m.nextReviewAt).getTime() <= now)
    .sort((a, b) => a.currentRetention - b.currentRetention)
    .slice(0, 10);

  // Coverage estimate: ratio of topics revised in last 14 days vs total topics ever revised
  const totalTopics = byTopic.length || 1;
  const activeTopicsQ = await pool.query(
    `SELECT COUNT(DISTINCT topic)::int AS n
     FROM revisions
     WHERE user_id=$1 AND revised_at >= NOW() - INTERVAL '14 days'`,
    [uid]
  );
  const activeTopics = activeTopicsQ.rows[0]?.n ?? 0;
  const coverage14d = Math.round((activeTopics / totalTopics) * 100);

  // Readiness score (0-100): combine coverage + retention health + momentum
  const avgRetention =
    topicModels.length ? topicModels.reduce((s, m) => s + m.currentRetention, 0) / topicModels.length : 0.5;

  const latestMomentumQ = await pool.query("SELECT score FROM momentum WHERE user_id=$1", [uid]);
  const momentumScore = latestMomentumQ.rows[0]?.score ?? 0;

  const daysToExam = nextExam
    ? Math.max(0, Math.ceil((new Date(nextExam.exam_date).getTime() - now) / (1000 * 60 * 60 * 24)))
    : null;

  // exam pressure: closer exam increases weight of overdue penalty
  const examFactor = daysToExam == null ? 1 : clamp(1.2 - daysToExam / 60, 0.6, 1.2);
  const overduePenalty = clamp(overdue.length * 3 * examFactor, 0, 30);

  let readiness =
    0.45 * coverage14d +
    0.35 * Math.round(avgRetention * 100) +
    0.20 * clamp(momentumScore * 4, 0, 100);

  readiness = clamp(Math.round(readiness - overduePenalty), 0, 100);

  res.json({
    nextExam,
    summary: {
      readiness,
      coverage14d,
      avgRetention: Number(avgRetention.toFixed(3)),
      overdueCount: overdue.length,
      momentumScore
    },
    byTopic: byTopic.map((t) => ({
      topic: t.topic,
      count: t.count,
      minutes: t.minutes,
      avgConfidence: Number(t.avg_conf),
      lastRevisedAt: t.last_revised_at
    })),
    dailyMinutes,
    momentumEvents,
    topicModels,
    overdue
  });
});

// Allow logging revision for everyone (FREE + PREMIUM)
const addSchema = z.object({
  topic: z.string().min(1).max(80),
  minutes: z.number().int().min(5).max(600),
  confidence: z.number().int().min(1).max(5).optional()
});

statsRoutes.post("/revision", authRequired, async (req, res) => {
  const p = addSchema.parse(req.body);

  const r = await pool.query(
    `INSERT INTO revisions (user_id, topic, minutes, confidence)
     VALUES ($1,$2,$3,$4)
     RETURNING id, topic, minutes, confidence, revised_at`,
    [req.user.id, p.topic, p.minutes, p.confidence ?? 3]
  );

  res.json(r.rows[0]);
});
