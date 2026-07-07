import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { describe, expect, it } from 'vitest';

import type { CandidateRecord } from '../functions/_lib/content-pipeline-candidate-import';
import {
  fetchCandidateTags,
  getCandidateByCandidateId,
  groupTagsByCategory,
  listCandidates,
  mapContentItemRowToCandidate,
  requireContentPipelineCandidateTables,
  updateCandidateReviewState,
  upsertCandidate,
  type CandidateReviewStateUpdate,
  type ContentItemRow,
} from '../functions/_lib/content-pipeline-candidate-repository';

function minimalCandidate(overrides: Partial<CandidateRecord> = {}): CandidateRecord {
  return {
    candidate_id: 'lgfc-gehrig-2026-999',
    input_stream: 'admin_seed',
    title: 'Test candidate',
    source_name: 'LGFC Operator',
    source_type: 'operator',
    content_type: 'story',
    summary: 'Test summary',
    rights_status: 'unknown',
    source_trust_status: 'pending',
    relevance_status: 'pending',
    review_status: 'pending_review',
    publication_status: 'not_ready',
    privacy_flag: 'none',
    privacy_review_status: 'not_applicable',
    review_priority: 'normal',
    created_at: '2026-07-05T16:00:00.000Z',
    updated_at: '2026-07-05T16:00:00.000Z',
    ...overrides,
  };
}

function applyRepoMigrations(db: DatabaseSync) {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    db.exec(fs.readFileSync(path.join(migrationsDir, file), 'utf8'));
  }
}

