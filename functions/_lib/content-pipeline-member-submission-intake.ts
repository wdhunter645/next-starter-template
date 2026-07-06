// Member submission intake persistence for LGFC content pipeline (#2286 / #2316).

import {
  CANDIDATE_ID_PATTERN,
  CONTENT_PIPELINE_CONSENT_STATUSES,
  CONTENT_PIPELINE_CREDIT_PREFERENCES,
  CONTENT_PIPELINE_PRIVACY_FLAGS,
  CONTENT_PIPELINE_SUBMISSION_TYPES,
  CONSENT_STATUSES,
  CREDIT_PREFERENCES,
  PRIVACY_FLAGS,
  SUBMISSION_TYPES,
} from './content-pipeline-candidate-constants';
import {
  validateCandidateRegistry,
  type CandidateRecord,
  type MemberSubmissionExtension,
} from './content-pipeline-candidate-import';
import { requireTables } from './d1';

export const MEMBER_SUBMISSION_INTAKE_TABLES = [
  'content_items',
  'submitters',
  'member_submissions',
  'tags',
  'content_item_tags',
] as const;

const SUBMISSION_TYPE_TO_CONTENT_TYPE: Record<string, string> = {
  story: 'story',
  photo: 'photo',
  memorabilia: 'artifact',
  correction: 'correction',
  identification: 'identification',
  source_lead: 'source_lead',
  historical_note: 'biography_note',
};

const MEMBER_INTAKE_CONSENT_STATUSES = new Set(['pending']);
const MEMBER_INTAKE_SOURCE_TYPE = 'member';
const MAX_CANDIDATE_ID_ALLOCATION_ATTEMPTS = 5;

export type MemberSubmissionIntakeRequest = {
  submitter_name: string;
  title: string;
  summary: string;
  submission_type: string;
  ownership_statement: string;
  permission_statement: string;
  credit_preference: string;
  consent_status: string;
  admin_followup_required: boolean;
  source_name?: string;
  source_url?: string;
  credit_line?: string;
  date_or_period?: string;
  privacy_flag?: string;
  privacy_notes?: string;
  uploaded_media_reference?: string;
  related_candidate_id?: string;
  people_tags?: string[];
  topic_tags?: string[];
  location_tags?: string[];
};

export type MemberSubmissionIntakeResult = {
  candidate_id: string;
  input_stream: 'member_submission';
  publication_status: 'not_ready';
  review_status: 'pending_review';
  admin_followup_required: boolean;
};

export type ParseMemberSubmissionIntakeResult =
  | { ok: true; request: MemberSubmissionIntakeRequest }
  | { ok: false; error: string };

type D1PreparedStatement = {
  run: () => Promise<unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const items = value.map((entry) => asTrimmedString(entry)).filter(Boolean);
  return items.length > 0 ? items : undefined;
}

function pushEnumError(errors: string[], path: string, value: unknown, allowed: Set<string>) {
  if (typeof value !== 'string' || !allowed.has(value)) {
    errors.push(`${path} must be one of: ${[...allowed].join(', ')}`);
  }
}

export function candidateAllocationYearFromIso(now: string): number {
  const match = /^(\d{4})/.exec(now);
  if (match) {
    return Number.parseInt(match[1], 10);
  }
  return new Date(now).getUTCFullYear();
}

export function deriveMemberIntakeContentType(submissionType: string): string {
  return SUBMISSION_TYPE_TO_CONTENT_TYPE[submissionType] ?? 'other';
}

export function isCandidateIdUniqueConflict(error: unknown): boolean {
  const message = String((error as { message?: string })?.message ?? error ?? '').toLowerCase();
  return message.includes('unique constraint failed') && message.includes('content_items.candidate_id');
}

export function computeAdminFollowupRequired(input: {
  consent_status: string;
  privacy_flag: string;
  permission_statement: string;
  uploaded_media_reference?: string;
}): boolean {
  if (input.consent_status === 'pending' || input.consent_status === 'restricted') {
    return true;
  }
  if (['living_person', 'minors', 'sensitive'].includes(input.privacy_flag)) {
    return true;
  }
  if (input.uploaded_media_reference) {
    return true;
  }
  const permission = input.permission_statement.toLowerCase();
  if (
    permission.includes('unsure') ||
    permission.includes('not sure') ||
    permission.includes('unknown') ||
    permission.includes('maybe')
  ) {
    return true;
  }
  return false;
}

