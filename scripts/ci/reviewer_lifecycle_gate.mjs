#!/usr/bin/env node

import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import {
  classifyProtectedScope,
  isEnforcingReviewerLifecycleEvent,
} from './reviewer-gate-simulation.mjs';

export { isEnforcingReviewerLifecycleEvent } from './reviewer-gate-simulation.mjs';

export const DEFAULT_TRUSTED_BOT_LOGINS = [
  'copilot-pull-request-reviewer[bot]',
  'copilot-pull-request-reviewer',
  'cubic-dev-ai[bot]',
  'cubic-dev-ai',
  'chatgpt-codex-connector[bot]',
  'chatgpt-codex-connector',
];

export const DEFAULT_EXCEPTION_LABEL = 'reviewer-lifecycle-exception';

function normalizeLogin(login = '') {
  return String(login || '').trim().toLowerCase();
}

export function trustedBotSet(logins = DEFAULT_TRUSTED_BOT_LOGINS) {
  return new Set(logins.map(normalizeLogin).filter(Boolean));
}

export function parseTrustedBotLogins(value = '') {
  if (!value) return DEFAULT_TRUSTED_BOT_LOGINS;
  return value.split(',').map((entry) => entry.trim()).filter(Boolean);
}

export function isTrustedReviewer(login = '', trustedBots = trustedBotSet()) {
  return trustedBots.has(normalizeLogin(login));
}

export function isProtectedPath(filePath = '') {
  return filePath.startsWith('.github/workflows/') || filePath.startsWith('scripts/ci/');
}

function timestamp(value = '') {
  return Date.parse(value || '') || 0;
}

export function latestReviewByAuthor(reviews = []) {
  const latest = new Map();
  for (const review of reviews) {
    const author = review.author?.login || review.user?.login || '';
    if (!author) continue;
    const submittedAt = review.submittedAt || review.submitted_at || review.created_at || '';
    const current = latest.get(author);
    if (!current || timestamp(submittedAt) >= timestamp(current.submittedAt || current.submitted_at || current.created_at || '')) {
      latest.set(author, review);
    }
  }
  return latest;
}

export function humanChangesRequested(reviews = [], trustedBots = trustedBotSet()) {
  const blockers = [];
  for (const [author, review] of latestReviewByAuthor(reviews)) {
    if (isTrustedReviewer(author, trustedBots)) continue;
    if (String(review.state || '').toUpperCase() !== 'CHANGES_REQUESTED') continue;
    blockers.push({
      author,
      submittedAt: review.submittedAt || review.submitted_at || review.created_at || '',
      state: review.state,
    });
  }
  return blockers;
}

function firstThreadComment(thread = {}) {
  if (thread.firstComment) return thread.firstComment;
  const comments = thread.comments?.nodes || thread.comments || [];
  return Array.isArray(comments) ? comments[0] || {} : {};
}

function threadAuthor(thread = {}) {
  const first = firstThreadComment(thread);
  return first.author?.login || first.user?.login || '';
}

