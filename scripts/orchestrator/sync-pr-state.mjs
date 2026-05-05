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

function issueLabelNames(issueNumber) {
  const issueJson = runGh(['issue', 'view', issueNumber, '--repo', repo, '--json', 'labels']);
  const issue = JSON.parse(issueJson);
  return new Set((issue.labels || []).map((label) => label.name));
}

function linkedIssueNumber(body) {
  const match = body.match(/(?:\*\*Issue:\*\*|Issue:)\s*(?:https?:\/\/github\.com\/[^/\s]+\/[^/\s]+\/issues\/|#)(\d+)/i);
  return match ? match[1] : '';
}

function setStatus(issueNumber, removeLabel, addLabel, comment) {
  const labels = issueLabelNames(issueNumber);
  const args = ['issue', 'edit', issueNumber, '--repo', repo];
  if (removeLabel && labels.has(removeLabel)) args.push('--remove-label', removeLabel);
  if (addLabel && !labels.has(addLabel)) args.push('--add-label', addLabel);
  if (args.length > 4) runGh(args);
  if (comment) runGh(['issue', 'comment', issueNumber, '--repo', repo, '--body', comment]);
}

const prJson = runGh(['pr', 'view', prNumber, '--repo', repo, '--json', 'body,url,mergedAt,state']);
const pr = JSON.parse(prJson);
const issueNumber = linkedIssueNumber(pr.body || '');
const isMerged = Boolean(pr.mergedAt) || pr.state === 'MERGED';

if (!issueNumber) {
  console.log(`No linked orchestrator issue found for PR #${prNumber}.`);
  process.exit(0);
}

if (action === 'ready_for_review') {
  setStatus(issueNumber, 'status:implementation', 'status:review', `PR #${prNumber} is ready for review: ${pr.url}`);
  process.exit(0);
}

if (action === 'merged') {
  if (!isMerged) process.exit(0);
  setStatus(issueNumber, 'status:review', 'status:post-merge-verify', `PR #${prNumber} merged. Post-merge verification pending: ${pr.url}`);
  process.exit(0);
}

if (action === 'post_merge_success') {
  setStatus(issueNumber, 'status:post-merge-verify', 'status:complete', `Post-merge verification passed for PR #${prNumber}: ${pr.url}`);
  runGh(['issue', 'close', issueNumber, '--repo', repo, '--comment', `Task complete. PR #${prNumber} merged and post-merge verification passed.`]);
  process.exit(0);
}

if (action === 'post_merge_failure') {
  setStatus(issueNumber, 'status:post-merge-verify', 'status:failed', `Post-merge verification failed for PR #${prNumber}. Recovery issue/PR required: ${pr.url}`);
  process.exit(0);
}

if (action === 'closed') process.exit(0);

console.error(`Unsupported SYNC_ACTION: ${action}`);
process.exit(1);
