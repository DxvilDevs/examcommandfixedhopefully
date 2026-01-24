// frontend/src/api/settings.js
import { api } from "./client";

export async function getEmailSettings() {
  return api("/api/settings/email", { method: "GET" });
  // → { weeklyDigest, dailyReminders, achievementAlerts, overdueTasks, preferredTime }
}

export async function updateEmailSettings(payload) {
  // payload = partial object — only send changed fields
  return api("/api/settings/email", {
    method: "PUT",
    body: payload,
  });
}
