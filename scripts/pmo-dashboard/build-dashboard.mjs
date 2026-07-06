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

const CHILD_PROJECT_PATTERN = /^PROJECT:\s*(\d+):(\d+)\s*\|\s*(.+)$/i;

const lifecycleToView = { active: 'activePrograms', pipeline: 'pmoPipeline', completed: 'completedPrograms' };
const statusByLifecycle = { active: 'Active', pipeline: 'Implementation Ready', completed: 'Completed' };

const STATUS_ALIASES = new Map([
  ['active', 'Active'],
  ['completed', 'Completed'],
  ['implementation ready', 'Implementation Ready'],
  ['planning', 'Planning'],
  ['planning complete', 'Planning'],
  ['strategy defined', 'Strategy Defined'],
  ['strategy development', 'Strategy Development'],
  ['strategy review', 'Strategy Development'],
  ['idea', 'Idea'],
  ['pmo intake', 'Implementation Ready'],
  ['paused', 'Planning'],
  ['paused (launch-gated)', 'Planning'],
  ['decision capture', 'Idea']
]);

const PIPELINE_STATUS_VALUES = new Set([
  'implementation ready',
  'planning',
  'strategy defined',
  'strategy development',
  'idea',
  'pmo intake',
  'planning complete',
  'strategy review',
  'paused (launch-gated)',
  'paused'
]);

const taskBlockHeadings = [
  'Task Chain',
  'Child Task Chain',
  'Child Tasks',
  'Child Issue Chain',
  'Child Issues',
  'Expected Child Issue Chain',
  'Expected Child Task Chain',
  'Required Child Issue Chain',
  'Required Child Task Chain',
  'Implementation Tasks',
  'Implementation Task Chain',
  'Implementation Issue Chain',
  'Task List',
  'Issue Chain'
];
const escapedTaskBlockHeadings = taskBlockHeadings.map((heading) => escapeRegex(heading));
const taskBlockHeadingAlternation = escapedTaskBlockHeadings.join('|');
const taskBlockHeadingPattern = new RegExp(`^\\s*(?:#{1,6}\\s*)?(${taskBlockHeadingAlternation})\\s*:?\\s*(.*)$`, 'i');
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

function isPmoTracked(issue) {
  return labels(issue).some((label) => label.toLowerCase() === 'pmo');
}

function titleType(title) {
  if (!title) return null;
  for (const { pattern, type } of TITLE_PREFIXES) {
    if (pattern.test(title)) return type;
  }
  return null;
}

function parseChildProject(title) {
  const match = title?.match(CHILD_PROJECT_PATTERN);
  if (!match) return null;
  return {
    parentProgramIssue: Number(match[1]),
    sequence: Number(match[2]),
    displayTitle: decodeBasicHtmlEntities(match[3].trim())
  };
}

function cleanName(title) {
  for (const { pattern } of TITLE_PREFIXES) {
    if (pattern.test(title)) return decodeBasicHtmlEntities(title.replace(pattern, '').trim());
  }
  return decodeBasicHtmlEntities(title.trim());
}

function displayName(issue) {
  const child = parseChildProject(issue.title);
  if (child) return child.displayTitle;
  return cleanName(issue.title);
}

function decodeBasicHtmlEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function escapeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
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
  if (issue.state === 'closed' || labels(issue).includes('status:complete')) return 'completed';

  const bodyStatus = (field(issue.body, 'Status') || '').trim().toLowerCase();
  if (bodyStatus === 'active') return 'active';
  if (bodyStatus === 'completed') return 'completed';

  const explicit = (field(issue.body, 'Dashboard Lifecycle') || '').toLowerCase();
  if (explicit === 'completed') return 'completed';
  if (explicit === 'active') return 'active';
  if (explicit === 'pipeline') return 'pipeline';

  if (PIPELINE_STATUS_VALUES.has(bodyStatus)) return 'pipeline';

  return 'pipeline';
}

function normalizeDisplayStatus(issue, life) {
  const raw = field(issue.body, 'Status') || field(issue.body, 'Dashboard Status');
  if (raw) {
    const normalized = raw.trim().toLowerCase();
    if (STATUS_ALIASES.has(normalized)) return STATUS_ALIASES.get(normalized);
    for (const [alias, display] of STATUS_ALIASES) {
      if (normalized.startsWith(alias)) return display;
    }
  }
  return statusByLifecycle[life];
}

