import React, { useMemo } from "react";
import PremiumCard from "../components/PremiumCard";

export default function Preview() {
  // Fake user + premium flags purely for preview visuals
  const me = useMemo(
    () => ({
      preferred_name: "Adam",
      plan: "PREMIUM",
      role: "OWNER"
    }),
    []
  );

  const isPremium = me?.plan === "PREMIUM" || me?.role === "OWNER";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Ambient background (pure tailwind, no new CSS) */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute -top-28 -left-28 w-[420px] h-[420px] rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute top-16 right-[-140px] w-[520px] h-[520px] rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="absolute bottom-[-180px] left-[20%] w-[560px] h-[560px] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      {/* Header */}
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-white/60">Preview</div>

            {/* Gold title when premium (no new components) */}
            <h1
              className={`text-2xl md:text-3xl font-semibold ${
                isPremium
                  ? "bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent"
                  : ""
              }`}
            >
              Exam Command Centre
            </h1>

            <div className="mt-2 text-white/80">
              Welcome, <span className="font-medium">{me.preferred_name}</span>
              {isPremium && (
                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-amber-300/15 border border-amber-300/25 text-amber-200">
                  Premium
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
              Alerts
            </button>
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
              Profile
            </button>
          </div>
        </div>

        {/* Top stat cards (no new components) */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative rounded-3xl p-5 overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-pink-500 opacity-90" />
            <div className="absolute inset-0 bg-black/25" />
            <div className="relative">
              <div className="text-xs uppercase tracking-wide text-white/70">Next Exam</div>
              <div className="mt-2 text-2xl font-semibold text-white">Physics Paper 2</div>
              <div className="mt-2 text-sm text-white/75">In 6 days</div>
            </div>
          </div>

          <div className="relative rounded-3xl p-5 overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-sky-400 to-indigo-400 opacity-80" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative">
              <div className="text-xs uppercase tracking-wide text-white/70">Momentum</div>
              <div className="mt-2 text-2xl font-semibold text-white">82%</div>
              <div className="mt-2 text-sm text-white/75">Strong consistency</div>
            </div>
          </div>

          <div className="relative rounded-3xl p-5 overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-400 opacity-80" />
            <div className="absolute inset-0 bg-black/35" />
            <div className="relative">
              <div className="text-xs uppercase tracking-wide text-white/70">Focus Today</div>
              <div className="mt-2 text-2xl font-semibold text-white">1h 45m</div>
              <div className="mt-2 text-sm text-white/75">3 sessions</div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Focus preview */}
          <div className="lg:col-span-2">
            <PremiumCard title="Focus Mode" subtitle="Preview only — no API calls">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="relative">
                  <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-pink-500 opacity-25 blur-2xl" />
                  <div className="relative w-56 h-56 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center">
                    <div className="text-5xl font-mono text-white">25:00</div>
                  </div>
                </div>

                <div className="w-full md:w-auto space-y-3">
                  <div className="text-sm text-white/70">Topic</div>
                  <div className="px-4 py-3 rounded-2xl bg-slate-900/50 border border-white/10">
                    Algebra — Simultaneous Equations
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                      Pause
                    </button>
                    <button className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-300/20 text-emerald-100 hover:bg-emerald-500/25 transition">
                      Finish
                    </button>
                    <button className="px-4 py-2 rounded-xl bg-red-500/15 border border-red-300/20 text-red-100 hover:bg-red-500/20 transition">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </PremiumCard>
          </div>

          {/* Status / alerts preview */}
          <div className="space-y-4">
            <PremiumCard title="System Status">
              <Row label="API" state="Operational" color="bg-emerald-400" />
              <Row label="Stats Engine" state="Minor delay" color="bg-amber-300" />
              <Row label="Auth" state="Operational" color="bg-emerald-400" />
            </PremiumCard>

            {/* Premium lock preview (stats) */}
            <div className="relative">
              {/* Gold outline (niche feature preserved visually) */}
              <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-400 opacity-30 blur-md" />
              <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-400 opacity-20" />

              <div className="relative rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">Premium Statistics</div>
                    <div className="text-sm text-white/60 mt-1">
                      Gold outline + blur lock preview
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-300/15 border border-amber-300/25 text-amber-200">
                    Premium
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="h-20 rounded-2xl bg-white/5 border border-white/10" />
                  <div className="h-20 rounded-2xl bg-white/5 border border-white/10" />
                  <div className="h-20 rounded-2xl bg-white/5 border border-white/10" />
                  <div className="h-20 rounded-2xl bg-white/5 border border-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-white/50 pt-2">
          This page is a UI preview only. Remove it whenever you’re ready.
        </div>
      </div>
    </div>
  );
}

function Row({ label, state, color }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <span className="relative inline-flex items-center">
          <span className={`absolute inline-flex h-3 w-3 rounded-full ${color} opacity-40 animate-ping`} />
          <span className={`relative inline-flex h-3 w-3 rounded-full ${color}`} />
        </span>
        <span className="text-white/90">{label}</span>
      </div>
      <span className="text-sm text-white/60">{state}</span>
    </div>
  );
}
