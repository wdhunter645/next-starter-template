#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repo = process.env.GITHUB_REPOSITORY;
const planDir = 'docs/ops/implementation-plans';
const routingPath = '.github/orchestrator-routing.json';

if (!repo) {
  console.error('GITHUB_REPOSITORY is required.');
  process.exit(1);
}

const routing = JSON.parse(fs.readFileSync(routingPath, 'utf8'));

function runGh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' }).trim();
}

function runGit(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function isProductionReady(content) {
  return /Status:\s*production-ready/i.test(content);
}

function markIssuesCreated(filePath, content) {
  const updated = content.replace(/Status:\s*production-ready/i, 'Status: issues-created');
  if (updated !== content) {
    fs.writeFileSync(filePath, updated);
    return true;
  }
  return false;
}

function projectSlug(filePath) {
  return path.basename(filePath, path.extname(filePath));
}

function parseTasks(content) {
  const matches = [...content.matchAll(/^## Task (\d{3}) — (.+)$/gm)];
  return matches.map((match, index) => {
    const start = match.index;
    const end = index + 1 < matches.length ? matches[index + 1].index : content.length;
    const block = content.slice(start, end).trim();
    const type = block.match(/^Type:\s*(.+)$/m)?.[1]?.trim();
    const agent = block.match(/^Agent:\s*(.+)$/m)?.[1]?.trim();
    return {
      id: `Task-${match[1]}`,
      number: match[1],
      title: match[2].trim(),
      type,
      agent,
      block
    };
  });
}

function issueExists(marker) {
  const query = `repo:${repo} is:issue ${marker}`;
  const result = runGh(['issue', 'list', '--repo', repo, '--search', query, '--json', 'number', '--limit', '1']);
  return JSON.parse(result).length > 0;
}

function labelsForTask(task) {
  const route = routing.taskTypes[task.type];
  if (!route) {
    throw new Error(`Unknown task type: ${task.type}`);
  }

  const agent = task.agent || route.defaultAgent;
  if (!route.allowedAgents.includes(agent)) {
    throw new Error(`Agent ${agent} is not allowed for task type ${task.type}`);
  }

  return [
    'orchestrator',
    'status:queued',
    `type:${task.type}`,
    `agent:${agent}`
  ];
}

const files = fs.existsSync(planDir)
  ? fs.readdirSync(planDir).filter((name) => name.endsWith('.md') && name !== 'README.md')
  : [];

const updatedPlans = [];

for (const file of files) {
  const filePath = path.join(planDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  if (!isProductionReady(content)) {
    continue;
  }

  const slug = projectSlug(filePath);
  const tasks = parseTasks(content);

  for (const task of tasks) {
    const marker = `lgfc-task-id:${slug}:${task.id}`;
    if (issueExists(marker)) {
      console.log(`SKIP existing issue for ${marker}`);
      continue;
    }

    const labels = labelsForTask(task);
    const body = [
      `<!-- ${marker} -->`,
      '',
      `Implementation Plan: \`${filePath}\``,
      `Task: ${task.id}`,
      `Type: ${task.type}`,
      `Agent: ${task.agent}`,
      '',
      task.block
    ].join('\n');

    runGh([
      'issue',
      'create',
      '--repo',
      repo,
      '--title',
      `[${task.id}] ${task.title}`,
      '--body',
      body,
      '--label',
      labels.join(',')
    ]);

    console.log(`CREATED issue for ${marker}`);
  }

  if (markIssuesCreated(filePath, content)) {
    updatedPlans.push(filePath);
  }
}

if (updatedPlans.length > 0) {
  runGit(['config', 'user.name', 'github-actions[bot]']);
  runGit(['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
  runGit(['add', ...updatedPlans]);
  runGit(['commit', '-m', 'ops: mark implementation plans as issues-created']);
  runGit(['push', 'origin', 'HEAD:main']);
}
