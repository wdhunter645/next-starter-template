#!/usr/bin/env node

import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import {
  classifyProtectedScope,
  evaluateReviewerAccounting,
  isEnforcingReviewerLifecycleEvent,
} from './reviewer-gate-simulation.mjs';
import {
  evaluateReviewerCommentDisposition,
  hasValidDisposition,
  parseReviewerDispositions,
} from './reviewer_comment_disposition.mjs';

export { isEnforcingReviewerLifecycleEvent } from './reviewer-gate-simulation.mjs';

export const TRUSTED_REVIEWERS = [
  {
    name: 'Copilot',
    users: ['copilot-pull-request-reviewer[bot]', 'copilot-pull-request-reviewer', 'Copilot'],
  },
  {
    name: 'Cubic',
    users: ['cubic-dev-ai[bot]', 'cubic-dev-ai'],
  },
  {
    name: 'Gemini',
    users: ['gemini-code-assist[bot]', 'gemini-code-assist'],
  },
  {
    name: 'Codex',
    users: ['chatgpt-codex-connector[bot]', 'chatgpt-codex-connector'],
  },
];

const TRUSTED_USERS = new Set(TRUSTED_REVIEWERS.flatMap((reviewer) => reviewer.users));
const IGNORE_MARKER = /<!--\s*reviewer-response-ignore\s*-->/i;
export const BREAK_GLASS_MARKER = /<!--\s*reviewer-lifecycle-break-glass\s*-->/i;
const RESOLVED_MARKER = /✅\s*Addressed|addressed in|\bresolved\b|all checks passed|no warnings detected/i;
const UNRESOLVED_MARKER = /\bunresolved\b|\bnot\s+resolved\b|\bstill\s+open\b|\bstill\s+blocking\b/i;
const LINKED_REVIEW_STATES = new Set(['APPROVED', 'COMMENTED']);

export function isTrustedReviewer(login = '') {
  return TRUSTED_USERS.has(login);
}

export function isResolvedReviewText(body = '') {
  return RESOLVED_MARKER.test(body || '') && !UNRESOLVED_MARKER.test(body || '');
}

export function isProtectedPath(filePath = '') {
  return filePath.startsWith('.github/workflows/') || filePath.startsWith('scripts/ci/');
}

function isTrustedReviewLinkedToHead(review, headSha) {
  return (
    isTrustedReviewer(review.user?.login || '') &&
    Boolean(review.commit_id) &&
    review.commit_id === headSha &&
    review.state !== 'PENDING' &&
    review.state !== 'DISMISSED' &&
    LINKED_REVIEW_STATES.has(review.state)
  );
}

function isTrustedCommentLinkedToHead(comment, headSha) {
  return (
    isTrustedReviewer(comment.user?.login || '') &&
    Boolean(comment.commit_id) &&
    comment.commit_id === headSha
  );
}

export function hasProtectedScopeBreakGlass({ labels = [], body = '' } = {}) {
  const names = labels.map((label) => (typeof label === 'string' ? label : label?.name)).filter(Boolean);
  return names.includes('recovery') && BREAK_GLASS_MARKER.test(body || '');
}

export function hasStaleTrustedReviewOnly({ reviews = [], reviewComments = [], headSha = '' } = {}) {
  if (!headSha) return false;
  if (computeCurrentHeadLinkedReview({ reviews, reviewComments, headSha })) return false;

  const staleReview = reviews.some((review) => (
    isTrustedReviewer(review.user?.login || '') &&
    Boolean(review.commit_id) &&
    review.commit_id !== headSha &&
    review.state !== 'PENDING' &&
    review.state !== 'DISMISSED'
  ));
  const staleComment = reviewComments.some((comment) => (
    isTrustedReviewer(comment.user?.login || '') &&
    Boolean(comment.commit_id) &&
    comment.commit_id !== headSha
  ));

  return staleReview || staleComment;
}

export function computeCurrentHeadLinkedReview({ reviews = [], reviewComments = [], headSha = '' } = {}) {
  if (!headSha) return false;

  const linkedReviews = reviews.some((review) => isTrustedReviewLinkedToHead(review, headSha));
  const linkedComments = reviewComments.some((comment) => isTrustedCommentLinkedToHead(comment, headSha));

  return linkedReviews || linkedComments;
}

function resolveThreadRootId(comment, commentsById) {
  let current = comment;
  const visited = new Set();

  while (current?.in_reply_to_id) {
    if (visited.has(current.in_reply_to_id)) {
      return current.in_reply_to_id;
    }
    visited.add(current.in_reply_to_id);

    const parent = commentsById.get(current.in_reply_to_id);
    if (!parent) {
      return current.in_reply_to_id;
    }
    current = parent;
  }

  return current.id;
}

