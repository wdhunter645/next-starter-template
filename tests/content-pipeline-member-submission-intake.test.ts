import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { describe, expect, it } from 'vitest';

import {
  allocateMemberSubmissionCandidateId,
  buildMemberSubmissionCandidateRecord,
  candidateAllocationYearFromIso,
  computeAdminFollowupRequired,
  deriveMemberIntakeContentType,
  isCandidateIdUniqueConflict,
  parseMemberSubmissionIntakeBody,
  persistMemberSubmissionIntake,
  serializeMemberSubmissionIntakeResponse,
} from '../functions/_lib/content-pipeline-member-submission-intake';
import { onRequestPost as memberSubmitPost } from '../functions/api/library/content-pipeline/submit';

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

function seedMemberSession(db: DatabaseSync, sessionId = 'session-2316', email = 'member@example.com') {
  db.exec(`
    INSERT INTO members (email, role, created_at)
    VALUES ('${email}', 'member', datetime('now'));
    INSERT INTO member_sessions (id, email, expires_at, created_at, last_seen_at)
    VALUES ('${sessionId}', '${email}', datetime('now', '+30 days'), datetime('now'), datetime('now'));
  `);
}

function insertContentItemRow(sqlite: DatabaseSync, candidateId: string) {
  sqlite.exec(`
    INSERT INTO content_items (
      candidate_id, input_stream, title, source_name, source_type, content_type, summary,
      rights_status, source_trust_status, relevance_status, review_status, publication_status,
      privacy_flag, privacy_review_status, review_priority, source_metadata, created_at, updated_at
    ) VALUES (
      '${candidateId}', 'admin_seed', 'Existing', 'LGFC', 'operator', 'story', 'Existing summary',
      'unknown', 'pending', 'pending', 'pending_review', 'not_ready',
      'none', 'not_applicable', 'normal', '{}', '2026-07-06T19:00:00.000Z', '2026-07-06T19:00:00.000Z'
    );
  `);
}

function validIntakeBody(overrides: Record<string, unknown> = {}) {
  return {
    submitter_name: 'Jane Member',
    title: 'Grandpa at Yankee Stadium',
    summary: 'My grandfather attended a Gehrig game in 1938.',
    submission_type: 'story',
    ownership_statement: 'I own this family memory and related notes.',
    permission_statement: 'LGFC may use this story for internal review and possible publication with credit.',
    credit_preference: 'public_credit',
    consent_status: 'pending',
    ...overrides,
  };
}

function memberPostRequest(body: unknown, sessionId = 'session-2316'): Request {
  return new Request('https://www.lougehrigfanclub.com/api/library/content-pipeline/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `lgfc_session=${sessionId}`,
    },
    body: JSON.stringify(body),
  });
}

