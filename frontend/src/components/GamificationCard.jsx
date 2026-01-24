import React, { useEffect, useState } from "react";

// Mock API - replace with your actual API calls
const gamificationApi = {
  async getStats() {
    // This would call your backend
    return {
      currentStreak: 7,
      longestStreak: 12,
      totalStudyHours: 47.5,
      tasksCompleted: 89,
      focusSessions: 34,
      level: 8,
      xp: 2340,
      xpToNextLevel: 3000,
      achievements: [
        { id: 1, name: "First Steps", icon: "🎯", description: "Complete your first task", unlocked: true },
        { id: 2, name: "Week Warrior", icon: "🔥", description: "Maintain a 7-day streak", unlocked: true },
        { id: 3, name: "Focus Master", icon: "⏱️", description: "Complete 25 focus sessions", unlocked: true },
        { id: 4, name: "Night Owl", icon: "🦉", description: "Study 50 hours total", unlocked: false, progress: 47.5, target: 50 },
        { id: 5, name: "Centurion", icon: "💯", description: "Complete 100 tasks", unlocked: false, progress: 89, target: 100 },
        { id: 6, name: "Fortnight Focus", icon: "⚡", description: "Maintain a 14-day streak", unlocked: false, progress: 7, target: 14 },
      ]
    };
  }
};

export default function GamificationCard() {
  const [stats, setStats] = useState(null);
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    gamificationApi.getStats().then(setStats);
  }, []);

  if (!stats) return null;

  const xpProgress = (stats.xp / stats.xpToNextLevel) * 100;
  const unlockedCount = stats.achievements.filter(a => a.unlocked).length;

  return (
    <>
      {/* Main Stats Card */}
      <div className="glass-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Your Progress</h2>
            <p className="text-sm text-slate-400 mt-1">Level {stats.level} • {stats.xp} XP</p>
          </div>
          <button
            onClick={() => setShowAchievements(true)}
            className="btn-secondary text-sm px-4 py-2"
          >
            🏆 Achievements
          </button>
        </div>

        {/* XP Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">Level {stats.level}</span>
            <span className="text-sm text-slate-400">{stats.xp} / {stats.xpToNextLevel} XP</span>
          </div>
          <div className="h-3 rounded-full bg-white/5 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 smooth-transition rounded-full"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Streak */}
          <div className="relative rounded-2xl p-4 overflow-hidden border border-orange-400/20">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-400/5" />
            <div className="relative">
              <div className="text-3xl mb-1">🔥</div>
              <div className="text-2xl font-bold text-white">{stats.currentStreak}</div>
              <div className="text-xs text-slate-400">Day Streak</div>
            </div>
          </div>

          {/* Study Hours */}
          <div className="relative rounded-2xl p-4 overflow-hidden border border-blue-400/20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-cyan-400/5" />
            <div className="relative">
              <div className="text-3xl mb-1">📚</div>
              <div className="text-2xl font-bold text-white">{stats.totalStudyHours}</div>
              <div className="text-xs text-slate-400">Study Hours</div>
            </div>
          </div>

          {/* Tasks */}
          <div className="relative rounded-2xl p-4 overflow-hidden border border-emerald-400/20">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-green-400/5" />
            <div className="relative">
              <div className="text-3xl mb-1">✓</div>
              <div className="text-2xl font-bold text-white">{stats.tasksCompleted}</div>
              <div className="text-xs text-slate-400">Tasks Done</div>
            </div>
          </div>

          {/* Focus Sessions */}
          <div className="relative rounded-2xl p-4 overflow-hidden border border-purple-400/20">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/5" />
            <div className="relative">
              <div className="text-3xl mb-1">⏱️</div>
              <div className="text-2xl font-bold text-white">{stats.focusSessions}</div>
              <div className="text-xs text-slate-400">Focus Sessions</div>
            </div>
          </div>
        </div>

        {/* Quick Achievement Preview */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-300">Achievements Unlocked</span>
            <span className="text-sm font-semibold text-white">{unlockedCount} / {stats.achievements.length}</span>
          </div>
          <div className="flex gap-2">
            {stats.achievements.slice(0, 5).map(a => (
              <div
                key={a.id}
                className={`text-3xl ${!a.unlocked && 'grayscale opacity-30'}`}
                title={a.name}
              >
                {a.icon}
              </div>
            ))}
            {stats.achievements.length > 5 && (
              <button
                onClick={() => setShowAchievements(true)}
                className="text-sm text-slate-400 hover:text-white smooth-transition"
              >
                +{stats.achievements.length - 5} more
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Achievements Modal */}
      {showAchievements && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setShowAchievements(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="glass-card p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold gold-gradient bg-clip-text text-transparent">
                  🏆 Achievements
                </h2>
                <button
                  onClick={() => setShowAchievements(false)}
                  className="btn-secondary text-sm"
                >
                  Close
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {stats.achievements.map(a => (
                  <div
                    key={a.id}
                    className={`rounded-2xl p-5 border smooth-transition ${
                      a.unlocked
                        ? 'border-amber-300/30 bg-gradient-to-br from-amber-300/10 to-yellow-400/5'
                        : 'border-white/10 bg-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`text-4xl ${!a.unlocked && 'grayscale'}`}>
                        {a.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white mb-1">{a.name}</div>
                        <div className="text-sm text-slate-400 mb-2">{a.description}</div>
                        
                        {!a.unlocked && a.progress !== undefined && (
                          <div>
                            <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-1">
                              <div
                                className="h-full bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full smooth-transition"
                                style={{ width: `${(a.progress / a.target) * 100}%` }}
                              />
                            </div>
                            <div className="text-xs text-slate-500">
                              {a.progress} / {a.target}
                            </div>
                          </div>
                        )}
                        
                        {a.unlocked && (
                          <div className="text-xs text-amber-400 font-medium">✓ Unlocked</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
