#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const repo = process.env.GITHUB_REPOSITORY;
const prNumber = process.env.PR_NUMBER;
const action = process.env.SYNC_ACTION;

function runGh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' }).trim();
}

let repoLabels;
function repoLabelNames() {
  if (!repoLabels) {
    const labelsJson = runGh(['label', 'list', '--repo', repo, '--json', 'name', '--limit', '1000']);
    const labels = JSON.parse(labelsJson);
    repoLabels = new Set((labels || []).map((label) => label.name));
  }
  return repoLabels;
}

function issueLabelNames(issueNumber) {
  const issueJson = runGh(['issue', 'view', issueNumber, '--repo', repo, '--json', 'labels']);
  const issue = JSON.parse(issueJson);
  return new Set((issue.labels || []).map((label) => label.name));
}

function linkedIssueNumber(body) {
  const sourceMarker = body.match(/<!--\s*orchestrator-source-issue:\s*(\d+)\s*-->/i);
  if (sourceMarker) return sourceMarker[1];

  const match = body.match(/(?:\*\*Issue:\*\*|Issue:)\s*(?:https?:\/\/github\.com\/[^/\s]+\/[^/\s]+\/issues\/|#)(\d+)/i);
  return match ? match[1] : '';
}

export function setStatus(
  issueNumber,
  removeLabel,
  addLabel,
  comment,
  { getLabels = issueLabelNames, getRepoLabels = repoLabelNames, run = runGh, warn = console.warn } = {}
) {
  const labels = getLabels(issueNumber);
  const args = ['issue', 'edit', issueNumber, '--repo', repo];
  if (removeLabel && labels.has(removeLabel)) args.push('--remove-label', removeLabel);
  if (addLabel && !labels.has(addLabel)) {
    const availableLabels = getRepoLabels();
    if (availableLabels.has(addLabel)) {
      args.push('--add-label', addLabel);
    } else {
      warn(`Status label ${addLabel} does not exist; leaving issue #${issueNumber} without that label.`);
    }
  }
  if (args.length > 5) run(args);
  if (comment) run(['issue', 'comment', issueNumber, '--repo', repo, '--body', comment]);
}

export function syncPrState({ pr, prNumber, action, setStatusFn = setStatus, run = runGh, log = console.log }) {
  const issueNumber = linkedIssueNumber(pr.body || '');
  const isMerged = Boolean(pr.mergedAt) || pr.state === 'MERGED';

  if (!issueNumber) {
    log(`No linked orchestrator issue found for PR #${prNumber}.`);
    return 'skipped';
  }

  if (action === 'ready_for_review') {
    setStatusFn(issueNumber, 'status:implementation', 'status:review', `PR #${prNumber} is ready for review: ${pr.url}`);
    return 'review';
  }

  if (action === 'merged') {
    if (!isMerged) return 'skipped';
    setStatusFn(issueNumber, 'status:review', 'status:post-merge-verify', `PR #${prNumber} merged. Post-merge verification pending: ${pr.url}`);
    return 'post_merge_verify';
  }

  if (action === 'post_merge_success') {
    setStatusFn(issueNumber, 'status:post-merge-verify', 'status:complete', `Post-merge verification passed for PR #${prNumber}: ${pr.url}`);
    run(['issue', 'close', issueNumber, '--repo', repo, '--comment', `Task complete. PR #${prNumber} merged and post-merge verification passed.`]);
    return 'complete';
  }

  if (action === 'post_merge_failure') {
    setStatusFn(issueNumber, 'status:post-merge-verify', 'status:failed', `Post-merge verification failed for PR #${prNumber}. Recovery issue/PR required: ${pr.url}`);
    return 'failed';
  }

  if (action === 'closed') return 'skipped';

  throw new Error(`Unsupported SYNC_ACTION: ${action}`);
}

export function main() {
  if (!repo || !prNumber || !action) {
    console.error('GITHUB_REPOSITORY, PR_NUMBER, and SYNC_ACTION are required.');
    process.exit(1);
  }

  const prJson = runGh(['pr', 'view', prNumber, '--repo', repo, '--json', 'body,url,mergedAt,state']);
  const pr = JSON.parse(prJson);
  syncPrState({ pr, prNumber, action });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
