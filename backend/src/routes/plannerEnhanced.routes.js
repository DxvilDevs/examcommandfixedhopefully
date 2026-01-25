// src/routes/plannerEnhanced.routes.js
const express = require('express');
const auth = require('../middleware/auth');
const db = require('../config/db');

const router = express.Router();

// GET /planner/sequence?minutes=90
router.get('/sequence', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const targetMinutes = parseInt(req.query.minutes) || 90;

    // Simple mock logic: fetch weak topics from revisions/flashcards
    const { rows: weakTopics } = await db.query(`
      SELECT topic, AVG(confidence) as avg_conf 
      FROM revisions 
      WHERE user_id = $1 
      GROUP BY topic 
      HAVING AVG(confidence) < 3
      ORDER BY AVG(confidence) ASC 
      LIMIT 5
    `, [userId]);

    const blocks = weakTopics.map((t, i) => ({
      topic: t.topic,
      minutes: Math.round(targetMinutes / weakTopics.length),
      priority: i === 0 ? 'HIGH' : 'MEDIUM',
      reason: `Low confidence (${t.avg_conf.toFixed(1)})`
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

// POST /planner/block/start
router.post('/block/start', auth, async (req, res) => {
  // Implement if needed, e.g. log start
  res.json({ success: true });
});

// POST /planner/block/complete
router.post('/block/complete', auth, async (req, res) => {
  // Implement if needed, e.g. update gamification
  res.json({ success: true });
});

module.exports = router;
