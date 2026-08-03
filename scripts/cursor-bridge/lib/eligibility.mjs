/**
 * Label- and status-driven eligibility for Cursor Local Bridge.
 *
 * Mechanical safety gates decide whether the Bridge may launch Cursor.
 * Every gate reads Issue state and labels only — no comment body is ever
 * parsed to decide eligibility, an action, or an authorization reference.
 * See docs/reference/ci/cursor-local-bridge-contract.md ("Label and
 * status-driven handoff") for the full rationale and history.
 */

import crypto from 'node:crypto';
import { classifyQueueCandidate } from '../../orchestrator/queue-routing.mjs';
import { conflictingAgentRoutingReason, hasCursorRoutingSignal } from './wake-ingress.mjs';

/** Errors that remain Bridge-side hard stops before launch. */
const MECHANICAL_ERROR_PREFIXES = [
  'source_issue_not_open',
  'missing_issue',
  'missing_label:',
  'repository_mismatch',
  'absent_cursor_routing',
  'already_handed_off:',
  'conflicting_agent_routing_labels',
];

/**
 * Status labels that mean this Issue already passed through a Cursor
 * handoff cycle (Cursor moved it to review/complete, or a later process
 * closed it out). A stray or repeated `handoff:ready` label event must not
 * relaunch an Issue that already has a live disposition — Cursor owns
 * moving status forward; the Bridge only refuses to double-launch on top
 * of it.
 */
const ALREADY_HANDED_OFF_STATUS_LABELS = [
  'status:review',
  'status:complete',
  'status:post-merge-verify',
];

function issueLabels(issue) {
  if (!issue || !Array.isArray(issue.labels)) return [];
  return issue.labels.map((l) => (typeof l === 'string' ? l : l?.name)).filter(Boolean);
}

function isIssueOpen(issue) {
  if (!issue) return false;
  return String(issue.state || '').toLowerCase() === 'open';
}

function isMechanicalError(error) {
  return MECHANICAL_ERROR_PREFIXES.some(
    (prefix) => error === prefix || error.startsWith(prefix),
  );
}

/**
 * Encode arbitrary delivery identity into a filesystem-safe key.
 * Safe tokens (numeric ids, wake-* ids without traversal) pass through.
 * Unsafe values become a stable SHA-256 digest of the complete original
 * identity (collision-resistant; no prefix truncation of reversible encodings).
 */
export function sanitizeDeliveryKey(raw) {
  const input = String(raw ?? '').trim();
  if (!input) return 'issue-unknown';
  if (/^[A-Za-z0-9][A-Za-z0-9._-]{0,179}$/.test(input) && !input.includes('..')) {
    return input;
  }
  const digest = crypto.createHash('sha256').update(input, 'utf8').digest('hex');
  return `enc-${digest}`;
}

/**
 * Informational-only findings that never block launch: PMO parent/priority
 * shape via the queue-routing classifier. This is unrelated to comment
 * parsing — it reads Issue labels/body plus the fetched parent, and Cursor
 * is told about it so it can hold or correct rather than the Bridge
 * silently discarding a trusted notification.
 */
export function assessInformationalFindings(issue, opts = {}) {
  const findings = [];
  const labels = issueLabels(issue);

  const queueRelevant = labels.some(
    (label) =>
      label.startsWith('team:') ||
      label.startsWith('ops:') ||
      label.startsWith('pmo:priority:') ||
      label.startsWith('eng:priority:') ||
      label.startsWith('pmo:stage:') ||
      label === 'pmo:task' ||
      label === 'pmo:active' ||
      label === 'pmo:pipeline',
  );
  let queueClassification = null;
  if (issue && queueRelevant && opts.skipQueueRoutingCheck !== true) {
    queueClassification = classifyQueueCandidate(
      {
        number: issue.number,
        state: isIssueOpen(issue) ? 'open' : String(issue.state || ''),
        labels,
        body: issue.body || '',
      },
      opts.queueContext || {},
    );
    if (
      queueClassification.failClosed &&
      queueClassification.reasons?.some((reason) =>
        /cross_namespace|multiple_team|pmo_child_carries|unclassified|ops_requires|pipeline_requires|pipeline_missing|active_shape|missing_or_mismatched_parent|parent_not_valid/.test(
          reason,
        ),
      )
    ) {
      findings.push(`queue_routing_ineligible:${queueClassification.reasons.join(',')}`);
    }
  }

  return { findings, labels, queueClassification };
}

/**
 * @param {object} issue - gh issue view JSON
 * @param {object[]} _comments - unused; retained for call-site compatibility
 * @param {object} opts
 */
export function validateEligibility(issue, _comments, opts = {}) {
  const errors = [];
  const requiredLabels = opts.requiredLabels || ['agent:cursor', 'handoff:ready'];

  if (!issue) {
    return {
      ok: false,
      errors: ['missing_issue'],
      semanticFindings: [],
      labels: [],
      queueClassification: null,
    };
  }

  if (!isIssueOpen(issue)) {
    errors.push('source_issue_not_open');
  }

  const labels = issueLabels(issue);
  for (const need of requiredLabels) {
    if (!labels.includes(need)) errors.push(`missing_label:${need}`);
  }

  const conflictReason = conflictingAgentRoutingReason(labels);
  if (conflictReason) {
    errors.push(conflictReason);
  }

  if (!hasCursorRoutingSignal({ labels })) {
    if (!errors.some((e) => e === 'missing_label:agent:cursor')) {
      errors.push('absent_cursor_routing');
    }
  }

  const handedOffStatus = ALREADY_HANDED_OFF_STATUS_LABELS.find((s) => labels.includes(s));
  if (handedOffStatus) {
    errors.push(`already_handed_off:${handedOffStatus}`);
  }

  if (opts.expectedRepo && issue.repository && issue.repository.nameWithOwner) {
    if (issue.repository.nameWithOwner !== opts.expectedRepo) {
      errors.push('repository_mismatch');
    }
  }

  const informational = assessInformationalFindings(issue, opts);

  const mechanicalErrors = errors.filter(isMechanicalError);
  // Defend against accidental non-mechanical entries in errors[].
  for (const e of errors) {
    if (!isMechanicalError(e) && !mechanicalErrors.includes(e)) {
      informational.findings.push(e);
    }
  }

  return {
    ok: mechanicalErrors.length === 0,
    errors: mechanicalErrors,
    semanticFindings: informational.findings,
    labels: informational.labels.length ? informational.labels : labels,
    queueClassification: informational.queueClassification,
  };
}

/**
 * Stable dedupe/claim key for a wake. Delivery identity always comes from
 * the wake packet (workflow run id + issue number) — there is no comment id
 * to prefer, so every label-triggered delivery is idempotent by packet
 * identity alone. Always filesystem-safe.
 */
export function resolveDeliveryKey({ packet, issueNumber }) {
  let raw;
  if (packet?.deliveryId) raw = String(packet.deliveryId);
  else raw = `issue-${issueNumber}`;
  return sanitizeDeliveryKey(raw);
}

export { MECHANICAL_ERROR_PREFIXES, isMechanicalError, isIssueOpen };
