import React, { useEffect, useMemo, useState } from "react";
import PremiumGate from "../components/PremiumGate";
import PremiumCard from "../components/PremiumCard";
import { statsApi } from "../api/stats";

import ForgettingCurve from "../components/Charts/ForgettingCurve";
import TopicsDonut from "../components/Charts/TopicsDonut";
import DailyMinutes from "../components/Charts/DailyMinutes";
import MomentumLine from "../components/Charts/MomentumLine";

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function Statistics({ me }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  const [topic, setTopic] = useState("");
  const [minutes, setMinutes] = useState(30);
  const [confidence, setConfidence] = useState(3);
  const [msg, setMsg] = useState("");

  const premium = me?.plan === "PREMIUM" || me?.role === "OWNER";

  async function load() {
    try {
      setErr("");
      setMsg("");
      const r = await statsApi.get();
      setData(r);
    } catch (e) {
      setErr(e.message || "Failed to load stats");
    }
  }

  useEffect(() => {
    if (premium) load();
  }, [premium]);

  const topModel = useMemo(() => {
    if (!data?.topicModels?.length) return null;
    return [...data.topicModels].sort((a, b) => a.currentRetention - b.currentRetention)[0];
  }, [data]);

  return (
    <PremiumGate me={me}>
      <div className="space-y-6">
        {/* Premium Header */}
        <div className="relative rounded-3xl overflow-hidden border border-amber-300/20 glass-card shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-300/10 via-yellow-400/5 to-orange-400/10 animated-gradient" />
          <div className="relative px-8 py-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold gold-gradient bg-clip-text text-transparent">
                Premium Statistics
              </h1>
              <p className="text-sm text-slate-300 mt-1">
                Intelligent revision analytics powered by forgetting curve science
              </p>
            </div>
            <button
              onClick={load}
              className="btn-secondary text-sm"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {err && (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-red-200 text-sm">
            {err}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid lg:grid-cols-4 gap-4">
          <div className="relative rounded-3xl p-5 overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 opacity-85" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative">
              <div className="text-xs uppercase tracking-wide text-white/70 font-medium mb-2">
                Readiness Score
              </div>
              <div className="text-4xl font-bold text-white">
                {data?.summary?.readiness ?? "—"}
              </div>
              <div className="text-xs text-white/80 mt-2">Coverage + Retention</div>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-2">
              Coverage (14d)
            </div>
            <div className="text-3xl font-bold text-white">
              {data?.summary?.coverage14d != null ? `${data.summary.coverage14d}%` : "—"}
            </div>
            <div className="text-xs text-slate-400 mt-2">Active topics ratio</div>
          </div>

          <div className="glass-card p-5">
            <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-2">
              Avg Retention
            </div>
            <div className="text-3xl font-bold text-white">
              {data?.summary?.avgRetention != null
                ? `${Math.round(data.summary.avgRetention * 100)}%`
                : "—"}
            </div>
            <div className="text-xs text-slate-400 mt-2">Across all topics</div>
          </div>

          <div className="glass-card p-5">
            <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-2">
              Overdue Topics
            </div>
            <div className="text-3xl font-bold text-red-300">
              {data?.summary?.overdueCount ?? "—"}
            </div>
            <div className="text-xs text-slate-400 mt-2">Need revision now</div>
          </div>
        </div>

        {/* Log Revision + Next Review */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PremiumCard
              title="Log a Revision"
              subtitle="Track your study sessions to improve retention modeling"
            >
              {msg && (
                <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                  {msg}
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-3 mb-4">
                <input
                  className="glass-input"
                  placeholder="Topic (e.g. Algebra)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                <input
                  className="glass-input"
                  type="number"
                  min={5}
                  max={600}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  placeholder="Minutes"
                />
                <select
                  className="glass-input"
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((c) => (
                    <option key={c} value={c}>
                      Confidence {c}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="btn-primary w-full"
                onClick={async () => {
                  try {
                    setErr("");
                    setMsg("");
                    if (!topic.trim()) return setErr("Topic is required.");
                    await statsApi.addRevision(topic.trim(), minutes, confidence);
                    setTopic("");
                    setMinutes(30);
                    setConfidence(3);
                    setMsg("✓ Revision logged successfully!");
                    await load();
                  } catch (e) {
                    setErr(e.message);
                  }
                }}
              >
                Log Revision
              </button>
            </PremiumCard>
          </div>

          <PremiumCard title="Next Review" subtitle="Most urgent topic">
            {topModel ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-300/10 to-orange-400/5 border border-amber-300/20">
                  <div className="text-lg font-bold text-white mb-2">{topModel.topic}</div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-400">Retention:</span>
                    <span className="font-semibold text-red-300">
                      {Math.round(topModel.currentRetention * 100)}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    Review by: {fmtDate(topModel.nextReviewAt)}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  Decay rate: {topModel.tauDays} days • Sessions: {topModel.revCount}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400 text-center py-6">
                Log revisions to start tracking
              </div>
            )}
          </PremiumCard>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <PremiumCard
            title="Forgetting Curve"
            subtitle="Retention decay over time"
          >
            {topModel ? (
              <ForgettingCurve model={topModel} />
            ) : (
              <div className="text-sm text-slate-400 text-center py-8">
                No data yet. Log a revision to start!
              </div>
            )}
          </PremiumCard>

          <PremiumCard title="Topic Distribution" subtitle="Study time breakdown">
            {data?.byTopic ? (
              <TopicsDonut byTopic={data.byTopic} />
            ) : (
              <div className="text-sm text-slate-400 text-center py-8">
                No data yet
              </div>
            )}
          </PremiumCard>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <PremiumCard title="Daily Study (30d)" subtitle="Minutes logged per day">
            {data?.dailyMinutes ? (
              <DailyMinutes daily={data.dailyMinutes} />
            ) : (
              <div className="text-sm text-slate-400 text-center py-8">
                No data yet
              </div>
            )}
          </PremiumCard>

          <PremiumCard title="Momentum Trend (30d)" subtitle="Your consistency over time">
            {data?.momentumEvents?.length ? (
              <MomentumLine events={data.momentumEvents} />
            ) : (
              <div className="text-sm text-slate-400 text-center py-8">
                Use +1/+2 buttons on Home to track momentum
              </div>
            )}
          </PremiumCard>
        </div>

        {/* Overdue Topics */}
        <PremiumCard title="Overdue Topics" subtitle="Needs immediate review">
          <div className="grid md:grid-cols-2 gap-3">
            {(data?.overdue || []).map((o) => (
              <div
                key={o.topic}
                className="rounded-2xl border border-red-300/20 bg-red-500/5 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="font-semibold text-white">{o.topic}</div>
                  <div className="text-xs px-2 py-1 rounded-lg bg-red-400/20 text-red-200">
                    {Math.round(o.currentRetention * 100)}%
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  Due: {fmtDate(o.nextReviewAt)}
                </div>
              </div>
            ))}

            {!data?.overdue?.length && (
              <div className="col-span-2 text-sm text-slate-400 text-center py-6">
                Nothing overdue — you're all caught up! 🎉
              </div>
            )}
          </div>
        </PremiumCard>
      </div>
    </PremiumGate>
  );
}
