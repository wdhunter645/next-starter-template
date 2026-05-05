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

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' }).trim();
}

function has(issue, name) {
  return issue.labels.some(l => l.name === name);
}

function parseIssues(output) {
  return JSON.parse(output || '[]');
}

function queryIssues(label, { limit = '1', state = 'open', sort = '', direction = '' } = {}) {
  const args = [
    'issue',
    'list',
    '--repo',
    repo,
    '--state',
    state,
    '--label',
    'orchestrator',
    '--label',
    label,
    '--json',
    'number,title,labels,createdAt',
    '--limit',
    limit
  ];

  if (sort && direction) args.push('--search', `sort:${sort}-${direction}`);

  return parseIssues(gh(args));
}

export function hasFailedIssue(query = queryIssues) {
  return query('status:failed', { limit: '1', state: 'all' }).some(i => has(i, 'status:failed'));
}

export function findActiveIssue(query = queryIssues) {
  for (const state of ACTIVE_STATES) {
    const active = query(state, { limit: '1' }).find(i => has(i, state) && i.labels.some(l => ACTIVE.has(l.name)));
    if (active) return active;
  }
  return null;
}

export function oldestBlockedIssue(query = queryIssues) {
  return query('status:blocked', { limit: '1', sort: 'created', direction: 'asc' })
    .filter(i => has(i, 'status:blocked'))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0] || null;
}

export function queueAdvanceDecision(query = queryIssues) {
  if (hasFailedIssue(query)) return { action: 'halt_failed' };

  const active = findActiveIssue(query);
  if (active) {
    return has(active, 'status:queued')
      ? { action: 'halt_queued' }
      : { action: 'halt_active' };
  }

  const next = oldestBlockedIssue(query);
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
