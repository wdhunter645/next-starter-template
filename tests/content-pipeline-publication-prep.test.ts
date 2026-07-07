import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { describe, expect, it } from 'vitest';

import type { CandidateRecord } from '../functions/_lib/content-pipeline-candidate-import';
import { upsertCandidate } from '../functions/_lib/content-pipeline-candidate-repository';
import {
  evaluatePublicationPrepEligibility,
  parsePublicationPrepListQuery,
  serializePublicationPrepView,
} from '../functions/_lib/content-pipeline-publication-prep';
import { serializeAdminMediaReferences } from '../functions/_lib/content-pipeline-media-reference';
import { onRequestGet as publicationPrepGet } from '../functions/api/admin/content-pipeline/publication-prep/index';

const ADMIN_TOKEN = 'test-admin-token';

function eligibleCandidate(overrides: Partial<CandidateRecord> = {}): CandidateRecord {
  return {
    candidate_id: 'lgfc-gehrig-2026-901',
    input_stream: 'admin_seed',
    title: 'Prep-ready candidate',
    source_name: 'LGFC Operator',
    source_type: 'operator',
    content_type: 'story',
    summary: 'Eligible summary',
    rights_status: 'permission_granted',
    source_trust_status: 'trusted',
    relevance_status: 'relevant',
    review_status: 'approved_public_candidate',
    publication_status: 'draft_candidate',
    publication_target: 'library',
    privacy_flag: 'none',
    privacy_review_status: 'not_applicable',
    credit_line: 'LGFC Archives',
    review_priority: 'normal',
    created_at: '2026-07-07T08:00:00.000Z',
    updated_at: '2026-07-07T08:00:00.000Z',
    ...overrides,
  };
}

