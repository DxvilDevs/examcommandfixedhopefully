// src/api/resources.js
import { api } from "./client";

export const resourcesApi = {
  list: () => api("/resources", { method: "GET" }),
  
  create: (data) => api("/resources", { 
    method: "POST", 
    body: JSON.stringify(data) // { title, url, description, tags: [] }
  }),
  
  update: (id, data) => api(`/resources/${id}`, { 
    method: "PUT", 
    body: JSON.stringify(data) 
  }),
  
  delete: (id) => api(`/resources/${id}`, { method: "DELETE" }),
  
  // Optional: search/filter by tag
  search: (query) => api(`/resources/search?q=${encodeURIComponent(query)}`, { method: "GET" })
};
