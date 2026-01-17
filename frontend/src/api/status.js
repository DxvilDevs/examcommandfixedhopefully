import { api } from "./client";

export const statusApi = {
  list: () => api("/status", { method: "GET" })
};
