import { api } from "./client";

export const statsApi = {
  get: () => api("/stats", { method: "GET" }),
  addRevision: (topic, minutes, confidence) =>
    api("/stats/revision", { method: "POST", body: { topic, minutes, confidence } })
};
