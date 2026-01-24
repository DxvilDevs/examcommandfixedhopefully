import { api } from "./client";

export const focusApi = {
  start: (topic, task_label = "") =>
    api("/focus/start", {
      method: "POST",
      body: { topic, task_label }
    }),

  end: (id, minutes, completed = true) =>
    api("/focus/end", {
      method: "POST",
      body: { id, minutes, completed }
    })
};