function applyRepoMigrations(db: DatabaseSync) {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  for (const file of fs.readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort()) {
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

function adminGetRequest(pathname: string, token = ADMIN_TOKEN): Request {
  return new Request(`https://www.lougehrigfanclub.com${pathname}`, {
    headers: { 'x-admin-token': token },
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

function importsProtectedModule(source: string, moduleName: string): boolean {
  const patterns = [
    new RegExp(`\\bfrom\\s+['"][^'"]*${moduleName}['"]`, 'm'),
    new RegExp(`\\bimport\\s*\\(\\s*['"][^'"]*${moduleName}['"]`, 'm'),
    new RegExp(`\\bexport\\s+[^;\\n]*\\bfrom\\s+['"][^'"]*${moduleName}['"]`, 'm'),
  ];
  return patterns.some((pattern) => pattern.test(source));
}

describe('content pipeline publication prep (#2324)', () => {
  it('marks fully reviewed candidates as eligible', () => {
    const eligibility = evaluatePublicationPrepEligibility(eligibleCandidate());
    expect(eligibility.eligible).toBe(true);
    expect(eligibility.reasons).toEqual([]);
  });

  it('blocks ineligible review, rights, privacy, duplicate, and publication states with rationale', () => {
    const rejected = evaluatePublicationPrepEligibility(
      eligibleCandidate({ review_status: 'rejected' }),
    );
    expect(rejected.eligible).toBe(false);
    expect(rejected.reasons).toContain('review_status must be an approved review state');

    const rights = evaluatePublicationPrepEligibility(
      eligibleCandidate({ rights_status: 'permission_needed' }),
    );
    expect(rights.eligible).toBe(false);
    expect(rights.reasons).toContain(
      'rights_status must be permission_granted or public_domain_candidate',
    );

    const privacy = evaluatePublicationPrepEligibility(
      eligibleCandidate({ privacy_review_status: 'pending_review' }),
    );
    expect(privacy.eligible).toBe(false);
    expect(privacy.reasons).toContain('privacy_review_status must be approved or not_applicable');

    const duplicate = evaluatePublicationPrepEligibility(
      eligibleCandidate({ duplicate_of: 'lgfc-gehrig-2026-001' }),
    );
    expect(duplicate.eligible).toBe(false);
    expect(duplicate.reasons).toContain('duplicate_of must be unset before publication prep');

    const published = evaluatePublicationPrepEligibility(
      eligibleCandidate({ publication_status: 'published', content_inventory_id: 42 }),
    );
    expect(published.eligible).toBe(false);
    expect(published.reasons).toContain('publication_status must not be published or archived');
  });

  it('blocks member submissions without granted consent', () => {
    const eligibility = evaluatePublicationPrepEligibility(
      eligibleCandidate({ input_stream: 'member_submission' }),
      {
        submission_type: 'story',
        consent_status: 'pending',
        credit_preference: 'public_credit',
        admin_followup_required: true,
      },
    );

    expect(eligibility.eligible).toBe(false);
    expect(eligibility.reasons).toContain('member submissions require consent_status granted');
  });

  it('serializes admin-safe publication prep views without private member fields', () => {
    const candidate = eligibleCandidate({
      input_stream: 'member_submission',
      provenance_notes: 'private operator notes',
      admin_notes: 'internal only',
    });
    const eligibility = evaluatePublicationPrepEligibility(candidate, {
      submission_type: 'story',
      consent_status: 'granted',
      credit_preference: 'anonymous',
      admin_followup_required: false,
    });
    const view = serializePublicationPrepView({
      candidate: {
        ...candidate,
        id: 1,
        tags: { people: ['Lou Gehrig'], topics: [], places: [] },
      },
      mediaReferences: serializeAdminMediaReferences(candidate),
      eligibility,
      memberSubmission: {
        submission_type: 'story',
        consent_status: 'granted',
        credit_preference: 'anonymous',
        admin_followup_required: false,
      },
    });

    expect(view.candidate_id).toBe('lgfc-gehrig-2026-901');
    expect(view.member_submission?.consent_status).toBe('granted');
    expect(view).not.toHaveProperty('admin_notes');
    expect(view).not.toHaveProperty('provenance_notes');
    expect(view).not.toHaveProperty('submitter_name');
    expect(view).not.toHaveProperty('submitter_contact');
    expect(view).not.toHaveProperty('privacy_notes');
  });

  it('parses publication prep list query and defaults to eligible_only', () => {
    const parsed = parsePublicationPrepListQuery(
      new URL('https://example.com/api/admin/content-pipeline/publication-prep?limit=25'),
    );
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.filter.limit).toBe(25);
      expect(parsed.filter.eligible_only).toBe(true);
    }
  });

  it('returns 401 without admin authorization', async () => {
    const response = await publicationPrepGet({
      env: { DB: {}, ADMIN_TOKEN },
      request: adminGetRequest('/api/admin/content-pipeline/publication-prep', 'wrong-token'),
    });

    expect(response.status).toBe(401);
  });

  it('lists eligible candidates and returns ineligible detail with rationale', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    await upsertCandidate(db, eligibleCandidate({ candidate_id: 'lgfc-gehrig-2026-911' }));
    await upsertCandidate(
      db,
      eligibleCandidate({
        candidate_id: 'lgfc-gehrig-2026-912',
        review_status: 'pending_review',
        publication_status: 'not_ready',
      }),
    );

    const listResponse = await publicationPrepGet({
      env: { DB: db, ADMIN_TOKEN },
      request: adminGetRequest('/api/admin/content-pipeline/publication-prep'),
    });
    expect(listResponse.status).toBe(200);
    const listBody = await listResponse.json();
    expect(listBody.ok).toBe(true);
    expect(listBody.count).toBe(1);
    expect(listBody.publication_prep[0].candidate_id).toBe('lgfc-gehrig-2026-911');
    expect(listBody.publication_prep[0].eligibility.eligible).toBe(true);

    const detailResponse = await publicationPrepGet({
      env: { DB: db, ADMIN_TOKEN },
      request: adminGetRequest(
        '/api/admin/content-pipeline/publication-prep?candidate_id=lgfc-gehrig-2026-912',
      ),
    });
    expect(detailResponse.status).toBe(200);
    const detailBody = await detailResponse.json();
    expect(detailBody.publication_prep.eligibility.eligible).toBe(false);
    expect(detailBody.publication_prep.eligibility.reasons.length).toBeGreaterThan(0);
  });

  it('does not expose publication prep routes on public API surfaces', () => {
    for (const filePath of publicApiFiles()) {
      const source = fs.readFileSync(filePath, 'utf8');
      expect(importsProtectedModule(source, 'content-pipeline-publication-prep')).toBe(false);
    }
  });

  it('registers publication prep route only under /api/admin/content-pipeline', () => {
    expect(fs.existsSync('functions/api/admin/content-pipeline/publication-prep/index.ts')).toBe(true);
    expect(fs.existsSync('functions/api/content-pipeline/publication-prep.ts')).toBe(false);
  });
});
