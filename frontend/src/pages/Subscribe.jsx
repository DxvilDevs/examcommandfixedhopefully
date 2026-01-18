import React, { useState } from "react";
import { subscriptionApi } from "../api/subscription";

export default function Subscribe({ me, onUpdated }) {
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="text-lg font-semibold">Subscribe</div>
      <p className="text-sm text-slate-300 mt-1">🔓 Subscribe now and unlock additional statistics to aid your exams!</p>

      {msg && <div className="mt-4 text-sm text-green-200">{msg}</div>}
      {err && <div className="mt-4 text-sm text-red-200">{err}</div>}

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-5">
          <div className="font-semibold">Free</div>
          <div className="text-sm text-slate-300 mt-1">£0</div>
          <button
            className="mt-4 w-full rounded-xl px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition font-medium"
            onClick={async () => {
              try {
                setErr(""); setMsg("");
                const u = await subscriptionApi.setPlan("FREE");
                onUpdated?.(u);
                setMsg("Plan updated to Free.");
              } catch (e) { setErr(e.message); }
            }}
            disabled={me?.plan === "FREE"}
          >
            {me?.plan === "FREE" ? "Current plan" : "Switch to Free"}
          </button>
        </div>

        <div className="rounded-2xl border border-amber-300/25 bg-amber-300/5 p-5">
          <div className="font-semibold">Premium</div>
          <div className="text-sm text-slate-300 mt-1">£3</div>
          <ul className="text-sm text-slate-300 mt-3 list-disc pl-5 space-y-1">
            <li>Statistics page unlocked</li>
            <li>Forgetting curve + insights (next)</li>
          </ul>
          <button
            className="mt-4 w-full rounded-xl px-3 py-2 bg-indigo-500/90 hover:bg-indigo-500 transition font-medium"
            onClick={async () => {
              try {
                setErr(""); setMsg("");
                const u = await subscriptionApi.setPlan("PREMIUM");
                onUpdated?.(u);
                setMsg("Plan updated to Premium.");
              } catch (e) { setErr(e.message); }
            }}
            disabled={me?.plan === "PREMIUM"}
          >
            {me?.plan === "PREMIUM" ? "Current plan" : "Upgrade to Premium"}
          </button>
        </div>
      </div>
    </div>
  );
}
