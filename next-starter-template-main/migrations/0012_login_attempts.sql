-- Login attempt tracking (rate limit: max 3 failed attempts per IP per hour)
CREATE TABLE IF NOT EXISTS login_attempts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  ip         TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  ok         INTEGER NOT NULL,
  created_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_created_at
  ON login_attempts (ip, created_at);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email_created_at
  ON login_attempts (email, created_at);
