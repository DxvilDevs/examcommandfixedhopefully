import React, { useEffect, useMemo, useState } from "react";
import { dashboardApi } from "../api/dashboard";

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

  const countdownDays = useMemo(
    () => daysUntil(data?.nextExam?.exam_date),
    [data]
  );

  return (
    <div className="space-y-6">
      {/* Ambient background (page-local; no global CSS required) */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute -top-28 -left-28 w-[420px] h-[420px] rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute top-16 right-[-140px] w-[520px] h-[520px] rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="absolute bottom-[-180px] left-[20%] w-[560px] h-[560px] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      {err && (
        <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-4 text-red-200">
          {err}
        </div>
      )}

      {/* Top stats */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Next exam (gradient card) */}
        <div className="relative rounded-3xl p-5 overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-pink-500 opacity-90" />
          <div className="absolute inset-0 bg-black/25" />
          <div className="relative">
            <div className="text-xs uppercase tracking-wide text-white/70">
              Next Exam
            </div>
            <div className="mt-2 text-xl font-semibold text-white">
              {data?.nextExam?.label || "Not set"}
            </div>
            <div className="mt-1 text-sm text-white/75">
              {data?.nextExam?.exam_date || "—"}
            </div>
            <div className="mt-3 text-sm text-white/80">
              Countdown:{" "}
              <span className="font-medium text-white">
                {data?.nextExam ? `${countdownDays} days` : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Tasks done */}
        <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="text-xs uppercase tracking-wide text-white/60">
            Tasks Done
          </div>
          <div className="mt-2 text-3xl font-semibold text-white">
            {data?.tasksDone ?? 0}
          </div>

          <div className="mt-4 text-xs uppercase tracking-wide text-white/60">
            Estimated Study Remaining
          </div>
          <div className="mt-2 text-xl font-semibold text-white">
            {Math.round(((data?.estimatedStudyMinutes ?? 0) / 60) * 10) / 10}{" "}
            hrs
          </div>
        </div>

        {/* Momentum */}
        <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="text-xs uppercase tracking-wide text-white/60">
            Momentum
          </div>
          <div className="mt-2 text-3xl font-semibold text-white">
            {data?.momentum ?? 0}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              className="rounded-2xl px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm"
              onClick={async () => {
                await dashboardApi.adjustMomentum(1);
                load();
              }}
            >
              +1
            </button>
            <button
              className="rounded-2xl px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm"
              onClick={async () => {
                await dashboardApi.adjustMomentum(2);
                load();
              }}
            >
              +2 (focus)
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Tasks */}
        <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-white/90">Tasks</div>
            <div className="text-xs text-white/50">
              Tap a task to toggle
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              className="flex-1 rounded-2xl bg-slate-900/50 border border-white/10 px-3 py-2 outline-none focus:border-white/20"
              placeholder="Add a task..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <button
              className="rounded-2xl px-4 py-2 bg-indigo-500/90 hover:bg-indigo-500 transition font-medium"
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

          <div className="mt-4 space-y-2">
            {(data?.tasks || []).map((t) => (
              <button
                key={t.id}
                onClick={async () => {
                  await dashboardApi.toggleTask(t.id);
                  load();
                }}
                className="w-full text-left rounded-2xl border border-white/10 bg-slate-900/30 hover:bg-slate-900/45 px-4 py-3 transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className={t.done ? "line-through text-white/40" : "text-white/90"}>
                    {t.title}
                  </div>
                  <div className="text-xs text-white/50">
                    {t.estimate_minutes}m
                  </div>
                </div>
              </button>
            ))}

            {!data?.tasks?.length && (
              <div className="text-sm text-white/60">No tasks yet.</div>
            )}
          </div>
        </div>

        {/* Next exam form */}
        <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="text-lg font-semibold text-white/90">
            Set / Update Next Exam
          </div>

          <div className="mt-4 grid gap-2">
            <input
              className="rounded-2xl bg-slate-900/50 border border-white/10 px-3 py-2 outline-none focus:border-white/20"
              placeholder="Exam label (e.g. Maths Paper 1)"
              value={examLabel}
              onChange={(e) => setExamLabel(e.target.value)}
            />
            <input
              className="rounded-2xl bg-slate-900/50 border border-white/10 px-3 py-2 outline-none focus:border-white/20"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
            <button
              className="rounded-2xl px-4 py-2 bg-indigo-500/90 hover:bg-indigo-500 transition font-medium"
              onClick={async () => {
                if (!examLabel.trim() || !examDate) return;
                await dashboardApi.addExam(examLabel.trim(), examDate);
                setExamLabel("");
                setExamDate("");
                load();
              }}
            >
              Save exam
            </button>
          </div>

          <div className="mt-6 text-sm text-white/60">
            Today’s plan (MVP): do 1–2 tasks + a 25–50m focus session.
          </div>
        </div>
      </div>
    </div>
  );
}
