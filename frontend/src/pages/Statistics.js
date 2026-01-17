import React from "react";
import PremiumGate from "../components/PremiumGate";

export default function Statistics({ me }) {
  return (
    <PremiumGate me={me}>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-lg font-semibold">Statistics</div>
        <p className="text-sm text-slate-300 mt-2">
          Placeholder UI (build-safe). Next step: add forgetting curve chart + topics pie + revision logging.
        </p>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-4">
            <div className="font-medium">Forgetting Curve</div>
            <div className="text-sm text-slate-300 mt-1">Chart placeholder</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-4">
            <div className="font-medium">Revised Topics</div>
            <div className="text-sm text-slate-300 mt-1">Pie placeholder</div>
          </div>
        </div>
      </div>
    </PremiumGate>
  );
}
