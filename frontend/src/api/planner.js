POST /api/planner/generate
     body: { targetMinutes: 90 }
     → { blocks: [{ topic, minutes, priority, reason, retention }], 
         suggestions[] }

POST /api/planner/complete-block
     body: { blockId, completed: true }
