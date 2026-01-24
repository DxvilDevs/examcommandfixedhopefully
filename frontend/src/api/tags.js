GET    /api/tags
       → [{ id, name, color, count }]

POST   /api/tags
       body: { name, color }
       → { id, name, color, count: 0 }

PUT    /api/tags/:id
       body: { name?, color? }

DELETE /api/tags/:id
