#!/usr/bin/env node

/**
 * Post-merge late reviewer audit (#3036).
 *
 * Counts trusted reviewer findings that arrive after merge. Inline review
 * comments from trusted bots (including login `Copilot`) are always counted
 * when undispositioned — they do not need P0/P1 wording.
 */

import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { isTrustedReviewer } from './reviewer_trusted_bots.mjs';
import { hasValidDisposition, parseReviewerDispositions } from './reviewer_comment_disposition.mjs';

const apiBase = 'https://api.github.com';
const BREAK_GLASS_MARKER = /<!--\s*reviewer-lifecycle-break-glass\s*-->/i;
const HIGH_SEVERITY_PATTERN =
  /(^|[^A-Za-z0-9])(P0|P1)([^A-Za-z0-9]|$)|high[- ]priority|request changes|requested changes|must fix|blocking/i;
const RESOLVED_PATTERN = /addressed in|\bresolved\b|all checks passed|no warnings detected/i;
const UNRESOLVED_PATTERN = /\bunresolved\b|\bnot\s+resolved\b|\bstill\s+open\b|\bstill\s+blocking\b/i;

function isResolvedText(body = '') {
  return RESOLVED_PATTERN.test(body) && !UNRESOLVED_PATTERN.test(body);
}

function isHighSeverityFinding(body = '', state = '') {
  return (state === 'CHANGES_REQUESTED' || HIGH_SEVERITY_PATTERN.test(body)) && !isResolvedText(body);
}

function isAfterMerge(value, mergedAt) {
  if (!value || !mergedAt) return false;
  return new Date(value).getTime() > new Date(mergedAt).getTime();
}

