#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const repo = process.env.GITHUB_REPOSITORY;
const issueNumber = process.env.ISSUE_NUMBER;

function runGh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' }).trim();
}

const issueJson = runGh([
  'issue','view',issueNumber,'--repo',repo,'--json','labels,title'
]);

const issue = JSON.parse(issueJson);
const labels = issue.labels.map(l => l.name);

if (!labels.includes('status:pr-draft')) process.exit(0);

let agent = labels.find(l => l.startsWith('agent:'));
if (!agent) process.exit(0);

let triggerComment = '';

if (agent === 'agent:cursor') {
  triggerComment = '@cursor execute implementation per issue + update existing draft PR only';
}

if (agent === 'agent:codex') {
  triggerComment = '@codex implement task and update draft PR';
}

if (agent === 'agent:copilot') {
  triggerComment = '@copilot implement per issue and update PR';
}

if (!triggerComment) process.exit(0);

runGh(['issue','comment',issueNumber,'--repo',repo,'--body',triggerComment]);

runGh(['issue','edit',issueNumber,'--repo',repo,'--remove-label','status:pr-draft','--add-label','status:implementation']);

console.log(`Agent triggered for issue #${issueNumber}`);
