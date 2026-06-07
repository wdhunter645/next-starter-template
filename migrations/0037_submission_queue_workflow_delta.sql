-- 0037_submission_queue_workflow_delta.sql
-- Task 003: reconcile submission_queue review states, decision metadata, and purge readiness.

CREATE TABLE submission_queue_next (
  submission_id INTEGER PRIMARY KEY AUTOINCREMENT,
  submitted_by TEXT NOT NULL,
  payload TEXT NOT NULL DEFAULT '{}',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source_name TEXT,
  source_url TEXT,
  credit_line TEXT,
  proposed_tag TEXT,
  media_url TEXT,
  media_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'triaged', 'under_review', 'approved', 'rejected', 'merged', 'purged')),
  triage_flags TEXT NOT NULL DEFAULT '[]',
  duplicate_candidate TEXT,
  review_notes TEXT,
  decision_by TEXT,
  decision_at TEXT,
  rejected_at TEXT,
  purge_eligible_at TEXT,
  retention_reason TEXT,
  purge_flag INTEGER NOT NULL DEFAULT 0 CHECK (purge_flag IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  reviewed_at TEXT,
  reviewer TEXT
);

INSERT INTO submission_queue_next (
  submission_id,
  submitted_by,
  payload,
  title,
  description,
  source_url,
  proposed_tag,
  media_url,
  media_reference,
  status,
  review_notes,
  decision_by,
  decision_at,
  rejected_at,
  purge_eligible_at,
  purge_flag,
  created_at,
  updated_at,
  reviewed_at,
  reviewer
)
SELECT
  submission_id,
  submitted_by,
  json_object(
    'submitted_by', submitted_by,
    'title', title,
    'description', description,
    'source_url', source_url,
    'proposed_tag', proposed_tag,
    'media_url', media_url
  ),
  title,
  description,
  source_url,
  proposed_tag,
  media_url,
  media_url,
  CASE
    WHEN status IN ('rejected_auto', 'rejected_manual') THEN 'rejected'
    WHEN status IN ('pending', 'approved') THEN status
    ELSE 'pending'
  END,
  review_notes,
  reviewer,
  CASE
    WHEN status IN ('approved', 'rejected_auto', 'rejected_manual') THEN COALESCE(reviewed_at, updated_at)
    ELSE reviewed_at
  END,
  CASE WHEN status IN ('rejected_auto', 'rejected_manual') THEN COALESCE(reviewed_at, updated_at) ELSE NULL END,
  CASE WHEN purge_flag = 1 THEN updated_at ELSE NULL END,
  purge_flag,
  created_at,
  updated_at,
  reviewed_at,
  reviewer
FROM submission_queue;

DROP TABLE submission_queue;

ALTER TABLE submission_queue_next RENAME TO submission_queue;

CREATE INDEX IF NOT EXISTS idx_submission_queue_status_created
  ON submission_queue(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_submission_queue_decision_at
  ON submission_queue(decision_at DESC);

CREATE INDEX IF NOT EXISTS idx_submission_queue_purge_eligible
  ON submission_queue(status, purge_eligible_at);
