import React from "react";
import { clearToken } from "../api/client";
import Badge from "./Badge";
import AlertsBell from "./Alerts/AlertsBell";

export default function Topbar({ me, onMe }) {
  const premium = me.plan === "PREMIUM" || me.role === "OWNER";

  return (
    <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <div className={`text-xl font-semibold tracking-tight ${premium ? "text-amber-300" : "text-slate-100"}`}>
            Exam Command Centre
          </div>
          <div className="text-sm text-slate-300">
            Welcome, <span className="font-medium text-slate-100">{me.preferred_name}</span>
            <span className="ml-2 align-middle">
              <Badge tone={premium ? "gold" : "slate"}>{premium ? "PREMIUM" : "FREE"}</Badge>
            </span>
          </div>
        </div>

        <button
          onClick={() => { clearToken(); onMe(null); }}
          className="rounded-xl px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 transition text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
