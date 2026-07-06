#!/usr/bin/env node
import { mkdir, writeFile, cp, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OWNER = process.env.GITHUB_REPOSITORY_OWNER || 'wdhunter645';
const REPO = (process.env.GITHUB_REPOSITORY || 'wdhunter645/next-starter-template').split('/')[1];
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const OUT_DIR = process.env.PMO_DASHBOARD_OUT_DIR || 'site/pmo-dashboard';
const API = process.env.GITHUB_API_URL || 'https://api.github.com';

const TITLE_PREFIXES = [
  { pattern: /^PROGRAM CANDIDATE:\s*/i, type: 'program-candidate' },
  { pattern: /^STRATEGY REVIEW:\s*/i, type: 'strategy-review' },
  { pattern: /^STRATEGY:\s*/i, type: 'strategy' },
  { pattern: /^PROGRAM:\s*/i, type: 'program' },
  { pattern: /^PROJECT:\s*/i, type: 'project' }
];

const lifecycleToView = { active: 'activePrograms', pipeline: 'pmoPipeline', completed: 'completedPrograms' };
const statusByLifecycle = { active: 'Active', pipeline: 'PMO Intake', completed: 'Completed' };
const taskBlockHeadingPattern = /^\s*(?:#{1,6}\s*)?(Task Chain|Child Tasks?|Implementation Tasks?|Task List)\s*:?\s*(.*)$/i;
const nextSectionPattern = /^\s*#{1,6}\s+\S/;

async function github(pathname) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'pmo-dashboard-generator' };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  const res = await fetch(`${API}${pathname}`, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${pathname}: ${await res.text()}`);
  return { data: await res.json(), headers: res.headers };
}

function nextLinkPath(linkHeader) {
  const match = linkHeader?.match(/<([^>]+)>;\s*rel="next"/);
  if (!match) return null;
  const next = new URL(match[1]);
  return `${next.pathname}${next.search}`;
}

async function fetchIssuesForState(issueState) {
  const all = [];
  let pathname = `/repos/${OWNER}/${REPO}/issues?state=${issueState}&per_page=100`;
  for (;;) {
    const { data: batch, headers } = await github(pathname);
    const issues = batch.filter((issue) => !issue.pull_request);
    all.push(...issues);
    const nextPath = nextLinkPath(headers.get('link'));
    if (!nextPath) break;
    pathname = nextPath;
  }
  return all;
}

async function fetchIssues(state) {
  if (process.env.PMO_DASHBOARD_ISSUES_FIXTURE) {
    const fixture = JSON.parse(await readFile(process.env.PMO_DASHBOARD_ISSUES_FIXTURE, 'utf8'));
    return fixture.filter((issue) => !issue.pull_request && (state === 'all' || issue.state === state));
  }
  if (state === 'all') {
    const open = await fetchIssuesForState('open');
    const closed = await fetchIssuesForState('closed');
    return [...open, ...closed];
  }
  return fetchIssuesForState(state);
}

function field(body, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = (body || '').match(new RegExp(`^\\s*${escaped}\\s*:\\s*(.+?)\\s*$`, 'im'));
  return match ? match[1].trim() : null;
}

function labels(issue) { return (issue.labels || []).map((label) => typeof label === 'string' ? label : label.name); }

function titleType(title) {
  if (!title) return null;
  for (const { pattern, type } of TITLE_PREFIXES) {
    if (pattern.test(title)) return type;
  }
  return null;
}

function cleanName(title) {
  for (const { pattern } of TITLE_PREFIXES) {
    if (pattern.test(title)) return title.replace(pattern, '').trim();
  }
  return title.trim();
}

function explicitTaskBlocks(body) {
  const lines = (body || '').split(/\r?\n/);
  const blocks = [];
  let currentBlock = null;

  for (const line of lines) {
    const headingMatch = line.match(taskBlockHeadingPattern);
    if (headingMatch) {
      currentBlock = [];
      const inlineContent = headingMatch[2] || '';
      if (inlineContent.trim()) currentBlock.push(inlineContent.trim());
      blocks.push(currentBlock);
      continue;
    }

    if (currentBlock && nextSectionPattern.test(line)) {
      currentBlock = null;
      continue;
    }

    if (currentBlock) currentBlock.push(line);
  }

  return blocks.map((block) => block.join('\n').trim()).filter(Boolean);
}

function taskNumbers(issue) {
  const own = issue.number;
  const nums = new Set();
  const taskSections = explicitTaskBlocks(issue.body);

  for (const taskSection of taskSections) {
    for (const match of taskSection.matchAll(/(?:#|issues\/)(\d{1,6})\b/g)) {
      const n = Number(match[1]);
      if (n && n !== own) nums.add(n);
    }
  }
  return [...nums];
}

function isComplete(issue) {
  return issue?.state === 'closed' || labels(issue || {}).includes('status:complete');
}

function lifecycle(issue) {
  const explicit = (field(issue.body, 'Dashboard Lifecycle') || '').toLowerCase();
  if (['active', 'pipeline', 'completed'].includes(explicit)) return explicit;
  if (issue.state === 'closed' || labels(issue).includes('status:complete')) return 'completed';
  if (labels(issue).some((l) => ['status:implementation', 'status:review', 'status:post-merge-verify', 'status:assigned'].includes(l))) return 'active';
  return 'pipeline';
}

function status(issue, life) {
  return field(issue.body, 'Status') || field(issue.body, 'Dashboard Status') || labels(issue).find((l) => l.startsWith('status:'))?.replace('status:', '').replace(/-/g, ' ') || statusByLifecycle[life];
}

function owner(issue) {
  return field(issue.body, 'Owner / Agent') || labels(issue).find((l) => l.startsWith('owner:'))?.replace('owner:', '') || issue.assignees?.map((a) => a.login).join(', ') || 'Pending Assignment';
}

function isPlaceholderDescription(value) {
  if (!value) return true;
  const trimmed = value.trim();
  return /^<[^>]+>$/.test(trimmed) || /^tbd$/i.test(trimmed);
}

function description(issue) {
  for (const name of ['Program Description', 'Project Description']) {
    const value = field(issue.body, name);
    if (value && !isPlaceholderDescription(value)) return value;
  }
  const purpose = field(issue.body, 'Purpose');
  if (purpose && !isPlaceholderDescription(purpose)) return purpose;
  const line = (issue.body || '').split('\n').find((entry) => entry.trim() && !entry.trim().startsWith('#'));
  return line?.trim() && !isPlaceholderDescription(line.trim()) ? line.trim() : '';
}

function priorityValue(priority) {
  const parsed = Number(priority);
  return Number.isNaN(parsed) ? 9999 : parsed;
}

async function loadExcludedIssueNumbers() {
  try {
    const inventory = JSON.parse(await readFile(path.join(__dirname, 'pmo-tracked-inventory.json'), 'utf8'));
    return new Set((inventory.excluded || []).map((item) => item.issueNumber));
  } catch {
    return new Set();
  }
}

async function main() {
  const excluded = await loadExcludedIssueNumbers();
  const issues = await fetchIssues('all');
  const byNumber = new Map(issues.map((issue) => [issue.number, issue]));
  const rows = { activePrograms: [], pmoPipeline: [], completedPrograms: [] };
  for (const issue of issues.filter((i) => titleType(i.title) && !excluded.has(i.number))) {
    const type = titleType(issue.title);
    const life = lifecycle(issue);
    const tasks = taskNumbers(issue).map((n) => byNumber.get(n)).filter(Boolean);
    const taskCount = tasks.length;
    const tasksCompleted = tasks.filter(isComplete).length;
    const percentComplete = taskCount > 0 ? Math.round((tasksCompleted / taskCount) * 100) : null;
    const row = {
      type,
      name: cleanName(issue.title),
      issueNumber: issue.number,
      issueUrl: issue.html_url,
      priority: field(issue.body, 'Priority #') || 'TBD',
      status: status(issue, life),
      percentComplete,
      taskCount,
      tasksCompleted,
      ownerAgent: owner(issue),
      description: description(issue),
      anticipatedCompletionDate: field(issue.body, 'Anticipated Completion Date') || 'TBD'
    };
    rows[lifecycleToView[life]].push(row);
  }
  for (const key of Object.keys(rows)) rows[key].sort((a, b) => priorityValue(a.priority) - priorityValue(b.priority) || a.name.localeCompare(b.name));
  const data = { generatedAt: new Date().toISOString(), source: 'github-issues', repository: `${OWNER}/${REPO}`, views: rows };
  await mkdir(path.join(OUT_DIR, 'assets'), { recursive: true });
  await writeFile(path.join(OUT_DIR, 'dashboard-data.json'), `${JSON.stringify(data, null, 2)}\n`);
  await cp(path.join(__dirname, 'static/index.html'), path.join(OUT_DIR, 'index.html'));
  await cp(path.join(__dirname, 'static/pmo-dashboard.css'), path.join(OUT_DIR, 'assets/pmo-dashboard.css'));
  await cp(path.join(__dirname, 'static/pmo-dashboard.js'), path.join(OUT_DIR, 'assets/pmo-dashboard.js'));
  console.log(`Generated PMO dashboard with ${Object.values(rows).flat().length} rows at ${OUT_DIR}`);
}

main().catch((error) => { console.error(error); process.exit(1); });
