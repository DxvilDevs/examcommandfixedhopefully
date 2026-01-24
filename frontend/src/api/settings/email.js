GET /api/settings/email
    → { weeklyDigest, dailyReminders, achievementAlerts, 
        overdueTasks, preferredTime }

PUT /api/settings/email
    body: { weeklyDigest?, dailyReminders?, ... }
