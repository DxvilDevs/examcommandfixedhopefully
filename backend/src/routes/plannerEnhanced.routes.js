import express from "express";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

export const plannerEnhancedRoutes = express.Router();

// GET /planner/sequence?minutes=90
plannerEnhancedRoutes.get("/sequence", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const targetMinutes = parseInt(req.query.minutes) || 90;

    const { rows: weakTopics } = await pool.query(
      `SELECT topic, AVG(confidence) as avg_conf 
       FROM revisions 
       WHERE user_id = $1 
       GROUP BY topic 
       HAVING AVG(confidence) < 3
       ORDER BY AVG(confidence) ASC 
       LIMIT 5`,
      [userId]
    );

    const blocks = weakTopics.map((t, i) => ({
      topic: t.topic,
      minutes: Math.round(targetMinutes / weakTopics.length) || 25,
      priority: i === 0 ? "HIGH" : "MEDIUM",
      reason: `Low confidence (${(t.avg_conf || 2.5).toFixed(1)})`
    }));

    res.json({
      blocks,
      totalMinutes: targetMinutes,
      generated: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
