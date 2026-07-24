/**
 * Read-only current-head evidence collector for the deterministic handoff controller.
 * Produces a normalized packet; performs no GitHub mutations.
 */

import {
  classifyDecisionAutomatability,
  normalizeEventEnvelope,
  protectedDecisionInventory,
} from './event-contract.mjs';

/**
 * Resolve exactly one open source Issue from candidate references.
 * @param {object[]} candidates - [{ number, state, ... }]
 */
export function resolveExactOpenSourceIssue(candidates = []) {
  const issues = (candidates || []).filter(Boolean);
  if (issues.length === 0) {
    return failClosed('missing_source_issue', 'No source Issue candidates were supplied.');
  }
  if (issues.length > 1) {
    return failClosed('ambiguous_source_issue', 'Multiple source Issue candidates were supplied.', {
      issueNumbers: issues.map((issue) => Number(issue.number)),
    });
  }
  const issue = issues[0];
  const number = Number(issue.number);
  if (!Number.isFinite(number) || number <= 0) {
    return failClosed('invalid_source_issue', 'Source Issue number is invalid.');
  }
  const state = String(issue.state || '').toUpperCase();
  if (state && state !== 'OPEN') {
    return failClosed('source_issue_not_open', `Source Issue #${number} is not open.`, {
      state,
    });
  }
  return { ok: true, issue, issueNumber: number };
}

/**
 * Extract primary source Issue references from a PR body (`- **Issue:** #N`).
 */