export function parseMemberSubmissionIntakeBody(body: unknown): ParseMemberSubmissionIntakeResult {
  if (!isRecord(body)) {
    return { ok: false, error: 'Invalid JSON body.' };
  }

  const submitterName = asTrimmedString(body.submitter_name ?? body.name);
  const title = asTrimmedString(body.title);
  const summary = asTrimmedString(body.summary ?? body.content);
  const submissionType = asTrimmedString(body.submission_type);
  const ownershipStatement = asTrimmedString(body.ownership_statement);
  const permissionStatement = asTrimmedString(body.permission_statement);
  const creditPreference = asTrimmedString(body.credit_preference);
  const consentStatus = asTrimmedString(body.consent_status) || 'pending';
  const privacyFlag = asTrimmedString(body.privacy_flag) || 'none';

  const errors: string[] = [];
  if (!submitterName) errors.push('submitter_name is required.');
  if (!title) errors.push('title is required.');
  if (!summary) errors.push('summary (or content) is required.');
  if (!submissionType) errors.push('submission_type is required.');
  if (!ownershipStatement) errors.push('ownership_statement is required.');
  if (!permissionStatement) errors.push('permission_statement is required.');
  if (!creditPreference) errors.push('credit_preference is required.');

  pushEnumError(errors, 'submission_type', submissionType, SUBMISSION_TYPES);
  pushEnumError(errors, 'credit_preference', creditPreference, CREDIT_PREFERENCES);
  pushEnumError(errors, 'consent_status', consentStatus, CONSENT_STATUSES);
  pushEnumError(errors, 'privacy_flag', privacyFlag, PRIVACY_FLAGS);

  if (consentStatus && !MEMBER_INTAKE_CONSENT_STATUSES.has(consentStatus)) {
    errors.push('consent_status must be pending on member intake.');
  }

  if (asTrimmedString(body.source_type)) {
    errors.push('source_type is not accepted on member intake; classification is determined server-side.');
  }
  if (asTrimmedString(body.content_type)) {
    errors.push('content_type is not accepted on member intake; derived from submission_type.');
  }

  const relatedCandidateId = asTrimmedString(body.related_candidate_id);
  if (relatedCandidateId && !CANDIDATE_ID_PATTERN.test(relatedCandidateId)) {
    errors.push('related_candidate_id must match lgfc-gehrig-YYYY-NNN with at least 3 trailing digits.');
  }

  if (errors.length > 0) {
    return { ok: false, error: errors.join(' ') };
  }

  const adminFollowupRequired = computeAdminFollowupRequired({
    consent_status: consentStatus,
    privacy_flag: privacyFlag,
    permission_statement: permissionStatement,
    uploaded_media_reference: asTrimmedString(body.uploaded_media_reference) || undefined,
  });

  return {
    ok: true,
    request: {
      submitter_name: submitterName,
      title,
      summary,
      submission_type: submissionType,
      ownership_statement: ownershipStatement,
      permission_statement: permissionStatement,
      credit_preference: creditPreference,
      consent_status: consentStatus,
      admin_followup_required: adminFollowupRequired,
      source_name: asTrimmedString(body.source_name) || undefined,
      source_url: asTrimmedString(body.source_url) || undefined,
      credit_line: asTrimmedString(body.credit_line) || undefined,
      date_or_period: asTrimmedString(body.date_or_period) || undefined,
      privacy_flag: privacyFlag,
      privacy_notes: asTrimmedString(body.privacy_notes) || undefined,
      uploaded_media_reference: asTrimmedString(body.uploaded_media_reference) || undefined,
      related_candidate_id: relatedCandidateId || undefined,
      people_tags: asStringArray(body.people_tags),
      topic_tags: asStringArray(body.topic_tags),
      location_tags: asStringArray(body.location_tags),
    },
  };
}

