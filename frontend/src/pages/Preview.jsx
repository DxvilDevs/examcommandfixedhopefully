import React from "react";
import PremiumCard from "../components/PremiumCard";
import PremiumFrame from "../components/PremiumFrame";
import GradientStatCard from "../components/GradientStatCard";
import StatusDot from "../components/StatusDot";

export default function Preview() {
  const isPremium = true; // force premium for preview

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Exam Command Centre</h1>
          <p className="text-sm text-white/60">
            UI preview · glass / gradient theme
          </p>
        </div>

        <span className="text-xs px-2 py-1 rounded-full bg-amber-300/15 border border-amber-300/25 text-amber-200">
          Premium
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <GradientStatCard
          title="Next Exam"
          value="Physics Paper 2"
          hint="In 6 days"
        />
        <GradientStatCard
          title="Momentum"
          value="82%"
          variant="accent"
          hint="Strong consistency"
        />
        <GradientStatCard
          title="Focus Today"
          value="1h 45m"
          variant="gold"
          hint="3 sessions"
        />
      </div>

      {/* Focus preview */}
      <PremiumCard
        title="Focus Mode"
        subtitle="Deep work sessions with automatic logging"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-grad-primary opacity-30 blur-2xl" />
            <div className="relative w-56 h-56 rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur-xl flex items-center justify-center shadow-glow">
              <div className="text-5xl font-mono text-white">25:00</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="btn-primary">Pause</button>
            <button className="btn bg-emerald-500/20 ring-1 ring-emerald-300/20 text-emerald-100">
              Finish
            </button>
            <button className="btn bg-red-500/15 ring-1 ring-red-300/20 text-red-100">
              Cancel
            </button>
          </div>
        </div>
      </PremiumCard>

      {/* Status preview */}
      <PremiumCard title="System Status">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <StatusDot level="ok" />
            <span>API</span>
          </div>
          <span className="text-sm text-white/60">Operational</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <StatusDot level="warn" />
            <span>Stats Engine</span>
          </div>
          <span className="text-sm text-white/60">Minor delay</span>
        </div>
      </PremiumCard>

      {/* Premium stats preview */}
      <PremiumFrame enabled={isPremium}>
        <h2 className="text-lg font-semibold mb-4">Premium Statistics</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-soft p-4">
            <div className="text-sm text-white/60">Forgetting Curve</div>
            <div className="mt-2 h-28 rounded-xl bg-white/5" />
          </div>
          <div className="glass-soft p-4">
            <div className="text-sm text-white/60">Topic Distribution</div>
            <div className="mt-2 h-28 rounded-xl bg-white/5" />
          </div>
        </div>
      </PremiumFrame>
    </div>
  );
}
