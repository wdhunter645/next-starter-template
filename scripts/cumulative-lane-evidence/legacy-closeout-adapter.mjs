#!/usr/bin/env node
/**
 * Compatibility adapter for active legacy closeout / handoff surfaces.
 * Maps recognized markers into cumulative-unit compatibility records and
 * optional Development progress event drafts. Never deletes history.
 * Work unit #2884 / parent #2678.
 */

export const LEGACY_MARKERS = Object.freeze([
  {
    id: 'post_merge_closeout_checklist',
    marker: '## POST-MERGE CLOSEOUT CHECKLIST',
    kind: 'legacy_post_merge_closeout',
    retirementClass: 'pr_body_checklist',
  },
  {
    id: 'chatgpt_closeout',
    marker: 'CHATGPT CLOSEOUT',
    kind: 'legacy_chatgpt_closeout',
    retirementClass: 'issue_comment_closeout',
  },
  {
    id: 'chatgpt_handoff',
    marker: 'CHATGPT HANDOFF',
    kind: 'legacy_chatgpt_handoff',
    retirementClass: 'issue_comment_handoff',
  },
  {
    id: 'implementation_handoff',
    marker: 'IMPLEMENTATION HANDOFF',
    kind: 'legacy_implementation_handoff',
    retirementClass: 'issue_comment_handoff',
  },
  {
    id: 'closeout_assignment',
    marker: 'CLOSEOUT ASSIGNMENT',
    kind: 'legacy_closeout_assignment',
    retirementClass: 'issue_comment_closeout',
  },
  {
    id: 'post_merge_closeout_complete',
    marker: 'POST-MERGE CLOSEOUT — COMPLETE',
    kind: 'legacy_post_merge_complete',
    retirementClass: 'issue_comment_closeout',
  },
]);

/**
 * @param {string} body
 * @returns {{ id: string, marker: string, kind: string, retirementClass: string }[]}
 */
export function detectLegacyEvidenceMarkers(body = '') {
  const text = String(body || '');
  const found = [];
  for (const entry of LEGACY_MARKERS) {
    if (text.includes(entry.marker)) found.push({ ...entry });
  }
  return found;
}

/**
 * @param {{
 *   bodies?: { id?: string, body: string, createdAt?: string }[],
 * }} params
 * @returns {{
 *   records: object[],
 *   retirementClassesPresent: string[],
 * }}
 */
export function mapLegacyEvidenceSurfaces({ bodies = [] } = {}) {
  const records = [];
  const retirementClasses = new Set();

  for (const item of bodies) {
    const detections = detectLegacyEvidenceMarkers(item.body || '');
    for (const detection of detections) {
      retirementClasses.add(detection.retirementClass);
      records.push({
        sourceId: item.id || null,
        createdAt: item.createdAt || null,
        ...detection,
        // Compatibility only — not yet an authoritative cumulative event.
        authoritative: false,
        preservesHistory: true,
      });
    }
  }

  return {
    records,
    retirementClassesPresent: [...retirementClasses].sort(),
  };
}

/**
 * Build a non-exit Development progress draft from a legacy closeout/handoff
 * marker so controllers can reconcile one cumulative unit without rewriting
 * or deleting the legacy comment.
 *
 * @param {{
 *   sourceIssue: number,
 *   workUnitId: string,
 *   idempotencyKey: string,
 *   legacyKind: string,
 *   marker: string,
 *   timestamp?: string,
 *   evidenceUri?: string,
 * }} params
 */
export function buildCompatibilityEventDraftFromLegacy(params = {}) {
  const {
    sourceIssue,
    workUnitId,
    idempotencyKey,
    legacyKind,
    marker,
    timestamp = new Date().toISOString(),
    evidenceUri,
  } = params;

  if (!sourceIssue || !workUnitId || !idempotencyKey || !legacyKind || !marker) {
    return { ok: false, errors: ['missing_required_legacy_mapping_fields'], event: null };
  }

  return {
    ok: true,
    errors: [],
    event: {
      schemaVersion: 'lgfc-cumulative-evidence:v1',
      idempotencyKey,
      sourceIssue,
      workUnitId,
      lane: 'development',
      transition: 'progress',
      candidateSha: null,
      actorRole: 'administration_communications',
      actor: 'legacy-closeout-adapter',
      timestamp,
      result: 'deferred',
      evidenceRefs: evidenceUri ? [{ kind: 'comment', uri: evidenceUri, note: marker }] : [],
      supersedes: null,
      protectedStops: [],
      nextExpectedTransition: 'progress',
      summary: `Compatibility view of legacy marker ${marker}`,
      laneFields: {
        sourceIssue,
        objective: `legacy-compatibility:${legacyKind}`,
        allowlist: [],
        implementationSummary: `Mapped from legacy surface "${marker}" without deleting history`,
        verification: { legacyKind, marker },
        reviewDispositions: 'compatibility-only; not an approval or lane exit',
        limitationsAndRollback: 'retire adapter after cumulative events are authoritative; keep legacy comments',
        componentCandidate: null,
        legacyKind,
        legacyMarker: marker,
      },
    },
  };
}
