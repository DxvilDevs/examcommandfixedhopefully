import React, { useState, useEffect } from "react";

// Mock API - replace with your backend
const flashcardsApi = {
  async getDecks() {
    return [
      { id: 1, name: "Algebra Formulas", cardCount: 24, dueCount: 5, topic: "Mathematics" },
      { id: 2, name: "Chemistry Elements", cardCount: 45, dueCount: 12, topic: "Chemistry" },
      { id: 3, name: "Physics Laws", cardCount: 18, dueCount: 0, topic: "Physics" },
    ];
  },
  
  async getDueCards(deckId) {
    return [
      { id: 1, front: "What is the quadratic formula?", back: "x = (-b ± √(b² - 4ac)) / 2a", difficulty: "MEDIUM" },
      { id: 2, front: "Define Newton's First Law", back: "An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force", difficulty: "EASY" },
      { id: 3, front: "What is the speed of light?", back: "299,792,458 m/s (approximately 3 × 10⁸ m/s)", difficulty: "EASY" },
    ];
  },
  
  async rateCard(cardId, rating) {
    // rating: "AGAIN", "HARD", "GOOD", "EASY"
    console.log("Rated card", cardId, rating);
  }
};

function FlashcardStudy({ deckId, onComplete }) {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    flashcardsApi.getDueCards(deckId).then(cards => {
      setCards(cards);
      setLoading(false);
    });
  }, [deckId]);

  if (loading) return <div className="text-center py-8 text-slate-400">Loading cards...</div>;
  if (!cards.length) return (
    <div className="text-center py-12">
      <div className="text-4xl mb-3">✅</div>
      <div className="text-lg font-semibold text-white mb-2">All caught up!</div>
      <div className="text-sm text-slate-400 mb-6">No cards due for review right now.</div>
      <button onClick={onComplete} className="btn-secondary">
        Back to Decks
      </button>
    </div>
  );

  const card = cards[currentIndex];

  async function handleRating(rating) {
    await flashcardsApi.rateCard(card.id, rating);
    
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      onComplete();
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Card {currentIndex + 1} of {cards.length}</span>
          <span className="text-sm text-slate-400">{cards.length - currentIndex - 1} remaining</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 smooth-transition"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        className="relative rounded-3xl border border-white/10 glass-card p-8 min-h-[320px] flex items-center justify-center cursor-pointer smooth-transition hover:scale-[1.02]"
        onClick={() => !showAnswer && setShowAnswer(true)}
      >
        <div className="text-center w-full">
          {!showAnswer ? (
            <>
              <div className="text-sm text-slate-400 mb-4">Question</div>
              <div className="text-2xl font-semibold text-white mb-8">
                {card.front}
              </div>
              <div className="text-sm text-slate-400">
                Click to reveal answer
              </div>
            </>
          ) : (
            <>
              <div className="text-sm text-slate-400 mb-2">Answer</div>
              <div className="text-xl text-white mb-6">
                {card.back}
              </div>
              <div className="border-t border-white/10 pt-6 mt-6">
                <div className="text-sm text-slate-400 mb-4">How well did you know this?</div>
                <div className="grid grid-cols-4 gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRating("AGAIN"); }}
                    className="rounded-2xl px-4 py-3 bg-red-500/20 border border-red-400/30 hover:bg-red-500/30 smooth-transition text-red-200 text-sm font-medium"
                  >
                    Again
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRating("HARD"); }}
                    className="rounded-2xl px-4 py-3 bg-orange-500/20 border border-orange-400/30 hover:bg-orange-500/30 smooth-transition text-orange-200 text-sm font-medium"
                  >
                    Hard
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRating("GOOD"); }}
                    className="rounded-2xl px-4 py-3 bg-blue-500/20 border border-blue-400/30 hover:bg-blue-500/30 smooth-transition text-blue-200 text-sm font-medium"
                  >
                    Good
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRating("EASY"); }}
                    className="rounded-2xl px-4 py-3 bg-emerald-500/20 border border-emerald-400/30 hover:bg-emerald-500/30 smooth-transition text-emerald-200 text-sm font-medium"
                  >
                    Easy
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      {!showAnswer && (
        <div className="mt-4 text-center text-xs text-slate-500">
          Press Space to reveal • 1-4 keys to rate
        </div>
      )}
    </div>
  );
}

export default function FlashcardsCard() {
  const [decks, setDecks] = useState([]);
  const [studyingDeck, setStudyingDeck] = useState(null);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckTopic, setNewDeckTopic] = useState("");

  useEffect(() => {
    flashcardsApi.getDecks().then(setDecks);
  }, []);

  if (studyingDeck) {
    return (
      <div className="glass-card p-8 shadow-xl">
        <button
          onClick={() => setStudyingDeck(null)}
          className="btn-secondary text-sm mb-6"
        >
          ← Back to Decks
        </button>
        <FlashcardStudy
          deckId={studyingDeck}
          onComplete={() => {
            setStudyingDeck(null);
            flashcardsApi.getDecks().then(setDecks);
          }}
        />
      </div>
    );
  }

  return (
    <div className="glass-card p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Flashcards</h2>
          <p className="text-sm text-slate-400 mt-1">Spaced repetition for better retention</p>
        </div>
        <button
          onClick={() => setShowCreateDeck(true)}
          className="btn-primary text-sm"
        >
          + New Deck
        </button>
      </div>

      {/* Decks Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {decks.map(deck => (
          <div
            key={deck.id}
            className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 smooth-transition p-5 cursor-pointer"
            onClick={() => deck.dueCount > 0 && setStudyingDeck(deck.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-2xl">🎴</div>
              {deck.dueCount > 0 && (
                <span className="px-2 py-1 rounded-lg bg-amber-400/20 text-amber-200 text-xs font-medium">
                  {deck.dueCount} due
                </span>
              )}
            </div>
            
            <div className="font-semibold text-white mb-1">{deck.name}</div>
            <div className="text-sm text-slate-400 mb-3">{deck.topic}</div>
            
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{deck.cardCount} cards</span>
              {deck.dueCount === 0 && <span className="text-emerald-400">✓ All reviewed</span>}
            </div>
          </div>
        ))}
      </div>

      {!decks.length && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🎴</div>
          <div className="text-lg font-semibold text-white mb-2">No flashcard decks yet</div>
          <div className="text-sm text-slate-400 mb-6">
            Create your first deck to start using spaced repetition
          </div>
        </div>
      )}

      {/* Create Deck Modal */}
      {showCreateDeck && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setShowCreateDeck(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="glass-card p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Create New Deck</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Deck Name</label>
                  <input
                    className="glass-input w-full"
                    placeholder="e.g. Spanish Vocabulary"
                    value={newDeckName}
                    onChange={e => setNewDeckName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Topic/Subject</label>
                  <input
                    className="glass-input w-full"
                    placeholder="e.g. Languages"
                    value={newDeckTopic}
                    onChange={e => setNewDeckTopic(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateDeck(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Create deck logic here
                    console.log("Creating deck:", newDeckName, newDeckTopic);
                    setShowCreateDeck(false);
                    setNewDeckName("");
                    setNewDeckTopic("");
                  }}
                  className="btn-primary flex-1"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
