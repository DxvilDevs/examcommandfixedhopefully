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
