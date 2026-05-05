#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const repo = process.env.GITHUB_REPOSITORY;

if (!repo) {
  console.error('GITHUB_REPOSITORY is required.');
  process.exit(1);
}

function runGh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' }).trim();
}

function searchIssues(query) {
  const result = runGh(['issue', 'list', '--repo', repo, '--search', query, '--json', 'number,title,labels', '--limit', '20']);
  return JSON.parse(result);
}

const failed = searchIssues('is:open label:orchestrator label:status:failed');
if (failed.length > 0) {
  console.log('Queue advance stopped: failed orchestrator issue exists.');
  process.exit(0);
}

const active = searchIssues('is:open label:orchestrator label:status:assigned,label:status:pr-draft,label:status:implementation,label:status:review,label:status:post-merge-verify');
if (active.length > 0) {
  console.log('Queue advance stopped: active orchestrator issue exists.');
  process.exit(0);
}

const queued = searchIssues('is:open label:orchestrator label:status:queued');
if (queued.length === 0) {
  console.log('Queue complete: no queued orchestrator issues.');
  process.exit(0);
}

const next = queued.sort((a, b) => a.number - b.number)[0];
runGh(['issue', 'comment', String(next.number), '--repo', repo, '--body', 'Queue advance selected this issue as the next serial task. Draft PR creation will run from status:queued.']);
console.log(`Queue advance selected issue #${next.number}: ${next.title}`);