function status(issue, life) {
  if (life === 'completed') return statusByLifecycle.completed;
  return normalizeDisplayStatus(issue, life);
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

function prioritySort(a, b) {
  return priorityValue(a.priority) - priorityValue(b.priority) || a.name.localeCompare(b.name);
}

function completedSort(a, b) {
  const aTime = a.closedAt ? new Date(a.closedAt).getTime() : (a.updatedAt ? new Date(a.updatedAt).getTime() : 0);
  const bTime = b.closedAt ? new Date(b.closedAt).getTime() : (b.updatedAt ? new Date(b.updatedAt).getTime() : 0);
  return bTime - aTime || a.name.localeCompare(b.name);
}

async function loadExcludedIssueNumbers() {
  try {
    const inventory = JSON.parse(await readFile(path.join(__dirname, 'pmo-tracked-inventory.json'), 'utf8'));
    return new Set((inventory.excluded || []).map((item) => item.issueNumber));
  } catch {
    return new Set();
  }
}

function buildRow(issue, byNumber) {
  const type = titleType(issue.title);
  const life = lifecycle(issue);
  const childMeta = parseChildProject(issue.title);
  const declaredTaskIssueNumbers = taskNumbers(issue);
  const missingTaskIssueNumbers = declaredTaskIssueNumbers.filter((n) => !byNumber.has(n));
  const completedTaskIssueNumbers = declaredTaskIssueNumbers.filter((n) => isComplete(byNumber.get(n)));
  const taskCount = declaredTaskIssueNumbers.length;
  const tasksCompleted = completedTaskIssueNumbers.length;
  const percentComplete = taskCount > 0 ? Math.round((tasksCompleted / taskCount) * 100) : null;

  return {
    entry: { issue, childMeta, life },
    row: {
      type,
      name: displayName(issue),
      issueNumber: issue.number,
      issueUrl: issue.html_url,
      priority: field(issue.body, 'Priority #') || 'TBD',
      status: status(issue, life),
      percentComplete,
      taskCount,
      tasksCompleted,
      ownerAgent: owner(issue),
      description: description(issue),
      anticipatedCompletionDate: field(issue.body, 'Anticipated Completion Date') || 'TBD',
      closedAt: issue.closed_at || null,
      updatedAt: issue.updated_at || null,
      parentProgramIssue: childMeta?.parentProgramIssue ?? null,
      childSequence: childMeta?.sequence ?? null
    },
    taskAccounting: {
      parentIssueNumber: issue.number,
      declaredTaskIssueNumbers,
      missingTaskIssueNumbers,
      completedTaskIssueNumbers,
      taskCount,
      tasksCompleted
    }
  };
}

function assembleViews(entries) {
  const activeParentNumbers = new Set(
    entries.filter((e) => e.life === 'active' && e.row.type === 'program').map((e) => e.row.issueNumber)
  );
  const completedParentNumbers = new Set(
    entries.filter((e) => e.life === 'completed' && e.row.type === 'program').map((e) => e.row.issueNumber)
  );

  const childrenByParent = new Map();
  for (const entry of entries) {
    if (!entry.childMeta) continue;
    const parent = entry.childMeta.parentProgramIssue;
    if (!childrenByParent.has(parent)) childrenByParent.set(parent, []);
    childrenByParent.get(parent).push(entry);
  }
  for (const children of childrenByParent.values()) {
    children.sort((a, b) => a.childMeta.sequence - b.childMeta.sequence);
  }

  function attachChildren(parentEntry) {
    const children = childrenByParent.get(parentEntry.row.issueNumber) || [];
    if (!children.length) return;
    parentEntry.row.children = children.map((child) => child.row);
  }

  function isNestedUnderActiveParent(entry) {
    return entry.childMeta && activeParentNumbers.has(entry.childMeta.parentProgramIssue);
  }

  function isNestedUnderCompletedParent(entry) {
    return entry.childMeta && completedParentNumbers.has(entry.childMeta.parentProgramIssue);
  }

  const views = { activePrograms: [], pmoPipeline: [], completedPrograms: [] };

  for (const entry of entries) {
    if (entry.life === 'active') {
      if (entry.childMeta && isNestedUnderActiveParent(entry)) continue;
      if (entry.row.type === 'program') attachChildren(entry);
      views.activePrograms.push(entry.row);
      continue;
    }

    if (entry.life === 'pipeline') {
      if (isNestedUnderActiveParent(entry)) continue;
      views.pmoPipeline.push(entry.row);
      continue;
    }

    if (entry.life === 'completed') {
      if (isNestedUnderActiveParent(entry) || isNestedUnderCompletedParent(entry)) continue;
      if (entry.row.type === 'program') attachChildren(entry);
      views.completedPrograms.push(entry.row);
    }
  }

  views.activePrograms.sort(prioritySort);
  views.pmoPipeline.sort(prioritySort);
  views.completedPrograms.sort(completedSort);

  return views;
}

async function main() {
  const excluded = await loadExcludedIssueNumbers();
  const issues = await fetchIssues('all');
  const byNumber = new Map(issues.map((issue) => [issue.number, issue]));
  const taskAccounting = [];

  const built = issues
    .filter((issue) => isPmoTracked(issue) && !excluded.has(issue.number))
    .map((issue) => buildRow(issue, byNumber));

  for (const item of built) {
    item.entry.row = item.row;
    taskAccounting.push(item.taskAccounting);
  }

  const entries = built.map((item) => item.entry);
  const rows = assembleViews(entries);
  taskAccounting.sort((a, b) => a.parentIssueNumber - b.parentIssueNumber);

  const topLevelCount = Object.values(rows).reduce((sum, view) => sum + view.length, 0);
  const nestedCount = Object.values(rows).reduce((sum, view) => sum + view.reduce((n, row) => n + (row.children?.length || 0), 0), 0);

  const data = {
    generatedAt: new Date().toISOString(),
    source: 'github-issues',
    repository: `${OWNER}/${REPO}`,
    trackingModel: 'pmo-label',
    views: rows,
    taskAccounting
  };

  await mkdir(path.join(OUT_DIR, 'assets'), { recursive: true });
  await writeFile(path.join(OUT_DIR, 'dashboard-data.json'), `${JSON.stringify(data, null, 2)}\n`);
  await cp(path.join(__dirname, 'static/index.html'), path.join(OUT_DIR, 'index.html'));
  await cp(path.join(__dirname, 'static/pmo-dashboard.css'), path.join(OUT_DIR, 'assets/pmo-dashboard.css'));
  await cp(path.join(__dirname, 'static/pmo-dashboard.js'), path.join(OUT_DIR, 'assets/pmo-dashboard.js'));
  console.log(`Generated PMO dashboard with ${topLevelCount} top-level rows and ${nestedCount} nested child rows at ${OUT_DIR}`);
}

main().catch((error) => { console.error(error); process.exit(1); });