describe('content pipeline member submission intake (#2316)', () => {
  it('parses required intake fields and rejects member-controlled classification fields', () => {
    const parsed = parseMemberSubmissionIntakeBody(validIntakeBody());
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.request.admin_followup_required).toBe(true);
    }

    const missingTitle = parseMemberSubmissionIntakeBody(validIntakeBody({ title: '   ' }));
    expect(missingTitle.ok).toBe(false);

    const grantedConsent = parseMemberSubmissionIntakeBody(validIntakeBody({ consent_status: 'granted' }));
    expect(grantedConsent.ok).toBe(false);
    if (!grantedConsent.ok) {
      expect(grantedConsent.error).toContain('pending');
    }

    const suppliedSourceType = parseMemberSubmissionIntakeBody(validIntakeBody({ source_type: 'member' }));
    expect(suppliedSourceType.ok).toBe(false);
    if (!suppliedSourceType.ok) {
      expect(suppliedSourceType.error).toContain('source_type is not accepted');
    }

    const suppliedContentType = parseMemberSubmissionIntakeBody(validIntakeBody({ content_type: 'story' }));
    expect(suppliedContentType.ok).toBe(false);
    if (!suppliedContentType.ok) {
      expect(suppliedContentType.error).toContain('content_type is not accepted');
    }
  });

  it('derives candidate classification server-side from submission_type', () => {
    expect(deriveMemberIntakeContentType('memorabilia')).toBe('artifact');
    expect(candidateAllocationYearFromIso('2025-03-01T00:00:00.000Z')).toBe(2025);

    const parsed = parseMemberSubmissionIntakeBody(validIntakeBody({ submission_type: 'photo' }));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const candidate = buildMemberSubmissionCandidateRecord(parsed.request, {
      candidateId: 'lgfc-gehrig-2025-101',
      submitterContact: 'member@example.com',
      memberSubmitterId: 'member@example.com',
      now: '2025-03-01T00:00:00.000Z',
    });

    expect(candidate.source_type).toBe('member');
    expect(candidate.content_type).toBe('photo');
  });

  it('computes admin follow-up for privacy-sensitive and pending consent cases', () => {
    expect(
      computeAdminFollowupRequired({
        consent_status: 'pending',
        privacy_flag: 'none',
        permission_statement: 'LGFC may use this.',
      }),
    ).toBe(true);

    expect(
      computeAdminFollowupRequired({
        consent_status: 'granted',
        privacy_flag: 'living_person',
        permission_statement: 'LGFC may use this.',
      }),
    ).toBe(true);
  });

  it('builds member_submission candidates with safe default review states', () => {
    const parsed = parseMemberSubmissionIntakeBody(validIntakeBody());
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const candidate = buildMemberSubmissionCandidateRecord(parsed.request, {
      candidateId: 'lgfc-gehrig-2026-101',
      submitterContact: 'member@example.com',
      memberSubmitterId: 'member@example.com',
      now: '2026-07-06T19:00:00.000Z',
    });

    expect(candidate.input_stream).toBe('member_submission');
    expect(candidate.publication_status).toBe('not_ready');
    expect(candidate.review_status).toBe('pending_review');
    expect(candidate.rights_status).toBe('permission_needed');
    expect(candidate.member_submission?.submitter_contact).toBe('member@example.com');
  });

  it('persists content_items, submitters, and member_submissions without publication promotion', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    const parsed = parseMemberSubmissionIntakeBody(
      validIntakeBody({
        privacy_flag: 'living_person',
        uploaded_media_reference: 'b2://pending/photo-ref',
        people_tags: ['Lou Gehrig'],
      }),
    );
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const intakeNow = '2026-07-06T19:00:00.000Z';
    const result = await persistMemberSubmissionIntake(db, parsed.request, {
      submitterContact: 'member@example.com',
      memberSubmitterId: 'member@example.com',
      now: intakeNow,
    });

    expect(result.publication_status).toBe('not_ready');
    expect(result.candidate_id).toBe('lgfc-gehrig-2026-001');

    const contentItem = sqlite
      .prepare(`SELECT * FROM content_items WHERE candidate_id = ?`)
      .get(result.candidate_id) as Record<string, unknown>;
    expect(contentItem.publication_status).toBe('not_ready');
    expect(contentItem.content_inventory_id).toBeNull();
    expect(contentItem.input_stream).toBe('member_submission');
    expect(contentItem.source_type).toBe('member');
    expect(contentItem.content_type).toBe('story');

    const memberSubmission = sqlite
      .prepare(
        `SELECT ms.*, s.submitter_contact, s.submitter_name
         FROM member_submissions ms
         JOIN content_items ci ON ci.id = ms.content_item_id
         JOIN submitters s ON s.id = ms.submitter_id
         WHERE ci.candidate_id = ?`,
      )
      .get(result.candidate_id) as Record<string, unknown>;
    expect(memberSubmission.submitter_contact).toBe('member@example.com');
    expect(memberSubmission.consent_status).toBe('pending');
    expect(memberSubmission.admin_followup_required).toBe(1);

    const publicationCount = sqlite
      .prepare(`SELECT COUNT(*) AS count FROM publication_candidates`)
      .get() as { count: number };
    expect(publicationCount.count).toBe(0);

    const inventoryCount = sqlite
      .prepare(`SELECT COUNT(*) AS count FROM content_inventory`)
      .get() as { count: number };
    expect(inventoryCount.count).toBe(0);
  });

  it('allocates sequential candidate IDs within an explicit allocation year', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    insertContentItemRow(sqlite, 'lgfc-gehrig-2026-005');

    await expect(allocateMemberSubmissionCandidateId(db, 2026)).resolves.toBe('lgfc-gehrig-2026-006');
  });

  it('uses options.now year for candidate ID allocation', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    const parsed = parseMemberSubmissionIntakeBody(validIntakeBody());
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const result = await persistMemberSubmissionIntake(db, parsed.request, {
      submitterContact: 'member@example.com',
      memberSubmitterId: 'member@example.com',
      now: '2025-12-31T23:59:59.000Z',
    });

    expect(result.candidate_id).toBe('lgfc-gehrig-2025-001');
  });

  it('detects candidate_id unique constraint conflicts for retry handling', () => {
    expect(isCandidateIdUniqueConflict(new Error('UNIQUE constraint failed: content_items.candidate_id'))).toBe(
      true,
    );
    expect(isCandidateIdUniqueConflict(new Error('some other failure'))).toBe(false);
  });

  it('allocates the next free candidate ID when lower sequence numbers are occupied', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    insertContentItemRow(sqlite, 'lgfc-gehrig-2026-006');
    insertContentItemRow(sqlite, 'lgfc-gehrig-2026-007');

    const parsed = parseMemberSubmissionIntakeBody(validIntakeBody());
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const result = await persistMemberSubmissionIntake(db, parsed.request, {
      submitterContact: 'member@example.com',
      memberSubmitterId: 'member@example.com',
      now: '2026-07-06T19:00:00.000Z',
    });

    expect(result.candidate_id).toBe('lgfc-gehrig-2026-008');
  });

  it('returns 401 without member authentication and 400 for invalid payloads', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    seedMemberSession(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    const unauthenticated = await memberSubmitPost({
      env: { DB: db },
      request: memberPostRequest(validIntakeBody(), 'missing-session'),
    });
    expect(unauthenticated.status).toBe(401);

    const invalid = await memberSubmitPost({
      env: { DB: db },
      request: memberPostRequest(validIntakeBody({ submission_type: 'not_real' })),
    });
    expect(invalid.status).toBe(400);

    const invalidSourceType = await memberSubmitPost({
      env: { DB: db },
      request: memberPostRequest(validIntakeBody({ source_type: 'archive' })),
    });
    expect(invalidSourceType.status).toBe(400);

    const invalidContentType = await memberSubmitPost({
      env: { DB: db },
      request: memberPostRequest(validIntakeBody({ content_type: 'article' })),
    });
    expect(invalidContentType.status).toBe(400);
  });

  it('ignores client admin_followup_required:false and persists admin follow-up as true', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    seedMemberSession(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    const response = await memberSubmitPost({
      env: { DB: db },
      request: memberPostRequest(validIntakeBody({ admin_followup_required: false })),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.admin_followup_required).toBe(true);

    const memberSubmission = sqlite
      .prepare(
        `SELECT ms.admin_followup_required
         FROM member_submissions ms
         JOIN content_items ci ON ci.id = ms.content_item_id
         WHERE ci.candidate_id = ?`,
      )
      .get(body.candidate_id) as { admin_followup_required: number };
    expect(memberSubmission.admin_followup_required).toBe(1);
  });

  it('accepts authenticated intake and omits private fields from the response', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyRepoMigrations(sqlite);
    seedMemberSession(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    const response = await memberSubmitPost({
      env: { DB: db },
      request: memberPostRequest(validIntakeBody()),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.publication_status).toBe('not_ready');
    expect(body.candidate_id).toMatch(/^lgfc-gehrig-\d{4}-\d{3,}$/);
    expect(body.submitter_contact).toBeUndefined();
    expect(body.ownership_statement).toBeUndefined();
    expect(body.permission_statement).toBeUndefined();
    expect(body.privacy_notes).toBeUndefined();

    const serialized = serializeMemberSubmissionIntakeResponse({
      candidate_id: body.candidate_id,
      input_stream: 'member_submission',
      publication_status: 'not_ready',
      review_status: 'pending_review',
      admin_followup_required: true,
    });
    expect(JSON.stringify(serialized)).not.toContain('member@example.com');
  });

  it('does not expose intake persistence on public admin-only candidate routes', () => {
    expect(fs.existsSync('functions/api/library/content-pipeline/submit.ts')).toBe(true);
    expect(fs.existsSync('functions/api/content-pipeline/member-submissions.ts')).toBe(false);
    expect(fs.existsSync('functions/api/admin/content-pipeline/member-submissions.ts')).toBe(false);
  });
});
