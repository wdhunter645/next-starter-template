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
  restoreSoftDeletedCandidate,
  softDeleteCandidate,
  updateCandidateRetention,
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
        const results: unknown[] = [];
        for (const statement of statements) {
          results.push(await statement.run());
        }
        sqlite.exec('COMMIT');
        return results;
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
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
          const result = stmt.run(...args);
          return { success: true, meta: { changes: result.changes } };
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
          const result = stmt.run();
          return { success: true, meta: { changes: result.changes } };
        },
      };
    },
  };
}

function wrapSqliteAsD1WithFailingAuditInsertOn(
  sqlite: DatabaseSync,
  shouldFail: (sql: string, args: readonly SQLInputValue[]) => boolean,
) {
  const base = wrapSqliteAsD1(sqlite);
  return {
    ...base,
    prepare(sql: string) {
      const prepared = base.prepare(sql);
      return {
        bind: (...args: SQLInputValue[]) => {
          const bound = prepared.bind(...args);
          return {
            ...bound,
            async run() {
              if (shouldFail(sql, args)) {
                throw new Error('moderation_events insert failed');
              }
              return bound.run();
            },
          };
        },
        async first() {
          return prepared.first();
        },
        async all() {
          return prepared.all();
        },
        async run() {
          if (shouldFail(sql, [])) {
            throw new Error('moderation_events insert failed');
          }
          return prepared.run();
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

  it('audits registry upserts when nullable optional fields change between null and empty string', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    await upsertCandidate(
      db,
      minimalCandidate({
        admin_notes: '',
        media_asset_id: '',
      }),
    );

    await upsertCandidate(
      db,
      minimalCandidate({
        updated_at: '2026-07-07T11:00:00.000Z',
      }),
    );

    const clearEvents = sqlite
      .prepare(
        `SELECT from_state, to_state
         FROM moderation_events me
         JOIN content_items ci ON ci.id = me.content_item_id
         WHERE ci.candidate_id = ?
           AND me.notes = 'candidate registry upsert'
         ORDER BY me.id ASC`,
      )
      .all('lgfc-gehrig-2026-999') as Array<{ from_state: string | null; to_state: string | null }>;

    expect(clearEvents).toHaveLength(2);
    expect(JSON.parse(clearEvents.find((event) => event.from_state?.includes('admin_notes'))!.from_state!)).toMatchObject({
      admin_notes: '',
    });
    expect(JSON.parse(clearEvents.find((event) => event.from_state?.includes('admin_notes'))!.to_state!)).toMatchObject({
      admin_notes: null,
    });
    expect(JSON.parse(clearEvents.find((event) => event.from_state?.includes('media_asset_id'))!.from_state!)).toMatchObject({
      media_asset_id: '',
    });
    expect(JSON.parse(clearEvents.find((event) => event.from_state?.includes('media_asset_id'))!.to_state!)).toMatchObject({
      media_asset_id: null,
    });

    const upsertEventCountBeforeRestore = (
      sqlite
        .prepare(
          `SELECT COUNT(*) AS count
           FROM moderation_events me
           JOIN content_items ci ON ci.id = me.content_item_id
           WHERE ci.candidate_id = ?
             AND me.notes = 'candidate registry upsert'`,
        )
        .get('lgfc-gehrig-2026-999') as { count: number }
    ).count;

    await upsertCandidate(
      db,
      minimalCandidate({
        admin_notes: '',
        media_asset_id: '',
        updated_at: '2026-07-07T12:00:00.000Z',
      }),
    );

    const restoreEvents = sqlite
      .prepare(
        `SELECT from_state, to_state
         FROM moderation_events me
         JOIN content_items ci ON ci.id = me.content_item_id
         WHERE ci.candidate_id = ?
           AND me.notes = 'candidate registry upsert'
         ORDER BY me.id ASC`,
      )
      .all('lgfc-gehrig-2026-999') as Array<{
      from_state: string | null;
      to_state: string | null;
    }>;

    expect(restoreEvents.slice(upsertEventCountBeforeRestore)).toHaveLength(2);
    const restoredAdminEvent = restoreEvents
      .slice(upsertEventCountBeforeRestore)
      .find((event) => event.to_state?.includes('admin_notes'));
    const restoredMediaEvent = restoreEvents
      .slice(upsertEventCountBeforeRestore)
      .find((event) => event.to_state?.includes('media_asset_id'));
    expect(JSON.parse(restoredAdminEvent!.from_state!)).toMatchObject({
      admin_notes: null,
    });
    expect(JSON.parse(restoredAdminEvent!.to_state!)).toMatchObject({
      admin_notes: '',
    });
    expect(JSON.parse(restoredMediaEvent!.from_state!)).toMatchObject({
      media_asset_id: null,
    });
    expect(JSON.parse(restoredMediaEvent!.to_state!)).toMatchObject({
      media_asset_id: '',
    });
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

describe('content pipeline retention and soft-delete (#2339)', () => {
  function moderationEventsForCandidate(sqlite: DatabaseSync, candidateId: string) {
    return sqlite
      .prepare(
        `SELECT event_type, actor, notes, from_state, to_state
         FROM moderation_events me
         JOIN content_items ci ON ci.id = me.content_item_id
         WHERE ci.candidate_id = ?
         ORDER BY me.id ASC`,
      )
      .all(candidateId) as Array<{
      event_type: string;
      actor: string | null;
      notes: string | null;
      from_state: string | null;
      to_state: string | null;
    }>;
  }

  it('soft-deletes a candidate, records retention fields, and writes soft_delete audit', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    await upsertCandidate(db, minimalCandidate({ people_tags: ['Lou Gehrig'] }));

    const deleted = await softDeleteCandidate(
      db,
      'lgfc-gehrig-2026-999',
      {
        retention_reason: 'Retained for rights follow-up',
        purge_eligible_at: '2027-01-01T00:00:00.000Z',
      },
      { actor: 'operator@test', notes: 'Archive stale seed', deleted_at: '2026-07-07T12:00:00.000Z' },
    );

    expect(deleted?.title).toBe('Test candidate');
    expect(await getCandidateByCandidateId(db, 'lgfc-gehrig-2026-999')).toBeNull();
    expect(
      await getCandidateByCandidateId(db, 'lgfc-gehrig-2026-999', { includeDeleted: true }),
    ).not.toBeNull();

    const row = sqlite
      .prepare(
        `SELECT deleted_at, retention_reason, purge_eligible_at
         FROM content_items
         WHERE candidate_id = ?`,
      )
      .get('lgfc-gehrig-2026-999') as {
      deleted_at: string;
      retention_reason: string;
      purge_eligible_at: string;
    };

    expect(row.deleted_at).toBe('2026-07-07T12:00:00.000Z');
    expect(row.retention_reason).toBe('Retained for rights follow-up');
    expect(row.purge_eligible_at).toBe('2027-01-01T00:00:00.000Z');

    const tagCount = sqlite
      .prepare(
        `SELECT COUNT(*) AS count
         FROM content_item_tags cit
         JOIN content_items ci ON ci.id = cit.content_item_id
         WHERE ci.candidate_id = ?`,
      )
      .get('lgfc-gehrig-2026-999') as { count: number };
    expect(tagCount.count).toBe(1);

    const events = moderationEventsForCandidate(sqlite, 'lgfc-gehrig-2026-999');
    const softDeleteEvent = events.find((event) => event.event_type === 'soft_delete');
    expect(softDeleteEvent).toMatchObject({
      actor: 'operator@test',
      notes: 'Archive stale seed',
    });
    expect(JSON.parse(softDeleteEvent!.from_state!)).toMatchObject({
      deleted_at: null,
      retention_reason: null,
      purge_eligible_at: null,
    });
    expect(JSON.parse(softDeleteEvent!.to_state!)).toMatchObject({
      deleted_at: '2026-07-07T12:00:00.000Z',
      retention_reason: 'Retained for rights follow-up',
      purge_eligible_at: '2027-01-01T00:00:00.000Z',
    });
  });

  it('no-ops duplicate soft-delete calls without writing another audit row', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    await upsertCandidate(db, minimalCandidate());
    await softDeleteCandidate(
      db,
      'lgfc-gehrig-2026-999',
      { retention_reason: 'Retained for audit trail' },
      { deleted_at: '2026-07-07T12:00:00.000Z' },
    );

    const eventCountBefore = moderationEventsForCandidate(sqlite, 'lgfc-gehrig-2026-999').length;
    const softDeleteEventsBefore = moderationEventsForCandidate(sqlite, 'lgfc-gehrig-2026-999').filter(
      (event) => event.event_type === 'soft_delete',
    ).length;
    const second = await softDeleteCandidate(db, 'lgfc-gehrig-2026-999', {
      retention_reason: 'Different reason',
    });

    expect(second).not.toBeNull();
    expect(moderationEventsForCandidate(sqlite, 'lgfc-gehrig-2026-999').length).toBe(eventCountBefore);
    expect(
      moderationEventsForCandidate(sqlite, 'lgfc-gehrig-2026-999').filter(
        (event) => event.event_type === 'soft_delete',
      ).length,
    ).toBe(softDeleteEventsBefore);
  });

  it('does not write soft_delete audit when guarded update reports zero changed rows', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    await upsertCandidate(db, minimalCandidate());
    await softDeleteCandidate(
      db,
      'lgfc-gehrig-2026-999',
      { retention_reason: 'Retained for audit trail' },
      { deleted_at: '2026-07-07T12:00:00.000Z' },
    );

    const softDeleteEventsBefore = moderationEventsForCandidate(sqlite, 'lgfc-gehrig-2026-999').filter(
      (event) => event.event_type === 'soft_delete',
    ).length;

    await softDeleteCandidate(db, 'lgfc-gehrig-2026-999', {
      retention_reason: 'Different reason',
    });

    expect(
      moderationEventsForCandidate(sqlite, 'lgfc-gehrig-2026-999').filter(
        (event) => event.event_type === 'soft_delete',
      ).length,
    ).toBe(softDeleteEventsBefore);
    expect(await getCandidateByCandidateId(db, 'lgfc-gehrig-2026-999')).toBeNull();
  });

  it('updates retention fields without deleting and writes retention_update audit', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    await upsertCandidate(db, minimalCandidate());

    const updated = await updateCandidateRetention(
      db,
      'lgfc-gehrig-2026-999',
      {
        retention_reason: 'Legal hold',
        purge_eligible_at: '2028-06-01T00:00:00.000Z',
      },
      { actor: 'operator@test' },
    );

    expect(updated).not.toBeNull();
    expect(await getCandidateByCandidateId(db, 'lgfc-gehrig-2026-999')).not.toBeNull();

    const row = sqlite
      .prepare(
        `SELECT deleted_at, retention_reason, purge_eligible_at
         FROM content_items
         WHERE candidate_id = ?`,
      )
      .get('lgfc-gehrig-2026-999') as {
      deleted_at: string | null;
      retention_reason: string;
      purge_eligible_at: string;
    };

    expect(row.deleted_at).toBeNull();
    expect(row.retention_reason).toBe('Legal hold');
    expect(row.purge_eligible_at).toBe('2028-06-01T00:00:00.000Z');

    const retentionEvent = moderationEventsForCandidate(sqlite, 'lgfc-gehrig-2026-999').find(
      (event) => event.event_type === 'retention_update',
    );
    expect(retentionEvent?.actor).toBe('operator@test');
    expect(JSON.parse(retentionEvent!.to_state!)).toMatchObject({
      retention_reason: 'Legal hold',
      purge_eligible_at: '2028-06-01T00:00:00.000Z',
    });
  });

  it('skips retention_update audit when retention values do not change', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    await upsertCandidate(db, minimalCandidate());
    await updateCandidateRetention(db, 'lgfc-gehrig-2026-999', {
      retention_reason: 'Legal hold',
      purge_eligible_at: '2028-06-01T00:00:00.000Z',
    });

    const eventCountBefore = moderationEventsForCandidate(sqlite, 'lgfc-gehrig-2026-999').length;
    await updateCandidateRetention(db, 'lgfc-gehrig-2026-999', {
      retention_reason: 'Legal hold',
      purge_eligible_at: '2028-06-01T00:00:00.000Z',
    });

    expect(moderationEventsForCandidate(sqlite, 'lgfc-gehrig-2026-999').length).toBe(eventCountBefore);
  });

  it('does not write retention_update audit when guarded retention update changes zero rows', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    await upsertCandidate(db, minimalCandidate());
    await updateCandidateRetention(db, 'lgfc-gehrig-2026-999', {
      retention_reason: 'Legal hold',
      purge_eligible_at: '2028-06-01T00:00:00.000Z',
    });

    const retentionEventsBefore = moderationEventsForCandidate(sqlite, 'lgfc-gehrig-2026-999').filter(
      (event) => event.event_type === 'retention_update',
    ).length;

    await updateCandidateRetention(db, 'lgfc-gehrig-2026-999', {
      retention_reason: 'Legal hold',
      purge_eligible_at: '2028-06-01T00:00:00.000Z',
    });

    expect(
      moderationEventsForCandidate(sqlite, 'lgfc-gehrig-2026-999').filter(
        (event) => event.event_type === 'retention_update',
      ).length,
    ).toBe(retentionEventsBefore);
  });

  it('restores a soft-deleted candidate and audits via retention_update', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    await upsertCandidate(db, minimalCandidate());
    await softDeleteCandidate(
      db,
      'lgfc-gehrig-2026-999',
      { retention_reason: 'Temporary archive' },
      { deleted_at: '2026-07-07T12:00:00.000Z' },
    );

    const restored = await restoreSoftDeletedCandidate(db, 'lgfc-gehrig-2026-999', {
      actor: 'operator@test',
      notes: 'Restore after review',
    });

    expect(restored?.title).toBe('Test candidate');
    expect(await getCandidateByCandidateId(db, 'lgfc-gehrig-2026-999')).not.toBeNull();

    const row = sqlite
      .prepare(`SELECT deleted_at, retention_reason FROM content_items WHERE candidate_id = ?`)
      .get('lgfc-gehrig-2026-999') as { deleted_at: string | null; retention_reason: string };

    expect(row.deleted_at).toBeNull();
    expect(row.retention_reason).toBe('Temporary archive');

    const restoreEvent = moderationEventsForCandidate(sqlite, 'lgfc-gehrig-2026-999')
      .filter((event) => event.event_type === 'retention_update')
      .at(-1);
    expect(restoreEvent).toMatchObject({
      actor: 'operator@test',
      notes: 'Restore after review',
    });
    expect(JSON.parse(restoreEvent!.from_state!)).toMatchObject({
      deleted_at: '2026-07-07T12:00:00.000Z',
    });
    expect(JSON.parse(restoreEvent!.to_state!)).toMatchObject({
      deleted_at: null,
      retention_reason: 'Temporary archive',
    });
  });

  it('does not write retention_update audit when restore guarded update changes zero rows', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    await upsertCandidate(db, minimalCandidate());

    const eventsBefore = moderationEventsForCandidate(sqlite, 'lgfc-gehrig-2026-999').length;
    await restoreSoftDeletedCandidate(db, 'lgfc-gehrig-2026-999');

    expect(moderationEventsForCandidate(sqlite, 'lgfc-gehrig-2026-999').length).toBe(eventsBefore);
    expect(
      moderationEventsForCandidate(sqlite, 'lgfc-gehrig-2026-999').some(
        (event) => event.event_type === 'retention_update' && event.notes === 'candidate restore',
      ),
    ).toBe(false);
  });

  it('does not write restore audit when guarded update reports zero changed rows on deleted row', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    await upsertCandidate(db, minimalCandidate());
    await softDeleteCandidate(
      db,
      'lgfc-gehrig-2026-999',
      { retention_reason: 'Temporary archive' },
      { deleted_at: '2026-07-07T12:00:00.000Z' },
    );
    await restoreSoftDeletedCandidate(db, 'lgfc-gehrig-2026-999');

    const restoreEventsBefore = moderationEventsForCandidate(sqlite, 'lgfc-gehrig-2026-999').filter(
      (event) => event.event_type === 'retention_update' && event.notes === 'candidate restore',
    ).length;

    await restoreSoftDeletedCandidate(db, 'lgfc-gehrig-2026-999');

    expect(
      moderationEventsForCandidate(sqlite, 'lgfc-gehrig-2026-999').filter(
        (event) => event.event_type === 'retention_update' && event.notes === 'candidate restore',
      ).length,
    ).toBe(restoreEventsBefore);
    expect(await getCandidateByCandidateId(db, 'lgfc-gehrig-2026-999')).not.toBeNull();
  });

  it('rolls back retention mutation when audit insert fails inside the transaction', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1WithFailingAuditInsertOn(
      sqlite,
      (sql, args) => sql.includes('INSERT INTO moderation_events') && args[1] === 'soft_delete',
    );

    await upsertCandidate(db, minimalCandidate());

    await expect(
      softDeleteCandidate(db, 'lgfc-gehrig-2026-999', {
        retention_reason: 'Should not persist',
      }),
    ).rejects.toThrow('moderation_events insert failed');

    const row = sqlite
      .prepare(`SELECT deleted_at, retention_reason FROM content_items WHERE candidate_id = ?`)
      .get('lgfc-gehrig-2026-999') as { deleted_at: string | null; retention_reason: string | null };

    expect(row.deleted_at).toBeNull();
    expect(row.retention_reason).toBeNull();
    expect(
      moderationEventsForCandidate(sqlite, 'lgfc-gehrig-2026-999').some(
        (event) => event.event_type === 'soft_delete',
      ),
    ).toBe(false);
  });

  it('excludes soft-deleted candidates from default list and includes them when requested', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    await upsertCandidate(
      db,
      minimalCandidate({
        candidate_id: 'lgfc-gehrig-2026-801',
      }),
    );
    await upsertCandidate(
      db,
      minimalCandidate({
        candidate_id: 'lgfc-gehrig-2026-802',
      }),
    );

    await softDeleteCandidate(
      db,
      'lgfc-gehrig-2026-801',
      { retention_reason: 'Archived seed' },
      { deleted_at: '2026-07-07T12:00:00.000Z' },
    );

    expect((await listCandidates(db)).map((candidate) => candidate.candidate_id)).toEqual([
      'lgfc-gehrig-2026-802',
    ]);
    expect(
      (await listCandidates(db, { include_deleted: true })).map((candidate) => candidate.candidate_id).sort(),
    ).toEqual(['lgfc-gehrig-2026-801', 'lgfc-gehrig-2026-802']);
  });

  it('does not physically delete content_items or moderation_events rows', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    await upsertCandidate(db, minimalCandidate({ people_tags: ['Lou Gehrig'] }));
    await softDeleteCandidate(db, 'lgfc-gehrig-2026-999', {
      retention_reason: 'Retained for audit trail',
    });

    const counts = sqlite
      .prepare(
        `SELECT
           (SELECT COUNT(*) FROM content_items WHERE candidate_id = ?) AS content_items,
           (SELECT COUNT(*) FROM content_item_tags cit
              JOIN content_items ci ON ci.id = cit.content_item_id
             WHERE ci.candidate_id = ?) AS content_item_tags,
           (SELECT COUNT(*) FROM moderation_events me
              JOIN content_items ci ON ci.id = me.content_item_id
             WHERE ci.candidate_id = ?) AS moderation_events`,
      )
      .get('lgfc-gehrig-2026-999', 'lgfc-gehrig-2026-999', 'lgfc-gehrig-2026-999') as {
      content_items: number;
      content_item_tags: number;
      moderation_events: number;
    };

    expect(counts.content_items).toBe(1);
    expect(counts.content_item_tags).toBe(1);
    expect(counts.moderation_events).toBeGreaterThanOrEqual(2);
  });

  it('rejects retention mutations when the database has no transactional batch primitive', async () => {
    const db = {
      prepare() {
        return {
          bind: () => ({
            async first() {
              return {
                id: 1,
                deleted_at: null,
                retention_reason: null,
                purge_eligible_at: null,
              };
            },
            async all() {
              return { results: [] };
            },
            async run() {
              return { success: true, meta: { changes: 1 } };
            },
          }),
          async first() {
            return null;
          },
          async all() {
            return { results: [] };
          },
          async run() {
            return { success: true, meta: { changes: 1 } };
          },
        };
      },
    };

    await expect(
      softDeleteCandidate(db, 'lgfc-gehrig-2026-999', { retention_reason: 'No batch support' }),
    ).rejects.toThrow('transactional batch execution');
  });
});
