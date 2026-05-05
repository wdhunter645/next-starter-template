#!/usr/bin/env node

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

const issueJson = runGh([
  'issue',
  'view',
  issueNumber,
  '--repo',
  repo,
  '--json',
  'number,title,body,labels'
]);

const issue = JSON.parse(issueJson);
const labels = issue.labels.map((label) => label.name);

if (!labels.includes('orchestrator') || !labels.includes('status:queued')) {
  console.log(`Issue #${issueNumber} is not an orchestrator queued issue. Skipping.`);
  process.exit(0);
}

const branchName = `orchestrator/${issue.number}-${slugify(issue.title)}`;

runGit(['fetch', 'origin', baseBranch]);
runGit(['checkout', '-B', branchName, `origin/${baseBranch}`]);
runGit(['commit', '--allow-empty', '-m', `orchestrator: draft PR for issue #${issue.number}`]);
runGit(['push', '-u', 'origin', branchName]);

const prBody = [
  `- **Issue:** #${issue.number}`,
  '',
  '## Orchestrator Draft PR',
  '',
  'This draft PR was created by the LGFC orchestration tier.',
  '',
  '## Task Details',
  '',
  issue.body || '',
  '',
  '## Implementation Status',
  '- [ ] AI agent implementation complete',
  '- [ ] Review complete',
  '- [ ] Human approval complete'
].join('\n');

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
  '--body',
  prBody
]);

runGh(['issue', 'edit', issueNumber, '--repo', repo, '--remove-label', 'status:queued']);
runGh(['issue', 'edit', issueNumber, '--repo', repo, '--add-label', 'status:pr-draft']);
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
