import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { describe, expect, it } from 'vitest';

import {
  parseCandidateListQuery,
  parseCandidateReviewRequest,
} from '../functions/_lib/content-pipeline-candidate-admin';
import { upsertCandidate } from '../functions/_lib/content-pipeline-candidate-repository';
import type { CandidateRecord } from '../functions/_lib/content-pipeline-candidate-import';
import { onRequestGet as candidatesGet } from '../functions/api/admin/content-pipeline/candidates/index';
import { onRequestPost as candidateReviewPost } from '../functions/api/admin/content-pipeline/candidates/review';

const ADMIN_TOKEN = 'test-admin-token';

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

function adminGetRequest(path: string, token = ADMIN_TOKEN): Request {
  return new Request(`https://www.lougehrigfanclub.com${path}`, {
    headers: { 'x-admin-token': token },
  });
}

function adminPostRequest(path: string, body: unknown, token = ADMIN_TOKEN): Request {
  return new Request(`https://www.lougehrigfanclub.com${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
    body: JSON.stringify(body),
  });
}

function publicApiFiles(): string[] {
  const apiRoot = path.join(process.cwd(), 'functions/api');
  const results: string[] = [];

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'admin') {
          continue;
        }
        walk(fullPath);
        continue;
      }
      if (entry.name.endsWith('.ts')) {
        results.push(fullPath);
      }
    }
  }

  walk(apiRoot);
  return results;
}

describe('content pipeline candidate admin API (#2310)', () => {
  it('parses list query filters and rejects invalid values', () => {
    const valid = parseCandidateListQuery(
      new URL('https://example.com/api/admin/content-pipeline/candidates?review_status=pending_review&limit=10'),
    );
    expect(valid.ok).toBe(true);

    const invalid = parseCandidateListQuery(
      new URL('https://example.com/api/admin/content-pipeline/candidates?review_status=not_real'),
    );
    expect(invalid.ok).toBe(false);
  });

  it('parses review requests and rejects invalid candidate_id values', () => {
    const valid = parseCandidateReviewRequest({
      candidate_id: 'lgfc-gehrig-2026-999',
      review_status: 'approved_internal_reference',
    });
    expect(valid.ok).toBe(true);

    const invalid = parseCandidateReviewRequest({
      candidate_id: 'bad-id',
      review_status: 'approved_internal_reference',
    });
    expect(invalid.ok).toBe(false);
  });

  it('returns 401 without admin authorization', async () => {
    const response = await candidatesGet({
      env: { DB: {}, ADMIN_TOKEN },
      request: adminGetRequest('/api/admin/content-pipeline/candidates', 'wrong-token'),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ ok: false, error: 'Unauthorized.' });
  });

  it('returns 503 when admin token is not configured', async () => {
    const response = await candidatesGet({
      env: { DB: {} },
      request: adminGetRequest('/api/admin/content-pipeline/candidates'),
    });

    expect(response.status).toBe(503);
  });

  it('lists and fetches candidates through admin routes', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);
    await upsertCandidate(db, minimalCandidate({ candidate_id: 'lgfc-gehrig-2026-801' }));
    await upsertCandidate(
      db,
      minimalCandidate({
        candidate_id: 'lgfc-gehrig-2026-802',
        review_status: 'approved_internal_reference',
      }),
    );

    const listResponse = await candidatesGet({
      env: { DB: db, ADMIN_TOKEN },
      request: adminGetRequest('/api/admin/content-pipeline/candidates?review_status=approved_internal_reference'),
    });
    expect(listResponse.status).toBe(200);
    const listBody = await listResponse.json();
    expect(listBody.ok).toBe(true);
    expect(listBody.count).toBe(1);
    expect(listBody.candidates[0].candidate_id).toBe('lgfc-gehrig-2026-802');

    const getResponse = await candidatesGet({
      env: { DB: db, ADMIN_TOKEN },
      request: adminGetRequest('/api/admin/content-pipeline/candidates?candidate_id=lgfc-gehrig-2026-801'),
    });
    expect(getResponse.status).toBe(200);
    const getBody = await getResponse.json();
    expect(getBody.candidate.candidate_id).toBe('lgfc-gehrig-2026-801');
  });

  it('returns 404 for missing candidates and 400 for invalid review payloads', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    const missing = await candidatesGet({
      env: { DB: db, ADMIN_TOKEN },
      request: adminGetRequest('/api/admin/content-pipeline/candidates?candidate_id=lgfc-gehrig-2026-404'),
    });
    expect(missing.status).toBe(404);

    const invalidReview = await candidateReviewPost({
      env: { DB: db, ADMIN_TOKEN },
      request: adminPostRequest('/api/admin/content-pipeline/candidates/review', {
        candidate_id: 'lgfc-gehrig-2026-404',
        review_status: 'not_a_valid_status',
      }),
    });
    expect(invalidReview.status).toBe(400);
  });

  it('applies allowed review-state updates through the admin review route', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);
    await upsertCandidate(db, minimalCandidate());

    const response = await candidateReviewPost({
      env: { DB: db, ADMIN_TOKEN },
      request: adminPostRequest('/api/admin/content-pipeline/candidates/review', {
        candidate_id: 'lgfc-gehrig-2026-999',
        review_status: 'approved_internal_reference',
        rights_status: 'permission_needed',
        actor: 'operator@test',
        notes: 'Initial review',
      }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.candidate.review_status).toBe('approved_internal_reference');
    expect(body.candidate.rights_status).toBe('permission_needed');

    const eventCount = sqlite
      .prepare(
        `SELECT COUNT(*) AS count
         FROM moderation_events me
         JOIN content_items ci ON ci.id = me.content_item_id
         WHERE ci.candidate_id = ?`,
      )
      .get('lgfc-gehrig-2026-999') as { count: number };
    expect(eventCount.count).toBe(2);
  });

  it('does not expose candidate repository routes on public API surfaces', () => {
    for (const filePath of publicApiFiles()) {
      const source = fs.readFileSync(filePath, 'utf8');
      expect(source.includes('content-pipeline-candidate-repository')).toBe(false);
      expect(source.includes('content-pipeline-candidate-admin')).toBe(false);
    }
  });

  it('registers admin routes only under /api/admin/content-pipeline', () => {
    expect(fs.existsSync('functions/api/admin/content-pipeline/candidates/index.ts')).toBe(true);
    expect(fs.existsSync('functions/api/admin/content-pipeline/candidates/review.ts')).toBe(true);
    expect(fs.existsSync('functions/api/content-pipeline/candidates.ts')).toBe(false);
  });
});
