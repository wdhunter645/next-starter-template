#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { evaluateCursorPickup } from './poller.mjs';
import { loadPollerState, savePollerState } from './state-store.mjs';

const repository = process.env.GITHUB_REPOSITORY || 'wdhunter645/next-starter-template';
const statePath = process.env.CURSOR_POLLER_STATE || path.join(os.homedir(), '.cursor/github-poller/state.json');

function ghJson(args) {
  const output = execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  return JSON.parse(output || '[]');
}

function latestExecutableEvent(comments = []) {
  return [...comments].reverse().map((comment) => {
    const marker = ['CURSOR ASSIGNMENT', 'CHATGPT RESPONSE'].find((value) => String(comment.body || '').includes(value));
    return marker ? { id: comment.id, marker, createdAt: comment.createdAt } : null;
  }).find(Boolean) || null;
}

export function inspectReadyIssues({ issues, commentsByIssue, state }) {
  return issues.map((issue) => {
    const candidate = {
      number: issue.number,
      projectIssue: issue.projectIssue || null,
      lane: String(issue.projectIssue || issue.number),
      labels: (issue.labels || []).map((label) => typeof label === 'string' ? label : label.name),
      latestEvent: latestExecutableEvent(commentsByIssue[issue.number] || []),
      eligible: issue.eligible !== false,
    };
    return { issue: candidate, pickup: evaluateCursorPickup(candidate, state) };
  });
}

function main() {
  const state = loadPollerState(statePath);
  const issues = ghJson(['issue', 'list', '--repo', repository, '--state', 'open', '--label', 'agent:cursor', '--label', 'handoff:ready', '--json', 'number,labels,updatedAt,url']);
  const commentsByIssue = {};
  for (const issue of issues) {
    commentsByIssue[issue.number] = ghJson(['api', `repos/${repository}/issues/${issue.number}/comments`, '--paginate']);
  }
  const inspected = inspectReadyIssues({ issues, commentsByIssue, state });
  const eligible = inspected.filter((item) => item.pickup.eligible);
  const nextState = { ...state, heartbeatAt: new Date().toISOString() };
  savePollerState(statePath, nextState);
  process.stdout.write(`${JSON.stringify({ repository, statePath, eligible, inspected }, null, 2)}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
