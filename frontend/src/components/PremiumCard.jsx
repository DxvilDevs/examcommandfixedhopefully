import React from "react";

export default function PremiumCard({ title, subtitle, children, right }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-300/20 glass-card shadow-xl">
      {/* Animated gold gradient wash */}
      <div className="pointer-events-none absolute inset-0 opacity-30 bg-gradient-to-br from-amber-300/20 via-transparent to-purple-500/10 animated-gradient" />
      
      {/* Subtle glow effect */}
      <div className="pointer-events-none absolute -inset-40 opacity-20">
        <div className="absolute top-0 right-0 w-60 h-60 bg-amber-300 rounded-full blur-3xl" />
      </div>
      
      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {subtitle && (
              <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
            )}
          </div>
          {right}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
