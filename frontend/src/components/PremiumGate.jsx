import React from "react";
import { Link } from "react-router-dom";

export default function PremiumGate({ me, children }) {
  const premium = me?.plan === "PREMIUM" || me?.role === "OWNER";

  return (
    <div className="relative">
      <div className={premium ? "" : "blur-md pointer-events-none select-none"}>
        {children}
      </div>

      {!premium && (
        <div className="absolute inset-0 grid place-items-center p-6">
          <div className="max-w-md w-full glass-card p-8 shadow-2xl border-amber-300/20">
            {/* Glow effect */}
            <div className="absolute -inset-20 opacity-20 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 rounded-full blur-3xl" />
            </div>
            
            <div className="relative">
              <div className="text-center mb-4">
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-amber-300/20 to-yellow-400/20 mb-4">
                  <span className="text-4xl">⭐</span>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-center gold-gradient bg-clip-text text-transparent mb-3">
                Premium Statistics
              </h3>
              
              <p className="text-sm text-slate-300 text-center mb-6">
                Unlock advanced analytics, forgetting curve insights, and AI-powered revision planning for just £3/month.
              </p>
              
              <Link
                to="/subscribe"
                className="btn-primary w-full text-center block"
              >
                Upgrade to Premium
              </Link>
              
              <div className="mt-4 text-xs text-slate-400 text-center">
                Unlock intelligent study insights
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
