// src/api/exams.js
import { api } from "./client";

export const examsApi = {
  generateMock: (durationMinutes = 60, topicFilter = null) => 
    api("/exams/mock/generate", { 
      method: "POST", 
      body: { durationMinutes, topicFilter } 
    }),
  
  submitAnswer: (mockId, questionId, answer) => 
    api(`/exams/mock/${mockId}/answer`, { 
      method: "POST", 
      body: { questionId, answer } 
    }),
  
  finishMock: (mockId) => 
    api(`/exams/mock/${mockId}/finish`, { method: "POST" }),
  
  getHistory: () => api("/exams/mock/history", { method: "GET" })
};
