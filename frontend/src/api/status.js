// frontend/src/api/status.js
import { api } from "./client";

export const statusApi = {
  list: () => api("/status", { method: "GET" }),

  // OWNER only
  create: (body) => api("/status", { method: "POST", body }),
  update: (id, body) => api(`/status/${id}`, { method: "PUT", body })
};
