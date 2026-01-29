#!/usr/bin/env bash
set -euo pipefail

DB_NAME="lgfc_lite"

echo "[Phase 1] D1 initial schema for ${DB_NAME}"
echo "----------------------------------------"

# 1) Create a new migration for the initial schema
echo "[1/3] Creating D1 migration..."
npx wrangler d1 migrations create "${DB_NAME}" init_schema

MIG_DIR="./migrations/${DB_NAME}"

if [ ! -d "${MIG_DIR}" ]; then
  echo "ERROR: Migration directory ${MIG_DIR} not found. Check wrangler config."
  exit 1
fi

LATEST_FILE=$(ls -t "${MIG_DIR}"/*.sql | head -n 1 || true)

if [ -z "${LATEST_FILE}" ]; then
  echo "ERROR: No migration .sql file found in ${MIG_DIR}."
  exit 1
fi

echo "[1/3] Using migration file: ${LATEST_FILE}"

# 2) Overwrite that migration with our initial schema
echo "[2/3] Writing initial schema to migration file..."

cat > "${LATEST_FILE}" <<'SQL'
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
