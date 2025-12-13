#!/usr/bin/env bash
set -euo pipefail

DB_NAME="lgfc_lite"

echo "[Phase 1] Applying D1 initial schema for ${DB_NAME}"
echo "----------------------------------------------"

# 1) Find the init_schema migration file that wrangler just created
MIG_FILE=$(ls -t migrations/*init_schema.sql 2>/dev/null | head -n 1 || true)

if [ -z "${MIG_FILE}" ]; then
  echo "ERROR: Could not find an init_schema migration in ./migrations."
  ls -R migrations || true
  exit 1
fi

echo "[1/3] Using migration file: ${MIG_FILE}"

# 2) Overwrite that migration with our initial schema
echo "[2/3] Writing initial schema to ${MIG_FILE}..."

cat > "${MIG_FILE}" <<'SQL'
-- lgfc_lite initial schema
PRAGMA foreign_keys = ON;

-- Mailing list / Join form submissions
CREATE TABLE IF NOT EXISTS join_requests (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  message     TEXT,
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Fan library submissions (stories, content)
CREATE TABLE IF NOT EXISTS library_entries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  title       TEXT    NOT NULL,
  content     TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  is_approved INTEGER NOT NULL DEFAULT 0
);

-- Photo catalog (archive + memorabilia)
CREATE TABLE IF NOT EXISTS photos (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  photo_id       TEXT    NOT NULL UNIQUE, -- B2 file id or filename
  url            TEXT    NOT NULL,        -- Full public URL via Cloudflare/B2
  is_memorabilia INTEGER NOT NULL DEFAULT 0,
  description    TEXT,
  created_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
SQL

echo "[2/3] Schema written."

# 3) Apply migrations and verify tables
echo "[3/3] Applying migrations..."
npx wrangler d1 migrations apply "${DB_NAME}"

echo "[3/3] Verifying tables exist..."
npx wrangler d1 execute "${DB_NAME}" --command \
"SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"

echo
echo "[Phase 1] D1 initial schema complete."