function threadExcerpt(thread = {}) {
  const first = firstThreadComment(thread);
  return String(first.body || '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
}

export function hasExceptionLabel(labels = [], exceptionLabel = DEFAULT_EXCEPTION_LABEL) {
  const target = String(exceptionLabel || '').toLowerCase();
  return labels
    .map((label) => (typeof label === 'string' ? label : label?.name || ''))
    .map((label) => label.toLowerCase())
    .includes(target);
}

export function unresolvedReviewThreads(reviewThreads = [], { trustedBots = trustedBotSet(), labels = [], exceptionLabel = DEFAULT_EXCEPTION_LABEL } = {}) {
  const exceptionActive = hasExceptionLabel(labels, exceptionLabel);
  const blocking = [];
  const advisory = [];
  const outdated = [];
  const resolved = [];

  for (const thread of reviewThreads) {
    const author = threadAuthor(thread);
    const trusted = isTrustedReviewer(author, trustedBots);
    const detail = {
      id: thread.id || '',
      author,
      trusted,
      isResolved: Boolean(thread.isResolved),
      isOutdated: Boolean(thread.isOutdated),
      path: thread.path || firstThreadComment(thread).path || '',
      excerpt: threadExcerpt(thread),
    };

    if (detail.isResolved) {
      resolved.push(detail);
      continue;
    }

    if (detail.isOutdated) {
      outdated.push(detail);
      continue;
    }

    if (trusted && exceptionActive) {
      advisory.push({ ...detail, exceptionActive: true });
      continue;
    }

    if (trusted) {
      advisory.push(detail);
      continue;
    }

    blocking.push(detail);
  }

  return { blocking, advisory, outdated, resolved };
}

export function pageInfoFailure(pageInfo = {}, label = 'result') {
  return pageInfo?.hasNextPage ? `${label} pagination not supported; refusing to make an incomplete reviewer lifecycle decision.` : '';
}

export function assessReviewerLifecycle({
  eventName = 'pull_request_target',
  labels = [],
  files = [],
  reviews = [],
  reviewThreads = [],
  trustedBotLogins = DEFAULT_TRUSTED_BOT_LOGINS,
  exceptionLabel = DEFAULT_EXCEPTION_LABEL,
  enforceFailure = isEnforcingReviewerLifecycleEvent(eventName),
  paginationFailures = [],
} = {}) {
  const trustedBots = trustedBotSet(trustedBotLogins);
  const scope = classifyProtectedScope(files);
  const humanReviewBlockers = humanChangesRequested(reviews, trustedBots);
  const threadState = unresolvedReviewThreads(reviewThreads, {
    trustedBots,
    labels,
    exceptionLabel,
  });
  const blockingReasons = [
    ...paginationFailures.filter(Boolean).map((message) => ({ code: 'pagination-incomplete', message })),
    ...humanReviewBlockers.map((review) => ({ code: 'human-changes-requested', message: `${review.author} latest review is CHANGES_REQUESTED.` })),
    ...threadState.blocking.map((thread) => ({ code: 'unresolved-human-review-thread', message: `${thread.author || 'unknown'} unresolved thread${thread.path ? ` on ${thread.path}` : ''}: ${thread.excerpt}` })),
  ];

  const ok = blockingReasons.length === 0;

  return {
    scope,
    labels,
    trustedBotLogins: [...trustedBots],
    exceptionLabel,
    exceptionActive: hasExceptionLabel(labels, exceptionLabel),
    humanChangesRequested: humanReviewBlockers,
    reviewThreads: threadState,
    blockingReasons,
    advisoryFindings: threadState.advisory.length,
    enforceFailure,
    assessment: {
      ok,
      severity: ok ? (threadState.advisory.length > 0 ? 'advisory' : 'none') : 'blocking',
      reason: ok ? 'github-native-review-state-ok' : blockingReasons[0].code,
    },
    shouldFail: enforceFailure && !ok,
  };
}

export function buildReviewerLifecycleReport(result) {
  const lines = [
    result.assessment.ok
      ? 'Reviewer lifecycle gate passed.'
      : result.enforceFailure
        ? 'Reviewer lifecycle gate failed.'
        : 'Reviewer lifecycle gate advisory refreshed.',
    '',
    'Reviewer lifecycle is evaluated from GitHub-native review state and review-thread state.',
    'The PR body is not used as a reviewer comment ledger.',
    '',
    `Protected scope: ${result.scope.hasProtectedScope ? 'yes' : 'no'}`,
    `Human latest CHANGES_REQUESTED reviews: ${result.humanChangesRequested.length}`,
    `Unresolved human review threads: ${result.reviewThreads.blocking.length}`,
    `Trusted/advisory review threads: ${result.reviewThreads.advisory.length}`,
    `Outdated review threads: ${result.reviewThreads.outdated.length}`,
    `Resolved review threads: ${result.reviewThreads.resolved.length}`,
    `Trusted-bot exception label: ${result.exceptionLabel}`,
    `Trusted-bot exception active: ${result.exceptionActive ? 'yes' : 'no'}`,
    `Assessment severity: ${result.assessment.severity}`,
    `Assessment reason: ${result.assessment.reason}`,
    `Enforcing event: ${result.enforceFailure ? 'yes' : 'no'}`,
  ];

  if (result.blockingReasons.length) {
    lines.push('', '## Blocking reviewer lifecycle findings');
    for (const finding of result.blockingReasons) {
      lines.push(`- ${finding.code}: ${finding.message}`);
    }
  }

  if (result.reviewThreads.advisory.length) {
    lines.push('', '## Advisory trusted-bot review threads');
    for (const thread of result.reviewThreads.advisory.slice(0, 20)) {
      lines.push(`- ${thread.author || 'unknown'}${thread.path ? ` on ${thread.path}` : ''}: ${thread.excerpt || 'no excerpt'}`);
    }
  }

  return lines.join('\n');
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

async function graphql(query, variables, token) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'lgfc-reviewer-lifecycle-gate',
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json();
  if (!response.ok || data.errors?.length) {
    throw new Error(`GraphQL request failed: ${response.status} ${JSON.stringify(data.errors || data)}`);
  }
  return data.data;
}

export async function fetchNativeReviewState({ owner, repo, prNumber, token }) {
  const query = `
    query ReviewerLifecycle($owner: String!, $repo: String!, $number: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $number) {
          labels(first: 100) { nodes { name } pageInfo { hasNextPage } }
          reviews(first: 100) { nodes { author { login } state submittedAt } pageInfo { hasNextPage } }
          reviewThreads(first: 100) {
            nodes {
              id
              isResolved
              isOutdated
              path
              comments(first: 1) { nodes { author { login } body path } }
            }
            pageInfo { hasNextPage }
          }
        }
      }
    }
  `;
  const data = await graphql(query, { owner, repo, number: Number(prNumber) }, token);
  const pr = data.repository?.pullRequest;
  if (!pr) throw new Error(`PR #${prNumber} not found.`);

  const paginationFailures = [
    pageInfoFailure(pr.labels?.pageInfo, 'label'),
    pageInfoFailure(pr.reviews?.pageInfo, 'review'),
    pageInfoFailure(pr.reviewThreads?.pageInfo, 'review thread'),
  ].filter(Boolean);

  return {
    labels: (pr.labels?.nodes || []).map((label) => label.name),
    reviews: pr.reviews?.nodes || [],
    reviewThreads: pr.reviewThreads?.nodes || [],
    paginationFailures,
  };
}

export async function runReviewerLifecycleGate({
  token,
  owner,
  repo,
  prNumber,
  eventName = 'pull_request_target',
  enforceFailure = isEnforcingReviewerLifecycleEvent(eventName),
  trustedBotLogins = DEFAULT_TRUSTED_BOT_LOGINS,
  exceptionLabel = DEFAULT_EXCEPTION_LABEL,
}) {
  const pull = await request(`/repos/${owner}/${repo}/pulls/${prNumber}`, token);
  const [files, nativeState] = await Promise.all([
    paginate(`/repos/${owner}/${repo}/pulls/${prNumber}/files`, token),
    fetchNativeReviewState({ owner, repo, prNumber, token }),
  ]);

  const result = assessReviewerLifecycle({
    eventName,
    labels: nativeState.labels,
    files: files.map((file) => file.filename),
    reviews: nativeState.reviews,
    reviewThreads: nativeState.reviewThreads,
    trustedBotLogins,
    exceptionLabel,
    enforceFailure,
    paginationFailures: nativeState.paginationFailures,
  });

  return {
    ...result,
    prNumber,
    headSha: pull.head?.sha || '',
    marker: '<!-- reviewer-lifecycle-gate -->',
    report: buildReviewerLifecycleReport(result),
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
  const trustedBotLogins = parseTrustedBotLogins(process.env.TRUSTED_BOT_LOGINS || '');
  const exceptionLabel = process.env.EXCEPTION_LABEL || DEFAULT_EXCEPTION_LABEL;

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
    trustedBotLogins,
    exceptionLabel,
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
