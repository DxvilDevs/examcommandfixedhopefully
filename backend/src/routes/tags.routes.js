import express from "express";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

export const tagsRoutes = express.Router();

// GET /tags
tagsRoutes.get("/", authRequired, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM topic_tags 
       WHERE user_id = $1 
       ORDER BY name ASC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Get tags error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /tags
tagsRoutes.post("/", authRequired, async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name || !color) {
      return res.status(400).json({ error: "Name and color required" });
    }

    const { rows } = await pool.query(
      `INSERT INTO topic_tags (user_id, name, color)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.id, name.trim(), color]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Create tag error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Optional: PUT /tags/:id
tagsRoutes.put("/:id", authRequired, async (req, res) => {
  try {
    const { name, color } = req.body;
    const id = req.params.id;

    await pool.query(
      `UPDATE topic_tags 
       SET name = $1, color = $2, updated_at = NOW()
       WHERE id = $3 AND user_id = $4`,
      [name?.trim(), color, id, req.user.id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /tags/:id
tagsRoutes.delete("/:id", authRequired, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM topic_tags 
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
