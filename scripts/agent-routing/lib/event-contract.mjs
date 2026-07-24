/**
 * Canonical handoff/review event contract for the deterministic routing controller.
 * Labels alone are never authority; structured Issue comments are.
 */

export const CANONICAL_EVENT_MARKERS = Object.freeze([
  'IMPLEMENTATION HANDOFF',
  'PR REVIEW REQUEST',
]);

export const LEGACY_ADAPTER_MARKERS = Object.freeze(['CHATGPT HANDOFF']);

export const ALL_HANDOFF_EVENT_MARKERS = Object.freeze([
  ...CANONICAL_EVENT_MARKERS,
  ...LEGACY_ADAPTER_MARKERS,
]);

export const PROTECTED_DECISION_CLASSES = Object.freeze([
  'product',
  'engineering-approval',
  'recovery',
  'credential',
  'destructive',
  'production',
]);

const MARKER_TO_EVENT_TYPE = Object.freeze({
  'IMPLEMENTATION HANDOFF': 'implementation_handoff',
  'PR REVIEW REQUEST': 'pr_review_request',
  'CHATGPT HANDOFF': 'chatgpt_handoff_legacy',
});

/**
 * @param {string} body
 * @returns {{ marker: string, eventType: string, adapter: boolean } | null}
 */
export function detectHandoffEventMarker(body = '') {
  const text = String(body || '');
  const trimmedStart = text.trimStart();
  for (const marker of ALL_HANDOFF_EVENT_MARKERS) {
    if (trimmedStart.startsWith(marker) || text.includes(`\n${marker}`)) {
      return {
        marker,
        eventType: MARKER_TO_EVENT_TYPE[marker],
        adapter: LEGACY_ADAPTER_MARKERS.includes(marker),
      };
    }
  }
  return null;
}

/**
 * Labels may route attention but never authorize controller action alone.
 * @param {string[]|object[]} labels
 * @param {object} comment
 */
export function assertEventAuthority({ labels = [], comment } = {}) {
  const detected = detectHandoffEventMarker(comment?.body || comment?.bodyText || '');
  if (!detected) {
    return {
      ok: false,
      code: 'missing_canonical_event',
      message: 'No canonical or legacy handoff/review event marker found on the Issue comment.',
      labelsPresent: normalizeLabelNames(labels),
    };
  }
  return {
    ok: true,
    code: 'event_authority_ok',
    event: detected,
    labelsPresent: normalizeLabelNames(labels),
    labelsAreAuthority: false,
  };
}

/**
 * @param {object[]} comments newest-last preferred but any order accepted
 * @param {{ markers?: string[] }} [opts]
 */
export function findLatestHandoffEvent(comments = [], opts = {}) {
  const markers = opts.markers || ALL_HANDOFF_EVENT_MARKERS;
  const sorted = [...comments].sort(
    (a, b) =>
      new Date(a.createdAt || a.created_at || 0).getTime() -
      new Date(b.createdAt || b.created_at || 0).getTime(),
  );
  let latest = null;
  for (const comment of sorted) {
    const body = comment.body || comment.bodyText || '';
    const detected = detectHandoffEventMarker(body);
    if (!detected) continue;
    if (!markers.includes(detected.marker)) continue;
    latest = {
      comment,
      ...detected,
      commentId: String(comment.id || comment.databaseId || ''),
      createdAt: comment.createdAt || comment.created_at || null,
    };
  }
  return latest;
}

/**
 * Stable action identity for later idempotent transactions.
 * Format: issue:<n>:event:<type>:comment:<id>:pr:<n|none>:head:<sha|none>
 */
export function buildActionIdentity({
  sourceIssueNumber,
  eventType,
  eventCommentId,
  prNumber = null,
  headSha = null,
} = {}) {
  const issue = Number(sourceIssueNumber);
  if (!Number.isFinite(issue) || issue <= 0) {
    throw new Error('action_identity_requires_source_issue');
  }
  if (!eventType) throw new Error('action_identity_requires_event_type');
  if (!eventCommentId) throw new Error('action_identity_requires_event_comment_id');
  const pr = prNumber == null || prNumber === '' ? 'none' : String(prNumber);
  const head = headSha ? String(headSha).toLowerCase() : 'none';
  return `issue:${issue}:event:${eventType}:comment:${eventCommentId}:pr:${pr}:head:${head}`;
}

/**
 * Classify whether a requested or observed decision class is automatable.
 * @param {string} decisionClass
 */
export function classifyDecisionAutomatability(decisionClass) {
  const normalized = String(decisionClass || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-');
  const aliases = {
    product: 'product',
    'product-authority': 'product',
    engineering: 'engineering-approval',
    'engineering-approval': 'engineering-approval',
    approval: 'engineering-approval',
    recovery: 'recovery',
    incident: 'recovery',
    credential: 'credential',
    credentials: 'credential',
    secret: 'credential',
    secrets: 'credential',
    destructive: 'destructive',
    production: 'production',
    main: 'production',
  };
  const mapped = aliases[normalized] || normalized;
  const protectedClass = PROTECTED_DECISION_CLASSES.includes(mapped);
  return {
    decisionClass: mapped,
    automatable: !protectedClass,
    nonAutomatable: protectedClass,
    reason: protectedClass
      ? `Decision class "${mapped}" is protected and must halt for human/Engineering authority.`
      : `Decision class "${mapped}" is eligible for later deterministic classification.`,
  };
}

export function protectedDecisionInventory(classes = PROTECTED_DECISION_CLASSES) {
  return classes.map((decisionClass) => classifyDecisionAutomatability(decisionClass));
}

function normalizeLabelNames(labels = []) {
  return labels
    .map((label) => (typeof label === 'string' ? label : label?.name || ''))
    .filter(Boolean);
}

/**
 * Normalize a detected event into the stable envelope used by evidence packets.
 */
export function normalizeEventEnvelope({
  sourceIssueNumber,
  event,
  prNumber = null,
  headSha = null,
  profile = null,
  status = 'observed',
} = {}) {
  if (!event?.eventType || !event?.commentId) {
    throw new Error('normalize_event_requires_detected_event');
  }
  const actionIdentity = buildActionIdentity({
    sourceIssueNumber,
    eventType: event.eventType,
    eventCommentId: event.commentId,
    prNumber,
    headSha,
  });
  return {
    schemaVersion: 1,
    eventType: event.eventType,
    marker: event.marker,
    adapter: Boolean(event.adapter),
    eventCommentId: event.commentId,
    createdAt: event.createdAt || null,
    sourceIssueNumber: Number(sourceIssueNumber),
    prNumber: prNumber == null ? null : Number(prNumber),
    headSha: headSha ? String(headSha).toLowerCase() : null,
    profile: profile || null,
    status,
    actionIdentity,
    labelsAreAuthority: false,
  };
}
