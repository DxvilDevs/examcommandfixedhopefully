import React, { useState } from "react";
import { subscriptionApi } from "../api/subscription";

export default function Subscribe({ me, onUpdated }) {
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const currentPlan = me?.plan || "FREE";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gold-gradient bg-clip-text text-transparent mb-3">
          Upgrade to Premium
        </h1>
        <p className="text-slate-400 text-lg">
          Unlock advanced features and take your exam prep to the next level
        </p>
      </div>

      {msg && (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-emerald-200 text-center">
          {msg}
        </div>
      )}
      {err && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-red-200 text-center">
          {err}
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="glass-card p-8 shadow-xl">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
            <div className="text-4xl font-bold text-slate-200 mb-1">£0</div>
            <div className="text-sm text-slate-400">Forever free</div>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-1">✓</span>
              <span className="text-slate-300">Task management</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-1">✓</span>
              <span className="text-slate-300">Exam countdown tracking</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-1">✓</span>
              <span className="text-slate-300">Basic momentum tracking</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-1">✓</span>
              <span className="text-slate-300">Focus mode sessions</span>
            </li>
          </ul>

          <button
            className={`w-full ${
              currentPlan === "FREE"
                ? "btn-secondary cursor-not-allowed"
                : "btn-secondary"
            }`}
            onClick={async () => {
              if (currentPlan === "FREE") return;
              try {
                setErr("");
                setMsg("");
                const u = await subscriptionApi.setPlan("FREE");
                onUpdated?.(u);
                setMsg("Switched to Free plan");
              } catch (e) {
                setErr(e.message);
              }
            }}
            disabled={currentPlan === "FREE"}
          >
            {currentPlan === "FREE" ? "Current Plan" : "Switch to Free"}
          </button>
        </div>

        {/* Premium Plan */}
        <div className="relative">
          {/* Gold glow effect */}
          <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 opacity-20 blur-xl" />
          
          <div className="relative glass-card p-8 shadow-2xl border-amber-300/30">
            {/* Popular badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-300 to-orange-400 text-sm font-bold text-white shadow-lg">
                ⭐ Most Popular
              </span>
            </div>

            <div className="text-center mb-6 mt-2">
              <h3 className="text-2xl font-bold gold-gradient bg-clip-text text-transparent mb-2">
                Premium
              </h3>
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-4xl font-bold text-white">£3</span>
                <span className="text-slate-400">/month</span>
              </div>
              <div className="text-sm text-slate-400">Best value for serious students</div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-1">✓</span>
                <span className="text-white font-medium">Everything in Free, plus:</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-1">✓</span>
                <span className="text-slate-200">Advanced statistics dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-1">✓</span>
                <span className="text-slate-200">Forgetting curve insights</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-1">✓</span>
                <span className="text-slate-200">Topic distribution analysis</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-1">✓</span>
                <span className="text-slate-200">Momentum trend tracking</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-1">✓</span>
                <span className="text-slate-200">AI-powered revision reminders</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-1">✓</span>
                <span className="text-slate-200">Priority support</span>
              </li>
            </ul>

            <button
              className={`w-full ${
                currentPlan === "PREMIUM"
                  ? "bg-white/10 border border-white/20 cursor-not-allowed text-white"
                  : "bg-gradient-to-r from-amber-300 to-orange-400 hover:from-amber-400 hover:to-orange-500 border-0 text-white shadow-xl shadow-amber-500/30"
              } rounded-2xl px-6 py-4 font-bold smooth-transition`}
              onClick={async () => {
                if (currentPlan === "PREMIUM") return;
                try {
                  setErr("");
                  setMsg("");
                  const u = await subscriptionApi.setPlan("PREMIUM");
                  onUpdated?.(u);
                  setMsg("🎉 Welcome to Premium! Enjoy your new features.");
                } catch (e) {
                  setErr(e.message);
                }
              }}
              disabled={currentPlan === "PREMIUM"}
            >
              {currentPlan === "PREMIUM" ? "✓ Current Plan" : "Upgrade to Premium"}
            </button>
          </div>
        </div>
      </div>

      {/* FAQ / Benefits Section */}
      <div className="max-w-4xl mx-auto mt-12">
        <div className="glass-card p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 text-center">
            Why upgrade to Premium?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">📊</div>
              <h4 className="font-semibold text-white mb-2">Smart Analytics</h4>
              <p className="text-sm text-slate-400">
                Track your progress with intelligent forgetting curves and retention modeling
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h4 className="font-semibold text-white mb-2">Targeted Revision</h4>
              <p className="text-sm text-slate-400">
                Know exactly what topics need review and when to maximize retention
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🚀</div>
              <h4 className="font-semibold text-white mb-2">Exam Ready</h4>
              <p className="text-sm text-slate-400">
                Get your readiness score and confidence-boosting insights before exam day
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
