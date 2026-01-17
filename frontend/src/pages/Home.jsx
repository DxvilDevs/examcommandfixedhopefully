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

  useEffect(() => { load(); }, []);

  const countdownDays = useMemo(() => daysUntil(data?.nextExam?.exam_date), [data]);

  return (
    <div className="space-y-6">
      {err && <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-red-200">{err}</div>}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-slate-300">Next Exam</div>
          <div className="mt-1 text-lg font-semibold">{data?.nextExam?.label || "Not set"}</div>
          <div className="text-sm text-slate-300">{data?.nextExam?.exam_date || "—"}</div>
          <div className="mt-2 text-sm">
            Countdown: <span className="font-medium">{data?.nextExam ? `${countdownDays} days` : "—"}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-slate-300">Tasks Done</div>
          <div className="mt-1 text-2xl font-semibold">{data?.tasksDone ?? 0}</div>
          <div className="text-sm text-slate-300 mt-2">Estimated study remaining</div>
          <div className="text-lg font-semibold">{Math.round((data?.estimatedStudyMinutes ?? 0) / 60 * 10) / 10} hrs</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-slate-300">Momentum</div>
          <div className="mt-1 text-2xl font-semibold">{data?.momentum ?? 0}</div>
          <div className="mt-3 flex gap-2">
            <button
              className="rounded-xl px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-sm"
              onClick={async () => { await dashboardApi.adjustMomentum(1); load(); }}
            >
              +1
            </button>
            <button
              className="rounded-xl px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-sm"
              onClick={async () => { await dashboardApi.adjustMomentum(2); load(); }}
            >
              +2 (focus)
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="font-semibold">Tasks</div>
          <div className="mt-3 flex gap-2">
            <input
              className="flex-1 rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
              placeholder="Add a task..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <button
              className="rounded-xl px-3 py-2 bg-indigo-500/90 hover:bg-indigo-500 transition font-medium"
              onClick={async () => { if (!taskTitle.trim()) return; await dashboardApi.addTask(taskTitle.trim()); setTaskTitle(""); load(); }}
            >
              Add
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {(data?.tasks || []).map((t) => (
              <button
                key={t.id}
                onClick={async () => { await dashboardApi.toggleTask(t.id); load(); }}
                className="w-full text-left rounded-xl border border-white/10 bg-slate-900/30 hover:bg-slate-900/45 px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <div className={t.done ? "line-through text-slate-400" : ""}>{t.title}</div>
                  <div className="text-xs text-slate-400">{t.estimate_minutes}m</div>
                </div>
              </button>
            ))}
            {!data?.tasks?.length && <div className="text-sm text-slate-300">No tasks yet.</div>}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="font-semibold">Set / Update Next Exam</div>
          <div className="mt-3 grid gap-2">
            <input className="rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
              placeholder="Exam label (e.g. Maths Paper 1)" value={examLabel} onChange={(e) => setExamLabel(e.target.value)} />
            <input className="rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
              type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
            <button
              className="rounded-xl px-3 py-2 bg-indigo-500/90 hover:bg-indigo-500 transition font-medium"
              onClick={async () => { if (!examLabel.trim() || !examDate) return; await dashboardApi.addExam(examLabel.trim(), examDate); setExamLabel(""); setExamDate(""); load(); }}
            >
              Save exam
            </button>
          </div>

          <div className="mt-6 text-sm text-slate-300">
            Today’s plan (MVP): do 1–2 tasks + a 25–50m focus session.
          </div>
        </div>
      </div>
    </div>
  );
}
