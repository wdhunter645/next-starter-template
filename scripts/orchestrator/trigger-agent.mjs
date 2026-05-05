#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const repo = process.env.GITHUB_REPOSITORY;
const issueNumber = process.env.ISSUE_NUMBER;

if (!repo || !issueNumber) {
  console.error('GITHUB_REPOSITORY and ISSUE_NUMBER environment variables are required.');
  process.exit(1);
}

const AGENT_PROMPTS = {
  'agent:cursor': '@cursor execute implementation per issue + update existing draft PR only',
  'agent:codex': '@codex implement task and update draft PR',
  'agent:copilot': '@copilot implement per issue and update PR'
};

function runGh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' }).trim();
}

const issueJson = runGh([
  'issue', 'view', issueNumber, '--repo', repo, '--json', 'labels,title'
]);

const issue = JSON.parse(issueJson);
const labels = issue.labels.map((label) => label.name);

if (!labels.includes('status:pr-draft')) process.exit(0);

const agent = labels.find((label) => label.startsWith('agent:'));
if (!agent) process.exit(0);

const triggerComment = AGENT_PROMPTS[agent] || '';
if (!triggerComment) process.exit(0);

runGh(['issue', 'comment', issueNumber, '--repo', repo, '--body', triggerComment]);
runGh(['issue', 'edit', issueNumber, '--repo', repo, '--remove-label', 'status:pr-draft', '--add-label', 'status:implementation']);

console.log(`Agent triggered for issue #${issueNumber}`);
