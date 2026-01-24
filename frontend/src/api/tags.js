// frontend/src/api/tags.js
import { api } from "./client";

export async function getTags() {
  return api("/api/tags", { method: "GET" });
  // → [{ id, name, color, count }]
}

export async function createTag(payload) {
  // payload = { name: string, color: string (e.g. "#FF6B6B") }
  return api("/api/tags", {
    method: "POST",
    body: payload,
  });
}

export async function updateTag(tagId, payload) {
  // payload = { name?: string, color?: string }
  return api(`/api/tags/${tagId}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteTag(tagId) {
  return api(`/api/tags/${tagId}`, { method: "DELETE" });
}
