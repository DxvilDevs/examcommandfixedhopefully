import express from "express";
import { z } from "zod";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

export const tagsRoutes = express.Router();

// GET /tags
tagsRoutes.get("/", authRequired, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT 
      t.id,
      t.name,
      t.color,
      t.created_at,
      (
        SELECT COUNT(*) FROM task_tags tt
        JOIN tasks ta ON ta.id = tt.task_id
        WHERE tt.tag_id = t.id AND ta.user_id = $1
      ) +
      (
        SELECT COUNT(*) FROM revision_tags rt
        JOIN revisions r ON r.id = rt.revision_id
        WHERE rt.tag_id = t.id AND r.user_id = $1
      ) +
      (
        SELECT COUNT(*) FROM deck_tags dt
        JOIN flashcard_decks fd ON fd.id = dt.deck_id
        WHERE dt.tag_id = t.id AND fd.user_id = $1
      ) as count
     FROM topic_tags t
     WHERE t.user_id = $1
     ORDER BY t.name ASC`,
    [req.user.id]
  );

  res.json(rows.map(r => ({
    id: r.id,
    name: r.name,
    color: r.color,
    count: parseInt(r.count)
  })));
});

// POST /tags
const tagSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
});

tagsRoutes.post("/", authRequired, async (req, res) => {
  const p = tagSchema.parse(req.body);

  // Check for duplicate
  const { rows: existing } = await pool.query(
    `SELECT id FROM topic_tags WHERE user_id = $1 AND LOWER(name) = LOWER($2)`,
    [req.user.id, p.name.trim()]
  );

  if (existing[0]) {
    return res.status(400).json({ error: 'Tag with this name already exists' });
  }

  const { rows } = await pool.query(
    `INSERT INTO topic_tags (user_id, name, color) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [req.user.id, p.name.trim(), p.color]
  );

  res.json({
    id: rows[0].id,
    name: rows[0].name,
    color: rows[0].color,
    count: 0
  });
});

// PUT /tags/:id
tagsRoutes.put("/:id", authRequired, async (req, res) => {
  const tagId = Number(req.params.id);
  const p = tagSchema.partial().parse(req.body);

  // Verify ownership
  const { rows: tagRows } = await pool.query(
    `SELECT * FROM topic_tags WHERE id = $1 AND user_id = $2`,
    [tagId, req.user.id]
  );

  if (!tagRows[0]) {
    return res.status(404).json({ error: 'Tag not found' });
  }

  if (p.name) {
    // Check for duplicate
    const { rows: existing } = await pool.query(
      `SELECT id FROM topic_tags 
       WHERE user_id = $1 AND LOWER(name) = LOWER($2) AND id != $3`,
      [req.user.id, p.name.trim(), tagId]
    );

    if (existing[0]) {
      return res.status(400).json({ error: 'Tag with this name already exists' });
    }
  }

  const { rows } = await pool.query(
    `UPDATE topic_tags 
     SET name = COALESCE($1, name), 
         color = COALESCE($2, color), 
         updated_at = NOW()
     WHERE id = $3 AND user_id = $4
     RETURNING *`,
    [p.name?.trim(), p.color, tagId, req.user.id]
  );

  res.json(rows[0]);
});

// DELETE /tags/:id
tagsRoutes.delete("/:id", authRequired, async (req, res) => {
  const tagId = Number(req.params.id);

  const result = await pool.query(
    `DELETE FROM topic_tags WHERE id = $1 AND user_id = $2`,
    [tagId, req.user.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Tag not found' });
  }

  res.json({ ok: true });
});

// POST /tags/:id/attach
const attachSchema = z.object({
  entityType: z.enum(['task', 'revision', 'deck']),
  entityId: z.number().int()
});

tagsRoutes.post("/:id/attach", authRequired, async (req, res) => {
  const tagId = Number(req.params.id);
  const p = attachSchema.parse(req.body);

  // Verify tag ownership
  const { rows: tagRows } = await pool.query(
    `SELECT * FROM topic_tags WHERE id = $1 AND user_id = $2`,
    [tagId, req.user.id]
  );

  if (!tagRows[0]) {
    return res.status(404).json({ error: 'Tag not found' });
  }

  let table, entityTable, entityColumn;

  switch (p.entityType) {
    case 'task':
      table = 'task_tags';
      entityTable = 'tasks';
      entityColumn = 'task_id';
      break;
    case 'revision':
      table = 'revision_tags';
      entityTable = 'revisions';
      entityColumn = 'revision_id';
      break;
    case 'deck':
      table = 'deck_tags';
      entityTable = 'flashcard_decks';
      entityColumn = 'deck_id';
      break;
  }

  // Verify entity ownership
  const { rows: entityRows } = await pool.query(
    `SELECT * FROM ${entityTable} WHERE id = $1 AND user_id = $2`,
    [p.entityId, req.user.id]
  );

  if (!entityRows[0]) {
    return res.status(404).json({ error: 'Entity not found' });
  }

  await pool.query(
    `INSERT INTO ${table} (${entityColumn}, tag_id) 
     VALUES ($1, $2) 
     ON CONFLICT DO NOTHING`,
    [p.entityId, tagId]
  );

  res.json({ ok: true });
});

// DELETE /tags/:id/detach
tagsRoutes.delete("/:id/detach", authRequired, async (req, res) => {
  const tagId = Number(req.params.id);
  const p = attachSchema.parse(req.body);

  let table, entityColumn;

  switch (p.entityType) {
    case 'task':
      table = 'task_tags';
      entityColumn = 'task_id';
      break;
    case 'revision':
      table = 'revision_tags';
      entityColumn = 'revision_id';
      break;
    case 'deck':
      table = 'deck_tags';
      entityColumn = 'deck_id';
      break;
  }

  await pool.query(
    `DELETE FROM ${table} WHERE ${entityColumn} = $1 AND tag_id = $2`,
    [p.entityId, tagId]
  );

  res.json({ ok: true });
});
