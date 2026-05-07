#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repo = process.env.GITHUB_REPOSITORY;
const issueNumber = process.env.ISSUE_NUMBER;
const baseBranch = process.env.BASE_BRANCH || 'main';

if (!repo) {
  console.error('GITHUB_REPOSITORY is required.');
  process.exit(1);
}

if (!issueNumber) {
  console.error('ISSUE_NUMBER is required.');
  process.exit(1);
}

function runGh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' }).trim();
}

function runGit(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function extractBlock(body, heading) {
  const pattern = new RegExp(`${heading}:\\n([\\s\\S]*?)(?:\\n[A-Z][A-Za-z ]+:|\\n## |$)`);
  const match = body.match(pattern);
  return match ? match[1].trim() : '';
}

export function isDuplicateIssueBody(body) {
  return /\bDuplicate of (?:Issue )?#\d+\b/i.test(body || '') || /\bclosed as duplicate\b/i.test(body || '');
}

function firstPrUrlFromSearch(search) {
  const result = runGh([
    'pr',
    'list',
    '--repo',
    repo,
    '--state',
    'open',
    '--search',
    search,
    '--json',
    'url',
    '--limit',
    '1'
  ]);
  const prs = JSON.parse(result);
  return prs.length > 0 ? prs[0].url : '';
}

function existingPrUrl(branchName) {
  const result = runGh([
    'pr',
    'list',
    '--repo',
    repo,
    '--head',
    branchName,
    '--state',
    'open',
    '--json',
    'url',
    '--limit',
    '1'
  ]);
  const prs = JSON.parse(result);
  return prs.length > 0 ? prs[0].url : '';
}

export function issuePrSearchQuery(number) {
  return `"orchestrator-source-issue: ${number}" OR "- **Issue:** #${number}" OR "issues/${number}"`;
}

function existingOpenPrForIssue(number) {
  return firstPrUrlFromSearch(issuePrSearchQuery(number));
}

function remoteBranchExists(branchName) {
  try {
    runGit(['ls-remote', '--exit-code', '--heads', 'origin', `refs/heads/${branchName}`]);
    return true;
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'status' in error && error.status === 2) {
      return false;
    }
    throw error;
  }
}

const issueJson = runGh([
  'issue',
  'view',
  issueNumber,
  '--repo',
  repo,
  '--json',
  'number,title,body,labels,state'
]);

const issue = JSON.parse(issueJson);
const labels = issue.labels.map((label) => label.name);
const issueBody = issue.body || '';

if (issue.state !== 'OPEN') {
  console.log(`Issue #${issueNumber} is not open. Skipping draft PR creation.`);
  process.exit(0);
}

if (isDuplicateIssueBody(issueBody)) {
  runGh(['issue', 'edit', issueNumber, '--repo', repo, '--remove-label', 'status:queued', '--add-label', 'status:blocked']);
  runGh(['issue', 'comment', issueNumber, '--repo', repo, '--body', 'Orchestrator draft PR creation skipped: issue is marked duplicate. Removed status:queued to avoid blocking queue advancement.']);
  console.log(`Issue #${issueNumber} is marked duplicate. Skipping draft PR creation.`);
  process.exit(0);
}

if (!labels.includes('orchestrator') || !labels.includes('status:queued')) {
  console.log(`Issue #${issueNumber} is not an orchestrator queued issue. Skipping.`);
  process.exit(0);
}

const branchName = `orchestrator/${issue.number}-${slugify(issue.title)}`;
const alreadyOpenPr = existingPrUrl(branchName) || existingOpenPrForIssue(issue.number);

if (alreadyOpenPr) {
  runGh(['issue', 'edit', issueNumber, '--repo', repo, '--remove-label', 'status:queued', '--add-label', 'status:pr-draft']);
  runGh(['issue', 'comment', issueNumber, '--repo', repo, '--body', `Existing active PR found: ${alreadyOpenPr}`]);
  console.log(`Existing PR found for issue #${issueNumber}: ${alreadyOpenPr}`);
  process.exit(0);
}

if (remoteBranchExists(branchName)) {
  runGh(['issue', 'edit', issueNumber, '--repo', repo, '--remove-label', 'status:queued', '--add-label', 'status:failed']);
  runGh([
    'issue',
    'comment',
    issueNumber,
    '--repo',
    repo,
    '--body',
    `Orchestrator draft PR creation stopped: remote branch already exists but no open PR was found. Branch: ${branchName}`
  ]);
  console.log(`Remote branch exists without open PR for issue #${issueNumber}: ${branchName}`);
  process.exit(1);
}

const allowedFiles = extractBlock(issueBody, 'Allowed Files') || '- To be completed by assigned agent from issue scope';
const acceptanceCriteria = extractBlock(issueBody, 'Acceptance Criteria') || '- To be completed by assigned agent';
const validation = extractBlock(issueBody, 'Validation') || '- To be completed by assigned agent';
const canonicalTemplate = fs.existsSync('.github/pull_request_template.md')
  ? fs.readFileSync('.github/pull_request_template.md', 'utf8')
  : '';

runGit(['fetch', 'origin', baseBranch]);
runGit(['checkout', '-B', branchName, `origin/${baseBranch}`]);
runGit(['config', 'user.name', 'github-actions[bot]']);
runGit(['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
runGit(['commit', '--allow-empty', '-m', `orchestrator: draft PR for issue #${issue.number}`]);
runGit(['push', '-u', 'origin', branchName]);

const prBody = [
  `<!-- orchestrator-source-issue: ${issue.number} -->`,
  '<!-- orchestrator-placeholder-pr: true -->',
  `- **Issue:** #${issue.number}`,
  '',
  '## Orchestrator Draft PR',
  '',
  'This placeholder PR was created by the LGFC orchestration tier after duplicate-preflight checks found no active PR for the source Issue.',
  '',
  '## Change Summary',
  '- To be completed by assigned agent.',
  '',
  '## Acceptance Criteria',
  acceptanceCriteria,
  '',
  '## Risk',
  'Low until implementation commits are added; assigned agent must update this section before review.',
  '',
  '## Validation',
  validation,
  '',
  '## Generated Governance Template',
  canonicalTemplate,
  '',
  '## Orchestrator Prefill',
  '',
  '### Allowed Files',
  allowedFiles,
  '',
  '### Required Validation',
  validation,
  '',
  '### Task Details',
  issueBody
].join('\n');

const bodyFile = path.join(os.tmpdir(), `orchestrator-pr-${issue.number}.md`);
fs.writeFileSync(bodyFile, prBody);

const prUrl = runGh([
  'pr',
  'create',
  '--repo',
  repo,
  '--base',
  baseBranch,
  '--head',
  branchName,
  '--draft',
  '--title',
  `[Orchestrator] ${issue.title}`,
  '--body-file',
  bodyFile
]);

runGh(['issue', 'edit', issueNumber, '--repo', repo, '--remove-label', 'status:queued', '--add-label', 'status:pr-draft']);
runGh([
  'issue',
  'comment',
  issueNumber,
  '--repo',
  repo,
  '--body',
  `Draft PR created: ${prUrl}`
]);

console.log(`Created draft PR for issue #${issueNumber}: ${prUrl}`);
