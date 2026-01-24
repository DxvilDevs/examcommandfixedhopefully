import React from "react";

export default function Badge({ tone = "slate", children }) {
  const cls =
    tone === "gold"
      ? "premium-badge"
      : "bg-white/5 text-slate-300 border-white/10";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${cls}`}
    >
      {children}
    </span>
  );
}
