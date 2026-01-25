// src/api/topics.js
import { api } from "./client";

export const topicsApi = {
  getMastery: () => api("/topics/mastery", { method: "GET" }),
  
  // Optional: get details for one topic
  getTopicDetails: (topicId) => api(`/topics/${topicId}`, { method: "GET" })
};
