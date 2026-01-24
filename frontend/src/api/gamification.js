// frontend/src/api/gamification.js
import { api } from "./client";

export async function getGamificationStats() {
  return api("/api/gamification/stats", { method: "GET" });
  // → { currentStreak, longestStreak, totalStudyHours, tasksCompleted, focusSessions, level, xp, xpToNextLevel, achievements[] }
}

export async function logActivity(activity) {
  // activity = { type: "TASK_COMPLETE" | "FOCUS_SESSION" | "REVISION" }
  const res = await api("/api/gamification/log-activity", {
    method: "POST",
    body: activity,
  });
  // → { xpGained, achievementsUnlocked[] }
  return res;
}
