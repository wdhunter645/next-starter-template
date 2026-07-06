#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = process.argv[2] || process.env.PMO_DASHBOARD_OUT_DIR || 'site/pmo-dashboard';
const requiredViews = ['activePrograms', 'pmoPipeline', 'completedPrograms'];
const lifecycleToView = { active: 'activePrograms', pipeline: 'pmoPipeline', completed: 'completedPrograms' };
const validLifecycles = new Set(Object.keys(lifecycleToView));
const standardDisplayStatuses = new Set([
  'Active',
  'Implementation Ready',
  'Planning',
  'Strategy Defined',
  'Strategy Development',
  'Idea',
  'Completed'
]);
const errors = [];

async function readJson(file) {
  try { return JSON.parse(await readFile(file, 'utf8')); }
  catch (error) { errors.push(`dashboard data is missing or JSON does not parse: ${error.message}`); return null; }
}

function validUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && url.hostname === 'github.com'; }
  catch { return false; }
}

function isNumericPriority(value) {
  const parsed = Number(value);
  return !Number.isNaN(parsed) && Number.isFinite(parsed);
}

function validateRow(row, label, rowByNumber, rowDataByNumber, errors) {
  if (!row.name) errors.push(`${label} is missing Program / Project Name`);
  if (!row.status) errors.push(`${label} is missing Status`);
  if (row.status && !standardDisplayStatuses.has(row.status)) {
    errors.push(`${label} status must use standardized dashboard vocabulary, got ${JSON.stringify(row.status)}`);
  }
  if (Number.isNaN(row.percentComplete)) errors.push(`${label} percentComplete is NaN`);
  if (row.percentComplete !== null && (typeof row.percentComplete !== 'number' || row.percentComplete < 0 || row.percentComplete > 100)) errors.push(`${label} percentComplete must be null or 0-100`);
  if (!Number.isInteger(row.taskCount) || row.taskCount < 0) errors.push(`${label} taskCount must be a non-negative integer`);
  if (!Number.isInteger(row.tasksCompleted) || row.tasksCompleted < 0) errors.push(`${label} tasksCompleted must be a non-negative integer`);
  if (row.tasksCompleted > row.taskCount) errors.push(`${label} # of Tasks Completed is greater than # of Tasks`);
  if (!validUrl(row.issueUrl)) errors.push(`${label} contains an obviously invalid issue link`);
  if (row.issueNumber) {
    if (rowByNumber.has(row.issueNumber)) errors.push(`issue #${row.issueNumber} appears in multiple dashboard views`);
    rowByNumber.set(row.issueNumber, label);
    rowDataByNumber.set(row.issueNumber, row);
  }
  for (const [childIndex, child] of (row.children || []).entries()) {
    validateRow(child, `${label}.children[${childIndex}]`, rowByNumber, rowDataByNumber, errors);
    if (!child.parentProgramIssue && row.issueNumber) {
      errors.push(`${label}.children[${childIndex}] is missing parentProgramIssue metadata`);
    }
    if (child.parentProgramIssue && child.parentProgramIssue !== row.issueNumber) {
      errors.push(`${label}.children[${childIndex}] parentProgramIssue does not match parent row issueNumber`);
    }
    if (!Number.isInteger(child.childSequence) || child.childSequence <= 0) {
      errors.push(`${label}.children[${childIndex}] childSequence must be a positive integer`);
    }
  }
}

const data = await readJson(path.join(outDir, 'dashboard-data.json'));
const inventory = process.env.PMO_DASHBOARD_SKIP_INVENTORY_VALIDATION
  ? null
  : await readJson(path.join(__dirname, 'pmo-tracked-inventory.json'));

