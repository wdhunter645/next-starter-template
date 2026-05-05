#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const repo = process.env.GITHUB_REPOSITORY;
if (!repo) {
  console.error('GITHUB_REPOSITORY is required.');
  process.exit(1);
}

const ACTIVE = new Set([
  'status:assigned',
  'status:pr-draft',
  'status:implementation',
  'status:review',
  'status:post-merge-verify'
]);

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' }).trim();
}

const issues = JSON.parse(
  gh(['issue','list','--repo',repo,'--search','is:open label:orchestrator','--json','number,title,labels,createdAt','--limit','100'])
);

function has(issue, name) {
  return issue.labels.some(l => l.name === name);
}

// stop if failure exists
if (issues.some(i => has(i,'status:failed'))) process.exit(0);

// stop if active work exists
if (issues.some(i => i.labels.some(l => ACTIVE.has(l.name)))) process.exit(0);

// select next blocked task
const next = issues
  .filter(i => has(i,'status:blocked'))
  .sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt))[0];

if (!next) process.exit(0);

// trigger next task by relabeling
gh(['issue','edit',String(next.number),'--repo',repo,'--remove-label','status:blocked','--add-label','status:queued']);

// comment for traceability
gh(['issue','comment',String(next.number),'--repo',repo,'--body','Queue advance activated: status:blocked → status:queued']);
