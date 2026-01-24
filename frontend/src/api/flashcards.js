GET  /api/flashcards/decks
     → [{ id, name, cardCount, dueCount, topic }]

POST /api/flashcards/decks
     body: { name, topic }
     → { id, name, cardCount: 0, dueCount: 0, topic }

GET  /api/flashcards/decks/:id/due
     → [{ id, front, back, difficulty }]

POST /api/flashcards/cards/:id/rate
     body: { rating: "AGAIN" | "HARD" | "GOOD" | "EASY" }
     → { nextReviewAt }

POST /api/flashcards/cards
     body: { deckId, front, back }
