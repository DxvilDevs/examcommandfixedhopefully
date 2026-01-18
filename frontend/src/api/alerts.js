import { api } from "./client";
export const alertsApi = {
  list: () => api("/alerts", { method: "GET" }),
  refresh: () => api("/alerts/refresh", { method: "POST" }),
  markRead: () => api("/alerts/mark-read", { method: "POST" })
};
