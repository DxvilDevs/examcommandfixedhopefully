import React, { useEffect, useState } from "react";
import PremiumCard from "../PremiumCard";
import { planApi } from "../../api/plan";

export default function TodaysPlanCard({ me }) {
  const [plan, setPlan] = useState(null);
  const [err, setErr] = useState("");

  const premium = me?.plan === "PREMIUM" || me?.role === "OWNER";

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const r = await planApi.today(90);
        setPlan(r);
      } catch (e) {
        setErr(e.message || "Failed to load plan");
      }
    })();
  }, []);

  return (
    <PremiumCard
      title={premium ? "Today’s Revision Plan" : "Today’s Plan (Preview)"}
      subtitle={premium ? "Auto-generated from your data" : "Upgrade later to auto-generate"}
      right={<div className="text-xs text-amber-200">{premium ? "PREMIUM" : "LOCKED"}</div>}
    >
      {err && <div className="text-sm text-red-200">{err}</div>}

      {!plan?.blocks?.length ? (
        <div className="text-sm text-slate-300">Log a few revisions to generate a plan.</div>
      ) : (
        <div className={premium ? "" : "blur-sm select-none pointer-events-none"}>
          <div className="space-y-2">
            {plan.blocks.map((b, idx) => (
              <div key={idx} className="rounded-xl border border-white/10 bg-slate-900/30 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{b.topic}</div>
                  <div className="text-xs text-slate-300">{b.minutes}m</div>
                </div>
                <div className="text-xs text-slate-400 mt-1">{b.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!premium && (
        <div className="mt-3 text-xs text-slate-300">
          Premium will unlock auto-plans, urgency sorting, and plan explanations.
        </div>
      )}
    </PremiumCard>
  );
}
