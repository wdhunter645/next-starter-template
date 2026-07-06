-- 0042_content_pipeline_core.sql
-- Program #2286 / #2288: D1 candidate metadata foundation for LGFC content pipeline.
-- Metadata and review state only; B2/R2 media referenced by key, not stored here.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_domain TEXT,
  source_name TEXT NOT NULL,
  source_owner TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN (
    'archive', 'museum', 'newspaper', 'library', 'member', 'social',
    'auction', 'institution', 'operator', 'other'
  )),
  source_trust_status TEXT NOT NULL DEFAULT 'pending' CHECK (source_trust_status IN (
    'pending', 'trusted', 'questionable', 'blocked', 'deleted'
  )),
  source_citation TEXT,
  date_accessed TEXT,
  blocked_at TEXT,
  admin_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sources_domain_unique
  ON sources(source_domain)
  WHERE source_domain IS NOT NULL AND trim(source_domain) != '';

CREATE INDEX IF NOT EXISTS idx_sources_trust_status
  ON sources(source_trust_status, updated_at DESC);

CREATE TABLE IF NOT EXISTS submitters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_submitter_id TEXT UNIQUE,
  submitter_name TEXT NOT NULL,
  submitter_contact TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_submitters_name
  ON submitters(submitter_name);

CREATE TABLE IF NOT EXISTS content_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  candidate_id TEXT NOT NULL UNIQUE,
  input_stream TEXT NOT NULL CHECK (input_stream IN (
    'public_research', 'member_submission', 'admin_seed', 'scheduled_discovery'
  )),
  title TEXT NOT NULL,
  source_url TEXT,
  source_name TEXT NOT NULL,
  source_owner TEXT,
  source_domain TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN (
    'archive', 'museum', 'newspaper', 'library', 'member', 'social',
    'auction', 'institution', 'operator', 'other'
  )),
  content_type TEXT NOT NULL CHECK (content_type IN (
    'photo', 'article', 'record', 'story', 'video', 'audio', 'artifact', 'quote',
    'timeline_fact', 'biography_note', 'source_lead', 'correction', 'identification', 'other'
  )),
  summary TEXT NOT NULL,
  date_or_period TEXT,
  provenance_notes TEXT,
  rights_status TEXT NOT NULL CHECK (rights_status IN (
    'unknown', 'public_domain_candidate', 'permission_needed', 'permission_requested',
    'permission_granted', 'copyright_restricted', 'blocked'
  )),
  source_trust_status TEXT NOT NULL CHECK (source_trust_status IN (
    'pending', 'trusted', 'questionable', 'blocked', 'deleted'
  )),
  relevance_status TEXT NOT NULL CHECK (relevance_status IN (
    'pending', 'relevant', 'not_relevant', 'uncertain'
  )),
  review_status TEXT NOT NULL CHECK (review_status IN (
    'pending_review', 'approved_internal_reference', 'approved_public_candidate',
    'approved_citation_reference_only', 'deferred_source_verification', 'deferred_rights_review',
    'deferred_privacy_review', 'rejected', 'private_internal_only'
  )),
  publication_status TEXT NOT NULL CHECK (publication_status IN (
    'not_ready', 'draft_candidate', 'staged', 'approved_for_publish',
    'published', 'unpublished', 'archived'
  )),
  publication_target TEXT CHECK (publication_target IS NULL OR publication_target IN (
    'biography', 'timeline', 'gallery', 'library', 'memorabilia', 'article',
    'homepage_feature', 'lou_gehrig_day', 'newsletter', 'social', 'internal_reference_only'
  )),
  privacy_flag TEXT NOT NULL CHECK (privacy_flag IN (
    'none', 'living_person', 'donor_member', 'minors', 'sensitive', 'other'
  )),
  privacy_review_status TEXT NOT NULL CHECK (privacy_review_status IN (
    'not_applicable', 'pending_review', 'approved', 'restricted', 'blocked'
  )),
  credit_line TEXT,
  media_asset_id TEXT,
  duplicate_of TEXT,
  review_priority TEXT NOT NULL CHECK (review_priority IN ('low', 'normal', 'high')),
  admin_notes TEXT,
  source_metadata TEXT NOT NULL DEFAULT '{}',
  source_id INTEGER REFERENCES sources(id),
  submission_queue_id INTEGER REFERENCES submission_queue(submission_id),
  content_inventory_id INTEGER REFERENCES content_inventory(id),
  last_event_at TEXT,
  deleted_at TEXT,
  retention_reason TEXT,
  purge_eligible_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (duplicate_of) REFERENCES content_items(candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_content_items_review_queue
  ON content_items(
    review_status,
    CASE review_priority WHEN 'high' THEN 0 WHEN 'normal' THEN 1 ELSE 2 END,
    updated_at DESC
  )
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_content_items_publication_status
  ON content_items(publication_status, updated_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_content_items_input_stream
  ON content_items(input_stream, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_content_items_source_trust
  ON content_items(source_trust_status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_content_items_rights_status
  ON content_items(rights_status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_content_items_privacy_review
  ON content_items(privacy_review_status, privacy_flag)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_content_items_duplicate_of
  ON content_items(duplicate_of)
  WHERE duplicate_of IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_items_media_asset
  ON content_items(media_asset_id)
  WHERE media_asset_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_items_submission_queue
  ON content_items(submission_queue_id)
  WHERE submission_queue_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_items_content_inventory
  ON content_items(content_inventory_id)
  WHERE content_inventory_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_items_source_id
  ON content_items(source_id)
  WHERE source_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_items_deleted_at
  ON content_items(deleted_at)
  WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_items_purge_eligible
  ON content_items(purge_eligible_at)
  WHERE purge_eligible_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_name TEXT NOT NULL,
  tag_category TEXT NOT NULL CHECK (tag_category IN ('people', 'topics', 'places')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(tag_name, tag_category)
);

CREATE INDEX IF NOT EXISTS idx_tags_category_name
  ON tags(tag_category, tag_name);

CREATE TABLE IF NOT EXISTS content_item_tags (
  content_item_id INTEGER NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (content_item_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_content_item_tags_tag
  ON content_item_tags(tag_id);

CREATE TABLE IF NOT EXISTS member_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_item_id INTEGER NOT NULL UNIQUE REFERENCES content_items(id) ON DELETE CASCADE,
  submitter_id INTEGER REFERENCES submitters(id),
  submission_type TEXT NOT NULL CHECK (submission_type IN (
    'story', 'photo', 'memorabilia', 'correction', 'identification', 'source_lead', 'historical_note'
  )),
  ownership_statement TEXT NOT NULL,
  permission_statement TEXT NOT NULL,
  credit_preference TEXT NOT NULL CHECK (credit_preference IN (
    'public_credit', 'anonymous', 'private', 'custom'
  )),
  privacy_notes TEXT,
  uploaded_media_reference TEXT,
  related_candidate_id TEXT,
  consent_status TEXT NOT NULL CHECK (consent_status IN (
    'pending', 'granted', 'restricted', 'denied'
  )),
  admin_followup_required INTEGER NOT NULL CHECK (admin_followup_required IN (0, 1)),
  submission_queue_id INTEGER REFERENCES submission_queue(submission_id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_member_submissions_submitter
  ON member_submissions(submitter_id);

CREATE INDEX IF NOT EXISTS idx_member_submissions_consent
  ON member_submissions(consent_status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_member_submissions_queue
  ON member_submissions(submission_queue_id)
  WHERE submission_queue_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS publication_candidates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_item_id INTEGER NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  publication_target TEXT NOT NULL CHECK (publication_target IN (
    'biography', 'timeline', 'gallery', 'library', 'memorabilia', 'article',
    'homepage_feature', 'lou_gehrig_day', 'newsletter', 'social', 'internal_reference_only'
  )),
  credit_line TEXT,
  staging_notes TEXT,
  approved_by TEXT,
  approved_at TEXT,
  content_inventory_id INTEGER REFERENCES content_inventory(id),
  status TEXT NOT NULL DEFAULT 'staging' CHECK (status IN (
    'staging', 'approved', 'converted', 'withdrawn'
  )),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_publication_candidates_item_target
  ON publication_candidates(content_item_id, publication_target);

CREATE INDEX IF NOT EXISTS idx_publication_candidates_content_item
  ON publication_candidates(content_item_id, status);

CREATE INDEX IF NOT EXISTS idx_publication_candidates_target
  ON publication_candidates(publication_target, status);

CREATE TABLE IF NOT EXISTS moderation_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_item_id INTEGER NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'review_state_change', 'rights_update', 'privacy_update', 'publication_prep',
    'duplicate_flagged', 'promotion', 'soft_delete', 'retention_update'
  )),
  actor TEXT,
  from_state TEXT,
  to_state TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_moderation_events_content_item_created
  ON moderation_events(content_item_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_moderation_events_event_type
  ON moderation_events(event_type, created_at DESC);
