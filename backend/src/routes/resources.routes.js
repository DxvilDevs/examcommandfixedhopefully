import express from "express";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

export const resourcesRoutes = express.Router();

// GET /resources
resourcesRoutes.get("/", authRequired, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
         r.*,
         COALESCE(ARRAY_AGG(rt.tag_id) FILTER (WHERE rt.tag_id IS NOT NULL), '{}') as tags
       FROM resources r
       LEFT JOIN resource_tags rt ON rt.resource_id = r.id
       WHERE r.user_id = $1
       GROUP BY r.id
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /resources
resourcesRoutes.post("/", authRequired, async (req, res) => {
  try {
    const { title, url, description, tags = [] } = req.body;

    const { rows: [resource] } = await pool.query(
      `INSERT INTO resources (user_id, title, url, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, title, url, description || null]
    );

    for (const tagId of tags) {
      await pool.query(
        `INSERT INTO resource_tags (resource_id, tag_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [resource.id, tagId]
      );
    }

    resource.tags = tags;
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /resources/:id
resourcesRoutes.put("/:id", authRequired, async (req, res) => {
  try {
    const id = req.params.id;
    const { title, url, description, tags } = req.body;

    await pool.query(
      `UPDATE resources 
       SET title = $1, url = $2, description = $3, updated_at = NOW()
       WHERE id = $4 AND user_id = $5`,
      [title, url, description || null, id, req.user.id]
    );

    if (tags !== undefined) {
      await pool.query(`DELETE FROM resource_tags WHERE resource_id = $1`, [id]);
      for (const tagId of tags) {
        await pool.query(
          `INSERT INTO resource_tags (resource_id, tag_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [id, tagId]
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /resources/:id
resourcesRoutes.delete("/:id", authRequired, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM resources WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
