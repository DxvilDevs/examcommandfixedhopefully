import React, { useEffect, useRef, useState } from "react";
import PremiumCard from "../components/PremiumCard";
import { focusApi } from "../api/focus";

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function Focus({ me }) {
  const [topic, setTopic] = useState("");
  const [task, setTask] = useState("");
  const [duration, setDuration] = useState(25); // minutes
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);

  const [seconds, setSeconds] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const timerRef = useRef(null);

  const mm = pad(Math.floor(seconds / 60));
  const ss = pad(seconds % 60);

  const premium = me?.plan === "PREMIUM" || me?.role === "OWNER";

  function startTimer() {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }

  async function start() {
    const usedTopic = topic.trim() || "Focus Session";
    const r = await focusApi.start(usedTopic, task.trim());
    setSessionId(r.id);
    setRunning(true);
    setPaused(false);
    setSeconds(0);
    startTimer();
  }

  async function finish(done = true) {
    stopTimer();
    const mins = Math.max(1, Math.round(seconds / 60));
    await focusApi.end(sessionId, mins, done);
    reset();
  }

  function pause() {
    stopTimer();
    setPaused(true);
  }

  function resume() {
    startTimer();
    setPaused(false);
  }

  function reset() {
    stopTimer();
    setRunning(false);
    setPaused(false);
    setSessionId(null);
    setSeconds(0);
  }

  useEffect(() => () => stopTimer(), []);

  return (
    <div className="space-y-6">
      {/* Header card */}
      <PremiumCard
        title="Focus Mode"
        subtitle="Deep work sessions with automatic logging"
        right={
          premium && (
            <span className="text-xs px-2 py-1 rounded-full bg-amber-300/15 border border-amber-300/20 text-amber-200">
              PREMIUM
            </span>
          )
        }
      >
        <div className="grid md:grid-cols-3 gap-3">
          <input
            className="rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
            placeholder="Topic (e.g. Algebra)"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            disabled={running}
          />

          <input
            className="rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
            placeholder="Task / notes (optional)"
            value={task}
            onChange={e => setTask(e.target.value)}
            disabled={running}
          />

          <div className="flex gap-2">
            {[25, 45, 60].map(m => (
              <button
                key={m}
                disabled={running}
                onClick={() => setDuration(m)}
                className={`flex-1 rounded-xl px-3 py-2 border transition
                  ${
                    duration === m
                      ? "bg-indigo-500/80 border-indigo-400/40"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>
      </PremiumCard>

      {/* Timer */}
      <PremiumCard
        title="Session"
        subtitle={running ? "Stay locked in" : "Ready when you are"}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="text-6xl font-mono tracking-tight">
            {mm}:{ss}
          </div>

          {!running ? (
            <button
              onClick={start}
              className="rounded-xl px-6 py-3 bg-indigo-500 hover:bg-indigo-600 transition font-medium"
            >
              Start Focus Session
            </button>
          ) : (
            <div className="flex gap-3">
              {!paused ? (
                <button
                  onClick={pause}
                  className="rounded-xl px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10"
                >
                  Pause
                </button>
              ) : (
                <button
                  onClick={resume}
                  className="rounded-xl px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10"
                >
                  Resume
                </button>
              )}

              <button
                onClick={() => finish(true)}
                className="rounded-xl px-4 py-2 bg-emerald-500/20 border border-emerald-400/30"
              >
                Finish
              </button>

              <button
                onClick={() => finish(false)}
                className="rounded-xl px-4 py-2 bg-red-500/20 border border-red-400/30"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="text-xs text-slate-400">
            Logged automatically when you finish.
          </div>
        </div>
      </PremiumCard>
    </div>
  );
}
