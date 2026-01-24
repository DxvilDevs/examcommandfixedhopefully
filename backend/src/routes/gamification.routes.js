import express from "express";
import { z } from "zod";
import { pool } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

export const gamificationRoutes = express.Router();

// Helper: Calculate level from XP
function calculateLevel(xp) {
  return Math.floor(Math.sqrt(xp / 100));
}

// Helper: XP needed for next level
function xpForNextLevel(level) {
  return Math.pow(level + 1, 2) * 100;
}

// Helper: Update streak
async function updateStreak(userId) {
  const { rows } = await pool.query(
    `SELECT current_streak, longest_streak, last_activity_date 
     FROM user_gamification WHERE user_id = $1`,
    [userId]
  );

  if (!rows[0]) {
    await pool.query(
      `INSERT INTO user_gamification (user_id, current_streak, longest_streak, last_activity_date) 
       VALUES ($1, 1, 1, CURRENT_DATE)`,
      [userId]
    );
    return { streakIncreased: true, currentStreak: 1 };
  }

  const { current_streak, longest_streak, last_activity_date } = rows[0];
  const today = new Date().toISOString().split('T')[0];
  const lastActivity = last_activity_date ? last_activity_date.toISOString().split('T')[0] : null;

  if (lastActivity === today) {
    return { streakIncreased: false, currentStreak: current_streak };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak;
  if (lastActivity === yesterdayStr) {
    newStreak = current_streak + 1;
  } else {
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, longest_streak);

  await pool.query(
    `UPDATE user_gamification 
     SET current_streak = $1, longest_streak = $2, last_activity_date = CURRENT_DATE 
     WHERE user_id = $3`,
    [newStreak, newLongest, userId]
  );

  return { streakIncreased: true, currentStreak: newStreak };
}

// Helper: Award XP
async function awardXP(userId, amount, activityType, description) {
  await pool.query(
    `UPDATE user_gamification 
     SET total_xp = total_xp + $1, updated_at = NOW() 
     WHERE user_id = $2`,
    [amount, userId]
  );

  await pool.query(
    `INSERT INTO xp_activities (user_id, activity_type, xp_gained, description) 
     VALUES ($1, $2, $3, $4)`,
    [userId, activityType, amount, description]
  );

  const { rows } = await pool.query(
    `SELECT total_xp FROM user_gamification WHERE user_id = $1`,
    [userId]
  );

  return rows[0].total_xp;
}

// Helper: Check achievements
async function checkAchievements(userId) {
  const { rows: statsRows } = await pool.query(
    `SELECT * FROM user_gamification WHERE user_id = $1`,
    [userId]
  );
  const stats = statsRows[0];
  if (!stats) return [];

  const { rows: achievements } = await pool.query(
    `SELECT a.*, ua.id as unlocked_id 
     FROM achievements a 
     LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1`,
    [userId]
  );

  const newlyUnlocked = [];

  for (const ach of achievements) {
    if (ach.unlocked_id) continue;

    let shouldUnlock = false;

    switch (ach.key) {
      case 'first_steps':
        shouldUnlock = stats.tasks_completed >= 1;
        break;
      case 'week_warrior':
        shouldUnlock = stats.current_streak >= 7;
        break;
      case 'fortnight_focus':
        shouldUnlock = stats.current_streak >= 14;
        break;
      case 'marathon':
        shouldUnlock = stats.current_streak >= 30;
        break;
      case 'focus_master':
        shouldUnlock = stats.focus_sessions_completed >= 25;
        break;
      case 'focus_legend':
        shouldUnlock = stats.focus_sessions_completed >= 100;
        break;
      case 'night_owl':
        shouldUnlock = stats.total_study_hours >= 50;
        break;
      case 'scholar':
        shouldUnlock = stats.total_study_hours >= 100;
        break;
      case 'centurion':
        shouldUnlock = stats.tasks_completed >= 100;
        break;
      case 'taskmaster':
        shouldUnlock = stats.tasks_completed >= 500;
        break;
    }

    if (shouldUnlock) {
      await pool.query(
        `INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2)`,
        [userId, ach.id]
      );
      newlyUnlocked.push({
        id: ach.id,
        name: ach.name,
        description: ach.description,
        icon: ach.icon
      });
    }
  }

  return newlyUnlocked;
}

// GET /gamification/stats
gamificationRoutes.get("/stats", authRequired, async (req, res) => {
  const userId = req.user.id;

  let { rows } = await pool.query(
    `SELECT * FROM user_gamification WHERE user_id = $1`,
    [userId]
  );

  if (!rows[0]) {
    await pool.query(
      `INSERT INTO user_gamification (user_id) VALUES ($1)`,
      [userId]
    );
    rows = await pool.query(
      `SELECT * FROM user_gamification WHERE user_id = $1`,
      [userId]
    );
  }

  const stats = rows[0];
  const level = calculateLevel(stats.total_xp);
  const xpToNext = xpForNextLevel(level);

  const { rows: achievements } = await pool.query(
    `SELECT a.*, 
            CASE WHEN ua.id IS NOT NULL THEN true ELSE false END as unlocked,
            ua.unlocked_at
     FROM achievements a
     LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
     ORDER BY a.id`,
    [userId]
  );

  const achievementsWithProgress = achievements.map(ach => {
    const base = {
      id: ach.id,
      name: ach.name,
      icon: ach.icon,
      description: ach.description,
      unlocked: ach.unlocked
    };

    if (ach.unlocked) return base;

    let progress = 0;
    switch (ach.key) {
      case 'first_steps':
      case 'centurion':
      case 'taskmaster':
        progress = stats.tasks_completed;
        break;
      case 'week_warrior':
      case 'fortnight_focus':
      case 'marathon':
        progress = stats.current_streak;
        break;
      case 'focus_master':
      case 'focus_legend':
        progress = stats.focus_sessions_completed;
        break;
      case 'night_owl':
      case 'scholar':
        progress = Math.floor(stats.total_study_hours);
        break;
    }

    return { ...base, progress, target: ach.target_value };
  });

  res.json({
    currentStreak: stats.current_streak,
    longestStreak: stats.longest_streak,
    totalStudyHours: parseFloat(stats.total_study_hours),
    tasksCompleted: stats.tasks_completed,
    focusSessions: stats.focus_sessions_completed,
    level,
    xp: stats.total_xp,
    xpToNextLevel: xpToNext,
    achievements: achievementsWithProgress
  });
});

// POST /gamification/log-activity
const activitySchema = z.object({
  type: z.enum(['TASK', 'FOCUS', 'REVISION', 'STREAK_BONUS']),
  metadata: z.object({
    minutes: z.number().int().min(1).max(600).optional()
  }).optional()
});

gamificationRoutes.post("/log-activity", authRequired, async (req, res) => {
  const userId = req.user.id;
  const p = activitySchema.parse(req.body);

  let xpAmount = 0;
  let description = '';

  switch (p.type) {
    case 'TASK':
      xpAmount = 10;
      description = 'Completed a task';
      await pool.query(
        `UPDATE user_gamification SET tasks_completed = tasks_completed + 1 WHERE user_id = $1`,
        [userId]
      );
      break;

    case 'FOCUS':
      const minutes = p.metadata?.minutes || 25;
      xpAmount = Math.floor(minutes / 25) * 20;
      description = `Focus session: ${minutes}m`;
      await pool.query(
        `UPDATE user_gamification SET focus_sessions_completed = focus_sessions_completed + 1 WHERE user_id = $1`,
        [userId]
      );
      break;

    case 'REVISION':
      const revMinutes = p.metadata?.minutes || 30;
      xpAmount = Math.floor(revMinutes / 10) * 5;
      description = `Revision: ${revMinutes}m`;
      const hours = revMinutes / 60;
      await pool.query(
        `UPDATE user_gamification SET total_study_hours = total_study_hours + $1 WHERE user_id = $2`,
        [hours, userId]
      );
      break;

    case 'STREAK_BONUS':
      xpAmount = 50;
      description = 'Daily streak bonus';
      break;

    default:
      return res.status(400).json({ error: 'Invalid activity type' });
  }

  const { streakIncreased, currentStreak } = await updateStreak(userId);
  if (streakIncreased && p.type !== 'STREAK_BONUS') {
    await awardXP(userId, 50, 'STREAK_BONUS', 'Daily streak maintained');
    xpAmount += 50;
  }

  const newTotalXP = await awardXP(userId, xpAmount, p.type, description);
  const newLevel = calculateLevel(newTotalXP);
  const newAchievements = await checkAchievements(userId);

  res.json({
    xpGained: xpAmount,
    totalXP: newTotalXP,
    level: newLevel,
    achievementsUnlocked: newAchievements,
    streakUpdated: streakIncreased,
    currentStreak
  });
});