function sortCommentsChronologically(comments) {
  return [...comments].sort((left, right) => {
    const leftTime = Date.parse(left.created_at || '') || 0;
    const rightTime = Date.parse(right.created_at || '') || 0;
    if (leftTime !== rightTime) {
      return leftTime - rightTime;
    }
    return (left.id || 0) - (right.id || 0);
  });
}

export function countUnresolvedProtectedThreads({
  reviewComments = [],
  reviews = [],
  body = '',
} = {}) {
	let unresolved = 0;
	const dispositions = parseReviewerDispositions(body);
	const commentsById = new Map(
		reviewComments.filter((comment) => comment.id != null).map((comment) => [comment.id, comment]),
	);
	const threads = new Map();

	for (const comment of reviewComments) {
		const threadId = resolveThreadRootId(comment, commentsById);
		if (!threads.has(threadId)) {
			threads.set(threadId, []);
		}
		threads.get(threadId).push(comment);
	}

	for (const comments of threads.values()) {
		const orderedComments = sortCommentsChronologically(comments);
		const firstComment = orderedComments[0];
		const latestComment = orderedComments[orderedComments.length - 1];
		const user = firstComment.user?.login || '';
		const path = firstComment.path || '';
		const threadId = String(resolveThreadRootId(firstComment, commentsById));

		if (!isTrustedReviewer(user)) continue;
		if (!isProtectedPath(path)) continue;
		if (firstComment.line == null && firstComment.position == null) continue;
		if (orderedComments.some((comment) => IGNORE_MARKER.test(comment.body || ''))) continue;
		if (hasValidDisposition(dispositions.get(threadId))) continue;
		if (isResolvedReviewText(latestComment.body || '')) continue;

		unresolved += 1;
	}

  const latestReviews = new Map();
  for (const review of reviews) {
    const user = review.user?.login || '';
    if (!isTrustedReviewer(user)) continue;

    const existing = latestReviews.get(user);
    const reviewTime = Date.parse(review.submitted_at || '') || review.id || 0;
    const existingTime = existing
      ? Date.parse(existing.submitted_at || '') || existing.id || 0
      : -1;

    if (!existing || reviewTime >= existingTime) {
      latestReviews.set(user, review);
    }
  }

  for (const review of latestReviews.values()) {
    if (review.state !== 'CHANGES_REQUESTED') continue;
    if (IGNORE_MARKER.test(review.body || '')) continue;
    if (isResolvedReviewText(review.body || '')) continue;
    unresolved += 1;
  }

  return unresolved;
}

export function countAdvisoryFindings({
  issueComments = [],
  reviewComments = [],
  reviews = [],
} = {}) {
  let findings = 0;

  for (const comment of issueComments) {
    if (!isTrustedReviewer(comment.user?.login || '')) continue;
    if (IGNORE_MARKER.test(comment.body || '')) continue;
    findings += 1;
  }

  for (const comment of reviewComments) {
    if (!isTrustedReviewer(comment.user?.login || '')) continue;
    if (IGNORE_MARKER.test(comment.body || '')) continue;
    if (isResolvedReviewText(comment.body || '')) continue;
    findings += 1;
  }

  for (const review of reviews) {
    if (!isTrustedReviewer(review.user?.login || '')) continue;
    if (isResolvedReviewText(review.body || '')) continue;
    if (review.state === 'COMMENTED') findings += 1;
    if (review.state === 'CHANGES_REQUESTED') findings += 1;
  }

  return findings;
}

function readyForReviewClaimed(body = '') {
  return /Status:\s*READY FOR REVIEW/i.test(String(body || ''));
}

