import { api } from "./client";

export const userApi = {
  me: () => api("/user/me"),
  updateMe: (body) => api("/user/me", { method: "PUT", body }),
  changePassword: (body) => api("/user/me/password", { method: "PUT", body })
};
