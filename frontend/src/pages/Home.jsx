import React, { useEffect, useMemo, useState } from "react";
import { dashboardApi } from "../api/dashboard";
import GamificationCard from "../components/GamificationCard";
import DailyPlannerCard from "../components/DailyPlannerCard";

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function Home() {
  const [data, setData] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [examLabel, setExamLabel] = useState("");
  const [examDate, setExamDate] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    try {
      setErr("");
      const r = await dashboardApi.home();
      setData(r);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const countdownDays = useMemo(() => daysUntil(data?.nextExam?.exam_date), [data]);

  return (
    <div className="space-y-6">
      {err && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-red-200">
          {err}
        </div>
      )}

      {/* Import gamification and planner at top */}
      <GamificationCard />

      {/* Gradient stat cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Next Exam Card */}
        <div className="relative rounded-3xl p-6 overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-90" />
          <div className="absolute inset-0 bg-black/25" />
          <div className="relative">
            <div className="text-xs uppercase tracking-wide text-white/70 font-medium">
              Next Exam
            </div>
            <div className="mt-3 text-2xl font-bold text-white">
              {data?.nextExam?.label || "Not set"}
            </div>
            <div className="mt-2 text-sm text-white/80">
              {data?.nextExam?.exam_date || "—"}
            </div>
            {data?.nextExam && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                <span className="text-xs font-medium text-white">
                  {countdownDays} days away
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tasks Card */}
        <div className="relative rounded-3xl p-6 overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 opacity-85" />
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative">
            <div className="text-xs uppercase tracking-wide text-white/70 font-medium">
              Tasks Completed
            </div>
            <div className="mt-3 text-4xl font-bold text-white">
              {data?.tasksDone ?? 0}
            </div>
            <div className="mt-3 text-sm text-white/80">Study remaining</div>
            <div className="text-xl font-semibold text-white">
              {Math.round(((data?.estimatedStudyMinutes ?? 0) / 60) * 10) / 10} hrs
            </div>
          </div>
        </div>

        {/* Momentum Card */}
        <div className="relative rounded-3xl p-6 overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-orange-400 to-pink-500 opacity-85" />
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative">
            <div className="text-xs uppercase tracking-wide text-white/70 font-medium">
              Momentum
            </div>
            <div className="mt-3 text-4xl font-bold text-white">
              {data?.momentum ?? 0}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                className="flex-1 rounded-xl px-3 py-2 bg-white/20 hover:bg-white/30 smooth-transition text-white text-sm font-medium backdrop-blur-sm"
                onClick={async () => {
                  await dashboardApi.adjustMomentum(1);
                  load();
                }}
              >
                +1
              </button>
              <button
                className="flex-1 rounded-xl px-3 py-2 bg-white/20 hover:bg-white/30 smooth-transition text-white text-sm font-medium backdrop-blur-sm"
                onClick={async () => {
                  await dashboardApi.adjustMomentum(2);
                  load();
                }}
              >
                +2
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tasks section */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>

          <div className="flex gap-3 mb-4">
            <input
              className="glass-input flex-1"
              placeholder="Add a task..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && taskTitle.trim()) {
                  dashboardApi.addTask(taskTitle.trim()).then(() => {
                    setTaskTitle("");
                    load();
                  });
                }
              }}
            />
            <button
              className="btn-primary"
              onClick={async () => {
                if (!taskTitle.trim()) return;
                await dashboardApi.addTask(taskTitle.trim());
                setTaskTitle("");
                load();
              }}
            >
              Add
            </button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {(data?.tasks || []).map((t) => (
              <button
                key={t.id}
                onClick={async () => {
                  await dashboardApi.toggleTask(t.id);
                  load();
                }}
                className="w-full text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 smooth-transition px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-3 ${t.done ? "opacity-50" : ""}`}>
                    <div
                      className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center smooth-transition ${
                        t.done
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-white/30"
                      }`}
                    >
                      {t.done && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={t.done ? "line-through" : ""}>
                      {t.title}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-lg">
                    {t.estimate_minutes}m
                  </span>
                </div>
              </button>
            ))}
            {!data?.tasks?.length && (
              <div className="text-sm text-slate-400 text-center py-8">
                No tasks yet. Add one to get started!
              </div>
            )}
          </div>
        </div>

        {/* Exam setup section */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Set Next Exam</h2>

          <div className="space-y-3">
            <input
              className="glass-input w-full"
              placeholder="Exam label (e.g. Maths Paper 1)"
              value={examLabel}
              onChange={(e) => setExamLabel(e.target.value)}
            />
            <input
              className="glass-input w-full"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
            <button
              className="btn-primary w-full"
              onClick={async () => {
                if (!examLabel.trim() || !examDate) return;
                await dashboardApi.addExam(examLabel.trim(), examDate);
                setExamLabel("");
                setExamDate("");
                load();
              }}
            >
              Save Exam
            </button>
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-400/20">
            <div className="text-sm font-medium text-indigo-300 mb-2">
              📋 Today's Plan
            </div>
            <div className="text-sm text-slate-300">
              Complete 1–2 tasks + a 25–50m focus session to build momentum!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
