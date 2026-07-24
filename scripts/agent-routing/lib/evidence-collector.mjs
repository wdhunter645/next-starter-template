/**
 * Read-only current-head evidence collector for the deterministic handoff controller.
 * Produces a normalized packet; performs no GitHub mutations.
 *
 * Authoritative evidence comes from GitHub-native live reads (or an injected live
 * snapshot produced by those reads). Caller-supplied snapshot/reread fields are
 * hints only and must match live state or fail closed.
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
 * Fail closed when a PR number is absent, non-numeric, or non-positive.
 */
export function assertValidPrNumber(value) {
  if (value == null || value === '') {
    return failClosed('invalid_pr_number', 'Pull request number is missing.');
  }
  const prNumber = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(prNumber) || !Number.isInteger(prNumber) || prNumber <= 0) {
    return failClosed('invalid_pr_number', 'Pull request number is invalid.', {
      received: value,
    });
  }
  return { ok: true, prNumber };
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
 * Normalize check-run evidence and retain only checks for the authoritative head.
 * @param {Array<object>} [checks]
 * @param {string|null} [authoritativeHeadSha]
 */
export function normalizeChecks(checks = [], authoritativeHeadSha = null) {
  const head = normalizeSha(authoritativeHeadSha || '');
  return (checks || [])
    .map((check) => ({
      name: check.name || check.context || '',
      status: check.status || null,
      conclusion: check.conclusion || check.state || null,
      headSha: normalizeSha(check.headSha || check.head_sha || check.commit_sha || ''),
      completedAt: check.completedAt || check.completed_at || null,
    }))
    .filter((check) => {
      if (!head) return true;
      return check.headSha === head;
    });
}

/**
 * Compare optional caller/trigger hints against authoritative live evidence.
 * Hints may be omitted; when present they must match live identity fields.
 * @param {{ hints?: object|null, live?: object|null }} [args]
 */
export function assertHintsMatchLive({ hints = null, live = null } = {}) {
  if (!live) {
    return failClosed(
      'live_evidence_unavailable',
      'Authoritative live GitHub evidence is required before packet emission.',
    );
  }
  if (!live.sourceIssue) {
    return failClosed('missing_source_issue', 'Live source Issue evidence is missing.');
  }
  if (!live.pullRequest) {
    return failClosed('missing_pull_request', 'Live pull request evidence is missing.');
  }
  if (!hints || typeof hints !== 'object') return { ok: true };

  const liveIssueNumber = Number(live.sourceIssue.number);
  const livePrCheck = assertValidPrNumber(live.pullRequest.number);
  if (!livePrCheck.ok) return livePrCheck;
  const liveHead = normalizeSha(
    live.pullRequest?.headRefOid ||
      live.pullRequest?.headSha ||
      live.pullRequest?.head?.sha ||
      live.headSha ||
      '',
  );
  if (!liveHead) {
    return failClosed('missing_expected_head_sha', 'Authoritative live PR head SHA is missing.');
  }

  const hintIssue = hints.sourceIssue || hints.reread?.sourceIssue || null;
  if (hintIssue?.number != null) {
    const hintIssueNumber = Number(hintIssue.number);
    if (hintIssueNumber !== liveIssueNumber) {
      return failClosed('hint_source_issue_mismatch', 'Caller hint source Issue does not match live Issue.', {
        hintIssueNumber,
        liveIssueNumber,
      });
    }
  }

  const hintPr = hints.pullRequest || hints.reread?.pullRequest || null;
  if (hintPr?.number != null) {
    const hintPrCheck = assertValidPrNumber(hintPr.number);
    if (!hintPrCheck.ok) return hintPrCheck;
    if (hintPrCheck.prNumber !== livePrCheck.prNumber) {
      return failClosed('hint_pr_number_mismatch', 'Caller hint PR number does not match live PR.', {
        hintPrNumber: hintPrCheck.prNumber,
        livePrNumber: livePrCheck.prNumber,
      });
    }
    const hintHead = normalizeSha(
      hintPr.headRefOid || hintPr.headSha || hintPr.head?.sha || '',
    );
    if (hintHead && hintHead !== liveHead) {
      return failClosed('hint_head_sha_mismatch', 'Caller hint head SHA does not match live PR head.', {
        hintHeadSha: hintHead,
        liveHeadSha: liveHead,
      });
    }
  }

  if (hints.observedHeadSha) {
    const observed = normalizeSha(hints.observedHeadSha);
    if (observed && observed !== liveHead) {
      return failClosed('stale_head_sha', 'Observed head SHA does not match the current PR head.', {
        expectedHeadSha: liveHead,
        observedHeadSha: observed,
      });
    }
  }

  if (hints.reread?.sourceIssue || hints.reread?.pullRequest) {
    const rereadIssueNumber =
      hints.reread.sourceIssue?.number != null
        ? Number(hints.reread.sourceIssue.number)
        : null;
    if (rereadIssueNumber != null && rereadIssueNumber !== liveIssueNumber) {
      return failClosed(
        'fabricated_reread_rejected',
        'Caller-supplied reread Issue cannot substitute for live GitHub evidence.',
        { rereadIssueNumber, liveIssueNumber },
      );
    }
    const rereadPr = hints.reread.pullRequest;
    if (rereadPr?.number != null) {
      const rereadPrCheck = assertValidPrNumber(rereadPr.number);
      if (!rereadPrCheck.ok) return rereadPrCheck;
      if (rereadPrCheck.prNumber !== livePrCheck.prNumber) {
        return failClosed(
          'fabricated_reread_rejected',
          'Caller-supplied reread PR cannot substitute for live GitHub evidence.',
          { rereadPrNumber: rereadPrCheck.prNumber, livePrNumber: livePrCheck.prNumber },
        );
      }
    }
    const rereadHead = normalizeSha(
      rereadPr?.headRefOid || rereadPr?.headSha || rereadPr?.head?.sha || '',
    );
    if (rereadHead && rereadHead !== liveHead) {
      return failClosed(
        'fabricated_reread_rejected',
        'Caller-supplied reread head SHA cannot substitute for live GitHub evidence.',
        { rereadHeadSha: rereadHead, liveHeadSha: liveHead },
      );
    }
  }

  return { ok: true, liveHeadSha: liveHead, livePrNumber: livePrCheck.prNumber };
}

