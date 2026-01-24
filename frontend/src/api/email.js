// ============================================
// email.js
// ============================================
export const emailApi = {
  async getSettings() {
    return api("/email/settings");
  },

  async updateSettings(settings) {
    return api("/email/settings", {
      method: "PUT",
      body: JSON.stringify(settings)
    });
  }
};
