import express from "express";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

export const examsRoutes = express.Router();

// POST /exams/mock/generate
examsRoutes.post("/mock/generate", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { durationMinutes = 60, topicFilter } = req.body;

    let query = `
      SELECT id, front as text, back as correct_answer, 
             '["A","B","C","D"]'::jsonb as options, topic
      FROM flashcards 
      WHERE user_id = $1
    `;
    let params = [userId];

    if (topicFilter) {
      query += ` AND topic ILIKE $2`;
      params.push(`%${topicFilter}%`);
    }

    query += ` ORDER BY RANDOM() LIMIT 10`;

    const { rows: questions } = await pool.query(query, params);

    if (questions.length === 0) {
      return res.status(400).json({ error: "No flashcards available to generate mock" });
    }

    const { rows: [mock] } = await pool.query(
      `INSERT INTO mock_exams (user_id, duration_minutes, topic_filter)
       VALUES ($1, $2, $3) RETURNING id, started_at`,
      [userId, durationMinutes, topicFilter]
    );

    for (const q of questions) {
      await pool.query(
        `INSERT INTO mock_questions (mock_id, text, options, correct_answer, topic)
         VALUES ($1, $2, $3, $4, $5)`,
        [mock.id, q.text, q.options, q.correct_answer, q.topic]
      );
    }

    res.json({
      id: mock.id,
      questions,
      durationMinutes,
      startedAt: mock.started_at
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /exams/mock/:mockId/answer
examsRoutes.post("/mock/:mockId/answer", authRequired, async (req, res) => {
  try {
    const { questionId, answer } = req.body;
    await pool.query(
      `UPDATE mock_questions 
       SET user_answer = $1
       WHERE id = $2 AND mock_id = $3`,
      [answer, questionId, req.params.mockId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /exams/mock/:mockId/finish
examsRoutes.post("/mock/:mockId/finish", authRequired, async (req, res) => {
  try {
    const mockId = req.params.mockId;

    const { rows: questions } = await pool.query(
      `SELECT (correct_answer = user_answer) as correct
       FROM mock_questions WHERE mock_id = $1`,
      [mockId]
    );

    const correct = questions.filter(q => q.correct).length;
    const total = questions.length;
    const score = total > 0 ? (correct / total) * 100 : 0;

    await pool.query(
      `UPDATE mock_exams 
       SET finished_at = NOW(), score = $1, correct = $2, incorrect = $3
       WHERE id = $4 AND user_id = $5`,
      [score, correct, total - correct, mockId, req.user.id]
    );

    res.json({ score, correct, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
