import React from "react";
import { Link } from "react-router-dom";

export default function PremiumGate({ me, children }) {
  const premium = me?.plan === "PREMIUM" || me?.role === "OWNER";

  return (
    <div className="relative">
      <div className={premium ? "" : "blur-sm pointer-events-none select-none"}>
        {children}
      </div>

      {!premium && (
        <div className="absolute inset-0 grid place-items-center p-6">
          <div className="max-w-md w-full rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 shadow-xl">
            <div className="text-lg font-semibold">Premium Statistics</div>
            <p className="text-sm text-slate-300 mt-2">
              This page is locked for Free users. Upgrade to Premium (£3) to unlock analytics,
              forgetting curve reminders, and deeper insights.
            </p>
            <Link
              to="/subscribe"
              className="inline-flex mt-4 items-center justify-center rounded-xl px-4 py-2 bg-indigo-500/90 hover:bg-indigo-500 transition font-medium"
            >
              Upgrade to Premium
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
