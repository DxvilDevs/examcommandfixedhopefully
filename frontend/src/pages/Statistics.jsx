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

  // revision input
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
    if (premium) load(); // only load if premium to avoid 403 spam
  }, [premium]);

  const topModel = useMemo(() => {
    if (!data?.topicModels?.length) return null;
    // pick most urgent (lowest retention) among top 8
    return [...data.topicModels].sort((a, b) => a.currentRetention - b.currentRetention)[0];
  }, [data]);

  return (
    <PremiumGate me={me}>
      <div className="space-y-6">
        {/* Premium header */}
        <div className="rounded-2xl border border-amber-300/20 bg-white/5 overflow-hidden">
          <div className="px-6 py-5 relative">
            <div className="absolute inset-0 opacity-40 bg-gradient-to-r from-amber-300/20 via-transparent to-indigo-500/10" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">Premium Statistics</div>
                <div className="text-sm text-slate-300 mt-1">
                  Intelligent revision analytics — forgetting curves, coverage, time, and momentum.
                </div>
              </div>
              <button
                onClick={load}
                className="rounded-xl px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {err && (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-red-200 text-sm">
            {err}
          </div>
        )}

        {/* Summary row */}
        <div className="grid lg:grid-cols-4 gap-4">
          <PremiumCard
            title="Readiness Score"
            subtitle="0–100 (coverage + retention + momentum)"
            right={<div className="text-xs text-amber-200">PREMIUM</div>}
          >
            <div className="text-3xl font-semibold">
              {data?.summary?.readiness ?? "—"}
            </div>
          </PremiumCard>

          <PremiumCard title="Coverage (14d)" subtitle="Active topics vs total topics">
            <div className="text-3xl font-semibold">
              {data?.summary?.coverage14d != null ? `${data.summary.coverage14d}%` : "—"}
            </div>
          </PremiumCard>

          <PremiumCard title="Average Retention" subtitle="Across topics (modelled)">
            <div className="text-3xl font-semibold">
              {data?.summary?.avgRetention != null ? `${Math.round(data.summary.avgRetention * 100)}%` : "—"}
            </div>
          </PremiumCard>

          <PremiumCard title="Overdue Topics" subtitle="Needs revision now">
            <div className="text-3xl font-semibold">
              {data?.summary?.overdueCount ?? "—"}
            </div>
          </PremiumCard>
        </div>

        {/* Revision input + next review */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="font-semibold">Log a Revision</div>
            <div className="text-sm text-slate-300 mt-1">
              Add topic + minutes + confidence — improves your forgetting curve model.
            </div>

            {msg && <div className="mt-3 text-sm text-emerald-200">{msg}</div>}

            <div className="mt-4 grid md:grid-cols-3 gap-3">
              <input
                className="rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
                placeholder="Topic (e.g. Trigonometry)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <input
                className="rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
                type="number"
                min={5}
                max={600}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              />
              <select
                className="rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
              >
                <option value={1}>Confidence 1</option>
                <option value={2}>Confidence 2</option>
                <option value={3}>Confidence 3</option>
                <option value={4}>Confidence 4</option>
                <option value={5}>Confidence 5</option>
              </select>
            </div>

            <button
              className="mt-4 rounded-xl px-4 py-2 bg-indigo-500/90 hover:bg-indigo-500 transition font-medium"
              onClick={async () => {
                try {
                  setErr("");
                  setMsg("");
                  if (!topic.trim()) return setErr("Topic is required.");
                  await statsApi.addRevision(topic.trim(), minutes, confidence);
                  setTopic("");
                  setMinutes(30);
                  setConfidence(3);
                  setMsg("Revision logged.");
                  await load();
                } catch (e) {
                  setErr(e.message);
                }
              }}
            >
              Add revision
            </button>
          </div>

          <PremiumCard title="Next Review" subtitle="Most urgent topic">
            {topModel ? (
              <div className="space-y-2">
                <div className="text-lg font-semibold">{topModel.topic}</div>
                <div className="text-sm text-slate-300">
                  Current retention: <span className="text-slate-100 font-medium">{Math.round(topModel.currentRetention * 100)}%</span>
                </div>
                <div className="text-sm text-slate-300">
                  Next review: <span className="text-slate-100 font-medium">{fmtDate(topModel.nextReviewAt)}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Tau: {topModel.tauDays} days • Revisions: {topModel.revCount}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-300">Log revisions to start modelling.</div>
            )}
          </PremiumCard>
        </div>

        {/* Forgetting curve + Coverage donut */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="font-semibold">Forgetting Curve</div>
            <div className="text-sm text-slate-300 mt-1">
              Modelled retention trend (based on your revisions + time + confidence).
            </div>
            <div className="mt-4">
              {topModel ? <ForgettingCurve model={topModel} /> : <div className="text-sm text-slate-300">No data yet.</div>}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="font-semibold">Topic Distribution</div>
            <div className="text-sm text-slate-300 mt-1">
              What you’ve revised most (top 8 + other).
            </div>
            <div className="mt-4">
              {data?.byTopic ? <TopicsDonut byTopic={data.byTopic} /> : <div className="text-sm text-slate-300">No data yet.</div>}
            </div>
          </div>
        </div>

        {/* Time intelligence + Momentum */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="font-semibold">Daily Study Minutes (30d)</div>
            <div className="text-sm text-slate-300 mt-1">Trend of revision time logged.</div>
            <div className="mt-4">
              {data?.dailyMinutes ? <DailyMinutes daily={data.dailyMinutes} /> : <div className="text-sm text-slate-300">No data yet.</div>}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="font-semibold">Momentum Trend (30d)</div>
            <div className="text-sm text-slate-300 mt-1">How your momentum changes over time.</div>
            <div className="mt-4">
              {data?.momentumEvents?.length ? (
                <MomentumLine events={data.momentumEvents} />
              ) : (
                <div className="text-sm text-slate-300">
                  No momentum history yet — press the +1/+2 buttons on Home to generate data.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overdue list */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="font-semibold">Overdue Topics</div>
          <div className="text-sm text-slate-300 mt-1">These are due based on your forgetting curve threshold.</div>

          <div className="mt-4 grid md:grid-cols-2 gap-3">
            {(data?.overdue || []).map((o) => (
              <div key={o.topic} className="rounded-2xl border border-white/10 bg-slate-900/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium">{o.topic}</div>
                  <div className="text-xs text-amber-200">{Math.round(o.currentRetention * 100)}%</div>
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Next review: {fmtDate(o.nextReviewAt)}
                </div>
              </div>
            ))}
            {!data?.overdue?.length && <div className="text-sm text-slate-300">Nothing overdue — nice.</div>}
          </div>
        </div>
      </div>
    </PremiumGate>
  );
}

