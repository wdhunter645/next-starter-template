#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const repo = process.env.GITHUB_REPOSITORY;
const prNumber = process.env.PR_NUMBER;
const action = process.env.SYNC_ACTION;

if (!repo || !prNumber || !action) {
  console.error('GITHUB_REPOSITORY, PR_NUMBER, and SYNC_ACTION are required.');
  process.exit(1);
}

function runGh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' }).trim();
}

function linkedIssueNumber(body) {
  const match = body.match(/(?:Issue:\*\*\s*#|Issue:\s*#|#)(\d+)/i);
  return match ? match[1] : '';
}

function setStatus(issueNumber, removeLabel, addLabel, comment) {
  const args = ['issue', 'edit', issueNumber, '--repo', repo];
  if (removeLabel) args.push('--remove-label', removeLabel);
  if (addLabel) args.push('--add-label', addLabel);
  runGh(args);
  if (comment) runGh(['issue', 'comment', issueNumber, '--repo', repo, '--body', comment]);
}

const prJson = runGh(['pr', 'view', prNumber, '--repo', repo, '--json', 'body,url,merged,state']);
const pr = JSON.parse(prJson);
const issueNumber = linkedIssueNumber(pr.body || '');

if (!issueNumber) {
  console.log(`No linked issue found for PR #${prNumber}.`);
  process.exit(0);
}

if (action === 'ready_for_review') {
  setStatus(issueNumber, 'status:implementation', 'status:review', `PR #${prNumber} is ready for review: ${pr.url}`);
  process.exit(0);
}

if (action === 'merged') {
  if (!pr.merged) process.exit(0);
  setStatus(issueNumber, 'status:review', 'status:merged', `PR #${prNumber} merged. Post-merge verification pending: ${pr.url}`);
  setStatus(issueNumber, 'status:merged', 'status:post-merge-verify', null);
  process.exit(0);
}

console.log(`Unsupported SYNC_ACTION: ${action}`);
