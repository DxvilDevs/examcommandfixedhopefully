import React, { useEffect, useState } from "react";
import PremiumGate from "../components/PremiumGate";
import PremiumCard from "../components/PremiumCard";
import { topicsApi } from "../api/topics";

function getHeatColor(mastery) {
  if (mastery >= 0.9) return "bg-emerald-500/30 border-emerald-400/40 text-emerald-300";
  if (mastery >= 0.7) return "bg-green-500/20 border-green-400/30 text-green-300";
  if (mastery >= 0.4) return "bg-amber-500/20 border-amber-400/30 text-amber-300";
  return "bg-red-500/20 border-red-400/30 text-red-300";
}

export default function Topics({ me }) {
  const [masteryData, setMasteryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await topicsApi.getMastery();
        setMasteryData(data || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Topic Mastery Heatmap</h1>
        <p className="text-slate-400 mt-1">
          Visual overview of your strongest and weakest areas
        </p>
      </div>

      <PremiumGate me={me}>
        <PremiumCard title="Your Topic Mastery" subtitle="Color-coded by confidence level">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading mastery data...</div>
          ) : masteryData.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No topic data yet — start revising to see your heatmap!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {masteryData.map((topic) => (
                <div 
                  key={topic.id || topic.name}
                  className={`p-4 rounded-xl border text-center smooth-transition hover:scale-105 ${getHeatColor(topic.mastery)}`}
                >
                  <div className="text-lg font-medium text-white">{topic.name}</div>
                  <div className="text-2xl mt-2">
                    {Math.round(topic.mastery * 100)}%
                  </div>
                  <div className="text-xs mt-1 text-slate-300">
                    {topic.cardsDue || 0} due • {topic.revisions || 0} revisions
                  </div>
                </div>
              ))}
            </div>
          )}
        </PremiumCard>
      </PremiumGate>
    </div>
  );
}
