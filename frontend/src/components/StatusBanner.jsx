import React, { useEffect, useMemo, useState } from "react";
import { statusApi } from "../api/status";

function statusStyle(status) {
  switch (status) {
    case "INVESTIGATING":
      return { ring: "bg-yellow-400", glow: "bg-yellow-400/30", text: "Investigating an issue" };
    case "IDENTIFIED":
      return { ring: "bg-orange-400", glow: "bg-orange-400/30", text: "Issue identified" };
    case "MONITORING":
      return { ring: "bg-sky-400", glow: "bg-sky-400/30", text: "Monitoring a fix" };
    case "RESOLVED":
    default:
      return { ring: "bg-emerald-400", glow: "bg-emerald-400/30", text: "All systems operational" };
  }
}

function pulseClass(status) {
  switch (status) {
    case "INVESTIGATING":
      return "animate-[ping_0.8s_ease-in-out_infinite]";
    case "IDENTIFIED":
      return "animate-[ping_1.1s_ease-in-out_infinite]";
    case "MONITORING":
      return "animate-[ping_1.6s_ease-in-out_infinite]";
    case "RESOLVED":
    default:
      return "animate-[ping_2.4s_ease-in-out_infinite]";
  }
}

export default function StatusBanner() {
  const [issues, setIssues] = useState([]);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await statusApi.list();
        setIssues(Array.isArray(r) ? r : []);
      } catch {
        // If status API fails, don't block the app—just hide banner.
        setHidden(true);
      }
    })();
  }, []);

  const overall = useMemo(() => {
    if (!issues.length) return "RESOLVED";
    if (issues.some((x) => x.status === "INVESTIGATING")) return "INVESTIGATING";
    if (issues.some((x) => x.status === "IDENTIFIED")) return "IDENTIFIED";
    if (issues.some((x) => x.status === "MONITORING")) return "MONITORING";
    return "RESOLVED";
  }, [issues]);

  const s = statusStyle(overall);
  if (hidden) return null;

  // If everything is resolved and no issues exist, keep it subtle.
  const show =
    overall !== "RESOLVED" || issues.length > 0;

  if (!show) return null;

  return (
    <div className="border-b border-white/10 bg-white/5 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="relative inline-flex h-3 w-3">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseClass(overall)} ${s.glow}`} />
            <span className={`relative inline-flex h-3 w-3 rounded-full ${s.ring}`} />
          </span>

          <div className="text-sm text-slate-200">
            <span className="font-medium">{s.text}</span>
            {issues.length > 0 && (
              <span className="text-slate-400"> • {issues.length} incident{issues.length === 1 ? "" : "s"}</span>
            )}
          </div>
        </div>

        <a
          href="#/status"
          className="text-sm text-slate-300 hover:text-slate-100 transition"
        >
          View status
        </a>
      </div>
    </div>
  );
}
