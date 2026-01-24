import React from "react";
import FlashcardsCard from "../components/FlashcardsCard";

export default function Flashcards() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Flashcards</h1>
        <p className="text-slate-400 mt-1">
          Master your topics with spaced repetition
        </p>
      </div>

      <FlashcardsCard />

      {/* Info Card */}
      <div className="glass-card p-6">
        <div className="text-lg font-semibold text-white mb-3">
          📚 How Spaced Repetition Works
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-3xl mb-2">🔴</div>
            <div className="font-medium text-white mb-1">Again</div>
            <div className="text-slate-400">
              Review this card again soon (within 1 minute)
            </div>
          </div>
          <div>
            <div className="text-3xl mb-2">🟡</div>
            <div className="font-medium text-white mb-1">Hard</div>
            <div className="text-slate-400">
              Difficult to remember - review in a few hours
            </div>
          </div>
          <div>
            <div className="text-3xl mb-2">🔵</div>
            <div className="font-medium text-white mb-1">Good</div>
            <div className="text-slate-400">
              Moderate difficulty - review tomorrow
            </div>
          </div>
          <div>
            <div className="text-3xl mb-2">🟢</div>
            <div className="font-medium text-white mb-1">Easy</div>
            <div className="text-slate-400">
              Very easy - review in 4 days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