export function buildMemberSubmissionCandidateRecord(
  request: MemberSubmissionIntakeRequest,
  options: {
    candidateId: string;
    submitterContact: string;
    memberSubmitterId: string;
    now: string;
  },
): CandidateRecord {
  const contentType = deriveMemberIntakeContentType(request.submission_type);

  const memberSubmission: MemberSubmissionExtension = {
    submitter_id: options.memberSubmitterId,
    submitter_name: request.submitter_name,
    submitter_contact: options.submitterContact,
    submission_type: request.submission_type,
    ownership_statement: request.ownership_statement,
    permission_statement: request.permission_statement,
    credit_preference: request.credit_preference,
    privacy_notes: request.privacy_notes,
    uploaded_media_reference: request.uploaded_media_reference,
    related_candidate_id: request.related_candidate_id,
    consent_status: request.consent_status,
    admin_followup_required: request.admin_followup_required,
  };

  return {
    candidate_id: options.candidateId,
    input_stream: 'member_submission',
    title: request.title,
    source_url: request.source_url,
    source_name: request.source_name || request.submitter_name,
    source_type: MEMBER_INTAKE_SOURCE_TYPE,
    content_type: contentType,
    summary: request.summary,
    date_or_period: request.date_or_period,
    people_tags: request.people_tags,
    topic_tags: request.topic_tags,
    location_tags: request.location_tags,
    rights_status: 'permission_needed',
    source_trust_status: 'pending',
    relevance_status: 'pending',
    review_status: 'pending_review',
    publication_status: 'not_ready',
    privacy_flag: request.privacy_flag || 'none',
    privacy_review_status: 'pending_review',
    credit_line: request.credit_line,
    review_priority: 'normal',
    member_submission: memberSubmission,
    created_at: options.now,
    updated_at: options.now,
  };
}

export async function requireMemberSubmissionIntakeTables(db: unknown) {
  return requireTables(db, [...MEMBER_SUBMISSION_INTAKE_TABLES]);
}

async function runD1Batch(db: any, statements: D1PreparedStatement[]) {
  if (statements.length === 0) {
    return;
  }

  if (typeof db.batch === 'function') {
    await db.batch(statements);
    return;
  }

  if (typeof db.exec === 'function') {
    await db.exec('BEGIN');
    try {
      for (const statement of statements) {
        await statement.run();
      }
      await db.exec('COMMIT');
    } catch (error) {
      await db.exec('ROLLBACK');
      throw error;
    }
    return;
  }

  for (const statement of statements) {
    await statement.run();
  }
}

export async function allocateMemberSubmissionCandidateId(db: any, year: number): Promise<string> {
  const prefix = `lgfc-gehrig-${year}-`;
  const sequenceStart = prefix.length + 1;
  const row = await db
    .prepare(
      `SELECT MAX(CAST(substr(candidate_id, ?) AS INTEGER)) AS max_seq
       FROM content_items
       WHERE candidate_id LIKE ?`,
    )
    .bind(sequenceStart, `${prefix}%`)
    .first();

  const maxSeq = Number((row as { max_seq?: number | null })?.max_seq ?? 0);
  const nextSeq = String(maxSeq + 1).padStart(3, '0');
  return `${prefix}${nextSeq}`;
}

async function syncCandidateTags(db: any, contentItemId: number, candidate: CandidateRecord) {
  const statements: D1PreparedStatement[] = [
    db.prepare('DELETE FROM content_item_tags WHERE content_item_id = ?').bind(contentItemId),
  ];

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
    statements.push(
      db
        .prepare(
          `INSERT INTO tags (tag_name, tag_category)
           VALUES (?, ?)
           ON CONFLICT(tag_name, tag_category) DO NOTHING`,
        )
        .bind(entry.name, entry.category),
    );
    statements.push(
      db
        .prepare(
          `INSERT INTO content_item_tags (content_item_id, tag_id)
           SELECT ?, t.id
           FROM tags t
           WHERE t.tag_name = ? AND t.tag_category = ?
           ON CONFLICT(content_item_id, tag_id) DO NOTHING`,
        )
        .bind(contentItemId, entry.name, entry.category),
    );
  }

  await runD1Batch(db, statements);
}

