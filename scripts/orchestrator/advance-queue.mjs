#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const repo = process.env.GITHUB_REPOSITORY;
if (!repo) {
  console.error('GITHUB_REPOSITORY is required.');
  process.exit(1);
}

export const ACTIVE_STATES = [
  'status:queued',
  'status:assigned',
  'status:pr-draft',
  'status:implementation',
  'status:review',
  'status:post-merge-verify'
];

const ACTIVE = new Set(ACTIVE_STATES);
const FAILED_STATE = 'status:failed';
const BLOCKED_STATE = 'status:blocked';

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' }).trim();
}

function has(issue, name) {
  return issue.labels.some(l => l.name === name);
}

function parseIssues(output) {
  return JSON.parse(output || '[]');
}

function queryIssues({ limit = '100', state = 'open', search = 'label:orchestrator' } = {}) {
  return parseIssues(gh([
    'issue',
    'list',
    '--repo',
    repo,
    '--state',
    state,
    '--search',
    search,
    '--json',
    'number,title,labels,createdAt',
    '--limit',
    limit
  ]));
}

function labels(issue) {
  return new Set(issue.labels.map((label) => label.name));
}

function firstIssueWithLabel(issues, label) {
  return issues.find((issue) => labels(issue).has(label)) || null;
}

export function hasFailedIssue(issues) {
  return firstIssueWithLabel(issues, FAILED_STATE) !== null;
}

export function findActiveIssue(issues) {
  return issues.find((issue) => issue.labels.some((label) => ACTIVE.has(label.name))) || null;
}

export function oldestBlockedIssue(issues) {
  return issues
    .filter((issue) => has(issue, BLOCKED_STATE))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0] || null;
}

export function queueAdvanceDecision(query = queryIssues) {
  const issues = query();
  if (hasFailedIssue(issues)) return { action: 'halt_failed' };

  const active = findActiveIssue(issues);
  if (active) {
    return has(active, 'status:queued')
      ? { action: 'halt_queued' }
      : { action: 'halt_active' };
  }

  const next = oldestBlockedIssue(issues);
  if (!next) return { action: 'done_no_blocked' };

  return { action: 'advance', issue: next };
}

export function logDecision(decision, log = console.log) {
  if (decision.action === 'halt_failed') log('halt: failed');
  if (decision.action === 'halt_queued') log('halt: queued exists');
  if (decision.action === 'halt_active') log('halt: active');
  if (decision.action === 'done_no_blocked') log('done: no blocked tasks');
  if (decision.action === 'advance') log(`advance: issue #${decision.issue.number}`);
}

export function advanceIssue(issue, run = gh) {
  run(['issue','edit',String(issue.number),'--repo',repo,'--remove-label','status:blocked','--add-label','status:queued']);
  run(['issue','comment',String(issue.number),'--repo',repo,'--body','Queue advance: blocked → queued']);
}

export function main() {
  const decision = queueAdvanceDecision();
  logDecision(decision);

  if (decision.action !== 'advance') process.exit(0);

  advanceIssue(decision.issue);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
