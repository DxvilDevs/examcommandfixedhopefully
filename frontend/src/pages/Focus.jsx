import React, { useEffect, useMemo, useRef, useState } from "react";
import PremiumCard from "../components/PremiumCard";
import { focusApi } from "../api/focus";
import { useNavigate } from "react-router-dom";

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function Focus({ me }) {
  const nav = useNavigate();

  const [topic, setTopic] = useState("");
  const [taskLabel, setTaskLabel] = useState("");
  const [running, setRunning] = useState(false);

  const [seconds, setSeconds] = useState(0);
  const [sessionId, setSessionId] = useState(null);

  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const tRef = useRef(null);
  const startedAtRef = useRef(null);

  const mm = pad(Math.floor(seconds / 60));
  const ss = pad(seconds % 60);

  const premium = me?.plan === "PREMIUM" || me?.role === "OWNER";

  function startTick() {
    if (tRef.current) return;
    tRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }

  function stopTick() {
    if (tRef.current) clearInterval(tRef.current);
    tRef.current = null;
  }

  async function start() {
    try {
      setErr("");
      setMsg("");

      const usedTopic = topic.trim() || "Focus Session";
      const usedTask = taskLabel.trim() || "";

      const r = await focusApi.start(usedTopic, usedTask);
      setSessionId(r.id);
      setRunning(true);
      setSeconds(0);
      startedAtRef.current = Date.now();
      startTick();
    } catch (e) {
      setErr(e?.message || "Failed to start focus session");
    }
  }

  async function finish(completed = true) {
    try {
      setErr("");
      setMsg("");

      stopTick();

      const mins = Math.max(1, Math.round(seconds / 60));
      if (!sessionId) throw new Error("No session is running.");

      await focusApi.end(sessionId, mins, completed);

      setRunning(false);
      setSessionId(null);
      setSeconds(0);
      startedAtRef.current = null;

      setMsg(completed ? `Logged ${mins} minute(s).` : "Session cancelled.");
    } catch (e) {
      setErr(e?.message || "Failed to end focus session");
    }
  }

  // Prevent accidental tab close while running
  useEffect(() => {
    function handler(e) {
      if (!running) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [running]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => stopTick();
  }, []);

  const headerRight = useMemo(() => {
    return (
      <div className="flex items-center gap-2">
        {premium ? (
          <span className="text-xs px-2 py-1 rounded-full bg-amber-300/15 border border-amber-300/20 text-amber-200">
            PREMIUM
          </span>
        ) : (
          <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">
            MVP
          </span>
        )}
        <button
          className="text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
          onClick={() => nav("/")}
          disabled={running}
          title={running ? "Finish or cancel the session first" : "Back to Home"}
        >
          Back
        </button>
      </div>
    );
  }, [premium, nav, running]);

  return (
    <div className="space-y-6">
      {/* Top “locked in” overlay while running */}
      {running && (
        <div className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm">
          <div className="absolute inset-x-0 top-0 p-4">
            <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-sm text-slate-300">Focus Mode</div>
                <div className="text-base font-semibold truncate">
                  {topic.trim() || "Focus Session"}
                  {taskLabel.trim() ? <span className="text-slate-300 font-medium"> — {taskLabel.trim()}</span> : null}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-2xl font-semibold tabular-nums">
                  {mm}:{ss}
                </div>

                <button
                  className="rounded-xl px-4 py-2 bg-emerald-500/20 border border-emerald-400/20 hover:bg-emerald-500/30 transition text-emerald-100"
                  onClick={() => finish(true)}
                >
                  Finish
                </button>

                <button
                  className="rounded-xl px-4 py-2 bg-red-500/15 border border-red-400/20 hover:bg-red-500/25 transition text-red-100"
                  onClick={() => finish(false)}
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="mx-auto max-w-4xl mt-3 text-xs text-slate-300">
              Tip: keep this tab open. Leaving won’t break data, but you’ll lose the timer display.
            </div>
          </div>
        </div>
      )}

      <PremiumCard
        title="Focus Mode"
        subtitle="Run a timed session — logs study time automatically."
        right={headerRight}
      >
        {err && (
          <div className="mb-3 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
            {err}
          </div>
        )}
        {msg && (
          <div className="mb-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            {msg}
          </div>
        )}

        {!running ? (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
                placeholder="Topic (e.g. Algebra)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <input
                className="rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
                placeholder="Task label (optional)"
                value={taskLabel}
                onChange={(e) => setTaskLabel(e.target.value)}
              />
            </div>

            <button
              className="rounded-xl px-4 py-2 bg-indigo-500/90 hover:bg-indigo-500 transition font-medium"
              onClick={start}
            >
              Start session
            </button>

            <div className="text-xs text-slate-300">
              You can keep it simple: topic only. When you finish, it auto-logs to your stats.
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-300">
            Session running… (you should see the overlay). If not, refresh once.
          </div>
        )}
      </PremiumCard>
    </div>
  );
}
