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
  confidence INT DEFAULT 3,
  revised_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'POMODORO',       -- POMODORO | DEEP
  minutes INT NOT NULL,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP
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
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ==========================================
-- GAMIFICATION TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS user_gamification (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  xp_total BIGINT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_activity_date DATE,
  tasks_completed INT NOT NULL DEFAULT 0,
  focus_sessions_completed INT NOT NULL DEFAULT 0,
  total_study_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xp_activities (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  xp_gained INT NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Achievements system
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,           -- e.g. 'FIRST_LOGIN', 'STREAK_7'
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT '🏆',
  xp_reward INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

-- ==========================================
-- FLASHCARDS / SPACED REPETITION
-- ==========================================

CREATE TABLE IF NOT EXISTS flashcard_decks (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  topic TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flashcards (
  id SERIAL PRIMARY KEY,
  deck_id INT NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  interval NUMERIC NOT NULL DEFAULT 0,
  repetitions INT NOT NULL DEFAULT 0,
  ease_factor NUMERIC NOT NULL DEFAULT 2.5,
  next_review_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flashcard_reviews (
  id SERIAL PRIMARY KEY,
  card_id INT NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating TEXT NOT NULL,          -- AGAIN, HARD, GOOD, EASY
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
-- ALERTS
-- ==========================================

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,          -- e.g. OVERDUE, WEAK, ACHIEVEMENT
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  meta JSONB DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add to end of schema.sql before indexes

-- ==========================================
-- RESOURCES FOR FEATURE 9
-- ==========================================

CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'LINK',  -- LINK | PDF | VIDEO | NOTE
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resource_tags (
    resource_id INT REFERENCES resources(id) ON DELETE CASCADE,
    tag_id INT REFERENCES topic_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (resource_id, tag_id)
);

-- ==========================================
-- MOCK EXAMS FOR FEATURE 7
-- ==========================================

CREATE TABLE IF NOT EXISTS mock_exams (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    duration_minutes INT NOT NULL,
    topic_filter TEXT,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMP,
    score NUMERIC(5,2),
    correct INT DEFAULT 0,
    incorrect INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS mock_questions (
    id SERIAL PRIMARY KEY,
    mock_id INT NOT NULL REFERENCES mock_exams(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    options JSONB NOT NULL,  -- array of options
    correct_answer TEXT NOT NULL,
    user_answer TEXT,
    topic TEXT
);

-- Add new indexes to the INDEXES section
CREATE INDEX IF NOT EXISTS idx_resources_user ON resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_tags_resource ON resource_tags(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_tags_tag ON resource_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_mock_exams_user ON mock_exams(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_questions_mock ON mock_questions(mock_id);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_tasks_user        ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_exams_user         ON exams(user_id);
CREATE INDEX IF NOT EXISTS idx_revisions_user     ON revisions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_activities_user ON xp_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON flashcards(next_review_at);
CREATE INDEX IF NOT EXISTS idx_flashcards_deck    ON flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_task     ON task_tags(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag      ON task_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_revision_tags_revision ON revision_tags(revision_id);
CREATE INDEX IF NOT EXISTS idx_revision_tags_tag  ON revision_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_deck_tags_deck     ON deck_tags(deck_id);
CREATE INDEX IF NOT EXISTS idx_deck_tags_tag      ON deck_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user        ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_read        ON alerts(read);
