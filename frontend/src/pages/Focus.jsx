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

  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [sessionId, setSessionId] = useState(null);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const timerRef = useRef(null);

  const mm = pad(Math.floor(secondsLeft / 60));
  const ss = pad(secondsLeft % 60);

  const premium = me?.plan === "PREMIUM" || me?.role === "OWNER";

  function clearTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  function startTimer() {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
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

    // optimistic UI
    setRunning(true);
    setPaused(false);
    setSecondsLeft(duration * 60);
    startTimer();

    try {
      const r = await focusApi.start(
        topic.trim() || "Focus Session",
        task.trim()
      );
      setSessionId(r.id);
      setInfo("Focus session started.");
    } catch (e) {
      // rollback if backend fails
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
      setInfo(done ? "Session logged." : "Session cancelled.");
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
      <PremiumCard
        title="Focus Mode"
        subtitle="Timed deep-work sessions with automatic logging"
        right={
          premium && (
            <span className="text-xs px-2 py-1 rounded-full bg-amber-300/15 border border-amber-300/20 text-amber-200">
              PREMIUM
            </span>
          )
        }
      >
        {error && (
          <div className="mb-3 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            {info}
          </div>
        )}

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
                onClick={() => {
                  if (!running) {
                    setDuration(m);
                    setSecondsLeft(m * 60);
                  }
                }}
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

      <PremiumCard title="Session">
        <div className="flex flex-col items-center gap-6">
          <div className="text-6xl font-mono">
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
        </div>
      </PremiumCard>
    </div>
  );
}