export function buildReviewerLifecycleReport({
  assessment,
  scope,
  headSha = '',
  enforceFailure = false,
  currentHeadLinkedReview = false,
  staleTrustedReviewOnly = false,
  breakGlassOverride = false,
  unresolvedProtectedThreads = 0,
  advisoryFindings = 0,
  reviewerDisposition = null,
}) {
  const lines = [
    assessment.ok
      ? 'Reviewer lifecycle gate passed.'
      : enforceFailure
        ? 'Reviewer lifecycle gate failed.'
        : 'Reviewer lifecycle gate advisory refreshed.',
    '',
    'Every actionable trusted reviewer comment must be resolved, explicitly dispositioned in the PR body, or linked to a bounded follow-up issue.',
    'Outdated review threads require explicit PR-body disposition with review-comment ID and thread state.',
    'Protected CI scope additionally requires a current-head trusted review artifact on the enforced SHA.',
    'Late reviewer findings arriving after READY FOR REVIEW must be dispositioned before merge.',
    '',
    `Current head SHA: ${headSha || 'unknown'}`,
    `Protected scope: ${scope.hasProtectedScope ? 'yes' : 'no'}`,
    `Current-head trusted review artifact: ${currentHeadLinkedReview ? 'yes' : 'no'}`,
    `Stale trusted review only (earlier commit): ${staleTrustedReviewOnly ? 'yes' : 'no'}`,
    `Break-glass override active: ${breakGlassOverride ? 'yes' : 'no'}`,
    `Unresolved protected review threads: ${unresolvedProtectedThreads}`,
    `Undispositioned reviewer comments: ${reviewerDisposition?.undispositionedCount ?? 0}`,
    `Outdated threads without disposition: ${reviewerDisposition?.outdatedWithoutDispositionCount ?? 0}`,
    `Late pre-merge reviewer findings: ${reviewerDisposition?.lateFindingsCount ?? 0}`,
    `Late undispositioned reviewer findings: ${reviewerDisposition?.lateUndispositionedCount ?? 0}`,
    `Advisory reviewer findings: ${advisoryFindings}`,
    `Assessment severity: ${assessment.severity}`,
    `Assessment reason: ${assessment.reason}`,
    `Enforcing event: ${enforceFailure ? 'yes' : 'no'}`,
  ];

  if (breakGlassOverride) {
    lines.push(
      '',
      'Break-glass override: recovery label plus `<!-- reviewer-lifecycle-break-glass -->` in the PR body.',
      'This merge path bypasses current-head protected review enforcement and is recorded for post-merge audit.',
    );
  } else if (!assessment.ok && enforceFailure) {
    lines.push('', 'Resolve the blocking reviewer condition or wait for trusted review on the current head SHA for protected CI files.');
    if (staleTrustedReviewOnly) {
      lines.push('Trusted review exists on an earlier commit only; re-run trusted review on the current head SHA.');
    }
  } else if (advisoryFindings > 0) {
    lines.push('', 'Advisory reviewer findings remain visible for PR readiness but do not block merge by timing alone.');
  }

  if (reviewerDisposition?.failures?.length) {
    lines.push('', '## Reviewer disposition failures');
    for (const failure of reviewerDisposition.failures) {
      lines.push(`- ${failure.code}: ${failure.message}`);
    }
  }

  return lines.join('\n');
}

export function assessReviewerLifecycle({
  eventName = 'pull_request_target',
  labels = [],
  files = [],
  reviews = [],
  reviewComments = [],
  issueComments = [],
  body = '',
  headSha = '',
  readyForReviewAt = '',
  enforceFailure = false,
}) {
  const scope = classifyProtectedScope(files);
  const currentHeadLinkedReview = computeCurrentHeadLinkedReview({ reviews, reviewComments, headSha });
  const staleTrustedReviewOnly = hasStaleTrustedReviewOnly({ reviews, reviewComments, headSha });
  const breakGlassOverride = hasProtectedScopeBreakGlass({ labels, body });
  const unresolvedProtectedThreads = countUnresolvedProtectedThreads({ reviewComments, reviews, body });
  const advisoryFindings = countAdvisoryFindings({ issueComments, reviewComments, reviews });
  const reviewerDisposition = evaluateReviewerCommentDisposition({
    body,
    issueComments,
    reviewComments,
    reviews,
    headSha,
    readyForReviewAt: readyForReviewAt || (readyForReviewClaimed(body) ? '' : ''),
    auditPhase: 'pre_merge',
  });
  const assessment = evaluateReviewerAccounting({
    eventName,
    labels,
    files,
    currentHeadLinkedReview,
    staleTrustedReviewOnly,
    breakGlassOverride,
    unresolvedProtectedThreads,
    advisoryFindings,
    undispositionedReviewerComments: reviewerDisposition.undispositionedCount,
    outdatedWithoutDisposition: reviewerDisposition.outdatedWithoutDispositionCount,
    lateUndispositionedReviewerComments: reviewerDisposition.lateUndispositionedCount,
  });

  return {
    scope,
    assessment,
    currentHeadLinkedReview,
    staleTrustedReviewOnly,
    breakGlassOverride,
    unresolvedProtectedThreads,
    advisoryFindings,
    reviewerDisposition,
    enforceFailure,
    report: buildReviewerLifecycleReport({
      assessment,
      scope,
      headSha,
      enforceFailure,
      currentHeadLinkedReview,
      staleTrustedReviewOnly,
      breakGlassOverride,
      unresolvedProtectedThreads,
      advisoryFindings,
      reviewerDisposition,
    }),
    shouldFail: enforceFailure && !assessment.ok && assessment.severity === 'blocking',
  };
}

