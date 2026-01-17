import express from "express";
import { z } from "zod";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

export const dashboardRoutes = express.Router();

dashboardRoutes.get("/home", authRequired, async (req, res) => {
  const uid = req.user.id;

  const tasks = await pool.query(
    "SELECT id, title, done, estimate_minutes, created_at FROM tasks WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20",
    [uid]
  );

  const nextExam = await pool.query(
    "SELECT id, label, exam_date FROM exams WHERE user_id=$1 AND exam_date >= CURRENT_DATE ORDER BY exam_date ASC LIMIT 1",
    [uid]
  );

  const doneCount = await pool.query(
    "SELECT COUNT(*)::int AS done FROM tasks WHERE user_id=$1 AND done=true",
    [uid]
  );

  const estStudy = await pool.query(
    "SELECT COALESCE(SUM(estimate_minutes),0)::int AS total FROM tasks WHERE user_id=$1 AND done=false",
    [uid]
  );

  const momentum = await pool.query(
    "SELECT score FROM momentum WHERE user_id=$1",
    [uid]
  );

  res.json({
    tasks: tasks.rows,
    nextExam: nextExam.rows[0] || null,
    tasksDone: doneCount.rows[0].done,
    estimatedStudyMinutes: estStudy.rows[0].total,
    momentum: momentum.rows[0]?.score ?? 0
  });
});

const taskSchema = z.object({
  title: z.string().min(1).max(120),
  estimateMinutes: z.number().int().min(5).max(600).optional()
});

dashboardRoutes.post("/tasks", authRequired, async (req, res) => {
  const p = taskSchema.parse(req.body);
  const r = await pool.query(
    `INSERT INTO tasks (user_id, title, estimate_minutes)
     VALUES ($1,$2,$3)
     RETURNING id, title, done, estimate_minutes, created_at`,
    [req.user.id, p.title, p.estimateMinutes ?? 25]
  );
  res.json(r.rows[0]);
});

dashboardRoutes.put("/tasks/:id/toggle", authRequired, async (req, res) => {
  const id = Number(req.params.id);
  const r = await pool.query(
    `UPDATE tasks
     SET done = NOT done
     WHERE id=$1 AND user_id=$2
     RETURNING id, title, done, estimate_minutes, created_at`,
    [id, req.user.id]
  );
  res.json(r.rows[0] || null);
});

const examSchema = z.object({
  label: z.string().min(1).max(80),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

dashboardRoutes.post("/exams", authRequired, async (req, res) => {
  const p = examSchema.parse(req.body);
  const r = await pool.query(
    `INSERT INTO exams (user_id, label, exam_date)
     VALUES ($1,$2,$3)
     RETURNING id, label, exam_date`,
    [req.user.id, p.label, p.examDate]
  );
  res.json(r.rows[0]);
});

dashboardRoutes.post("/momentum/adjust", authRequired, async (req, res) => {
  // simple: +2 for focus, +1 for task done, -1 for missed day etc (frontend can choose)
  const schema = z.object({ delta: z.number().int().min(-20).max(20) });
  const p = schema.parse(req.body);

  await pool.query(
    `INSERT INTO momentum (user_id, score)
     VALUES ($1,$2)
     ON CONFLICT (user_id) DO UPDATE
     SET score = GREATEST(0, momentum.score + $2),
         updated_at = NOW()`,
    [req.user.id, p.delta]
  );

  const r = await pool.query("SELECT score FROM momentum WHERE user_id=$1", [req.user.id]);
  res.json({ score: r.rows[0].score });
});
