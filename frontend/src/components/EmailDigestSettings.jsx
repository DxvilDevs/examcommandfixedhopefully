import React, { useState, useEffect } from "react";

// Mock API
const emailApi = {
  async getSettings() {
    return {
      weeklyDigest: true,
      dailyReminders: false,
      achievementAlerts: true,
      overdueTasks: true,
      preferredTime: "09:00"
    };
  },
  
  async updateSettings(settings) {
    console.log("Updating email settings:", settings);
    return settings;
  }
};

export default function EmailDigestSettings() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    emailApi.getSettings().then(setSettings);
  }, []);

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      await emailApi.updateSettings(settings);
      setMsg("Email preferences saved!");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) return null;

  return (
    <div className="glass-card p-6 shadow-xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Email Notifications</h2>
        <p className="text-sm text-slate-400 mt-1">
          Stay on track with personalized email updates
        </p>
      </div>

      {msg && (
        <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          {msg}
        </div>
      )}

      <div className="space-y-6">
        {/* Weekly Digest */}
        <div className="flex items-start gap-4 p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="text-3xl">📊</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-white">Weekly Digest</div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.weeklyDigest}
                  onChange={(e) => setSettings({ ...settings, weeklyDigest: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>
            <p className="text-sm text-slate-400">
              Get a comprehensive weekly report every Sunday with your study stats, achievements, and upcoming tasks
            </p>
          </div>
        </div>

        {/* Daily Reminders */}
        <div className="flex items-start gap-4 p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="text-3xl">⏰</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-white">Daily Study Reminder</div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.dailyReminders}
                  onChange={(e) => setSettings({ ...settings, dailyReminders: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>
            <p className="text-sm text-slate-400 mb-3">
              Daily reminder to complete your study plan
            </p>
            
            {settings.dailyReminders && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Preferred time:</label>
                <input
                  type="time"
                  className="glass-input w-32 text-sm"
                  value={settings.preferredTime}
                  onChange={(e) => setSettings({ ...settings, preferredTime: e.target.value })}
                />
              </div>
            )}
          </div>
        </div>

        {/* Achievement Alerts */}
        <div className="flex items-start gap-4 p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="text-3xl">🏆</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-white">Achievement Unlocked</div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.achievementAlerts}
                  onChange={(e) => setSettings({ ...settings, achievementAlerts: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>
            <p className="text-sm text-slate-400">
              Get notified when you unlock new achievements and milestones
            </p>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="flex items-start gap-4 p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="text-3xl">🔔</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-white">Overdue Reminders</div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.overdueTasks}
                  onChange={(e) => setSettings({ ...settings, overdueTasks: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>
            <p className="text-sm text-slate-400">
              Get alerts when topics need urgent review based on forgetting curve
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="btn-primary w-full mt-6"
      >
        {saving ? "Saving..." : "Save Preferences"}
      </button>

      {/* Preview Section */}
      <div className="mt-8 p-6 rounded-2xl border border-indigo-400/20 bg-indigo-500/5">
        <div className="text-sm font-medium text-white mb-2 flex items-center gap-2">
          <span>📧</span>
          <span>Weekly Digest Preview</span>
        </div>
        <div className="text-xs text-slate-400 space-y-1">
          <p>• Your study stats: 8.5 hours, 23 tasks completed</p>
          <p>• Achievements unlocked: Week Warrior 🔥</p>
          <p>• Topics needing review: 3 overdue</p>
          <p>• Next exam: Physics Paper 2 in 6 days</p>
        </div>
      </div>
    </div>
  );
}
