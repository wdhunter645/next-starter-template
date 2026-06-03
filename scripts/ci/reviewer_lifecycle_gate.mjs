#!/usr/bin/env node

import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import {
  classifyProtectedScope,
  evaluateReviewerAccounting,
} from './reviewer-gate-simulation.mjs';

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
const RESOLVED_MARKER = /✅\s*Addressed|addressed in|\bresolved\b|all checks passed|no warnings detected/i;
const UNRESOLVED_MARKER = /\bunresolved\b|\bnot\s+resolved\b|\bstill\s+open\b|\bstill\s+blocking\b/i;

export function isTrustedReviewer(login = '') {
  return TRUSTED_USERS.has(login);
}

export function isResolvedReviewText(body = '') {
  return RESOLVED_MARKER.test(body || '') && !UNRESOLVED_MARKER.test(body || '');
}

export function isProtectedPath(filePath = '') {
  return filePath.startsWith('.github/workflows/') || filePath.startsWith('scripts/ci/');
}

export function computeCurrentHeadLinkedReview({ reviews = [], reviewComments = [], headSha = '' } = {}) {
  if (!headSha) return false;

  const linkedReviews = reviews.some((review) => (
    isTrustedReviewer(review.user?.login || '') &&
    review.commit_id === headSha &&
    review.state !== 'PENDING'
  ));

  const linkedComments = reviewComments.some((comment) => (
    isTrustedReviewer(comment.user?.login || '') &&
    comment.commit_id === headSha
  ));

  return linkedReviews || linkedComments;
}

export function countUnresolvedProtectedThreads({
  reviewComments = [],
  reviews = [],
  headSha = '',
} = {}) {
  let unresolved = 0;

  for (const comment of reviewComments) {
    const user = comment.user?.login || '';
    const body = comment.body || '';
    const path = comment.path || '';

    if (!isTrustedReviewer(user)) continue;
    if (IGNORE_MARKER.test(body)) continue;
    if (comment.commit_id && headSha && comment.commit_id !== headSha) continue;
    if (!isProtectedPath(path)) continue;
    if (comment.line == null && comment.position == null) continue;
    if (isResolvedReviewText(body)) continue;

    unresolved += 1;
  }

  for (const review of reviews) {
    const user = review.user?.login || '';
    const body = review.body || '';

    if (!isTrustedReviewer(user)) continue;
    if (review.commit_id && headSha && review.commit_id !== headSha) continue;
    if (review.state !== 'CHANGES_REQUESTED') continue;
    if (isResolvedReviewText(body)) continue;

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
    if (review.state === 'APPROVED' || review.state === 'COMMENTED') findings += 1;
    if (review.state === 'CHANGES_REQUESTED') findings += 1;
  }

  return findings;
}

export function buildReviewerLifecycleReport({
  assessment,
  scope,
  headSha = '',
  enforceFailure = false,
  currentHeadLinkedReview = false,
  unresolvedProtectedThreads = 0,
  advisoryFindings = 0,
}) {
  const lines = [
    assessment.ok
      ? 'Reviewer lifecycle gate passed.'
      : enforceFailure
        ? 'Reviewer lifecycle gate failed.'
        : 'Reviewer lifecycle gate advisory refreshed.',
    '',
    'Task 003 model: reviewer timing and PR-body rituals are not synchronous merge blockers.',
    'Protected CI scope may still require a current-head trusted review artifact.',
    'Late reviewer findings are audited post-merge and can pause orchestration.',
    '',
    `Current head SHA: ${headSha || 'unknown'}`,
    `Protected scope: ${scope.hasProtectedScope ? 'yes' : 'no'}`,
    `Current-head trusted review artifact: ${currentHeadLinkedReview ? 'yes' : 'no'}`,
    `Unresolved protected review threads: ${unresolvedProtectedThreads}`,
    `Advisory reviewer findings: ${advisoryFindings}`,
    `Assessment severity: ${assessment.severity}`,
    `Assessment reason: ${assessment.reason}`,
    `Enforcing event: ${enforceFailure ? 'yes' : 'no'}`,
  ];

  if (!assessment.ok && enforceFailure) {
    lines.push('', 'Resolve the blocking reviewer condition or wait for trusted review on protected CI files.');
  } else if (advisoryFindings > 0) {
    lines.push('', 'Advisory reviewer findings remain visible for PR readiness but do not block merge by timing alone.');
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
  headSha = '',
  enforceFailure = false,
}) {
  const scope = classifyProtectedScope(files);
  const currentHeadLinkedReview = computeCurrentHeadLinkedReview({ reviews, reviewComments, headSha });
  const unresolvedProtectedThreads = countUnresolvedProtectedThreads({ reviewComments, reviews, headSha });
  const advisoryFindings = countAdvisoryFindings({ issueComments, reviewComments, reviews });
  const assessment = evaluateReviewerAccounting({
    eventName,
    labels,
    files,
    currentHeadLinkedReview,
    unresolvedProtectedThreads,
    advisoryFindings,
  });

  return {
    scope,
    assessment,
    currentHeadLinkedReview,
    unresolvedProtectedThreads,
    advisoryFindings,
    enforceFailure,
    report: buildReviewerLifecycleReport({
      assessment,
      scope,
      headSha,
      enforceFailure,
      currentHeadLinkedReview,
      unresolvedProtectedThreads,
      advisoryFindings,
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

export async function runReviewerLifecycleGate({
  token,
  owner,
  repo,
  prNumber,
  eventName = 'pull_request_target',
  enforceFailure = eventName === 'pull_request_target',
}) {
  const pull = await request(`/repos/${owner}/${repo}/pulls/${prNumber}`, token);
  const [files, issueComments, reviewComments, reviews] = await Promise.all([
    paginate(`/repos/${owner}/${repo}/pulls/${prNumber}/files`, token),
    paginate(`/repos/${owner}/${repo}/issues/${prNumber}/comments`, token),
    paginate(`/repos/${owner}/${repo}/pulls/${prNumber}/comments`, token),
    paginate(`/repos/${owner}/${repo}/pulls/${prNumber}/reviews`, token),
  ]);

  const result = assessReviewerLifecycle({
    eventName,
    labels: (pull.labels || []).map((label) => label.name),
    files: files.map((file) => file.filename),
    issueComments,
    reviewComments,
    reviews,
    headSha: pull.head?.sha || '',
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
  const enforceFailure = (process.env.ENFORCE_FAILURE || (eventName === 'pull_request_target' ? 'true' : 'false')) === 'true';

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

  await upsertGateComment({
    token,
    owner,
    repo,
    prNumber: result.prNumber,
    marker: result.marker,
    body: result.report,
  });

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
