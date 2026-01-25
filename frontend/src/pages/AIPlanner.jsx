import React, { useEffect, useState } from "react";
import PremiumCard from "../components/PremiumCard";
import PremiumGate from "../components/PremiumGate";
import { plannerEnhancedApi } from "../api/plannerEnhanced";

export default function AIPlanner({ me }) {
  const [sequence, setSequence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const premium = me?.plan === "PREMIUM" || me?.role === "OWNER";

  useEffect(() => {
    if (!premium) return;
    (async () => {
      try {
        setLoading(true);
        const data = await plannerEnhancedApi.getSequence(90);
        setSequence(data);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [premium]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">AI Study Session Planner</h1>
        <p className="text-slate-400 mt-1">
          Personalized sequence based on your weak areas and deadlines
        </p>
      </div>

      <PremiumGate me={me}>
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading your plan...</div>
        ) : err ? (
          <div className="text-red-400 text-center py-8">{err}</div>
        ) : sequence ? (
          <PremiumCard title="Your 90-Minute AI-Optimized Session" subtitle="Adaptive & prioritized">
            <div className="space-y-4">
              {sequence.blocks?.map((block, i) => (
                <div 
                  key={i} 
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 smooth-transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-white">{block.topic}</h4>
                      <p className="text-sm text-slate-400">{block.minutes} min • {block.priority}</p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
                      {block.reason}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center text-sm text-slate-400">
              Total: {sequence.totalMinutes} minutes • Generated {new Date(sequence.generated).toLocaleTimeString()}
            </div>
          </PremiumCard>
        ) : (
          <div className="text-center py-12 text-slate-400">
            No data yet — start a focus session to improve recommendations!
          </div>
        )}

        {!premium && (
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-amber-400/20 text-center">
            <p className="text-amber-300 font-medium">Premium unlocks AI-powered adaptive sequencing</p>
          </div>
        )}
      </PremiumGate>
    </div>
  );
}
