import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { focusApi } from "../api/focus";

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function Focus({ me }) {
  const nav = useNavigate();
  const [topic, setTopic] = useState("");
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const timerRef = useRef(null);

  function startTimer() {
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  }

  function stopTimer() {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }

  async function start() {
    const r = await focusApi.start(topic || "Focus Session", "");
    setSessionId(r.id);
    setRunning(true);
    setSeconds(0);
    startTimer();
  }

  async function end(done = true) {
    stopTimer();
    const mins = Math.max(1, Math.round(seconds / 60));
    await focusApi.end(sessionId, mins, done);
    setRunning(false);
    setSessionId(null);
    setSeconds(0);
  }

  useEffect(() => () => stopTimer(), []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold">Focus Mode</div>
          <button
            onClick={() => nav("/")}
            disabled={running}
            className="text-xs px-3 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
          >
            Back
          </button>
        </div>

        {!running ? (
          <>
            <input
              className="w-full rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 mb-4 outline-none"
              placeholder="Topic (optional)"
              value={topic}
              onChange={e => setTopic(e.target.value)}
            />
            <button
              onClick={start}
              className="w-full rounded-xl px-4 py-2 bg-indigo-500 hover:bg-indigo-600 transition font-medium"
            >
              Start Focus
            </button>
          </>
        ) : (
          <>
            <div className="text-center text-4xl font-mono mb-6">
              {pad(Math.floor(seconds / 60))}:{pad(seconds % 60)}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => end(true)}
                className="flex-1 rounded-xl px-4 py-2 bg-emerald-500/20 border border-emerald-400/30"
              >
                Finish
              </button>
              <button
                onClick={() => end(false)}
                className="flex-1 rounded-xl px-4 py-2 bg-red-500/20 border border-red-400/30"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