export function extractPrimarySourceIssueRefs(prBody = '') {
  const refs = [];
  const lines = String(prBody || '').split(/\r?\n/);
  for (const line of lines) {
    const normalized = line.replace(/^[>\s]*[-*+]\s+/, '').replace(/[`*_]+/g, ' ').trim();
    const match = normalized.match(/^Issue:\s*#(\d+)\b/i);
    if (match) refs.push(Number(match[1]));
  }
  return [...new Set(refs)];
}

/**
 * Reject when observed head SHA does not match the authoritative current PR head.
 */
export function assertCurrentHeadSha({ expectedHeadSha, observedHeadSha } = {}) {
  const expected = normalizeSha(expectedHeadSha);
  const observed = normalizeSha(observedHeadSha);
  if (!expected) {
    return failClosed('missing_expected_head_sha', 'Authoritative PR head SHA is missing.');
  }
  if (!observed) {
    return failClosed('missing_observed_head_sha', 'Observed head SHA is missing.');
  }
  if (expected !== observed) {
    return failClosed('stale_head_sha', 'Observed head SHA does not match the current PR head.', {
      expectedHeadSha: expected,
      observedHeadSha: observed,
    });
  }
  return { ok: true, headSha: expected };
}

/**
 * Detect contradictory delivery / ownership profile fields.
 */
export function assertOwnershipProfileConsistency({
  deliveryModel = null,
  targetEnvironment = null,
  approvalProfile = null,
  componentBranch = null,
  baseRef = null,
} = {}) {
  const contradictions = [];
  if (
    deliveryModel === 'B-child' &&
    targetEnvironment &&
    targetEnvironment !== 'component'
  ) {
    contradictions.push('b_child_requires_component_target');
  }
  if (
    approvalProfile === 'component-auto-integration' &&
    targetEnvironment === 'production'
  ) {
    contradictions.push('component_auto_integration_cannot_target_production');
  }
  if (
    componentBranch &&
    baseRef &&
    normalizeRef(componentBranch) !== normalizeRef(baseRef)
  ) {
    contradictions.push('component_branch_base_mismatch');
  }
  if (targetEnvironment === 'production' && deliveryModel === 'B-child') {
    contradictions.push('b_child_cannot_target_production');
  }
  if (contradictions.length > 0) {
    return failClosed(
      'contradictory_ownership_profile',
      'Delivery/ownership profile fields contradict repository contracts.',
      { contradictions },
    );
  }
  return { ok: true };
}

/**
 * Parse acceptance-criteria checklist items from Issue or PR markdown.
 */
export function extractAcceptanceCriteria(markdown = '') {
  const items = [];
  const lines = String(markdown || '').split(/\r?\n/);
  let inAcceptance = false;
  for (const line of lines) {
    if (/^##\s+Acceptance Criteria\b/i.test(line.trim())) {
      inAcceptance = true;
      continue;
    }
    if (inAcceptance && /^##\s+/.test(line.trim())) break;
    if (!inAcceptance) continue;
    const match = line.match(/^\s*[-*]\s*\[([ xX])\]\s+(.+)\s*$/);
    if (match) {
      items.push({
        text: match[2].trim(),
        checked: match[1].toLowerCase() === 'x',
      });
    }
  }
  return items;
}

/**
 * Separate unresolved review threads from late Issue comments after the handoff event.
 */
export function partitionReviewEvidence({
  reviewThreads = [],
  issueComments = [],
  reviewSubmissions = [],
  handoffCreatedAt = null,
} = {}) {
  const unresolvedThreads = [];
  const resolvedThreads = [];
  for (const thread of reviewThreads || []) {
    const entry = {
      id: String(thread.id || thread.node_id || thread.databaseId || ''),
      isResolved: Boolean(thread.isResolved),
      isOutdated: Boolean(thread.isOutdated),
      path: thread.path || null,
      line: thread.line ?? thread.originalLine ?? null,
      body: firstThreadBody(thread),
    };
    if (entry.isResolved) resolvedThreads.push(entry);
    else unresolvedThreads.push(entry);
  }

  const handoffTs = handoffCreatedAt ? Date.parse(handoffCreatedAt) : NaN;
  const lateComments = [];
  const priorComments = [];
  for (const comment of issueComments || []) {
    const createdAt = comment.createdAt || comment.created_at || null;
    const entry = {
      id: String(comment.id || comment.databaseId || ''),
      createdAt,
      author: comment.author?.login || comment.user?.login || null,
      bodyPreview: String(comment.body || comment.bodyText || '').slice(0, 240),
    };
    const ts = createdAt ? Date.parse(createdAt) : NaN;
    if (!Number.isNaN(handoffTs) && !Number.isNaN(ts) && ts > handoffTs) {
      lateComments.push(entry);
    } else {
      priorComments.push(entry);
    }
  }

  return {
    unresolvedReviewThreads: unresolvedThreads,
    resolvedReviewThreads: resolvedThreads,
    lateIssueComments: lateComments,
    priorIssueComments: priorComments,
    reviewSubmissions: (reviewSubmissions || []).map((review) => ({
      id: String(review.id || review.databaseId || ''),
      state: review.state || null,
      author: review.author?.login || review.user?.login || null,
      submittedAt: review.submittedAt || review.submitted_at || null,
      bodyPreview: String(review.body || '').slice(0, 240),
    })),
  };
}

/**
 * Normalize check-run evidence for the current head.
 */
export function normalizeChecks(checks = []) {
  return (checks || []).map((check) => ({
    name: check.name || check.context || '',
    status: check.status || null,
    conclusion: check.conclusion || check.state || null,
    headSha: normalizeSha(check.headSha || check.head_sha || check.commit_sha || ''),
    completedAt: check.completedAt || check.completed_at || null,
  }));
}

/**
 * Build the normalized current-head controller packet.
 * Caller must re-read Issue + PR immediately before invoking this.
 */
export function buildEvidencePacket({
  sourceIssue,
  pullRequest,
  event,
  checks = [],
  changedFiles = [],
  reviewThreads = [],
  reviewSubmissions = [],
  issueComments = [],
  observedHeadSha = null,
  rereadAt = null,
  deliveryProfile = null,
} = {}) {
  const issueResolution = resolveExactOpenSourceIssue(sourceIssue ? [sourceIssue] : []);
  if (!issueResolution.ok) return issueResolution;

  const issueNumber = issueResolution.issueNumber;
  const prNumber = pullRequest?.number == null ? null : Number(pullRequest.number);
  const authoritativeHead = normalizeSha(
    pullRequest?.headRefOid ||
      pullRequest?.headSha ||
      pullRequest?.head?.sha ||
      '',
  );

  const headCheck = assertCurrentHeadSha({
    expectedHeadSha: authoritativeHead,
    observedHeadSha: observedHeadSha || authoritativeHead,
  });
  if (!headCheck.ok) return headCheck;

  const profile = deliveryProfile || extractDeliveryProfile(pullRequest?.body || '');
  const profileCheck = assertOwnershipProfileConsistency({
    deliveryModel: profile.deliveryModel,
    targetEnvironment: profile.targetEnvironment,
    approvalProfile: profile.approvalProfile,
    componentBranch: profile.componentBranch,
    baseRef: pullRequest?.baseRefName || pullRequest?.base?.ref || null,
  });
  if (!profileCheck.ok) return profileCheck;

  if (!event?.eventType || !event?.commentId) {
    return failClosed('missing_event_authority', 'Canonical handoff/review event is required.');
  }

  const envelope = normalizeEventEnvelope({
    sourceIssueNumber: issueNumber,
    event,
    prNumber,
    headSha: headCheck.headSha,
    profile: profile.deliveryModel || null,
    status: 'current_head_packet',
  });

  const partitioned = partitionReviewEvidence({
    reviewThreads,
    issueComments,
    reviewSubmissions,
    handoffCreatedAt: event.createdAt,
  });

  const acceptanceFromIssue = extractAcceptanceCriteria(sourceIssue.body || '');
  const acceptanceFromPr = extractAcceptanceCriteria(pullRequest?.body || '');

  const protectedDecisions = protectedDecisionInventory().map((item) => ({
    ...item,
    automatable: false,
  }));

  return {
    ok: true,
    packet: {
      schemaVersion: 1,
      collectedAt: rereadAt || new Date().toISOString(),
      mode: 'observe-only',
      mutationAllowed: false,
      event: envelope,
      sourceIssue: {
        number: issueNumber,
        state: sourceIssue.state || 'OPEN',
        title: sourceIssue.title || null,
        labels: normalizeLabelNames(sourceIssue.labels || []),
        acceptanceCriteria: acceptanceFromIssue,
      },
      pullRequest: {
        number: prNumber,
        title: pullRequest?.title || null,
        state: pullRequest?.state || null,
        baseRef: pullRequest?.baseRefName || pullRequest?.base?.ref || null,
        headRef: pullRequest?.headRefName || pullRequest?.head?.ref || null,
        headSha: headCheck.headSha,
        url: pullRequest?.url || pullRequest?.html_url || null,
        deliveryProfile: profile,
        acceptanceCriteria: acceptanceFromPr,
        changedFiles: [...changedFiles].map(String).sort(),
      },
      checks: normalizeChecks(checks),
      reviewEvidence: {
        unresolvedReviewThreads: partitioned.unresolvedReviewThreads,
        resolvedReviewThreads: partitioned.resolvedReviewThreads,
        lateIssueComments: partitioned.lateIssueComments,
        priorIssueCommentsCount: partitioned.priorIssueComments.length,
        reviewSubmissions: partitioned.reviewSubmissions,
        distinctions: {
          unresolvedThreadsRepresentedSeparately: true,
          lateCommentsRepresentedSeparately: true,
        },
      },
      protectedBoundaries: {
        nonAutomatable: protectedDecisions,
        classes: protectedDecisions.map((item) => item.decisionClass),
      },
      idempotency: {
        actionIdentity: envelope.actionIdentity,
        key: {
          sourceIssueNumber: issueNumber,
          eventType: envelope.eventType,
          eventCommentId: envelope.eventCommentId,
          prNumber,
          headSha: headCheck.headSha,
        },
      },
      reread: {
        performed: true,
        at: rereadAt || null,
        surfaces: ['source_issue', 'pull_request', 'checks', 'review_threads'],
      },
    },
  };
}

export function markDecision(decisionClass) {
  return classifyDecisionAutomatability(decisionClass);
}

function extractDeliveryProfile(prBody = '') {
  const read = (label) => {
    const re = new RegExp(`^\\s*(?:[-*]\\s*)?(?:\\*\\*)?${label}(?:\\*\\*)?\\s*:\\s*(.+)\\s*$`, 'im');
    const match = String(prBody || '').match(re);
    if (!match) return null;
    const value = match[1].replace(/<!--.*?-->/g, '').trim();
    if (!value || /^_+$/.test(value) || value.toLowerCase() === 'not-applicable') return null;
    return value;
  };
  return {
    deliveryModel: read('Delivery model'),
    targetEnvironment: read('Target environment'),
    approvalProfile: read('Approval profile'),
    gateProfile: read('Gate profile'),
    componentBranch: read('Component branch'),
    componentMaster: read('Component master'),
  };
}

function firstThreadBody(thread = {}) {
  if (thread.body) return String(thread.body).slice(0, 240);
  const comments = thread.comments?.nodes || thread.comments || [];
  if (Array.isArray(comments) && comments[0]?.body) {
    return String(comments[0].body).slice(0, 240);
  }
  return '';
}

function normalizeLabelNames(labels = []) {
  return labels
    .map((label) => (typeof label === 'string' ? label : label?.name || ''))
    .filter(Boolean);
}

function normalizeSha(value = '') {
  const sha = String(value || '').trim().toLowerCase();
  return /^[0-9a-f]{7,40}$/.test(sha) ? sha : '';
}

function normalizeRef(value = '') {
  return String(value || '').replace(/^refs\/heads\//, '').trim();
}

function failClosed(code, message, details = {}) {
  return { ok: false, code, message, ...details };
}