/**
 * Collect authoritative live evidence via GitHub-native read-only REST/GraphQL.
 * Injectable fetchFn supports unit tests without network.
 * @param {{
 *   repository: string,
 *   issueNumber: number|string,
 *   prNumber: number|string,
 *   token: string,
 *   fetchFn?: typeof fetch,
 *   userAgent?: string,
 * }} args
 * @returns {Promise<{ok:true, live: object}|{ok:false, code:string, message:string}>}
 */
export async function collectLiveGitHubEvidence({
  repository,
  issueNumber,
  prNumber,
  token,
  fetchFn = globalThis.fetch,
  userAgent = 'lgfc-agent-routing-controller',
} = {}) {
  if (!repository || !String(repository).includes('/')) {
    return failClosed('live_evidence_unavailable', 'GITHUB_REPOSITORY is required for live collection.');
  }
  if (!token) {
    return failClosed('live_evidence_unavailable', 'GITHUB_TOKEN is required for live collection.');
  }
  const issueCheck = resolveExactOpenSourceIssue([{ number: issueNumber, state: 'OPEN' }]);
  if (!issueCheck.ok && issueCheck.code === 'invalid_source_issue') return issueCheck;
  const issueNum = Number(issueNumber);
  if (!Number.isFinite(issueNum) || issueNum <= 0) {
    return failClosed('invalid_source_issue', 'Source Issue number is invalid.');
  }
  const prCheck = assertValidPrNumber(prNumber);
  if (!prCheck.ok) return prCheck;

  const [owner, repo] = String(repository).split('/');
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': userAgent,
  };

  async function ghGet(apiPath) {
    const response = await fetchFn(`https://api.github.com/repos/${repository}${apiPath}`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`GET ${apiPath} failed: ${response.status} ${text}`);
    }
    return response.json();
  }

  async function ghGetAll(apiPath) {
    const items = [];
    let page = 1;
    while (true) {
      const batch = await ghGet(`${apiPath}${apiPath.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
      if (!Array.isArray(batch) || batch.length === 0) break;
      items.push(...batch);
      if (batch.length < 100) break;
      page += 1;
    }
    return items;
  }

  let sourceIssue;
  let pullRequest;
  let changedFileEntries;
  let issueComments;
  let reviewSubmissions;
  let checkRuns;
  let reviewThreads;
  try {
    [sourceIssue, pullRequest, changedFileEntries, issueComments, reviewSubmissions] =
      await Promise.all([
        ghGet(`/issues/${issueNum}`),
        ghGet(`/pulls/${prCheck.prNumber}`),
        ghGetAll(`/pulls/${prCheck.prNumber}/files`),
        ghGetAll(`/issues/${issueNum}/comments`),
        ghGetAll(`/pulls/${prCheck.prNumber}/reviews`),
      ]);

    const headSha = normalizeSha(pullRequest.head?.sha || '');
    if (!headSha) {
      return failClosed('missing_expected_head_sha', 'Authoritative PR head SHA is missing from live PR.');
    }

    const checksPayload = await ghGet(
      `/commits/${headSha}/check-runs?per_page=100`,
    ).catch(async () => {
      // Fall back to check-suites listing when check-runs path is unavailable.
      return { check_runs: [] };
    });
    checkRuns = checksPayload.check_runs || checksPayload || [];

    reviewThreads = await fetchLiveReviewThreads({
      owner,
      repo,
      prNumber: prCheck.prNumber,
      token,
      fetchFn,
      userAgent,
    });
  } catch (error) {
    return failClosed(
      'live_evidence_unavailable',
      `GitHub-native live collection failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!sourceIssue || sourceIssue.pull_request) {
    return failClosed('live_evidence_unavailable', 'Live source Issue read did not return an Issue.');
  }
  if (!pullRequest || pullRequest.number == null) {
    return failClosed('live_evidence_unavailable', 'Live pull request read failed.');
  }

  const headSha = normalizeSha(pullRequest.head?.sha || '');
  const collectedAt = new Date().toISOString();

  return {
    ok: true,
    live: {
      collectedAt,
      source: 'github-native',
      sourceIssue: {
        number: sourceIssue.number,
        state: String(sourceIssue.state || '').toUpperCase() === 'OPEN' ? 'OPEN' : sourceIssue.state,
        title: sourceIssue.title || null,
        body: sourceIssue.body || '',
        labels: (sourceIssue.labels || []).map((label) =>
          typeof label === 'string' ? label : label?.name || '',
        ),
      },
      pullRequest: {
        number: pullRequest.number,
        title: pullRequest.title || null,
        state: pullRequest.state || null,
        body: pullRequest.body || '',
        baseRefName: pullRequest.base?.ref || null,
        headRefName: pullRequest.head?.ref || null,
        headSha,
        head: { sha: headSha },
        url: pullRequest.html_url || null,
        html_url: pullRequest.html_url || null,
      },
      headSha,
      changedFiles: (changedFileEntries || []).map((file) => file.filename || file.path).filter(Boolean),
      checks: (checkRuns || []).map((check) => ({
        name: check.name || check.context || '',
        status: check.status || null,
        conclusion: check.conclusion || check.state || null,
        headSha: normalizeSha(check.head_sha || check.headSha || headSha),
        completedAt: check.completed_at || check.completedAt || null,
      })),
      issueComments: (issueComments || []).map((comment) => ({
        id: String(comment.id),
        createdAt: comment.created_at || null,
        author: { login: comment.user?.login || null },
        body: comment.body || '',
      })),
      reviewSubmissions: (reviewSubmissions || []).map((review) => ({
        id: String(review.id),
        state: review.state || null,
        author: { login: review.user?.login || null },
        submittedAt: review.submitted_at || null,
        body: review.body || '',
      })),
      reviewThreads: reviewThreads || [],
    },
  };
}

async function fetchLiveReviewThreads({
  owner,
  repo,
  prNumber,
  token,
  fetchFn,
  userAgent,
}) {
  const query = `
    query AgentRoutingControllerThreads($owner: String!, $repo: String!, $number: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $number) {
          reviewThreads(first: 100) {
            nodes {
              id
              isResolved
              isOutdated
              path
              comments(first: 1) {
                nodes { body author { login } }
              }
            }
          }
        }
      }
    }
  `;
  const response = await fetchFn('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': userAgent,
    },
    body: JSON.stringify({
      query,
      variables: { owner, repo, number: Number(prNumber) },
    }),
  });
  const payload = await response.json();
  if (!response.ok || payload.errors?.length) {
    throw new Error(
      `GraphQL reviewThreads failed: ${response.status} ${JSON.stringify(payload.errors || payload)}`,
    );
  }
  const nodes = payload.data?.repository?.pullRequest?.reviewThreads?.nodes || [];
  return nodes.map((thread) => ({
    id: thread.id,
    isResolved: Boolean(thread.isResolved),
    isOutdated: Boolean(thread.isOutdated),
    path: thread.path || null,
    body: thread.comments?.nodes?.[0]?.body || '',
    comments: thread.comments,
  }));
}

/**
 * Build the normalized current-head controller packet from authoritative live evidence.
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
  const prNumberCheck = assertValidPrNumber(pullRequest?.number);
  if (!prNumberCheck.ok) return prNumberCheck;
  const prNumber = prNumberCheck.prNumber;

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
      checks: normalizeChecks(checks, headCheck.headSha),
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
        source: 'github-native',
        surfaces: [
          'source_issue',
          'pull_request',
          'checks',
          'changed_files',
          'issue_comments',
          'review_submissions',
          'review_threads',
        ],
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
