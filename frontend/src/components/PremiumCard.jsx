import React from "react";

export default function PremiumCard({ title, subtitle, children, right }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-300/20 bg-white/5 p-5">
      {/* gold gradient wash */}
      <div className="pointer-events-none absolute inset-0 opacity-40 bg-gradient-to-br from-amber-300/20 via-transparent to-indigo-500/10" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-slate-300">{title}</div>
            {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
          </div>
          {right}
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
