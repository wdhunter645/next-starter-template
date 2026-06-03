#!/usr/bin/env node

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

import { linkedIssueNumber } from '../ci/issue_accounting.mjs';
import {
  STALE_SOURCE_ISSUE_LABELS,
  buildSourceIssueCloseoutComment,
  postMergeVerificationResult,
  shouldCloseSourceIssue,
} from '../ci/post_merge_source_issue_closeout.mjs';

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

export function readPostMergeResult(resultPath = process.env.POST_MERGE_RESULT_PATH || 'post-merge-result.json') {
  if (!resultPath || !fs.existsSync(resultPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(resultPath, 'utf8'));
  } catch {
    return null;
  }
}

export function issueMeta(issueNumber, { run = runGh } = {}) {
  const issueJson = run(['issue', 'view', issueNumber, '--repo', repo, '--json', 'title,labels']);
  const issue = JSON.parse(issueJson);
  return {
    title: issue.title || '',
    labels: (issue.labels || []).map((label) => label.name),
  };
}

export { linkedIssueNumber };

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

export function syncPrState({
  pr,
  prNumber,
  action,
  setStatusFn = setStatus,
  run = runGh,
  log = console.log,
  getIssueMeta = issueMeta,
  postMergeResult = readPostMergeResult(),
} = {}) {
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
    const meta = getIssueMeta(issueNumber, { run });
    const closeDecision = shouldCloseSourceIssue({
      action,
      issueNumber,
      isMerged,
      issueMeta: meta,
      postMergeResult,
    });

    if (!closeDecision.close) {
      log(`Skipping source issue closeout for PR #${prNumber}: ${closeDecision.reason}.`);
      return closeDecision.reason;
    }

    const lifecycleLabelsToClear = [
      ...STALE_SOURCE_ISSUE_LABELS,
      'status:pr-draft',
      'status:review',
      'status:implementation',
    ];
    for (const label of lifecycleLabelsToClear) {
      setStatusFn(issueNumber, label, null, null);
    }

    const mergeSha = postMergeResult?.merge_sha || pr.mergeCommit?.oid || '';
    const closeoutComment = buildSourceIssueCloseoutComment({
      prNumber,
      mergeSha,
      validatorStatus: postMergeResult?.status || 'pass',
      verificationResult: postMergeVerificationResult(postMergeResult),
      closeoutReason: closeDecision.reason,
    });

    setStatusFn(
      issueNumber,
      null,
      'status:complete',
      `Post-merge verification passed for PR #${prNumber}: ${pr.url}`,
    );
    run(['issue', 'comment', issueNumber, '--repo', repo, '--body', closeoutComment]);
    run(['issue', 'close', issueNumber, '--repo', repo, '--reason', 'completed']);
    return 'complete';
  }

  if (action === 'post_merge_remediation') {
    setStatusFn(
      issueNumber,
      'status:failed',
      'status:post-merge-verify',
      `Post-merge validation passed for PR #${prNumber}, but remediation remains required. Source issue remains open: ${pr.url}`,
    );
    return 'remediation';
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

  const prJson = runGh(['pr', 'view', prNumber, '--repo', repo, '--json', 'body,url,mergedAt,state,mergeCommit']);
  const pr = JSON.parse(prJson);
  syncPrState({ pr, prNumber, action });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
