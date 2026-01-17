import { api } from "./client";

export const dashboardApi = {
  home: () => api("/dashboard/home"),
  addTask: (title, estimateMinutes = 25) => api("/dashboard/tasks", { method: "POST", body: { title, estimateMinutes } }),
  toggleTask: (id) => api(`/dashboard/tasks/${id}/toggle`, { method: "PUT" }),
  addExam: (label, examDate) => api("/dashboard/exams", { method: "POST", body: { label, examDate } }),
  adjustMomentum: (delta) => api("/dashboard/momentum/adjust", { method: "POST", body: { delta } })
};
