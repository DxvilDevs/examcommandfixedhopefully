// ============================================
// gamification.js
// ============================================
import { api } from "./client";

export const gamificationApi = {
  async getStats() {
    return api("/gamification/stats");
  },

  async logActivity(type, metadata = {}) {
    return api("/gamification/log-activity", {
      method: "POST",
      body: { type, metadata }
    });
  }
};
