import React, { useState, useEffect } from "react";
import { flashcardsApi } from "../api/flashcards"; // your real api wrapper

export default function FlashcardsCard() {
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [dueCards, setDueCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckTopic, setNewDeckTopic] = useState("");
  const [showAddCard, setShowAddCard] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDecks();
  }, []);

  async function loadDecks() {
    try {
      setLoading(true);
      setError(null);
      const data = await flashcardsApi.getDecks();
      setDecks(data || []);
    } catch (err) {
      console.error("Failed to load decks:", err);
      setError("Failed to load decks. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateDeck() {
    if (!newDeckName.trim()) {
      alert("Deck name is required");
      return;
    }

    try {
      const newDeck = await flashcardsApi.createDeck(
        newDeckName.trim(),
        newDeckTopic.trim() || null
      );
      setDecks(prev => [...prev, newDeck]);
      setShowCreateDeck(false);
      setNewDeckName("");
      setNewDeckTopic("");
    } catch (err) {
      console.error("Create deck failed:", err);
      alert("Failed to create deck: " + (err.message || "Unknown error"));
    }
  }

  async function loadDueCards(deckId) {
    try {
      setError(null);
      const cards = await flashcardsApi.getDue(deckId);
      setDueCards(cards || []);
      setCurrentCardIndex(0);
      setShowBack(false);
    } catch (err) {
      console.error("Load due cards failed:", err);
      setError("Failed to load cards for this deck.");
      setDueCards([]);
    }
  }

  async function handleRate(rating) {
    if (!dueCards[currentCardIndex]) return;

    try {
      await flashcardsApi.rateCard(dueCards[currentCardIndex].id, rating);
      
      // Remove rated card from due list
      const newDue = dueCards.filter((_, i) => i !== currentCardIndex);
      setDueCards(newDue);
      
      // Move to next card or reset
      if (newDue.length > 0) {
        setCurrentCardIndex(0);
      } else {
        setCurrentCardIndex(0);
      }
      
      setShowBack(false);
    } catch (err) {
      console.error("Rate card failed:", err);
      alert("Failed to save rating: " + (err.message || "Unknown error"));
    }
  }

  async function handleAddCard() {
    if (!newFront.trim() || !newBack.trim() || !selectedDeck) {
      alert("Front and back are required");
      return;
    }

    try {
      await flashcardsApi.createCard(
        selectedDeck.id,
        newFront.trim(),
        newBack.trim()
      );

      setShowAddCard(false);
      setNewFront("");
      setNewBack("");
      
      // Refresh due cards
      loadDueCards(selectedDeck.id);
    } catch (err) {
      console.error("Add card failed:", err);
      alert("Failed to add card: " + (err.message || "Unknown error"));
    }
  }

  const currentCard = dueCards[currentCardIndex];

  return (
    <div className="space-y-6">
      {/* Deck Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400">
            Loading decks...
          </div>
        ) : error ? (
          <div className="col-span-3 text-center py-12 text-red-400">
            {error}
          </div>
        ) : decks.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-400">
            No decks yet — create one below!
          </div>
        ) : (
          decks.map(deck => (
            <div
              key={deck.id}
              onClick={() => {
                setSelectedDeck(deck);
                loadDueCards(deck.id);
              }}
              className={`p-6 rounded-xl cursor-pointer smooth-transition border ${
                selectedDeck?.id === deck.id
                  ? "bg-indigo-500/20 border-indigo-400"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <h3 className="font-medium text-white">{deck.name}</h3>
              <p className="text-sm text-slate-400">
                {deck.cardCount || 0} cards • {deck.dueCount || 0} due
              </p>
              {deck.topic && (
                <p className="text-xs text-slate-500 mt-1">{deck.topic}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Deck Button */}
      <button
        onClick={() => setShowCreateDeck(true)}
        className="btn-primary px-6 py-3 w-full md:w-auto"
      >
        + Create New Deck
      </button>

      {/* Create Deck Modal */}
      {showCreateDeck && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a1f] border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Create Deck</h2>
            
            <input
              type="text"
              placeholder="Deck Name (e.g. Algebra Basics)"
              value={newDeckName}
              onChange={e => setNewDeckName(e.target.value)}
              className="glass-input w-full mb-4"
            />
            
            <input
              type="text"
              placeholder="Topic (optional)"
              value={newDeckTopic}
              onChange={e => setNewDeckTopic(e.target.value)}
              className="glass-input w-full mb-6"
            />
            
            <div className="flex gap-4">
              <button
                onClick={handleCreateDeck}
                className="btn-primary flex-1"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateDeck(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deck Content */}
      {selectedDeck && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">
            {selectedDeck.name}
          </h2>

          {/* Due Cards */}
          {dueCards.length > 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-medium text-white">
                  Card {currentCardIndex + 1} of {dueCards.length}
                </h3>
              </div>

              <div 
                className="min-h-[200px] flex items-center justify-center cursor-pointer"
                onClick={() => setShowBack(!showBack)}
              >
                <div className="text-2xl text-white p-8 bg-white/5 rounded-xl border border-white/10 w-full text-center">
                  {showBack 
                    ? currentCard.back 
                    : currentCard.front}
                </div>
              </div>

              {showBack && (
                <div className="mt-8 flex justify-center gap-4 flex-wrap">
                  <button 
                    onClick={() => handleRate("AGAIN")}
                    className="px-6 py-3 bg-red-500/20 border border-red-400/40 rounded-xl hover:bg-red-500/30"
                  >
                    Again
                  </button>
                  <button 
                    onClick={() => handleRate("HARD")}
                    className="px-6 py-3 bg-amber-500/20 border border-amber-400/40 rounded-xl hover:bg-amber-500/30"
                  >
                    Hard
                  </button>
                  <button 
                    onClick={() => handleRate("GOOD")}
                    className="px-6 py-3 bg-green-500/20 border border-green-400/40 rounded-xl hover:bg-green-500/30"
                  >
                    Good
                  </button>
                  <button 
                    onClick={() => handleRate("EASY")}
                    className="px-6 py-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl hover:bg-emerald-500/30"
                  >
                    Easy
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              No cards due — great job! Add more or come back tomorrow.
            </div>
          )}

          {/* Add Card Button */}
          <button
            onClick={() => setShowAddCard(true)}
            className="btn-primary px-6 py-3 w-full md:w-auto"
          >
            + Add New Card
          </button>

          {/* Add Card Modal */}
          {showAddCard && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-[#0a0a1f] border border-white/10 rounded-2xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold text-white mb-6">Add New Card</h2>
                
                <textarea
                  placeholder="Front (question)"
                  value={newFront}
                  onChange={e => setNewFront(e.target.value)}
                  className="glass-input w-full h-24 mb-4"
                />
                
                <textarea
                  placeholder="Back (answer)"
                  value={newBack}
                  onChange={e => setNewBack(e.target.value)}
                  className="glass-input w-full h-24 mb-6"
                />
                
                <div className="flex gap-4">
                  <button
                    onClick={handleAddCard}
                    className="btn-primary flex-1"
                  >
                    Add Card
                  </button>
                  <button
                    onClick={() => setShowAddCard(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
