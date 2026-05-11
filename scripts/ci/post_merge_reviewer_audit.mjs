#!/usr/bin/env node

import fs from 'node:fs';

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const prNumber = process.env.PR_NUMBER;
const runId = process.env.GITHUB_RUN_ID || '';
const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';

if (!token || !repository || !prNumber) {
  console.error('Missing required environment: GITHUB_TOKEN/GH_TOKEN, GITHUB_REPOSITORY, PR_NUMBER');
  process.exit(1);
}

const [owner, repo] = repository.split('/');
const apiBase = 'https://api.github.com';
const trustedReviewerPattern = /chatgpt-codex-connector|gemini-code-assist|copilot-pull-request-reviewer|cubic-dev-ai/i;
const highSeverityPattern = /(^|[^A-Za-z0-9])(P0|P1)([^A-Za-z0-9]|$)|high[- ]priority|request changes|requested changes|must fix|blocking/i;
const resolvedPattern = /✅\s*Addressed|addressed in|\bresolved\b|all checks passed|no warnings detected/i;
const unresolvedPattern = /\bunresolved\b|\bnot\s+resolved\b|\bstill\s+open\b|\bstill\s+blocking\b/i;

async function request(path, options = {}) {
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

async function paginate(path) {
  const results = [];
  let page = 1;

  while (true) {
    const separator = path.includes('?') ? '&' : '?';
    const data = await request(`${path}${separator}per_page=100&page=${page}`);
    if (!Array.isArray(data) || data.length === 0) break;
    results.push(...data);
    if (data.length < 100) break;
    page += 1;
  }

  return results;
}

function isTrusted(login) {
  return trustedReviewerPattern.test(login || '');
}

function isResolvedText(body) {
  const text = body || '';
  return resolvedPattern.test(text) && !unresolvedPattern.test(text);
}

function isHighSeverityFinding(body, state = '') {
  const text = body || '';
  return (state === 'CHANGES_REQUESTED' || highSeverityPattern.test(text)) && !isResolvedText(text);
}

function isAfterMerge(value, mergedAt) {
  if (!value || !mergedAt) return false;
  return new Date(value).getTime() > new Date(mergedAt).getTime();
}

function findingLine(item, fallbackUrl) {
  const login = item.user?.login || 'unknown-reviewer';
  const url = item.html_url || item.url || item._links?.html?.href || fallbackUrl || 'unknown-url';
  let body = String(item.body || '').replace(/\s+/g, ' ').trim();
  if (!body && item.state) body = `[Review: ${item.state}]`;
  return `- ${url} by ${login}: ${body.slice(0, 240)}`;
}

async function main() {
  const pr = await request(`/repos/${owner}/${repo}/pulls/${prNumber}`);
  const mergedAt = pr.merged_at;
  const prUrl = pr.html_url;
  const prTitle = pr.title || '';

  if (!mergedAt) {
    console.log('PR is not merged. Late reviewer audit skipped.');
    writeOutput('late_findings', '0');
    writeOutput('audit_issue', 'none');
    return;
  }

  const [issueComments, reviewComments, reviews] = await Promise.all([
    paginate(`/repos/${owner}/${repo}/issues/${prNumber}/comments`),
    paginate(`/repos/${owner}/${repo}/pulls/${prNumber}/comments`),
    paginate(`/repos/${owner}/${repo}/pulls/${prNumber}/reviews`),
  ]);

  const findings = [];

  for (const comment of issueComments) {
    if (isTrusted(comment.user?.login) && isAfterMerge(comment.created_at, mergedAt) && isHighSeverityFinding(comment.body)) {
      findings.push(findingLine(comment, prUrl));
    }
  }

  for (const comment of reviewComments) {
    if (isTrusted(comment.user?.login) && isAfterMerge(comment.created_at, mergedAt) && isHighSeverityFinding(comment.body)) {
      findings.push(findingLine(comment, prUrl));
    }
  }

  for (const review of reviews) {
    if (isTrusted(review.user?.login) && isAfterMerge(review.submitted_at, mergedAt) && isHighSeverityFinding(review.body, review.state || '')) {
      findings.push(findingLine(review, prUrl));
    }
  }

  let auditIssue = 'none';

  if (findings.length > 0) {
    const title = `Post-merge reviewer follow-up for PR #${prNumber}`;
    const search = await request(`/search/issues?q=${encodeURIComponent(`repo:${repository} is:issue is:open in:title "${title}"`)}`);
    const existing = search.items?.[0];
    const body = [
      `Post-merge reviewer audit found ${findings.length} late high-severity reviewer finding(s).`,
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
      'Review each finding, confirm whether it is valid, and open corrective PRs as needed.',
    ].join('\n');

    if (existing?.number) {
      await request(`/repos/${owner}/${repo}/issues/${existing.number}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      });
      auditIssue = existing.html_url || `#${existing.number}`;
    } else {
      const created = await request(`/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        body: JSON.stringify({ title, body, labels: ['codex'] }),
      });
      auditIssue = created.html_url || `#${created.number}`;
    }
  }

  writeOutput('late_findings', String(findings.length));
  writeOutput('audit_issue', auditIssue);

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    fs.appendFileSync(summaryPath, `\n### Late reviewer audit\n- Late high-severity findings: ${findings.length}\n- Follow-up issue: ${auditIssue}\n`);
  }

  console.log(`late_findings=${findings.length}`);
  console.log(`audit_issue=${auditIssue}`);
}

function writeOutput(name, value) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (outputPath) {
    fs.appendFileSync(outputPath, `${name}=${value}\n`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
