GET  /api/gamification/stats
     → { currentStreak, longestStreak, totalStudyHours, tasksCompleted, 
         focusSessions, level, xp, xpToNextLevel, achievements[] }

POST /api/gamification/log-activity
     body: { type: "TASK_COMPLETE" | "FOCUS_SESSION" | "REVISION" }
     → { xpGained, achievementsUnlocked[] }
