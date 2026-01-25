import express from 'express';
import auth from '../middleware/auth.js';
import db from '../config/db.js';

const router = express.Router();

// GET /resources
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        r.*,
        COALESCE(ARRAY_AGG(rt.tag_id) FILTER (WHERE rt.tag_id IS NOT NULL), '{}') as tags
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
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [req.user.id, title, url, description || null]);

    for (const tagId of tags) {
      await db.query(`
        INSERT INTO resource_tags (resource_id, tag_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [resource.id, tagId]);
    }

    resource.tags = tags;
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /resources/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const { title, url, description, tags } = req.body;

    await db.query(`
      UPDATE resources 
      SET title = $1, url = $2, description = $3, updated_at = NOW()
      WHERE id = $4 AND user_id = $5
    `, [title, url, description || null, id, req.user.id]);

    if (tags !== undefined) {
      await db.query(`DELETE FROM resource_tags WHERE resource_id = $1`, [id]);
      for (const tagId of tags) {
        await db.query(`
          INSERT INTO resource_tags (resource_id, tag_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [id, tagId]);
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /resources/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    await db.query(`DELETE FROM resources WHERE id = $1 AND user_id = $2`, [id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export const resourcesRoutes = router;
