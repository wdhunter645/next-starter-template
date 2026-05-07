#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

function runGh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' }).trim();
}

export function isDuplicateIssueBody(body) {
  return /\bDuplicate of (?:Issue )?#\d+\b/i.test(body || '') || /\bclosed as duplicate\b/i.test(body || '');
}

function firstPrUrlFromSearch(repo, search) {
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

export function issuePrSearchQuery(number) {
  return `"orchestrator-source-issue: ${number}" OR "- **Issue:** #${number}" OR "issues/${number}"`;
}

function existingOpenPrForIssue(repo, number) {
  return firstPrUrlFromSearch(repo, issuePrSearchQuery(number));
}

export function main() {
  const repo = process.env.GITHUB_REPOSITORY;
  const issueNumber = process.env.ISSUE_NUMBER;

  if (!repo) {
    console.error('GITHUB_REPOSITORY is required.');
    process.exit(1);
  }

  if (!issueNumber) {
    console.error('ISSUE_NUMBER is required.');
    process.exit(1);
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
    console.log(`Issue #${issueNumber} is not open. Skipping PR creation.`);
    process.exit(0);
  }

  if (isDuplicateIssueBody(issueBody)) {
    runGh(['issue', 'edit', issueNumber, '--repo', repo, '--remove-label', 'status:queued', '--add-label', 'status:blocked']);
    runGh(['issue', 'comment', issueNumber, '--repo', repo, '--body', 'Orchestrator PR creation skipped: issue is marked duplicate. Removed status:queued to avoid blocking queue advancement.']);
    console.log(`Issue #${issueNumber} is marked duplicate. Skipping PR creation.`);
    process.exit(0);
  }

  if (!labels.includes('orchestrator') || !labels.includes('status:queued')) {
    console.log(`Issue #${issueNumber} is not an orchestrator queued issue. Skipping.`);
    process.exit(0);
  }

  const alreadyOpenPr = existingOpenPrForIssue(repo, issue.number);

  if (alreadyOpenPr) {
    runGh(['issue', 'edit', issueNumber, '--repo', repo, '--remove-label', 'status:queued', '--add-label', 'status:pr-draft']);
    runGh(['issue', 'comment', issueNumber, '--repo', repo, '--body', `Existing active implementation PR found: ${alreadyOpenPr}`]);
    console.log(`Existing PR found for issue #${issueNumber}: ${alreadyOpenPr}`);
    process.exit(0);
  }

  runGh(['issue', 'comment', issueNumber, '--repo', repo, '--body', 'Orchestrator queue handoff: no placeholder PR was created. The assigned agent must create an implementation PR only after producing real file changes.']);
  console.log(`No placeholder PR created for issue #${issueNumber}. Waiting for assigned agent implementation PR.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
