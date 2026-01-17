import { api } from "./client";

export const subscriptionApi = {
  setPlan: (plan) => api("/subscription/set", { method: "POST", body: { plan } })
};