async function request(path, token, options = {}) {
  const hasBody = Boolean(options.body);

  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'lgfc-post-merge-reviewer-audit',
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
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

function findingLine(item, fallbackUrl) {
  const login = item.user?.login || 'unknown-reviewer';
  const url = item.html_url || item.url || item._links?.html?.href || fallbackUrl || 'unknown-url';
  let body = String(item.body || '').replace(/\s+/g, ' ').trim();
  if (!body && item.state) body = `[Review: ${item.state}]`;
  return `- ${url} by ${login}: ${body.slice(0, 240)}`;
}

function itemId(item) {
  return String(item?.id || item?.databaseId || '').trim();
}

function hasDisposition(item, dispositions) {
  const id = itemId(item);
  return id && hasValidDisposition(dispositions.get(id));
}

export function collectLateAuditFindings({
  pr,
  issueComments = [],
  reviewComments = [],
  reviews = [],
} = {}) {
  const mergedAt = pr?.merged_at || pr?.mergedAt || '';
  const prUrl = pr?.html_url || pr?.url || '';
  const dispositions = parseReviewerDispositions(pr?.body || '');
  const findings = [];

  for (const comment of issueComments) {
    if (
      isTrustedReviewer(comment.user?.login || '') &&
      isAfterMerge(comment.created_at, mergedAt) &&
      isHighSeverityFinding(comment.body || '') &&
      !hasDisposition(comment, dispositions)
    ) {
      findings.push(findingLine(comment, prUrl));
    }
  }

  for (const comment of reviewComments) {
    if (
      isTrustedReviewer(comment.user?.login || '') &&
      isAfterMerge(comment.created_at, mergedAt) &&
      !hasDisposition(comment, dispositions)
    ) {
      findings.push(findingLine(comment, prUrl));
    }
  }

  for (const review of reviews) {
    if (
      isTrustedReviewer(review.user?.login || '') &&
      isAfterMerge(review.submitted_at, mergedAt) &&
      isHighSeverityFinding(review.body || '', review.state || '') &&
      !hasDisposition(review, dispositions)
    ) {
      findings.push(findingLine(review, prUrl));
    }
  }

  return findings;
}

async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  const prNumber = process.env.PR_NUMBER;
  const runId = process.env.GITHUB_RUN_ID || '';
  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';

  if (!token || !repository || !prNumber) {
    throw new Error('Missing required environment: GITHUB_TOKEN/GH_TOKEN, GITHUB_REPOSITORY, PR_NUMBER');
  }

  const [owner, repo] = repository.split('/');
  const pr = await request(`/repos/${owner}/${repo}/pulls/${prNumber}`, token);
  const mergedAt = pr.merged_at;
  const prUrl = pr.html_url;
  const prTitle = pr.title || '';

  if (!mergedAt) {
    console.log('PR is not merged. Late reviewer audit skipped.');
    writeOutput('late_findings', '0');
    writeOutput('audit_issue', 'none');
    return;
  }

  if (BREAK_GLASS_MARKER.test(pr.body || '')) {
    const breakGlassNote = [
      'Post-merge reviewer audit: break-glass override was declared on this merged PR.',
      'Marker: `<!-- reviewer-lifecycle-break-glass -->` with `recovery` intent label required pre-merge.',
      `PR: ${prUrl}`,
    ].join('\n');
    console.log(breakGlassNote);
    const summaryPath = process.env.GITHUB_STEP_SUMMARY;
    if (summaryPath) {
      fs.appendFileSync(summaryPath, `\n### Reviewer lifecycle break-glass\n\n${breakGlassNote}\n`);
    }
  }

  const [issueComments, reviewComments, reviews] = await Promise.all([
    paginate(`/repos/${owner}/${repo}/issues/${prNumber}/comments`, token),
    paginate(`/repos/${owner}/${repo}/pulls/${prNumber}/comments`, token),
    paginate(`/repos/${owner}/${repo}/pulls/${prNumber}/reviews`, token),
  ]);

  const findings = collectLateAuditFindings({ pr, issueComments, reviewComments, reviews });

  let auditIssue = 'none';

  if (findings.length > 0) {
    const title = `Post-merge reviewer follow-up for PR #${prNumber}`;
    const search = await request(
      `/search/issues?q=${encodeURIComponent(`repo:${repository} is:issue is:open in:title "${title}"`)}`,
      token,
    );
    const existing = search.items?.[0];
    const body = [
      `Post-merge reviewer audit found ${findings.length} late trusted reviewer finding(s) (#3036 detector).`,
      '',
      `- PR: ${prUrl}`,
      `- PR title: ${prTitle}`,
      `- Merged at: ${mergedAt}`,
      `- Workflow run: ${serverUrl}/${repository}/actions/runs/${runId}`,
      '',
      '## Findings',
      ...findings,
      '',
      '## Required action',
      'Review each finding, confirm whether it is valid, reopen/keep the source Issue failed until remediated, and open corrective PRs as needed.',
      'Do not treat an earlier closeout `late_review=0` as authoritative once late findings exist.',
    ].join('\n');

    if (existing?.number) {
      await request(`/repos/${owner}/${repo}/issues/${existing.number}/comments`, token, {
        method: 'POST',
        body: JSON.stringify({ body }),
      });
      auditIssue = existing.html_url || `#${existing.number}`;
    } else {
      const created = await request(`/repos/${owner}/${repo}/issues`, token, {
        method: 'POST',
        body: JSON.stringify({ title, body, labels: ['change-ops', 'ops-runtime-finding'] }),
      });
      auditIssue = created.html_url || `#${created.number}`;
    }
  }

  writeOutput('late_findings', String(findings.length));
  writeOutput('audit_issue', auditIssue);

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    fs.appendFileSync(
      summaryPath,
      `\n### Late reviewer audit\n- Late trusted findings: ${findings.length}\n- Follow-up issue: ${auditIssue}\n`,
    );
  }

  console.log(`late_findings=${findings.length}`);
  console.log(`audit_issue=${auditIssue}`);
  if (findings.length > 0) process.exitCode = 2;
}

function writeOutput(name, value) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (outputPath) {
    fs.appendFileSync(outputPath, `${name}=${value}\n`);
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
