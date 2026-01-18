import { api } from "./client";

export const statusApi = {
  list: () => api("/status", { method: "GET" }),

  // timeline
  history: (id) => api(`/status/${id}/history`, { method: "GET" }),

  // OWNER only
  create: (body) => api("/status", { method: "POST", body }),
  update: (id, body) => api(`/status/${id}`, { method: "PUT", body }),
  remove: (id) => api(`/status/${id}`, { method: "DELETE" })
};
