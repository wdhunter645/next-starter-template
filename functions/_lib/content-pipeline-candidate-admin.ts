// Admin API helpers for LGFC content pipeline candidate review (#2286 / #2310).

import type { CandidateListFilter, CandidateReviewStateUpdate } from './content-pipeline-candidate-repository';

export const CANDIDATE_ID_PATTERN = /^lgfc-gehrig-[0-9]{4}-[0-9]{3,}$/;

const REVIEW_STATUSES = new Set([
  'pending_review',
  'approved_internal_reference',
  'approved_public_candidate',
  'approved_citation_reference_only',
  'deferred_source_verification',
  'deferred_rights_review',
  'deferred_privacy_review',
  'rejected',
  'private_internal_only',
]);

const RIGHTS_STATUSES = new Set([
  'unknown',
  'public_domain_candidate',
  'permission_needed',
  'permission_requested',
  'permission_granted',
  'copyright_restricted',
  'blocked',
]);

const SOURCE_TRUST_STATUSES = new Set(['pending', 'trusted', 'questionable', 'blocked', 'deleted']);

const RELEVANCE_STATUSES = new Set(['pending', 'relevant', 'not_relevant', 'uncertain']);

const PUBLICATION_STATUSES = new Set([
  'not_ready',
  'draft_candidate',
  'staged',
  'approved_for_publish',
  'published',
  'unpublished',
  'archived',
]);

const PRIVACY_REVIEW_STATUSES = new Set([
  'not_applicable',
  'pending_review',
  'approved',
  'restricted',
  'blocked',
]);

const INPUT_STREAMS = new Set([
  'public_research',
  'member_submission',
  'admin_seed',
  'scheduled_discovery',
]);

const REVIEW_PRIORITIES = new Set(['low', 'normal', 'high']);

const REVIEW_FIELD_VALIDATORS: Record<keyof CandidateReviewStateUpdate, Set<string> | null> = {
  review_status: REVIEW_STATUSES,
  rights_status: RIGHTS_STATUSES,
  privacy_review_status: PRIVACY_REVIEW_STATUSES,
  publication_status: PUBLICATION_STATUSES,
  relevance_status: RELEVANCE_STATUSES,
  source_trust_status: SOURCE_TRUST_STATUSES,
  admin_notes: null,
};

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parseLimit(raw: string | null): number {
  const n = Number(raw || '50');
  return Number.isFinite(n) ? Math.min(Math.max(Math.floor(n), 1), 200) : 50;
}

function parseOffset(raw: string | null): number {
  const n = Number(raw || '0');
  return Number.isFinite(n) ? Math.max(Math.floor(n), 0) : 0;
}

export function isValidCandidateId(candidateId: string): boolean {
  return CANDIDATE_ID_PATTERN.test(candidateId);
}

export function parseCandidateListQuery(
  url: URL,
): { ok: true; filter: CandidateListFilter } | { ok: false; error: string } {
  const filter: CandidateListFilter = {
    limit: parseLimit(url.searchParams.get('limit')),
    offset: parseOffset(url.searchParams.get('offset')),
  };

  const reviewStatus = asTrimmedString(url.searchParams.get('review_status'));
  if (reviewStatus) {
    if (!REVIEW_STATUSES.has(reviewStatus)) {
      return { ok: false, error: 'Invalid review_status filter.' };
    }
    filter.review_status = reviewStatus;
  }

  const inputStream = asTrimmedString(url.searchParams.get('input_stream'));
  if (inputStream) {
    if (!INPUT_STREAMS.has(inputStream)) {
      return { ok: false, error: 'Invalid input_stream filter.' };
    }
    filter.input_stream = inputStream;
  }

  const reviewPriority = asTrimmedString(url.searchParams.get('review_priority'));
  if (reviewPriority) {
    if (!REVIEW_PRIORITIES.has(reviewPriority)) {
      return { ok: false, error: 'Invalid review_priority filter.' };
    }
    filter.review_priority = reviewPriority;
  }

  const publicationStatus = asTrimmedString(url.searchParams.get('publication_status'));
  if (publicationStatus) {
    if (!PUBLICATION_STATUSES.has(publicationStatus)) {
      return { ok: false, error: 'Invalid publication_status filter.' };
    }
    filter.publication_status = publicationStatus;
  }

  if (url.searchParams.get('include_deleted') === '1' || url.searchParams.get('include_deleted') === 'true') {
    filter.include_deleted = true;
  }

  return { ok: true, filter };
}

export type CandidateReviewRequest = CandidateReviewStateUpdate & {
  candidate_id: string;
  actor?: string;
  notes?: string;
};

export function parseCandidateReviewRequest(
  body: unknown,
): { ok: true; request: CandidateReviewRequest } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Request body must be a JSON object.' };
  }

  const record = body as Record<string, unknown>;
  const candidateId = asTrimmedString(record.candidate_id);
  if (!candidateId || !isValidCandidateId(candidateId)) {
    return { ok: false, error: 'candidate_id must match lgfc-gehrig-YYYY-NNNN+.' };
  }

  const update: CandidateReviewStateUpdate = {};
  for (const field of Object.keys(REVIEW_FIELD_VALIDATORS) as Array<keyof CandidateReviewStateUpdate>) {
    if (!(field in record)) {
      continue;
    }
    const rawValue = record[field];
    if (field === 'admin_notes') {
      if (rawValue !== null && typeof rawValue !== 'string') {
        return { ok: false, error: 'admin_notes must be a string or null.' };
      }
      update.admin_notes = rawValue === null ? '' : asTrimmedString(rawValue);
      continue;
    }
    const value = asTrimmedString(rawValue);
    if (!value) {
      return { ok: false, error: `${field} must be a non-empty string when provided.` };
    }
    const allowed = REVIEW_FIELD_VALIDATORS[field];
    if (allowed && !allowed.has(value)) {
      return { ok: false, error: `Invalid ${field}.` };
    }
    update[field] = value;
  }

  if (Object.keys(update).length === 0) {
    return { ok: false, error: 'At least one review-state field must be provided.' };
  }

  const actor = asTrimmedString(record.actor) || undefined;
  const notes = asTrimmedString(record.notes) || undefined;

  return {
    ok: true,
    request: {
      candidate_id: candidateId,
      ...update,
      actor,
      notes,
    },
  };
}

export function serializeCandidateForAdmin(candidate: Record<string, unknown>) {
  const { tags, ...rest } = candidate;
  return {
    ...rest,
    tags: tags ?? { people: [], topics: [], places: [] },
  };
}
