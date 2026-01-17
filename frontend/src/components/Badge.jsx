import React from "react";

export default function Badge({ tone = "slate", children }) {
  const cls =
    tone === "gold"
      ? "bg-amber-300/15 text-amber-200 border-amber-300/25"
      : "bg-white/5 text-slate-200 border-white/10";

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}
