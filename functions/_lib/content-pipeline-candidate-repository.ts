// Internal D1 repository for LGFC content pipeline candidate metadata (#2286 / #2305).

import { requireTables } from './d1';
import type { CandidateRecord, SourceMetadata } from './content-pipeline-candidate-import';

export const CONTENT_PIPELINE_REPOSITORY_TABLES = [
  'content_items',
  'tags',
  'content_item_tags',
  'moderation_events',
] as const;

export type CandidateTags = {
  people: string[];
  topics: string[];
  places: string[];
};

export type ContentItemRow = {
  id: number;
  candidate_id: string;
  input_stream: string;
  title: string;
  source_url: string | null;
  source_name: string;
  source_owner: string | null;
  source_domain: string | null;
  source_type: string;
  content_type: string;
  summary: string;
  date_or_period: string | null;
  provenance_notes: string | null;
  rights_status: string;
  source_trust_status: string;
  relevance_status: string;
  review_status: string;
  publication_status: string;
  publication_target: string | null;
  privacy_flag: string;
  privacy_review_status: string;
  credit_line: string | null;
  media_asset_id: string | null;
  duplicate_of: string | null;
  review_priority: string;
  admin_notes: string | null;
  source_metadata: string;
  source_id: number | null;
  submission_queue_id: number | null;
  content_inventory_id: number | null;
  last_event_at: string | null;
  deleted_at: string | null;
  retention_reason: string | null;
  purge_eligible_at: string | null;
  created_at: string;
  updated_at: string;
};

export type StoredCandidate = CandidateRecord & {
  id: number;
  tags: CandidateTags;
};

export type CandidateListFilter = {
  review_status?: string;
  input_stream?: string;
  review_priority?: string;
  publication_status?: string;
  include_deleted?: boolean;
  limit?: number;
  offset?: number;
};

export type CandidateReviewStateUpdate = {
  review_status?: string;
  rights_status?: string;
  privacy_review_status?: string;
  publication_status?: string;
  relevance_status?: string;
  source_trust_status?: string;
  admin_notes?: string;
};

type ReviewStateField = keyof CandidateReviewStateUpdate;

const REVIEW_STATE_EVENT_TYPES: Record<ReviewStateField, string> = {
  review_status: 'review_state_change',
  rights_status: 'rights_update',
  privacy_review_status: 'privacy_update',
  publication_status: 'publication_prep',
  relevance_status: 'review_state_change',
  source_trust_status: 'review_state_change',
  admin_notes: 'review_state_change',
};

const TAG_CATEGORY_TO_ARRAY: Record<'people' | 'topics' | 'places', keyof CandidateTags> = {
  people: 'people',
  topics: 'topics',
  places: 'places',
};

const TAG_ARRAY_TO_CATEGORY: Record<keyof CandidateTags, 'people' | 'topics' | 'places'> = {
  people: 'people',
  topics: 'topics',
  places: 'places',
};

