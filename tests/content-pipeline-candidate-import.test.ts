import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';

import fixtureRegistry from '../data/research/lou-gehrig-content-candidates.json';
import {
  buildCandidateImportPlan,
  CONTENT_PIPELINE_CORE_TABLES,
  validateCandidateRegistry,
  type CandidateRecord,
  type CandidateRegistry,
} from '../functions/_lib/content-pipeline-candidate-import';

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

function minimalRegistry(candidates: CandidateRecord[]): CandidateRegistry {
  return {
    schema_version: '1',
    registry_class: 'fixture',
    candidates,
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

describe('content pipeline candidate import (#2288)', () => {
  it('validates the fixture registry JSON', () => {
    const result = validateCandidateRegistry(fixtureRegistry);
    expect(result.ok).toBe(true);
  });

  it('rejects invalid candidate_id patterns and missing member_submission extension', () => {
    const registry = minimalRegistry([
      minimalCandidate({ candidate_id: 'bad-id' }),
      minimalCandidate({
        candidate_id: 'lgfc-gehrig-2026-998',
        input_stream: 'member_submission',
      }),
    ]);

    const result = validateCandidateRegistry(registry);
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.errors.some((error) => error.includes('candidate_id must match'))).toBe(true);
    expect(result.errors.some((error) => error.includes('member_submission object is required'))).toBe(
      true,
    );
  });

  it('builds idempotent upsert SQL on candidate_id', () => {
    const registry = minimalRegistry([minimalCandidate()]);
    const plan = buildCandidateImportPlan(registry);

    expect(plan.candidateCount).toBe(1);
    expect(plan.statements.some((statement) => statement.table === 'content_items')).toBe(true);

    const upsert = plan.statements.find((statement) => statement.table === 'content_items');
    expect(upsert?.sql).toContain('ON CONFLICT(candidate_id) DO UPDATE SET');
    expect(upsert?.sql).toContain("'lgfc-gehrig-2026-999'");
  });

  it('produces stable statement counts for repeated import plan builds', () => {
    const first = buildCandidateImportPlan(fixtureRegistry as CandidateRegistry);
    const second = buildCandidateImportPlan(fixtureRegistry as CandidateRegistry);

    expect(first.candidateCount).toBe(second.candidateCount);
    expect(first.statements.length).toBe(second.statements.length);
    expect(first.statements.map((statement) => statement.description)).toEqual(
      second.statements.map((statement) => statement.description),
    );
  });

  it('includes member submission and publication prep statements when applicable', () => {
    const registry = minimalRegistry([
      minimalCandidate({
        candidate_id: 'lgfc-gehrig-2026-901',
        input_stream: 'member_submission',
        publication_status: 'approved_for_publish',
        publication_target: 'library',
        credit_line: 'Courtesy of Test Submitter',
        member_submission: {
          submitter_name: 'Test Submitter',
          submitter_contact: 'member-901@example.com',
          submission_type: 'story',
          ownership_statement: 'I own this story.',
          permission_statement: 'LGFC may review this story.',
          credit_preference: 'public_credit',
          consent_status: 'pending',
          admin_followup_required: true,
        },
      }),
    ]);

    const plan = buildCandidateImportPlan(registry);
    expect(plan.statements.some((statement) => statement.table === 'member_submissions')).toBe(true);
    expect(plan.statements.some((statement) => statement.table === 'publication_candidates')).toBe(
      true,
    );
  });
});

describe('content pipeline migration schema (#2288)', () => {
  it('creates core tables with expected constraints after full migration apply', () => {
    const db = new DatabaseSync(':memory:');
    applyRepoMigrations(db);

    const tables = db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name`,
      )
      .all()
      .map((row) => String((row as { name: string }).name));

    for (const table of CONTENT_PIPELINE_CORE_TABLES) {
      expect(tables).toContain(table);
    }
  });

  it('enforces unique candidate_id and review-state check constraints', () => {
    const db = new DatabaseSync(':memory:');
    applyRepoMigrations(db);

    const insert = db.prepare(`
      INSERT INTO content_items (
        candidate_id, input_stream, title, source_name, source_type, content_type, summary,
        rights_status, source_trust_status, relevance_status, review_status, publication_status,
        privacy_flag, privacy_review_status, review_priority, created_at, updated_at
      ) VALUES (
        ?, 'admin_seed', 'Title', 'Source', 'operator', 'story', 'Summary',
        'unknown', 'pending', 'pending', 'pending_review', 'not_ready',
        'none', 'not_applicable', 'normal', '2026-07-05T16:00:00.000Z', '2026-07-05T16:00:00.000Z'
      )
    `);

    insert.run('lgfc-gehrig-2026-101');
    expect(() => insert.run('lgfc-gehrig-2026-101')).toThrow();

    expect(() =>
      db.prepare(`
        INSERT INTO content_items (
          candidate_id, input_stream, title, source_name, source_type, content_type, summary,
          rights_status, source_trust_status, relevance_status, review_status, publication_status,
          privacy_flag, privacy_review_status, review_priority, created_at, updated_at
        ) VALUES (
          'lgfc-gehrig-2026-102', 'admin_seed', 'Title', 'Source', 'operator', 'story', 'Summary',
          'unknown', 'pending', 'pending', 'not_a_real_status', 'not_ready',
          'none', 'not_applicable', 'normal', '2026-07-05T16:00:00.000Z', '2026-07-05T16:00:00.000Z'
        )
      `).run(),
    ).toThrow();
  });

  it('supports tag joins and append-only moderation events', () => {
    const db = new DatabaseSync(':memory:');
    applyRepoMigrations(db);

    db.exec(`
      INSERT INTO content_items (
        candidate_id, input_stream, title, source_name, source_type, content_type, summary,
        rights_status, source_trust_status, relevance_status, review_status, publication_status,
        privacy_flag, privacy_review_status, review_priority, created_at, updated_at
      ) VALUES (
        'lgfc-gehrig-2026-201', 'admin_seed', 'Tagged item', 'Source', 'operator', 'story', 'Summary',
        'unknown', 'pending', 'relevant', 'pending_review', 'not_ready',
        'none', 'not_applicable', 'high', '2026-07-05T16:00:00.000Z', '2026-07-05T16:00:00.000Z'
      );
      INSERT INTO tags (tag_name, tag_category) VALUES ('Lou Gehrig', 'people');
      INSERT INTO content_item_tags (content_item_id, tag_id)
      SELECT ci.id, t.id FROM content_items ci, tags t
      WHERE ci.candidate_id = 'lgfc-gehrig-2026-201' AND t.tag_name = 'Lou Gehrig';
      INSERT INTO moderation_events (content_item_id, event_type, actor, from_state, to_state, notes)
      SELECT id, 'review_state_change', 'operator@test', '{"review_status":"pending_review"}', '{"review_status":"approved_internal_reference"}', 'reviewed'
      FROM content_items WHERE candidate_id = 'lgfc-gehrig-2026-201';
    `);

    const tagCount = db
      .prepare(
        `SELECT COUNT(*) AS count
         FROM content_item_tags cit
         JOIN content_items ci ON ci.id = cit.content_item_id
         WHERE ci.candidate_id = 'lgfc-gehrig-2026-201'`,
      )
      .get() as { count: number };

    const eventCount = db
      .prepare(
        `SELECT COUNT(*) AS count
         FROM moderation_events me
         JOIN content_items ci ON ci.id = me.content_item_id
         WHERE ci.candidate_id = 'lgfc-gehrig-2026-201'`,
      )
      .get() as { count: number };

    expect(tagCount.count).toBe(1);
    expect(eventCount.count).toBe(1);
  });

  it('applies import SQL idempotently on candidate_id', () => {
    const db = new DatabaseSync(':memory:');
    applyRepoMigrations(db);

    const registry = minimalRegistry([
      minimalCandidate({
        people_tags: ['Lou Gehrig'],
        topic_tags: ['Yankees'],
      }),
    ]);
    const plan = buildCandidateImportPlan(registry);

    for (const statement of plan.statements) {
      db.exec(statement.sql);
    }
    const firstCount = db
      .prepare('SELECT COUNT(*) AS count FROM content_items WHERE candidate_id = ?')
      .get('lgfc-gehrig-2026-999') as { count: number };

    for (const statement of plan.statements) {
      db.exec(statement.sql);
    }
    const secondCount = db
      .prepare('SELECT COUNT(*) AS count FROM content_items WHERE candidate_id = ?')
      .get('lgfc-gehrig-2026-999') as { count: number };

    expect(firstCount.count).toBe(1);
    expect(secondCount.count).toBe(1);
  });
});