async function persistMemberSubmissionIntakeAttempt(
  db: any,
  request: MemberSubmissionIntakeRequest,
  options: { submitterContact: string; memberSubmitterId: string; now: string; candidateId: string },
): Promise<MemberSubmissionIntakeResult> {
  const candidate = buildMemberSubmissionCandidateRecord(request, options);

  const validation = validateCandidateRegistry({
    schema_version: '1',
    registry_class: 'operator_export',
    candidates: [candidate],
  });
  if (!validation.ok) {
    throw new Error(validation.errors.join('; '));
  }

  const member = candidate.member_submission;
  if (!member) {
    throw new Error('member_submission extension missing after candidate build.');
  }

  const statements: D1PreparedStatement[] = [
    db
      .prepare(
        `INSERT INTO submitters (member_submitter_id, submitter_name, submitter_contact)
         VALUES (?, ?, ?)
         ON CONFLICT(member_submitter_id) DO UPDATE SET
           submitter_name = excluded.submitter_name,
           submitter_contact = excluded.submitter_contact,
           updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')`,
      )
      .bind(options.memberSubmitterId, member.submitter_name, member.submitter_contact),
    db
      .prepare(
        `INSERT INTO content_items (
          candidate_id, input_stream, title, source_url, source_name, source_owner, source_domain,
          source_type, content_type, summary, date_or_period, provenance_notes,
          rights_status, source_trust_status, relevance_status, review_status, publication_status,
          publication_target, privacy_flag, privacy_review_status, credit_line, media_asset_id,
          duplicate_of, review_priority, admin_notes, source_metadata, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?
        )`,
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
        '{}',
        candidate.created_at,
        candidate.updated_at,
      ),
    db
      .prepare(
        `INSERT INTO member_submissions (
          content_item_id,
          submitter_id,
          submission_type,
          ownership_statement,
          permission_statement,
          credit_preference,
          privacy_notes,
          uploaded_media_reference,
          related_candidate_id,
          consent_status,
          admin_followup_required
        )
        SELECT
          ci.id,
          s.id,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        FROM content_items ci
        LEFT JOIN submitters s ON s.member_submitter_id = ?
        WHERE ci.candidate_id = ?`,
      )
      .bind(
        member.submission_type,
        member.ownership_statement,
        member.permission_statement,
        member.credit_preference,
        member.privacy_notes ?? null,
        member.uploaded_media_reference ?? null,
        member.related_candidate_id ?? null,
        member.consent_status,
        member.admin_followup_required ? 1 : 0,
        options.memberSubmitterId,
        candidate.candidate_id,
      ),
  ];

  await runD1Batch(db, statements);

  const contentItem = await db
    .prepare(`SELECT id FROM content_items WHERE candidate_id = ? LIMIT 1`)
    .bind(candidate.candidate_id)
    .first();

  if (
    contentItem &&
    (candidate.people_tags?.length || candidate.topic_tags?.length || candidate.location_tags?.length)
  ) {
    await syncCandidateTags(db, Number((contentItem as { id: number }).id), candidate);
  }

  return {
    candidate_id: candidate.candidate_id,
    input_stream: 'member_submission',
    publication_status: 'not_ready',
    review_status: 'pending_review',
    admin_followup_required: member.admin_followup_required,
  };
}

export async function persistMemberSubmissionIntake(
  db: any,
  request: MemberSubmissionIntakeRequest,
  options: { submitterContact: string; memberSubmitterId: string; now?: string },
): Promise<MemberSubmissionIntakeResult> {
  const memberSubmitterId = asTrimmedString(options.memberSubmitterId);
  if (!memberSubmitterId) {
    throw new Error('memberSubmitterId is required for member submission intake persistence.');
  }

  const now = options.now ?? new Date().toISOString();
  const year = candidateAllocationYearFromIso(now);
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_CANDIDATE_ID_ALLOCATION_ATTEMPTS; attempt += 1) {
    const candidateId = await allocateMemberSubmissionCandidateId(db, year);
    try {
      return await persistMemberSubmissionIntakeAttempt(db, request, {
        submitterContact: options.submitterContact,
        memberSubmitterId,
        now,
        candidateId,
      });
    } catch (error) {
      if (isCandidateIdUniqueConflict(error) && attempt < MAX_CANDIDATE_ID_ALLOCATION_ATTEMPTS - 1) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  throw lastError ?? new Error('Failed to allocate a unique candidate_id for member submission intake.');
}

export function serializeMemberSubmissionIntakeResponse(result: MemberSubmissionIntakeResult) {
  return {
    ok: true,
    candidate_id: result.candidate_id,
    input_stream: result.input_stream,
    publication_status: result.publication_status,
    review_status: result.review_status,
    admin_followup_required: result.admin_followup_required,
    message: 'Submission saved for editorial review.',
  };
}

export const MEMBER_INTAKE_ENUM_REFERENCE = {
  submission_types: [...CONTENT_PIPELINE_SUBMISSION_TYPES],
  credit_preferences: [...CONTENT_PIPELINE_CREDIT_PREFERENCES],
  consent_statuses: [...CONTENT_PIPELINE_CONSENT_STATUSES],
  privacy_flags: [...CONTENT_PIPELINE_PRIVACY_FLAGS],
} as const;
