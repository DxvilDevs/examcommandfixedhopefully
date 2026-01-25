import express from "express";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

export const topicsRoutes = express.Router();

// GET /topics/mastery
topicsRoutes.get("/mastery", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows } = await pool.query(
      `SELECT 
         t.id,
         t.name,
         COALESCE(AVG(r.confidence), 1) as mastery_raw,
         COUNT(f.id) FILTER (WHERE f.next_review_at < NOW()) as cards_due,
         COUNT(r.id) as revisions
       FROM topic_tags t
       LEFT JOIN revision_tags rt ON rt.tag_id = t.id
       LEFT JOIN revisions r ON r.id = rt.revision_id AND r.user_id = $1
       LEFT JOIN flashcards f ON f.deck_id IN (
         SELECT id FROM flashcard_decks WHERE user_id = $1
       )
       GROUP BY t.id, t.name
       ORDER BY mastery_raw ASC`,
      [userId]
    );

    const masteryData = rows.map(r => ({
      id: r.id,
      name: r.name,
      mastery: r.mastery_raw / 5,
      cardsDue: r.cards_due || 0,
      revisions: r.revisions || 0
    }));

    res.json(masteryData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
