// src/routes/resources.routes.js
const express = require('express');
const auth = require('../middleware/auth');
const db = require('../config/db');

const router = express.Router();

// GET /resources
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT r.*, ARRAY_AGG(rt.tag_id) as tags
      FROM resources r
      LEFT JOIN resource_tags rt ON rt.resource_id = r.id
      WHERE r.user_id = $1
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /resources
router.post('/', auth, async (req, res) => {
  try {
    const { title, url, description, tags = [] } = req.body;
    const { rows: [resource] } = await db.query(`
      INSERT INTO resources (user_id, title, url, description)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [req.user.id, title, url, description]);

    for (const tagId of tags) {
      await db.query(`
        INSERT INTO resource_tags (resource_id, tag_id) VALUES ($1, $2)
      `, [resource.id, tagId]);
    }

    resource.tags = tags;
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /resources/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, url, description, tags = [] } = req.body;
    const id = req.params.id;

    await db.query(`
      UPDATE resources SET title = $1, url = $2, description = $3, updated_at = NOW()
      WHERE id = $4 AND user_id = $5
    `, [title, url, description, id, req.user.id]);

    // Update tags: delete old, add new
    await db.query(`DELETE FROM resource_tags WHERE resource_id = $1`, [id]);
    for (const tagId of tags) {
      await db.query(`INSERT INTO resource_tags (resource_id, tag_id) VALUES ($1, $2)`, [id, tagId]);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /resources/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query(`DELETE FROM resources WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /resources/search?q=query
router.get('/search', auth, async (req, res) => {
  try {
    const query = `%${req.query.q}%`;
    const { rows } = await db.query(`
      SELECT * FROM resources 
      WHERE user_id = $1 AND (title ILIKE $2 OR description ILIKE $2)
    `, [req.user.id, query]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
