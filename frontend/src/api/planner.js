// frontend/src/api/planner.js
import { api } from "./client";

export async function generateDailyPlan(payload) {
  // payload = { targetMinutes: number,  e.g. 90 }
  return api("/api/planner/generate", {
    method: "POST",
    body: payload,
  });
  // → { blocks: [{ topic, minutes, priority, reason, retention }], suggestions[] }
}

export async function completePlannerBlock(payload) {
  // payload = { blockId: string, completed: boolean }
  return api("/api/planner/complete-block", {
    method: "POST",
    body: payload,
  });
}
