// src/routes/topics.routes.js
const express = require('express');
const auth = require('../middleware/auth');
const db = require('../config/db');

const router = express.Router();

// GET /topics/mastery
router.get('/mastery', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Simple mastery calc: average confidence from revisions + due cards
    const { rows } = await db.query(`
      SELECT 
        t.id,
        t.name,
        AVG(r.confidence) as mastery,  -- 1-5 scale, normalize to 0-1
        COUNT(f.id) FILTER (WHERE f.next_review_at < NOW()) as cards_due,
        COUNT(r.id) as revisions
      FROM topic_tags t
      LEFT JOIN revisions r ON r.user_id = $1
      LEFT JOIN revision_tags rt ON rt.revision_id = r.id AND rt.tag_id = t.id
      LEFT JOIN flashcards f ON f.user_id = $1  -- assume flashcards have topic
      GROUP BY t.id, t.name
      ORDER BY mastery ASC
    `, [userId]);

    // Normalize mastery to 0-1
    const masteryData = rows.map(r => ({
      ...r,
      mastery: (r.mastery || 1) / 5
    }));

    res.json(masteryData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /topics/:id
router.get('/:id', auth, async (req, res) => {
  // Details for one topic
  res.json({ /* fetch details */ });
});

module.exports = router;
