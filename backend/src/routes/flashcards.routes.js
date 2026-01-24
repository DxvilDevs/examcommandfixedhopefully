import express from "express";
import { z } from "zod";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

export const flashcardsRoutes = express.Router();

// Helper: SM-2 algorithm for spaced repetition
function calculateNextReview(rating, currentInterval, repetitions, easeFactor) {
  let newInterval = currentInterval;
  let newRepetitions = repetitions;
  let newEaseFactor = easeFactor;

  switch (rating) {
    case 'AGAIN':
      newInterval = 0.0007; // ~1 minute
      newRepetitions = 0;
      newEaseFactor = Math.max(1.3, easeFactor - 0.2);
      break;

    case 'HARD':
      newInterval = currentInterval * 1.2;
      newRepetitions = repetitions + 1;
      newEaseFactor = Math.max(1.3, easeFactor - 0.15);
      break;

    case 'GOOD':
      if (repetitions === 0) {
        newInterval = 1;
      } else if (repetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = currentInterval * easeFactor;
      }
      newRepetitions = repetitions + 1;
      break;

    case 'EASY':
      if (repetitions === 0) {
        newInterval = 4;
      } else {
        newInterval = currentInterval * easeFactor * 1.3;
      }
      newRepetitions = repetitions + 1;
      newEaseFactor = easeFactor + 0.15;
      break;

    default:
      throw new Error('Invalid rating');
  }

  return {
    interval: Math.max(0.0007, newInterval),
    repetitions: newRepetitions,
    easeFactor: newEaseFactor
  };
}

// GET /flashcards/decks
flashcardsRoutes.get("/decks", authRequired, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT 
      d.id,
      d.name,
      d.topic,
      d.created_at,
      COUNT(c.id)::int as card_count,
      COUNT(CASE WHEN c.next_review_at <= NOW() THEN 1 END)::int as due_count
     FROM flashcard_decks d
     LEFT JOIN flashcards c ON d.id = c.deck_id
     WHERE d.user_id = $1
     GROUP BY d.id
     ORDER BY d.created_at DESC`,
    [req.user.id]
  );

  res.json(rows.map(r => ({
    id: r.id,
    name: r.name,
    topic: r.topic,
    cardCount: r.card_count,
    dueCount: r.due_count
  })));
});

// POST /flashcards/decks
const deckSchema = z.object({
  name: z.string().min(1).max(200),
  topic: z.string().max(100).optional()
});

flashcardsRoutes.post("/decks", authRequired, async (req, res) => {
  const p = deckSchema.parse(req.body);

  const { rows } = await pool.query(
    `INSERT INTO flashcard_decks (user_id, name, topic) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [req.user.id, p.name, p.topic || null]
  );

  res.json({
    id: rows[0].id,
    name: rows[0].name,
    topic: rows[0].topic,
    cardCount: 0,
    dueCount: 0
  });
});

// PUT /flashcards/decks/:id
flashcardsRoutes.put("/decks/:id", authRequired, async (req, res) => {
  const deckId = Number(req.params.id);
  const p = deckSchema.partial().parse(req.body);

  const { rows } = await pool.query(
    `UPDATE flashcard_decks 
     SET name = COALESCE($1, name), 
         topic = COALESCE($2, topic), 
         updated_at = NOW()
     WHERE id = $3 AND user_id = $4
     RETURNING *`,
    [p.name, p.topic, deckId, req.user.id]
  );

  if (!rows[0]) {
    return res.status(404).json({ error: 'Deck not found' });
  }

  res.json(rows[0]);
});

