// src/api/plannerEnhanced.js
import { api } from "./client";

export const plannerEnhancedApi = {
  getSequence: (targetMinutes = 90) => 
    api(`/planner/sequence?minutes=${targetMinutes}`, { method: "GET" }),
  
  // Optional: mark a suggested block as started/completed
  startBlock: (blockId) => 
    api("/planner/block/start", { method: "POST", body: { blockId } }),
  
  completeBlock: (blockId, actualMinutes) => 
    api("/planner/block/complete", { 
      method: "POST", 
      body: { blockId, actualMinutes } 
    })
};
