import React from "react";
import { clearToken } from "../api/client";
import Badge from "./Badge";
import AlertsBell from "./Alerts/AlertsBell";

export default function Topbar({ me, onLogout }) {
  const premium = me.plan === "PREMIUM" || me.role === "OWNER";

  return (
    <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0a0a1f]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1
            className={`text-xl font-bold tracking-tight ${
              premium
                ? "gold-gradient bg-clip-text text-transparent"
                : "text-white"
            }`}
          >
            Exam Command Centre
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-300">
            <span>Welcome,</span>
            <span className="font-semibold text-white">{me.preferred_name}</span>
            {premium && (
              <span className="premium-badge">Premium</span>
            )}
            {!premium && (
              <Badge tone="slate">Free</Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <AlertsBell />
          <button
            onClick={() => {
              clearToken();
              onLogout();
            }}
            className="btn-secondary text-sm px-4 py-2"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
