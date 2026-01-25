// src/routes/exams.routes.js
const express = require('express');
const auth = require('../middleware/auth');
const db = require('../config/db');

const router = express.Router();

// POST /exams/mock/generate
router.post('/mock/generate', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { durationMinutes = 60, topicFilter } = req.body;

    // Mock generate questions from flashcards
    const { rows: flashcards } = await db.query(`
      SELECT id, front as text, back as correct_answer, '["A","B","C","D"]' as options, topic
      FROM flashcards 
      WHERE user_id = $1 ${topicFilter ? 'AND topic = $2' : ''}
      ORDER BY RANDOM() LIMIT 10
    `, topicFilter ? [userId, topicFilter] : [userId]);

    const { rows: [mock] } = await db.query(`
      INSERT INTO mock_exams (user_id, duration_minutes, topic_filter)
      VALUES ($1, $2, $3) RETURNING *
    `, [userId, durationMinutes, topicFilter]);

    for (const q of flashcards) {
      await db.query(`
        INSERT INTO mock_questions (mock_id, text, options, correct_answer, topic)
        VALUES ($1, $2, $3, $4, $5)
      `, [mock.id, q.text, q.options, q.correct_answer, q.topic]);
    }

    mock.questions = flashcards;  // return with questions

    res.json(mock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /exams/mock/:mockId/answer
router.post('/mock/:mockId/answer', auth, async (req, res) => {
  try {
    const { questionId, answer } = req.body;
    await db.query(`
      UPDATE mock_questions 
      SET user_answer = $1
      WHERE id = $2 AND mock_id = $3
    `, [answer, questionId, req.params.mockId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /exams/mock/:mockId/finish
router.post('/mock/:mockId/finish', auth, async (req, res) => {
  try {
    const mockId = req.params.mockId;
    const { rows: questions } = await db.query(`
      SELECT correct_answer = user_answer as is_correct
      FROM mock_questions WHERE mock_id = $1
    `, [mockId]);

    const correct = questions.filter(q => q.is_correct).length;
    const incorrect = questions.length - correct;
    const score = (correct / questions.length) * 100;

    await db.query(`
      UPDATE mock_exams 
      SET finished_at = NOW(), score = $1, correct = $2, incorrect = $3
      WHERE id = $4
    `, [score, correct, incorrect, mockId]);

    res.json({ score, correct, incorrect });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /exams/mock/history
router.get('/mock/history', auth, async (req, res) => {
  const { rows } = await db.query(`
    SELECT * FROM mock_exams WHERE user_id = $1 ORDER BY started_at DESC
  `, [req.user.id]);
  res.json(rows);
});

module.exports = router;
