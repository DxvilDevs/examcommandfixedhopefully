import React, { useEffect, useRef, useState } from "react";
import PremiumCard from "../components/PremiumCard";
import { focusApi } from "../api/focus";

export default function Focus({ me }) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [topic, setTopic] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [err, setErr] = useState("");

  const timer = useRef(null);

  function startTick() {
    timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }
  function stopTick() {
    clearInterval(timer.current);
    timer.current = null;
  }

  async function start() {
    try {
      setErr("");
      const r = await focusApi.start(topic || "Focus Session", "");
      setSessionId(r.id);
      setRunning(true);
      setSeconds(0);
      startTick();
    } catch (e) {
      setErr(e.message || "Failed to start");
    }
  }

  async function end(completed = true) {
    try {
      setErr("");
      stopTick();
      const mins = Math.max(1, Math.round(seconds / 60));
      await focusApi.end(sessionId, mins, completed);
      setRunning(false);
      setSessionId(null);
    } catch (e) {
      setErr(e.message || "Failed to end");
    }
  }

  useEffect(() => () => stopTick(), []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="space-y-6">
      <PremiumCard title="Focus Mode" subtitle="Lock in. Auto-logs study time." right={<div className="text-xs text-amber-200">MVP+</div>}>
        {err && <div className="text-sm text-red-200">{err}</div>}

        {!running ? (
          <div className="space-y-3">
            <input
              className="w-full rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
              placeholder="Topic (optional)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <button
              className="rounded-xl px-4 py-2 bg-indigo-500/90 hover:bg-indigo-500 transition font-medium"
              onClick={start}
            >
              Start Focus Session
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-4xl font-semibold tabular-nums">{mm}:{ss}</div>

            <div className="flex items-center gap-2">
              <button
                className="rounded-xl px-4 py-2 bg-emerald-500/20 border border-emerald-400/20 hover:bg-emerald-500/30 transition text-emerald-100"
                onClick={() => end(true)}
              >
                Finish
              </button>
              <button
                className="rounded-xl px-4 py-2 bg-red-500/15 border border-red-400/20 hover:bg-red-500/25 transition text-red-100"
                onClick={() => end(false)}
              >
                Cancel
              </button>
            </div>

            <div className="text-xs text-slate-400">
              Navigation lock (hard-lock) can be added next — this MVP already logs sessions.
            </div>
          </div>
        )}
      </PremiumCard>
    </div>
  );
}
