#!/usr/bin/env node
import { mkdir, writeFile, cp, readFile } from 'node:fs/promises';
import path from 'node:path';

const OWNER = process.env.GITHUB_REPOSITORY_OWNER || 'wdhunter645';
const REPO = (process.env.GITHUB_REPOSITORY || 'wdhunter645/next-starter-template').split('/')[1];
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const OUT_DIR = process.env.PMO_DASHBOARD_OUT_DIR || 'site/pmo-dashboard';
const API = process.env.GITHUB_API_URL || 'https://api.github.com';

const lifecycleToView = { active: 'activePrograms', pipeline: 'pmoPipeline', completed: 'completedPrograms' };
const statusByLifecycle = { active: 'Active', pipeline: 'PMO Intake', completed: 'Completed' };

async function github(pathname) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'pmo-dashboard-generator' };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  const res = await fetch(`${API}${pathname}`, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${pathname}: ${await res.text()}`);
  return res.json();
}

async function fetchIssues(state) {
  if (process.env.PMO_DASHBOARD_ISSUES_FIXTURE) {
    const fixture = JSON.parse(await readFile(process.env.PMO_DASHBOARD_ISSUES_FIXTURE, 'utf8'));
    return fixture.filter((issue) => !issue.pull_request && (state === 'all' || issue.state === state));
  }
  const all = [];
  for (let page = 1; ; page += 1) {
    const batch = await github(`/repos/${OWNER}/${REPO}/issues?state=${state}&per_page=100&page=${page}`);
    const issues = batch.filter((issue) => !issue.pull_request);
    all.push(...issues);
    if (batch.length < 100) break;
  }
  return all;
}

function field(body, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = (body || '').match(new RegExp(`^\\s*${escaped}\\s*:\\s*(.+?)\\s*$`, 'im'));
  return match ? match[1].trim() : null;
}

function labels(issue) { return (issue.labels || []).map((label) => typeof label === 'string' ? label : label.name); }
function titleType(title) { return title?.startsWith('PROGRAM:') ? 'program' : title?.startsWith('PROJECT:') ? 'project' : null; }
function cleanName(title) { return title.replace(/^(PROGRAM|PROJECT):\s*/i, '').trim(); }

function taskNumbers(issue) {
  const own = issue.number;
  const nums = new Set();
  const body = issue.body || '';
  const taskSection = body.match(/(?:task chain|child tasks?|implementation tasks?|task list)[\s\S]*/i)?.[0] || body;
  for (const match of taskSection.matchAll(/(?:#|issues\/)(\d{1,6})\b/g)) {
    const n = Number(match[1]);
    if (n && n !== own) nums.add(n);
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

function description(issue) {
  return field(issue.body, 'Program Description') || field(issue.body, 'Project Description') || field(issue.body, 'Purpose') || (issue.body || '').split('\n').find((line) => line.trim() && !line.trim().startsWith('#'))?.trim() || '';
}

function priorityValue(priority) {
  const parsed = Number(priority);
  return Number.isNaN(parsed) ? 9999 : parsed;
}

async function main() {
  const issues = await fetchIssues('all');
  const byNumber = new Map(issues.map((issue) => [issue.number, issue]));
  const rows = { activePrograms: [], pmoPipeline: [], completedPrograms: [] };
  for (const issue of issues.filter((i) => titleType(i.title))) {
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
  await cp('scripts/pmo-dashboard/static/index.html', path.join(OUT_DIR, 'index.html'));
  await cp('scripts/pmo-dashboard/static/pmo-dashboard.css', path.join(OUT_DIR, 'assets/pmo-dashboard.css'));
  await cp('scripts/pmo-dashboard/static/pmo-dashboard.js', path.join(OUT_DIR, 'assets/pmo-dashboard.js'));
  console.log(`Generated PMO dashboard with ${Object.values(rows).flat().length} rows at ${OUT_DIR}`);
}

main().catch((error) => { console.error(error); process.exit(1); });
