import { api } from "./client";
export const planApi = {
  today: (minutes = 90) => api(`/plan/today?minutes=${minutes}`, { method: "GET" })
};