if (data) {
  if (data.source !== 'github-issues') errors.push('dashboard source must be github-issues');
  const rowByNumber = new Map();
  const rowDataByNumber = new Map();
  for (const view of requiredViews) {
    if (!Array.isArray(data.views?.[view])) errors.push(`required top-level view missing: ${view}`);
    for (const [index, row] of (data.views?.[view] || []).entries()) {
      validateRow(row, `${view}[${index}]`, rowByNumber, rowDataByNumber, errors);
    }
  }

  const taskAccountingByNumber = new Map();
  if (!Array.isArray(data.taskAccounting)) {
    errors.push('taskAccounting must be present and must be an array');
  } else {
    for (const [index, entry] of data.taskAccounting.entries()) {
      const label = `taskAccounting[${index}]`;
      if (!Number.isInteger(entry.parentIssueNumber) || entry.parentIssueNumber <= 0) errors.push(`${label} parentIssueNumber must be a positive integer`);
      if (!Array.isArray(entry.declaredTaskIssueNumbers)) errors.push(`${label} declaredTaskIssueNumbers must be an array`);
      if (!Array.isArray(entry.missingTaskIssueNumbers)) errors.push(`${label} missingTaskIssueNumbers must be an array`);
      if (!Array.isArray(entry.completedTaskIssueNumbers)) errors.push(`${label} completedTaskIssueNumbers must be an array`);
      if (!Number.isInteger(entry.taskCount) || entry.taskCount < 0) errors.push(`${label} taskCount must be a non-negative integer`);
      if (!Number.isInteger(entry.tasksCompleted) || entry.tasksCompleted < 0) errors.push(`${label} tasksCompleted must be a non-negative integer`);
      if (entry.tasksCompleted > entry.taskCount) errors.push(`${label} tasksCompleted is greater than taskCount`);

      const declaredUnique = new Set(entry.declaredTaskIssueNumbers || []);
      if (declaredUnique.size !== (entry.declaredTaskIssueNumbers || []).length) errors.push(`${label} declaredTaskIssueNumbers must not contain duplicates`);
      if (entry.taskCount !== declaredUnique.size) errors.push(`${label} taskCount must equal declaredTaskIssueNumbers length`);
      if (entry.tasksCompleted !== (entry.completedTaskIssueNumbers || []).length) errors.push(`${label} tasksCompleted must equal completedTaskIssueNumbers length`);

      const row = rowDataByNumber.get(entry.parentIssueNumber);
      if (row) {
        if (row.taskCount !== entry.taskCount) errors.push(`${label} taskCount does not match dashboard row value for #${entry.parentIssueNumber}`);
        if (row.tasksCompleted !== entry.tasksCompleted) errors.push(`${label} tasksCompleted does not match dashboard row value for #${entry.parentIssueNumber}`);
      }
      if (taskAccountingByNumber.has(entry.parentIssueNumber)) errors.push(`${label} duplicates task accounting for issue #${entry.parentIssueNumber}`);
      taskAccountingByNumber.set(entry.parentIssueNumber, entry);
    }
  }

  if (inventory?.included) {
    const trackedNumbers = new Set(inventory.included.map((item) => item.issueNumber));
    for (const view of ['activePrograms', 'pmoPipeline']) {
      for (const [index, row] of (data.views?.[view] || []).entries()) {
        if (trackedNumbers.has(row.issueNumber) && !isNumericPriority(row.priority)) {
          errors.push(`${view}[${index}] #${row.issueNumber} tracked inventory priority must be numeric, got ${JSON.stringify(row.priority)}`);
        }
      }
    }
    for (const item of inventory.included) {
      if (!validLifecycles.has(item.expectedLifecycle)) {
        errors.push(`tracked inventory #${item.issueNumber} has invalid expectedLifecycle: ${JSON.stringify(item.expectedLifecycle)}`);
        continue;
      }
      const expectedView = lifecycleToView[item.expectedLifecycle];
      const viewLabel = rowByNumber.get(item.issueNumber);
      if (!viewLabel) {
        errors.push(`tracked issue #${item.issueNumber} is missing from dashboard output`);
        continue;
      }
      const topLevelView = viewLabel.split('[')[0];
      if (topLevelView !== expectedView) {
        errors.push(`tracked issue #${item.issueNumber} expected in ${expectedView}, found in ${viewLabel}`);
      }
      if (item.expectedPriority !== undefined) {
        const row = rowDataByNumber.get(item.issueNumber);
        if (row && Number(row.priority) !== item.expectedPriority) {
          errors.push(`tracked issue #${item.issueNumber} expected priority ${item.expectedPriority}, found ${row.priority}`);
        }
      }
      if (item.requiresTaskAccounting || item.expectedMinimumTaskCount !== undefined) {
        const row = rowDataByNumber.get(item.issueNumber);
        const minimumTaskCount = item.expectedMinimumTaskCount ?? 1;
        if (!row) {
          errors.push(`tracked issue #${item.issueNumber} requires task accounting but has no dashboard row details`);
        } else if (row.taskCount < minimumTaskCount) {
          errors.push(`tracked issue #${item.issueNumber} expected taskCount >= ${minimumTaskCount}, found ${row.taskCount}`);
        }
        const taskAudit = taskAccountingByNumber.get(item.issueNumber);
        if (!taskAudit) {
          errors.push(`tracked issue #${item.issueNumber} requires task accounting but has no taskAccounting audit entry`);
        } else if (taskAudit.taskCount < minimumTaskCount) {
          errors.push(`taskAccounting for tracked issue #${item.issueNumber} expected taskCount >= ${minimumTaskCount}, found ${taskAudit.taskCount}`);
        }
      }
    }
  }

  if (inventory?.excluded) {
    for (const item of inventory.excluded) {
      const view = rowByNumber.get(item.issueNumber);
      if (view) errors.push(`excluded issue #${item.issueNumber} must not appear in dashboard output (found in ${view})`);
    }
  }
}

for (const file of ['index.html', 'assets/pmo-dashboard.css', 'assets/pmo-dashboard.js']) {
  try { await readFile(path.join(outDir, file), 'utf8'); }
  catch { errors.push(`generated ${file} is missing`); }
}

if (errors.length) { console.error(errors.map((e) => `- ${e}`).join('\n')); process.exit(1); }
console.log(`PMO dashboard validation passed for ${outDir}`);
