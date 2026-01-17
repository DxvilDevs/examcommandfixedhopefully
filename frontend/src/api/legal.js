import { api } from "./client";

export const legalApi = {
  get: (key) => api(`/legal/${key}`),
  update: (key, body) => api(`/legal/${key}`, { method: "PUT", body })
};