async function request(path, token, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'lgfc-reviewer-lifecycle-gate',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${options.method || 'GET'} ${path} failed: ${response.status} ${text}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function paginate(path, token) {
  const results = [];
  let page = 1;

  while (true) {
    const separator = path.includes('?') ? '&' : '?';
    const data = await request(`${path}${separator}per_page=100&page=${page}`, token);
    if (!Array.isArray(data) || data.length === 0) break;
    results.push(...data);
    if (data.length < 100) break;
    page += 1;
  }

  return results;
}

async function resolveReadyForReviewAt({ owner, repo, prNumber, token, body = '' }) {
  if (!readyForReviewClaimed(body)) return '';

  try {
    const events = await paginate(`/repos/${owner}/${repo}/issues/${prNumber}/timeline`, token);
    const readyEvents = events
      .filter((event) => event.event === 'ready_for_review' && event.created_at)
      .sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at));
    return readyEvents[0]?.created_at || '';
  } catch {
    return '';
  }
}

export async function runReviewerLifecycleGate({
  token,
  owner,
  repo,
  prNumber,
  eventName = 'pull_request_target',
  enforceFailure = isEnforcingReviewerLifecycleEvent(eventName),
}) {
  const pull = await request(`/repos/${owner}/${repo}/pulls/${prNumber}`, token);
  const [files, issueComments, reviewComments, reviews, readyForReviewAt] = await Promise.all([
    paginate(`/repos/${owner}/${repo}/pulls/${prNumber}/files`, token),
    paginate(`/repos/${owner}/${repo}/issues/${prNumber}/comments`, token),
    paginate(`/repos/${owner}/${repo}/pulls/${prNumber}/comments`, token),
    paginate(`/repos/${owner}/${repo}/pulls/${prNumber}/reviews`, token),
    resolveReadyForReviewAt({ owner, repo, prNumber, token, body: pull.body || '' }),
  ]);

  const result = assessReviewerLifecycle({
    eventName,
    labels: (pull.labels || []).map((label) => label.name),
    files: files.map((file) => file.filename),
    issueComments,
    reviewComments,
    reviews,
    body: pull.body || '',
    headSha: pull.head?.sha || '',
    readyForReviewAt,
    enforceFailure,
  });

  return {
    ...result,
    prNumber,
    marker: '<!-- reviewer-lifecycle-gate -->',
  };
}

export async function upsertGateComment({ token, owner, repo, prNumber, marker, body }) {
  const comments = await paginate(`/repos/${owner}/${repo}/issues/${prNumber}/comments`, token);
  const existing = comments.find((comment) => (comment.body || '').includes(marker));
  const commentBody = `${marker}\n\n${body}`;

  if (existing) {
    await request(`/repos/${owner}/${repo}/issues/comments/${existing.id}`, token, {
      method: 'PATCH',
      body: JSON.stringify({ body: commentBody }),
    });
    return;
  }

  await request(`/repos/${owner}/${repo}/issues/${prNumber}/comments`, token, {
    method: 'POST',
    body: JSON.stringify({ body: commentBody }),
  });
}

async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  const prNumber = process.env.PR_NUMBER;
  const eventName = process.env.GITHUB_EVENT_NAME || 'pull_request_target';
  const enforceFailure = (process.env.ENFORCE_FAILURE || (isEnforcingReviewerLifecycleEvent(eventName) ? 'true' : 'false')) === 'true';

  if (!token || !repository || !prNumber) {
    throw new Error('GITHUB_TOKEN/GH_TOKEN, GITHUB_REPOSITORY, and PR_NUMBER are required.');
  }

  const [owner, repo] = repository.split('/');
  const result = await runReviewerLifecycleGate({
    token,
    owner,
    repo,
    prNumber,
    eventName,
    enforceFailure,
  });

  try {
    await upsertGateComment({
      token,
      owner,
      repo,
      prNumber: result.prNumber,
      marker: result.marker,
      body: result.report,
    });
  } catch (error) {
    console.warn(`Failed to upsert reviewer lifecycle gate comment: ${error.message}`);
    console.warn('Continuing with gate result; merge blocking depends on assessment only.');
  }

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    fs.appendFileSync(summaryPath, `\n### Reviewer lifecycle gate\n\n${result.report}\n`);
  }

  console.log(result.report);
  if (result.shouldFail) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
