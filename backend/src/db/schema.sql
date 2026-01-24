CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  account_name TEXT NOT NULL DEFAULT 'Account',
  preferred_name TEXT NOT NULL DEFAULT 'Student',
  role TEXT NOT NULL DEFAULT 'USER',          -- USER | OWNER
  plan TEXT NOT NULL DEFAULT 'FREE',          -- FREE | PREMIUM
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  estimate_minutes INT NOT NULL DEFAULT 25,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  exam_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS revisions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  minutes INT NOT NULL DEFAULT 30,
  revised_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'POMODORO',       -- POMODORO | DEEP
  minutes INT NOT NULL,
  started_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS momentum (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  score INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS issues (
  id SERIAL PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'INVESTIGATING',  -- INVESTIGATING | IDENTIFIED | MONITORING | RESOLVED
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS issue_events (
  id SERIAL PRIMARY KEY,
  issue_id INT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- CREATED | UPDATED | DELETED
  status TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS legal_docs (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,    -- TOS | PRIVACY
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO legal_docs (key, title, content)
VALUES
  ('TOS', 'Terms of Service', 'Add your Terms of Service here.'),
  ('PRIVACY', 'Privacy Policy', 'Add your Privacy Policy here.')
ON CONFLICT (key) DO NOTHING;

-- Add confidence column for revisions (safe migration)
ALTER TABLE IF EXISTS revisions
  ADD COLUMN IF NOT EXISTS confidence INT NOT NULL DEFAULT 3;

-- Store momentum history for analytics
CREATE TABLE IF NOT EXISTS momentum_events (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delta INT NOT NULL,
  score_after INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Study sessions (Focus Mode)
CREATE TABLE IF NOT EXISTS focus_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP,
  minutes INT NOT NULL DEFAULT 0,
  task_label TEXT,
  topic TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE
);

-- Syllabus / topic tree
CREATE TABLE IF NOT EXISTS syllabus_nodes (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INT REFERENCES syllabus_nodes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- OVERDUE | WEAK | OVERREVISION | EXAM_RISK
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- Daily snapshots for weekly reports (optional but useful)
CREATE TABLE IF NOT EXISTS daily_snapshots (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  minutes_studied INT NOT NULL DEFAULT 0,
  revisions_count INT NOT NULL DEFAULT 0,
  momentum_score INT NOT NULL DEFAULT 0,
  UNIQUE(user_id, day)
);

-- =========================
-- Focus Sessions (v2)
-- =========================
CREATE TABLE IF NOT EXISTS focus_sessions_v2 (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic       TEXT,
  task_label  TEXT,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at    TIMESTAMPTZ,
  minutes     INTEGER,
  completed   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_v2_user_id_started_at
  ON focus_sessions_v2 (user_id, started_at DESC);

-- ==========================================
-- GAMIFICATION TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS user_gamification (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1,
    total_xp INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_activity_date DATE,
    total_study_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
    tasks_completed INTEGER NOT NULL DEFAULT 0,
    focus_sessions_completed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    target_value INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS xp_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    xp_gained INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed achievements
INSERT INTO achievements (key, name, description, icon, target_value) VALUES
('first_steps', 'First Steps', 'Complete your first task', '🎯', 1),
('week_warrior', 'Week Warrior', 'Maintain a 7-day streak', '🔥', 7),
('fortnight_focus', 'Fortnight Focus', 'Maintain a 14-day streak', '⚡', 14),
('marathon', 'Marathon', 'Maintain a 30-day streak', '🏃', 30),
('focus_master', 'Focus Master', 'Complete 25 focus sessions', '⏱️', 25),
('focus_legend', 'Focus Legend', 'Complete 100 focus sessions', '👑', 100),
('night_owl', 'Night Owl', 'Study 50 hours total', '🦉', 50),
('scholar', 'Scholar', 'Study 100 hours total', '📚', 100),
('centurion', 'Centurion', 'Complete 100 tasks', '💯', 100),
('taskmaster', 'Taskmaster', 'Complete 500 tasks', '🎖️', 500)
ON CONFLICT (key) DO NOTHING;

-- ==========================================
-- FLASHCARDS TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS flashcard_decks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    topic TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flashcards (
    id SERIAL PRIMARY KEY,
    deck_id INTEGER REFERENCES flashcard_decks(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    interval NUMERIC(10,2) NOT NULL DEFAULT 1,
    repetitions INTEGER NOT NULL DEFAULT 0,
    ease_factor NUMERIC(3,2) NOT NULL DEFAULT 2.5,
    next_review_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flashcard_reviews (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES flashcards(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating TEXT NOT NULL,
    reviewed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ==========================================
-- TOPIC TAGS TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS topic_tags (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS task_tags (
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES topic_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

CREATE TABLE IF NOT EXISTS revision_tags (
    revision_id INTEGER REFERENCES revisions(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES topic_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (revision_id, tag_id)
);

CREATE TABLE IF NOT EXISTS deck_tags (
    deck_id INTEGER REFERENCES flashcard_decks(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES topic_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (deck_id, tag_id)
);

-- ==========================================
-- EMAIL PREFERENCES
-- ==========================================

CREATE TABLE IF NOT EXISTS email_preferences (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    weekly_digest BOOLEAN NOT NULL DEFAULT TRUE,
    daily_reminders BOOLEAN NOT NULL DEFAULT FALSE,
    achievement_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    overdue_tasks BOOLEAN NOT NULL DEFAULT TRUE,
    preferred_time TIME NOT NULL DEFAULT '09:00:00',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON flashcards(next_review_at);
CREATE INDEX IF NOT EXISTS idx_flashcards_deck ON flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_xp_activities_user ON xp_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_task ON task_tags(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag ON task_tags(tag_id);
