// frontend/src/api/flashcards.js
import { api } from "./client";

export async function getDecks() {
  return api("/api/flashcards/decks", { method: "GET" });
  // → [{ id, name, cardCount, dueCount, topic }]
}

export async function createDeck(payload) {
  // payload = { name: string, topic?: string }
  return api("/api/flashcards/decks", {
    method: "POST",
    body: payload,
  });
}

export async function getDueCards(deckId) {
  return api(`/api/flashcards/decks/${deckId}/due`, { method: "GET" });
  // → [{ id, front, back, difficulty }]
}

export async function rateCard(cardId, rating) {
  // rating = "AGAIN" | "HARD" | "GOOD" | "EASY"
  return api(`/api/flashcards/cards/${cardId}/rate`, {
    method: "POST",
    body: { rating },
  });
  // → { nextReviewAt }
}

export async function createCard(payload) {
  // payload = { deckId: string, front: string, back: string }
  return api("/api/flashcards/cards", {
    method: "POST",
    body: payload,
  });
}