// DELETE /flashcards/decks/:id
flashcardsRoutes.delete("/decks/:id", authRequired, async (req, res) => {
  const deckId = Number(req.params.id);

  const result = await pool.query(
    `DELETE FROM flashcard_decks WHERE id = $1 AND user_id = $2`,
    [deckId, req.user.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Deck not found' });
  }

  res.json({ ok: true });
});

// GET /flashcards/decks/:id/due
flashcardsRoutes.get("/decks/:id/due", authRequired, async (req, res) => {
  const deckId = Number(req.params.id);

  // Verify ownership
  const { rows: deckRows } = await pool.query(
    `SELECT * FROM flashcard_decks WHERE id = $1 AND user_id = $2`,
    [deckId, req.user.id]
  );

  if (!deckRows[0]) {
    return res.status(404).json({ error: 'Deck not found' });
  }

  const { rows } = await pool.query(
    `SELECT * FROM flashcards 
     WHERE deck_id = $1 AND next_review_at <= NOW()
     ORDER BY next_review_at ASC
     LIMIT 50`,
    [deckId]
  );

  res.json(rows.map(card => ({
    id: card.id,
    front: card.front,
    back: card.back,
    difficulty: card.repetitions === 0 ? 'NEW' : 
               card.repetitions < 3 ? 'LEARNING' : 'MATURE'
  })));
});

// POST /flashcards/cards
const cardSchema = z.object({
  deckId: z.number().int(),
  front: z.string().min(1).max(1000),
  back: z.string().min(1).max(2000)
});

flashcardsRoutes.post("/cards", authRequired, async (req, res) => {
  const p = cardSchema.parse(req.body);

  // Verify deck ownership
  const { rows: deckRows } = await pool.query(
    `SELECT * FROM flashcard_decks WHERE id = $1 AND user_id = $2`,
    [p.deckId, req.user.id]
  );

  if (!deckRows[0]) {
    return res.status(404).json({ error: 'Deck not found' });
  }

  const { rows } = await pool.query(
    `INSERT INTO flashcards (deck_id, front, back) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [p.deckId, p.front, p.back]
  );

  res.json(rows[0]);
});

// POST /flashcards/cards/:id/rate
const rateSchema = z.object({
  rating: z.enum(['AGAIN', 'HARD', 'GOOD', 'EASY'])
});

flashcardsRoutes.post("/cards/:id/rate", authRequired, async (req, res) => {
  const cardId = Number(req.params.id);
  const p = rateSchema.parse(req.body);

  // Get card and verify access
  const { rows: cardRows } = await pool.query(
    `SELECT c.*, d.user_id 
     FROM flashcards c
     JOIN flashcard_decks d ON c.deck_id = d.id
     WHERE c.id = $1`,
    [cardId]
  );

  if (!cardRows[0] || cardRows[0].user_id !== req.user.id) {
    return res.status(404).json({ error: 'Card not found' });
  }

  const card = cardRows[0];

  const { interval, repetitions, easeFactor } = calculateNextReview(
    p.rating,
    parseFloat(card.interval),
    card.repetitions,
    parseFloat(card.ease_factor)
  );

  const nextReviewAt = new Date();
  nextReviewAt.setTime(nextReviewAt.getTime() + interval * 24 * 60 * 60 * 1000);

  await pool.query(
    `UPDATE flashcards 
     SET interval = $1, 
         repetitions = $2, 
         ease_factor = $3, 
         next_review_at = $4, 
         updated_at = NOW()
     WHERE id = $5`,
    [interval, repetitions, easeFactor, nextReviewAt, cardId]
  );

  await pool.query(
    `INSERT INTO flashcard_reviews (card_id, user_id, rating) 
     VALUES ($1, $2, $3)`,
    [cardId, req.user.id, p.rating]
  );

  res.json({
    nextReviewAt,
    interval,
    repetitions
  });
});

// DELETE /flashcards/cards/:id
flashcardsRoutes.delete("/cards/:id", authRequired, async (req, res) => {
  const cardId = Number(req.params.id);

  const result = await pool.query(
    `DELETE FROM flashcards c
     USING flashcard_decks d
     WHERE c.deck_id = d.id AND c.id = $1 AND d.user_id = $2`,
    [cardId, req.user.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Card not found' });
  }

  res.json({ ok: true });
});
