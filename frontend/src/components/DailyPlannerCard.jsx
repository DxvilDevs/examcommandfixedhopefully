import React, { useEffect, useState } from "react";
import PremiumCard from "./PremiumCard";

// Mock API - replace with your actual backend
const plannerApi = {
  async generatePlan(targetMinutes = 90) {
    // This would call your AI/algorithm on the backend
    return {
      generated: new Date().toISOString(),
      totalMinutes: targetMinutes,
      blocks: [
        {
          topic: "Algebra - Quadratic Equations",
          minutes: 30,
          priority: "HIGH",
          reason: "Retention at 45% - needs urgent review",
          retention: 0.45,
          daysOverdue: 3
        },
        {
          topic: "Chemistry - Organic Reactions",
          minutes: 25,
          priority: "MEDIUM",
          reason: "Scheduled for review today",
          retention: 0.68,
          daysOverdue: 0
        },
        {
          topic: "Physics - Thermodynamics",
          minutes: 35,
          priority: "MEDIUM",
          reason: "Building momentum - last studied 2 days ago",
          retention: 0.72,
          daysOverdue: 0
        }
      ],
      suggestions: [
        "Start with Algebra while your mind is fresh",
        "Take a 5-minute break between topics",
        "Consider a 25-min focus session for Chemistry"
      ]
    };
  }
};

export default function DailyPlannerCard({ me }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [targetMinutes, setTargetMinutes] = useState(90);
  const [completedBlocks, setCompletedBlocks] = useState([]);

  const premium = me?.plan === "PREMIUM" || me?.role === "OWNER";

  async function generate() {
    setLoading(true);
    try {
      const newPlan = await plannerApi.generatePlan(targetMinutes);
      setPlan(newPlan);
      setCompletedBlocks([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (premium) generate();
  }, [premium]);

  function toggleBlock(index) {
    setCompletedBlocks(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  }

  const completedMinutes = plan?.blocks
    .filter((_, i) => completedBlocks.includes(i))
    .reduce((sum, b) => sum + b.minutes, 0) || 0;

  const progressPercent = plan ? (completedMinutes / plan.totalMinutes) * 100 : 0;

  return (
    <PremiumCard
      title="📅 Today's Study Plan"
      subtitle={premium ? "AI-generated based on your data" : "Upgrade to unlock"}
      right={premium && <span className="premium-badge">Premium</span>}
    >
      {!premium ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🤖</div>
          <p className="text-slate-400 mb-4">
            Let AI create your personalized daily study plan based on forgetting curves and exam dates
          </p>
          <a href="#/subscribe" className="btn-primary inline-block">
            Upgrade to Premium
          </a>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="flex items-center gap-3 mb-4">
            <select
              className="glass-input flex-1"
              value={targetMinutes}
              onChange={(e) => setTargetMinutes(Number(e.target.value))}
            >
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>2 hours</option>
              <option value={180}>3 hours</option>
            </select>
            <button
              onClick={generate}
              disabled={loading}
              className="btn-primary px-6"
            >
              {loading ? "Generating..." : "🔄 Regenerate"}
            </button>
          </div>

          {plan && (
            <>
              {/* Progress Bar */}
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/5 border border-indigo-400/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">Today's Progress</span>
                  <span className="text-sm text-slate-400">
                    {completedMinutes} / {plan.totalMinutes} min
                  </span>
                </div>
                <div className="h-3 rounded-full bg-white/5 overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500 smooth-transition rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Study Blocks */}
              <div className="space-y-3 mb-6">
                {plan.blocks.map((block, index) => {
                  const isCompleted = completedBlocks.includes(index);
                  const priorityColor = {
                    HIGH: "border-red-400/30 bg-red-500/5",
                    MEDIUM: "border-amber-400/30 bg-amber-500/5",
                    LOW: "border-blue-400/30 bg-blue-500/5"
                  }[block.priority];

                  return (
                    <button
                      key={index}
                      onClick={() => toggleBlock(index)}
                      className={`w-full text-left rounded-2xl border p-4 smooth-transition hover:scale-[1.02] ${
                        isCompleted
                          ? "border-emerald-400/30 bg-emerald-500/10"
                          : priorityColor
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center smooth-transition mt-0.5 flex-shrink-0 ${
                            isCompleted
                              ? "bg-emerald-500 border-emerald-500"
                              : "border-white/30"
                          }`}
                        >
                          {isCompleted && (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className={`font-semibold text-white ${isCompleted && 'line-through opacity-60'}`}>
                              {block.topic}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs px-2 py-1 rounded-lg bg-white/10 text-white font-medium">
                                {block.minutes}m
                              </span>
                              {block.priority === "HIGH" && (
                                <span className="text-xs px-2 py-1 rounded-lg bg-red-400/20 text-red-200">
                                  Urgent
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-sm text-slate-400 mb-2">
                            {block.reason}
                          </div>

                          {block.retention && (
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full smooth-transition ${
                                    block.retention < 0.5
                                      ? "bg-red-400"
                                      : block.retention < 0.7
                                      ? "bg-amber-400"
                                      : "bg-emerald-400"
                                  }`}
                                  style={{ width: `${block.retention * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-500">
                                {Math.round(block.retention * 100)}% retention
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* AI Suggestions */}
              {plan.suggestions?.length > 0 && (
                <div className="rounded-2xl border border-indigo-400/20 bg-indigo-500/5 p-4">
                  <div className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <span>💡</span>
                    <span>AI Suggestions</span>
                  </div>
                  <ul className="space-y-1">
                    {plan.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {completedBlocks.length === plan.blocks.length && (
                <div className="mt-4 text-center p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-green-500/10 border border-emerald-400/30">
                  <div className="text-2xl mb-2">🎉</div>
                  <div className="font-semibold text-white">Plan Completed!</div>
                  <div className="text-sm text-slate-300 mt-1">
                    Great work today. Your consistency is building momentum!
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </PremiumCard>
  );
}
