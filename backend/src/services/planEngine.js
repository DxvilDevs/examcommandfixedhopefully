import { pool } from "../config/db.js";

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

// Simple urgency score: low retention + close exam + low confidence
export async function buildTodaysPlan(userId, minutesAvailable = 90) {
  const now = Date.now();

  const nextExamQ = await pool.query(
    "SELECT label, exam_date FROM exams WHERE user_id=$1 AND exam_date >= CURRENT_DATE ORDER BY exam_date ASC LIMIT 1",
    [userId]
  );
  const nextExam = nextExamQ.rows[0] || null;

  const byTopicQ = await pool.query(
    `SELECT topic,
            COUNT(*)::int AS count,
            SUM(minutes)::int AS minutes,
            AVG(confidence)::numeric(10,2) AS avg_conf,
            MAX(revised_at) AS last_revised_at
     FROM revisions
     WHERE user_id=$1
     GROUP BY topic`,
    [userId]
  );

  const topics = byTopicQ.rows.map(t => {
    const last = new Date(t.last_revised_at).getTime();
    const daysSince = (now - last) / (1000*60*60*24);
    const avgConf = Number(t.avg_conf) || 3;

    // heuristic retention-ish: decays with days, boosted by confidence + reps
    const reps = t.count;
    const decay = Math.exp(-daysSince / (2.5 + reps * 0.9));
    const retention = clamp(decay * (0.7 + (avgConf/5)*0.6), 0, 1);

    const examDays = nextExam ? Math.max(0, Math.ceil((new Date(nextExam.exam_date).getTime() - now)/(1000*60*60*24))) : 30;
    const examPressure = clamp(1.2 - examDays/60, 0.6, 1.2);

    const urgency = (1 - retention) * 70 + (1 - avgConf/5) * 20 + examPressure * 10;

    return {
      topic: t.topic,
      retention,
      avgConf,
      reps,
      daysSince,
      urgency: Number(urgency.toFixed(2))
    };
  });

  topics.sort((a,b)=> b.urgency - a.urgency);

  // Build timeboxed plan chunks: 25/25/20... until minutesAvailable
  const blocks = [];
  let remaining = minutesAvailable;

  const blockSizes = [25, 25, 20, 15, 10];
  let idx = 0;

  for (const t of topics.slice(0, 8)) {
    if (remaining <= 0) break;
    const size = Math.min(blockSizes[idx % blockSizes.length], remaining);
    blocks.push({
      topic: t.topic,
      minutes: size,
      reason: `Urgency ${t.urgency} • retention ${(t.retention*100).toFixed(0)}% • confidence ${t.avgConf.toFixed(1)}`
    });
    remaining -= size;
    idx++;
  }

  return {
    nextExam,
    minutesAvailable,
    blocks
  };
}