function wrapSqliteAsD1(sqlite: DatabaseSync) {
  return {
    async exec(sql: string) {
      sqlite.exec(sql);
    },
    async batch(statements: Array<{ run: () => Promise<unknown> }>) {
      sqlite.exec('BEGIN');
      try {
        for (const statement of statements) {
          await statement.run();
        }
        sqlite.exec('COMMIT');
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
      return statements.map(() => ({ success: true }));
    },
    prepare(sql: string) {
      const stmt = sqlite.prepare(sql);
      const bound = (...args: SQLInputValue[]) => ({
        async first() {
          return stmt.get(...args) ?? null;
        },
        async all() {
          return { results: stmt.all(...args) };
        },
        async run() {
          stmt.run(...args);
          return { success: true };
        },
      });

      return {
        bind: bound,
        async first() {
          return stmt.get() ?? null;
        },
        async all() {
          return { results: stmt.all() };
        },
        async run() {
          stmt.run();
          return { success: true };
        },
      };
    },
  };
}

function sampleRow(overrides: Partial<ContentItemRow> = {}): ContentItemRow {
  return {
    id: 1,
    candidate_id: 'lgfc-gehrig-2026-999',
    input_stream: 'admin_seed',
    title: 'Test candidate',
    source_url: null,
    source_name: 'LGFC Operator',
    source_owner: null,
    source_domain: null,
    source_type: 'operator',
    content_type: 'story',
    summary: 'Test summary',
    date_or_period: null,
    provenance_notes: null,
    rights_status: 'unknown',
    source_trust_status: 'pending',
    relevance_status: 'pending',
    review_status: 'pending_review',
    publication_status: 'not_ready',
    publication_target: null,
    privacy_flag: 'none',
    privacy_review_status: 'not_applicable',
    credit_line: null,
    media_asset_id: null,
    duplicate_of: null,
    review_priority: 'normal',
    admin_notes: null,
    source_metadata: '{}',
    source_id: null,
    submission_queue_id: null,
    content_inventory_id: null,
    last_event_at: null,
    deleted_at: null,
    retention_reason: null,
    purge_eligible_at: null,
    created_at: '2026-07-05T16:00:00.000Z',
    updated_at: '2026-07-05T16:00:00.000Z',
    ...overrides,
  };
}

describe('content pipeline candidate repository (#2305)', () => {
  it('maps content_items rows to canonical candidate records with tags', () => {
    const mapped = mapContentItemRowToCandidate(sampleRow(), {
      people: ['Lou Gehrig'],
      topics: ['Yankees'],
      places: ['Yankee Stadium'],
    });

    expect(mapped.candidate_id).toBe('lgfc-gehrig-2026-999');
    expect(mapped.people_tags).toEqual(['Lou Gehrig']);
    expect(mapped.topic_tags).toEqual(['Yankees']);
    expect(mapped.location_tags).toEqual(['Yankee Stadium']);
    expect(mapped.source_metadata).toBeUndefined();
  });

  it('groups tag rows by category', () => {
    const grouped = groupTagsByCategory([
      { tag_name: 'Lou Gehrig', tag_category: 'people' },
      { tag_name: 'Yankees', tag_category: 'topics' },
      { tag_name: 'Bronx', tag_category: 'places' },
    ]);

    expect(grouped).toEqual({
      people: ['Lou Gehrig'],
      topics: ['Yankees'],
      places: ['Bronx'],
    });
  });

  it('requires repository tables before use', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    const result = await requireContentPipelineCandidateTables(db);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.db).toBe(db);
    }
  });

  it('loads candidates by candidate_id and excludes soft-deleted rows by default', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    await upsertCandidate(
      db,
      minimalCandidate({
        people_tags: ['Lou Gehrig'],
        topic_tags: ['Yankees'],
      }),
    );

    const found = await getCandidateByCandidateId(db, 'lgfc-gehrig-2026-999');
    expect(found?.title).toBe('Test candidate');
    expect(found?.people_tags).toEqual(['Lou Gehrig']);
    expect(found?.topic_tags).toEqual(['Yankees']);

    sqlite
      .prepare(
        `UPDATE content_items
         SET deleted_at = '2026-07-06T12:00:00.000Z'
         WHERE candidate_id = ?`,
      )
      .run('lgfc-gehrig-2026-999');

    expect(await getCandidateByCandidateId(db, 'lgfc-gehrig-2026-999')).toBeNull();
    expect(
      await getCandidateByCandidateId(db, 'lgfc-gehrig-2026-999', { includeDeleted: true }),
    ).not.toBeNull();
  });

  it('lists candidates with review and stream filters', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    await upsertCandidate(
      db,
      minimalCandidate({
        candidate_id: 'lgfc-gehrig-2026-801',
        review_priority: 'high',
      }),
    );
    await upsertCandidate(
      db,
      minimalCandidate({
        candidate_id: 'lgfc-gehrig-2026-802',
        input_stream: 'public_research',
        review_status: 'approved_internal_reference',
        review_priority: 'normal',
      }),
    );

    const highPriority = await listCandidates(db, { review_priority: 'high' });
    expect(highPriority.map((candidate) => candidate.candidate_id)).toEqual(['lgfc-gehrig-2026-801']);

    const approved = await listCandidates(db, {
      review_status: 'approved_internal_reference',
      input_stream: 'public_research',
    });
    expect(approved.map((candidate) => candidate.candidate_id)).toEqual(['lgfc-gehrig-2026-802']);
  });

  it('upserts candidates idempotently and syncs tags', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    const first = await upsertCandidate(
      db,
      minimalCandidate({
        people_tags: ['Lou Gehrig'],
        topic_tags: ['Yankees'],
      }),
    );
    const second = await upsertCandidate(
      db,
      minimalCandidate({
        title: 'Updated title',
        people_tags: ['Lou Gehrig', 'Eleanor Gehrig'],
        topic_tags: ['Yankees', 'Iron Horse'],
      }),
    );

    const count = sqlite
      .prepare('SELECT COUNT(*) AS count FROM content_items WHERE candidate_id = ?')
      .get('lgfc-gehrig-2026-999') as { count: number };

    expect(count.count).toBe(1);
    expect(first.id).toBe(second.id);
    expect(second.title).toBe('Updated title');
    expect(second.people_tags).toEqual(['Eleanor Gehrig', 'Lou Gehrig']);
    expect(second.topic_tags).toEqual(['Iron Horse', 'Yankees']);

    const tags = await fetchCandidateTags(db, second.id);
    expect(tags.people).toEqual(['Eleanor Gehrig', 'Lou Gehrig']);
    expect(tags.topics).toEqual(['Iron Horse', 'Yankees']);
  });

  it('upserts soft-deleted candidates with tag sync without returning null', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    await upsertCandidate(
      db,
      minimalCandidate({
        people_tags: ['Lou Gehrig'],
      }),
    );

    sqlite
      .prepare(
        `UPDATE content_items
         SET deleted_at = '2026-07-06T12:00:00.000Z'
         WHERE candidate_id = ?`,
      )
      .run('lgfc-gehrig-2026-999');

    const updated = await upsertCandidate(
      db,
      minimalCandidate({
        title: 'Soft-deleted refresh',
        people_tags: ['Lou Gehrig', 'Eleanor Gehrig'],
      }),
    );

    expect(updated.title).toBe('Soft-deleted refresh');
    expect(updated.people_tags).toEqual(['Eleanor Gehrig', 'Lou Gehrig']);
    expect(await getCandidateByCandidateId(db, 'lgfc-gehrig-2026-999')).toBeNull();
    expect(
      await getCandidateByCandidateId(db, 'lgfc-gehrig-2026-999', { includeDeleted: true }),
    ).not.toBeNull();
  });

  it('updates review state and appends moderation events', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    await upsertCandidate(db, minimalCandidate());

    const updated = await updateCandidateReviewState(
      db,
      'lgfc-gehrig-2026-999',
      {
        review_status: 'approved_internal_reference',
        rights_status: 'permission_needed',
        admin_notes: 'Needs rights follow-up',
      },
      { actor: 'operator@test', notes: 'Initial review complete' },
    );

    expect(updated?.review_status).toBe('approved_internal_reference');
    expect(updated?.rights_status).toBe('permission_needed');
    expect(updated?.admin_notes).toBe('Needs rights follow-up');

    const events = sqlite
      .prepare(
        `SELECT event_type, actor, notes
         FROM moderation_events me
         JOIN content_items ci ON ci.id = me.content_item_id
         WHERE ci.candidate_id = ?
         ORDER BY me.id ASC`,
      )
      .all('lgfc-gehrig-2026-999') as Array<{ event_type: string; actor: string | null; notes: string | null }>;

    expect(events.length).toBe(4);
    expect(events[0]).toMatchObject({
      event_type: 'review_state_change',
      notes: 'candidate registry create',
    });
    expect(events.slice(1).map((event) => event.event_type)).toEqual([
      'review_state_change',
      'rights_update',
      'review_state_change',
    ]);
    expect(events[1]?.actor).toBe('operator@test');
    expect(events[1]?.notes).toBe('Initial review complete');
  });

  it('audits registry upserts that clear optional media and admin note fields', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    await upsertCandidate(
      db,
      minimalCandidate({
        media_asset_id: 'media_uid:lgfc-photo-001',
        admin_notes: 'Keep until import refresh',
      }),
    );

    await upsertCandidate(
      db,
      minimalCandidate({
        updated_at: '2026-07-07T10:00:00.000Z',
      }),
    );

    const events = sqlite
      .prepare(
        `SELECT event_type, from_state, to_state, notes
         FROM moderation_events me
         JOIN content_items ci ON ci.id = me.content_item_id
         WHERE ci.candidate_id = ?
           AND me.notes = 'candidate registry upsert'
         ORDER BY me.id ASC`,
      )
      .all('lgfc-gehrig-2026-999') as Array<{
      event_type: string;
      from_state: string | null;
      to_state: string | null;
      notes: string | null;
    }>;

    expect(events).toHaveLength(2);
    expect(events.map((event) => event.event_type).sort()).toEqual(
      ['review_state_change', 'review_state_change'].sort(),
    );
    expect(JSON.parse(events.find((event) => event.from_state?.includes('media_asset_id'))!.from_state!)).toMatchObject({
      media_asset_id: 'media_uid:lgfc-photo-001',
    });
    expect(JSON.parse(events.find((event) => event.from_state?.includes('admin_notes'))!.from_state!)).toMatchObject({
      admin_notes: 'Keep until import refresh',
    });
  });

  it('ignores unknown review-state keys and does not mutate unrelated columns', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    await upsertCandidate(db, minimalCandidate({ title: 'Protected title' }));

    const maliciousUpdate = {
      review_status: 'approved_internal_reference',
      title: 'Injected title',
    } as CandidateReviewStateUpdate;

    const updated = await updateCandidateReviewState(db, 'lgfc-gehrig-2026-999', maliciousUpdate);

    expect(updated?.review_status).toBe('approved_internal_reference');
    expect(updated?.title).toBe('Protected title');
  });

  it('returns null when updating a missing candidate', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    const result = await updateCandidateReviewState(db, 'lgfc-gehrig-2026-missing', {
      review_status: 'rejected',
    });

    expect(result).toBeNull();
  });
});