function parseSourceMetadata(raw: string | null | undefined): SourceMetadata | undefined {
  if (!raw || raw.trim() === '' || raw.trim() === '{}') {
    return undefined;
  }
  try {
    const parsed = JSON.parse(raw) as SourceMetadata;
    return Object.keys(parsed).length > 0 ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function emptyTags(): CandidateTags {
  return { people: [], topics: [], places: [] };
}

export function mapContentItemRowToCandidate(
  row: ContentItemRow,
  tags: CandidateTags = emptyTags(),
): StoredCandidate {
  const sourceMetadata = parseSourceMetadata(row.source_metadata);
  return {
    id: row.id,
    candidate_id: row.candidate_id,
    input_stream: row.input_stream,
    title: row.title,
    source_url: row.source_url ?? undefined,
    source_name: row.source_name,
    source_owner: row.source_owner ?? undefined,
    source_domain: row.source_domain ?? undefined,
    source_type: row.source_type,
    content_type: row.content_type,
    summary: row.summary,
    date_or_period: row.date_or_period ?? undefined,
    provenance_notes: row.provenance_notes ?? undefined,
    rights_status: row.rights_status,
    source_trust_status: row.source_trust_status,
    relevance_status: row.relevance_status,
    review_status: row.review_status,
    publication_status: row.publication_status,
    publication_target: row.publication_target ?? undefined,
    privacy_flag: row.privacy_flag,
    privacy_review_status: row.privacy_review_status,
    credit_line: row.credit_line ?? undefined,
    media_asset_id: row.media_asset_id ?? undefined,
    duplicate_of: row.duplicate_of ?? undefined,
    review_priority: row.review_priority,
    admin_notes: row.admin_notes ?? undefined,
    source_metadata: sourceMetadata,
    submission_queue_id: row.submission_queue_id ?? undefined,
    content_inventory_id: row.content_inventory_id ?? undefined,
    last_event_at: row.last_event_at ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
    people_tags: tags.people.length > 0 ? tags.people : undefined,
    topic_tags: tags.topics.length > 0 ? tags.topics : undefined,
    location_tags: tags.places.length > 0 ? tags.places : undefined,
    tags,
  };
}

export async function requireContentPipelineCandidateTables(db: unknown) {
  return requireTables(db, [...CONTENT_PIPELINE_REPOSITORY_TABLES]);
}

export async function fetchCandidateTags(db: any, contentItemId: number): Promise<CandidateTags> {
  const result = await db
    .prepare(
      `SELECT t.tag_name, t.tag_category
       FROM content_item_tags cit
       JOIN tags t ON t.id = cit.tag_id
       WHERE cit.content_item_id = ?
       ORDER BY t.tag_category ASC, t.tag_name ASC`,
    )
    .bind(contentItemId)
    .all();

  const tags = emptyTags();
  for (const row of result.results || []) {
    const tagName = String(row.tag_name || '');
    const category = String(row.tag_category || '') as keyof typeof TAG_CATEGORY_TO_ARRAY;
    const bucket = TAG_CATEGORY_TO_ARRAY[category];
    if (bucket && tagName) {
      tags[bucket].push(tagName);
    }
  }
  return tags;
}

async function loadStoredCandidate(
  db: any,
  row: ContentItemRow | null,
): Promise<StoredCandidate | null> {
  if (!row) {
    return null;
  }
  const tags = await fetchCandidateTags(db, row.id);
  return mapContentItemRowToCandidate(row as ContentItemRow, tags);
}

export async function getCandidateByCandidateId(
  db: any,
  candidateId: string,
  options: { includeDeleted?: boolean } = {},
): Promise<StoredCandidate | null> {
  const includeDeleted = options.includeDeleted === true;
  const row = await db
    .prepare(
      `SELECT *
       FROM content_items
       WHERE candidate_id = ?
         AND (? = 1 OR deleted_at IS NULL)
       LIMIT 1`,
    )
    .bind(candidateId, includeDeleted ? 1 : 0)
    .first();

  return loadStoredCandidate(db, row as ContentItemRow | null);
}

export async function listCandidates(
  db: any,
  filter: CandidateListFilter = {},
): Promise<StoredCandidate[]> {
  const clauses: string[] = [];
  const binds: unknown[] = [];

  if (!filter.include_deleted) {
    clauses.push('deleted_at IS NULL');
  }
  if (filter.review_status) {
    clauses.push('review_status = ?');
    binds.push(filter.review_status);
  }
  if (filter.input_stream) {
    clauses.push('input_stream = ?');
    binds.push(filter.input_stream);
  }
  if (filter.review_priority) {
    clauses.push('review_priority = ?');
    binds.push(filter.review_priority);
  }
  if (filter.publication_status) {
    clauses.push('publication_status = ?');
    binds.push(filter.publication_status);
  }

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const limit = Math.min(Math.max(filter.limit ?? 50, 1), 200);
  const offset = Math.max(filter.offset ?? 0, 0);

  const result = await db
    .prepare(
      `SELECT *
       FROM content_items
       ${whereSql}
       ORDER BY
         CASE review_priority WHEN 'high' THEN 0 WHEN 'normal' THEN 1 ELSE 2 END,
         updated_at DESC,
         candidate_id ASC
       LIMIT ? OFFSET ?`,
    )
    .bind(...binds, limit, offset)
    .all();

  const stored: StoredCandidate[] = [];
  for (const row of result.results || []) {
    const candidate = await loadStoredCandidate(db, row as ContentItemRow);
    if (candidate) {
      stored.push(candidate);
    }
  }
  return stored;
}

async function syncCandidateTags(db: any, contentItemId: number, candidate: CandidateRecord) {
  await db
    .prepare('DELETE FROM content_item_tags WHERE content_item_id = ?')
    .bind(contentItemId)
    .run();

  const tagEntries: Array<{ category: 'people' | 'topics' | 'places'; name: string }> = [];
  for (const name of candidate.people_tags ?? []) {
    tagEntries.push({ category: 'people', name });
  }
  for (const name of candidate.topic_tags ?? []) {
    tagEntries.push({ category: 'topics', name });
  }
  for (const name of candidate.location_tags ?? []) {
    tagEntries.push({ category: 'places', name });
  }

  for (const entry of tagEntries) {
    await db
      .prepare(
        `INSERT INTO tags (tag_name, tag_category)
         VALUES (?, ?)
         ON CONFLICT(tag_name, tag_category) DO NOTHING`,
      )
      .bind(entry.name, entry.category)
      .run();

    await db
      .prepare(
        `INSERT INTO content_item_tags (content_item_id, tag_id)
         SELECT ?, t.id
         FROM tags t
         WHERE t.tag_name = ? AND t.tag_category = ?
         ON CONFLICT(content_item_id, tag_id) DO NOTHING`,
      )
      .bind(contentItemId, entry.name, entry.category)
      .run();
  }
}

export async function upsertCandidate(db: any, candidate: CandidateRecord): Promise<StoredCandidate> {
  const sourceMetadata = JSON.stringify(candidate.source_metadata ?? {});
  const now = candidate.updated_at;

  await db
    .prepare(
      `INSERT INTO content_items (
        candidate_id, input_stream, title, source_url, source_name, source_owner, source_domain,
        source_type, content_type, summary, date_or_period, provenance_notes,
        rights_status, source_trust_status, relevance_status, review_status, publication_status,
        publication_target, privacy_flag, privacy_review_status, credit_line, media_asset_id,
        duplicate_of, review_priority, admin_notes, source_metadata, submission_queue_id,
        content_inventory_id, last_event_at, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?
      )
      ON CONFLICT(candidate_id) DO UPDATE SET
        input_stream = excluded.input_stream,
        title = excluded.title,
        source_url = excluded.source_url,
        source_name = excluded.source_name,
        source_owner = excluded.source_owner,
        source_domain = excluded.source_domain,
        source_type = excluded.source_type,
        content_type = excluded.content_type,
        summary = excluded.summary,
        date_or_period = excluded.date_or_period,
        provenance_notes = excluded.provenance_notes,
        rights_status = excluded.rights_status,
        source_trust_status = excluded.source_trust_status,
        relevance_status = excluded.relevance_status,
        review_status = excluded.review_status,
        publication_status = excluded.publication_status,
        publication_target = excluded.publication_target,
        privacy_flag = excluded.privacy_flag,
        privacy_review_status = excluded.privacy_review_status,
        credit_line = excluded.credit_line,
        media_asset_id = excluded.media_asset_id,
        duplicate_of = excluded.duplicate_of,
        review_priority = excluded.review_priority,
        admin_notes = excluded.admin_notes,
        source_metadata = excluded.source_metadata,
        submission_queue_id = excluded.submission_queue_id,
        content_inventory_id = excluded.content_inventory_id,
        last_event_at = excluded.last_event_at,
        updated_at = excluded.updated_at`,
    )
    .bind(
      candidate.candidate_id,
      candidate.input_stream,
      candidate.title,
      candidate.source_url ?? null,
      candidate.source_name,
      candidate.source_owner ?? null,
      candidate.source_domain ?? null,
      candidate.source_type,
      candidate.content_type,
      candidate.summary,
      candidate.date_or_period ?? null,
      candidate.provenance_notes ?? null,
      candidate.rights_status,
      candidate.source_trust_status,
      candidate.relevance_status,
      candidate.review_status,
      candidate.publication_status,
      candidate.publication_target ?? null,
      candidate.privacy_flag,
      candidate.privacy_review_status,
      candidate.credit_line ?? null,
      candidate.media_asset_id ?? null,
      candidate.duplicate_of ?? null,
      candidate.review_priority,
      candidate.admin_notes ?? null,
      sourceMetadata,
      candidate.submission_queue_id ?? null,
      candidate.content_inventory_id ?? null,
      candidate.last_event_at ?? null,
      candidate.created_at,
      now,
    )
    .run();

  const stored = await getCandidateByCandidateId(db, candidate.candidate_id, { includeDeleted: true });
  if (!stored) {
    throw new Error(`Failed to load candidate after upsert: ${candidate.candidate_id}`);
  }

  if (
    candidate.people_tags !== undefined ||
    candidate.topic_tags !== undefined ||
    candidate.location_tags !== undefined
  ) {
    await syncCandidateTags(db, stored.id, candidate);
    return (await getCandidateByCandidateId(db, candidate.candidate_id)) as StoredCandidate;
  }

  return stored;
}

async function appendModerationEvent(
  db: any,
  contentItemId: number,
  eventType: string,
  actor: string | null,
  fromState: Record<string, unknown>,
  toState: Record<string, unknown>,
  notes?: string,
) {
  await db
    .prepare(
      `INSERT INTO moderation_events (
        content_item_id, event_type, actor, from_state, to_state, notes
      ) VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      contentItemId,
      eventType,
      actor,
      JSON.stringify(fromState),
      JSON.stringify(toState),
      notes ?? null,
    )
    .run();
}

export async function updateCandidateReviewState(
  db: any,
  candidateId: string,
  update: CandidateReviewStateUpdate,
  options: { actor?: string; notes?: string } = {},
): Promise<StoredCandidate | null> {
  const existing = await getCandidateByCandidateId(db, candidateId);
  if (!existing) {
    return null;
  }

  const assignments: string[] = [];
  const binds: unknown[] = [];
  const events: Array<{ field: ReviewStateField; from: unknown; to: unknown }> = [];

  for (const field of Object.keys(update) as ReviewStateField[]) {
    const nextValue = update[field];
    if (nextValue === undefined || nextValue === existing[field]) {
      continue;
    }
    assignments.push(`${field} = ?`);
    binds.push(nextValue);
    events.push({ field, from: existing[field], to: nextValue });
  }

  if (assignments.length === 0) {
    return existing;
  }

  assignments.push(`updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')`);
  binds.push(candidateId);

  await db
    .prepare(
      `UPDATE content_items
       SET ${assignments.join(', ')}
       WHERE candidate_id = ?
         AND deleted_at IS NULL`,
    )
    .bind(...binds)
    .run();

  for (const event of events) {
    await appendModerationEvent(
      db,
      existing.id,
      REVIEW_STATE_EVENT_TYPES[event.field],
      options.actor ?? null,
      { [event.field]: event.from },
      { [event.field]: event.to },
      options.notes,
    );
  }

  return getCandidateByCandidateId(db, candidateId);
}

export function groupTagsByCategory(
  rows: Array<{ tag_name: string; tag_category: string }>,
): CandidateTags {
  const tags = emptyTags();
  for (const row of rows) {
    const category = row.tag_category as keyof typeof TAG_ARRAY_TO_CATEGORY;
    const bucket = TAG_ARRAY_TO_CATEGORY[category];
    if (bucket && row.tag_name) {
      tags[bucket].push(row.tag_name);
    }
  }
  return tags;
}
