import React, { useEffect, useRef, useState } from "react";
import PremiumCard from "../components/PremiumCard";
import { focusApi } from "../api/focus";

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function Focus({ me }) {
  const [topic, setTopic] = useState("");
  const [task, setTask] = useState("");
  const [duration, setDuration] = useState(25);

  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [sessionId, setSessionId] = useState(null);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const timerRef = useRef(null);

  const mm = pad(Math.floor(secondsLeft / 60));
  const ss = pad(secondsLeft % 60);
  const progress = ((duration * 60 - secondsLeft) / (duration * 60)) * 100;

  const premium = me?.plan === "PREMIUM" || me?.role === "OWNER";

  function clearTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  function startTimer() {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearTimer();
          finish(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function start() {
    setError("");
    setInfo("");

    setRunning(true);
    setPaused(false);
    setSecondsLeft(duration * 60);
    startTimer();

    try {
      const r = await focusApi.start(topic.trim() || "Focus Session", task.trim());
      setSessionId(r.id);
      setInfo("Focus session started.");
    } catch (e) {
      clearTimer();
      setRunning(false);
      setError("Failed to start focus session (API error).");
    }
  }

  async function finish(done) {
    clearTimer();

    try {
      if (sessionId) {
        const minutes = Math.max(1, Math.round((duration * 60 - secondsLeft) / 60));
        await focusApi.end(sessionId, minutes, done);
      }
      setInfo(done ? "Session completed! 🎉" : "Session cancelled.");
    } catch {
      setError("Failed to log focus session.");
    }

    reset();
  }

  function pause() {
    clearTimer();
    setPaused(true);
  }

  function resume() {
    setPaused(false);
    startTimer();
  }

  function reset() {
    clearTimer();
    setRunning(false);
    setPaused(false);
    setSessionId(null);
    setSecondsLeft(duration * 60);
  }

  useEffect(() => {
    return () => clearTimer();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <PremiumCard
        title="Focus Mode"
        subtitle="Deep work sessions with automatic tracking"
        right={
          premium && <span className="premium-badge">Premium</span>
        }
      >
        {error && (
          <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            {info}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <input
            className="glass-input"
            placeholder="Topic (e.g. Algebra)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={running}
          />
          <input
            className="glass-input"
            placeholder="Task (optional)"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            disabled={running}
          />
          <div className="flex gap-2">
            {[25, 45, 60].map((m) => (
              <button
                key={m}
                onClick={() => {
                  if (!running) {
                    setDuration(m);
                    setSecondsLeft(m * 60);
                  }
                }}
                className={`flex-1 rounded-2xl px-3 py-2.5 border smooth-transition font-medium ${
                  duration === m
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-400/40 shadow-lg shadow-indigo-500/25"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>
      </PremiumCard>

      {/* Timer Card */}
      <div className="glass-card p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-8">
          {/* Circular timer */}
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-2xl pulse-glow" />
            
            {/* Progress ring */}
            <svg className="relative transform -rotate-90" width="280" height="280">
              {/* Background ring */}
              <circle
                cx="140"
                cy="140"
                r="130"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="12"
              />
              {/* Progress ring */}
              <circle
                cx="140"
                cy="140"
                r="130"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 130}`}
                strokeDashoffset={`${2 * Math.PI * 130 * (1 - progress / 100)}`}
                className="smooth-transition"
                style={{ transitionDuration: '0.3s' }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>

            {/* Timer display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl font-bold font-mono text-white mb-2">
                {mm}:{ss}
              </div>
              {running && (
                <div className="text-sm text-slate-400">
                  {paused ? "Paused" : "Focus time"}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          {!running ? (
            <button onClick={start} className="btn-primary px-8 py-4 text-lg">
              Start Focus Session
            </button>
          ) : (
            <div className="flex gap-3">
              {!paused ? (
                <button onClick={pause} className="btn-secondary px-6 py-3">
                  ⏸️ Pause
                </button>
              ) : (
                <button onClick={resume} className="btn-secondary px-6 py-3">
                  ▶️ Resume
                </button>
              )}

              <button onClick={() => finish(true)} className="btn-success px-6 py-3">
                ✓ Finish
              </button>

              <button onClick={() => finish(false)} className="btn-danger px-6 py-3">
                ✕ Cancel
              </button>
            </div>
          )}

          {running && (
            <div className="text-center">
              <div className="text-sm text-slate-400">
                {topic || "Focus Session"} {task && `• ${task}`}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
