// ============================================
// flashcards.js
// ============================================
export const flashcardsApi = {
  async getDecks() {
    return api("/flashcards/decks");
  },

  async createDeck(name, topic) {
    return api("/flashcards/decks", {
      method: "POST",
      body: JSON.stringify({ name, topic })
    });
  },

  async updateDeck(id, data) {
    return api(`/flashcards/decks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  async deleteDeck(id) {
    return api(`/flashcards/decks/${id}`, {
      method: "DELETE"
    });
  },

  async getDueCards(deckId) {
    return api(`/flashcards/decks/${deckId}/due`);
  },

  async createCard(deckId, front, back) {
    return api("/flashcards/cards", {
      method: "POST",
      body: JSON.stringify({ deckId, front, back })
    });
  },

  async rateCard(cardId, rating) {
    return api(`/flashcards/cards/${cardId}/rate`, {
      method: "POST",
      body: JSON.stringify({ rating })
    });
  },

  async deleteCard(cardId) {
    return api(`/flashcards/cards/${cardId}`, {
      method: "DELETE"
    });
  }
};
