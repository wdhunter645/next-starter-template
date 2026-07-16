#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = process.argv[2] || process.env.PMO_DASHBOARD_OUT_DIR || 'site/pmo-dashboard';
const requiredViews = ['activePrograms', 'pmoPipeline', 'completedPrograms', 'incomplete'];
const lifecycleToView = {
  active: 'activePrograms',
  pipeline: 'pmoPipeline',
  completed: 'completedPrograms',
  closed: 'completedPrograms',
  incomplete: 'incomplete'
};
const validInventoryLifecycles = new Set(['active', 'pipeline', 'completed']);
const validRowLifecycles = new Set(['active', 'pipeline', 'closed', 'incomplete']);
const stageLabels = new Set([
  'pmo:stage:intake',
  'pmo:stage:discovery',
  'pmo:stage:definition',
  'pmo:stage:planning',
  'pmo:stage:prep',
  'pmo:stage:ready-for-launch'
]);
const allowedStatusByView = {
  activePrograms: new Set(['Active']),
  pmoPipeline: new Set([
    'Idea / topic intake',
    'Discussion / discovery',
    'Definition / design',
    'Planning',
    'Implementation preparation',
    'Ready for launch'
  ]),
  completedPrograms: new Set(['Completed']),
  incomplete: new Set(['Incomplete'])
};
const errors = [];

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    errors.push(`dashboard data is missing or JSON does not parse: ${error.message}`);
    return null;
  }
}

function validUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'github.com';
  } catch {
    return false;
  }
}

function isNumericPriorityDisplay(value) {
  const parsed = Number(value);
  return !Number.isNaN(parsed) && Number.isFinite(parsed);
}

function topLevelViewFromLabel(label) {
  return label.split('[')[0];
}

function validateViewStatus(row, label, errors) {
  if (label.includes('.children[')) return;
  const view = topLevelViewFromLabel(label);
  const allowed = allowedStatusByView[view];
  if (row.status && allowed && !allowed.has(row.status)) {
    errors.push(`${label} status ${JSON.stringify(row.status)} is not allowed in ${view}; allowed statuses: ${[...allowed].join(', ')}`);
  }
}

function validateRow(row, label, rowByNumber, rowDataByNumber, errors) {
  if (!row.name && !row.title) errors.push(`${label} is missing title/name`);
  if (!Number.isInteger(row.issueNumber) || row.issueNumber <= 0) errors.push(`${label} is missing a valid issueNumber`);
  if (!validUrl(row.issueUrl)) errors.push(`${label} contains an obviously invalid issue link`);
  if (!Array.isArray(row.labels)) errors.push(`${label} labels must be an array`);
  if (!validRowLifecycles.has(row.lifecycle)) {
    errors.push(`${label} lifecycle must be active|pipeline|closed|incomplete, got ${JSON.stringify(row.lifecycle)}`);
  }
  if (!row.status) errors.push(`${label} is missing Status`);
  validateViewStatus(row, label, errors);

  if (!Array.isArray(row.dataQualityErrors)) errors.push(`${label} dataQualityErrors must be an array`);
  if (!Array.isArray(row.requiredRemediation)) errors.push(`${label} requiredRemediation must be an array`);

  const view = topLevelViewFromLabel(label);
  if (view === 'incomplete') {
    if (!row.dataQualityErrors?.length) errors.push(`${label} Incomplete rows must include dataQualityErrors`);
    if (!row.requiredRemediation?.length) errors.push(`${label} Incomplete rows must include requiredRemediation`);
    if (row.lifecycle !== 'incomplete') errors.push(`${label} Incomplete rows must use lifecycle incomplete`);
  } else if (!label.includes('.children[')) {
    if (row.dataQualityErrors?.length) {
      errors.push(`${label} valid lifecycle rows must not carry dataQualityErrors; route to Incomplete instead`);
    }
    if (row.priorityLabel === 'pmo:priority:none') {
      errors.push(`${label} accepts prohibited pmo:priority:none`);
    }
    if (!row.priorityLabel) errors.push(`${label} is missing priorityLabel`);
    if (!row.priorityDisplay) errors.push(`${label} is missing priorityDisplay`);
    if (row.lifecycle === 'pipeline') {
      if (!row.pipelineStageLabel || !stageLabels.has(row.pipelineStageLabel)) {
        errors.push(`${label} Pipeline rows require exactly one supported pipelineStageLabel`);
      }
      if (!row.pipelineStageDisplay) errors.push(`${label} Pipeline rows require pipelineStageDisplay`);
    }
    if (row.lifecycle === 'active' && view !== 'activePrograms') {
      errors.push(`${label} active lifecycle must appear in activePrograms`);
    }
    if (row.lifecycle === 'pipeline' && view !== 'pmoPipeline') {
      errors.push(`${label} pipeline lifecycle must appear in pmoPipeline`);
    }
    if (row.lifecycle === 'closed' && view !== 'completedPrograms') {
      errors.push(`${label} closed lifecycle must appear in completedPrograms`);
    }
  }

  if (Number.isNaN(row.percentComplete)) errors.push(`${label} percentComplete is NaN`);
  if (row.percentComplete !== null && (typeof row.percentComplete !== 'number' || row.percentComplete < 0 || row.percentComplete > 100)) {
    errors.push(`${label} percentComplete must be null or 0-100`);
  }
  if (!Number.isInteger(row.taskCount) || row.taskCount < 0) errors.push(`${label} taskCount must be a non-negative integer`);
  if (!Number.isInteger(row.tasksCompleted) || row.tasksCompleted < 0) errors.push(`${label} tasksCompleted must be a non-negative integer`);
  if (row.tasksCompleted > row.taskCount) errors.push(`${label} # of Tasks Completed is greater than # of Tasks`);
  if (row.taskCount > 0) {
    const expected = Math.round((row.tasksCompleted / row.taskCount) * 100);
    if (row.percentComplete !== expected) {
      errors.push(`${label} percentComplete must equal round(tasksCompleted / taskCount * 100)`);
    }
  } else if (row.percentComplete !== null) {
    errors.push(`${label} percentComplete must be null when taskCount is 0`);
  }

  if (row.issueNumber) {
    if (rowByNumber.has(row.issueNumber)) errors.push(`issue #${row.issueNumber} appears in multiple dashboard views`);
    rowByNumber.set(row.issueNumber, label);
    rowDataByNumber.set(row.issueNumber, row);
  }

  if (row.children != null) {
    if (!Array.isArray(row.children)) {
      errors.push(`${label} children must be an array`);
      return;
    }
    for (const [childIndex, child] of row.children.entries()) {
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
      if (!Number.isInteger(entry.parentIssueNumber) || entry.parentIssueNumber <= 0) {
        errors.push(`${label} parentIssueNumber must be a positive integer`);
      }
      if (!Array.isArray(entry.declaredTaskIssueNumbers)) errors.push(`${label} declaredTaskIssueNumbers must be an array`);
      if (!Array.isArray(entry.missingTaskIssueNumbers)) errors.push(`${label} missingTaskIssueNumbers must be an array`);
      if (!Array.isArray(entry.completedTaskIssueNumbers)) errors.push(`${label} completedTaskIssueNumbers must be an array`);
      if (!Number.isInteger(entry.taskCount) || entry.taskCount < 0) errors.push(`${label} taskCount must be a non-negative integer`);
      if (!Number.isInteger(entry.tasksCompleted) || entry.tasksCompleted < 0) errors.push(`${label} tasksCompleted must be a non-negative integer`);
      if (entry.tasksCompleted > entry.taskCount) errors.push(`${label} tasksCompleted is greater than taskCount`);

      const declaredUnique = new Set(entry.declaredTaskIssueNumbers || []);
      if (declaredUnique.size !== (entry.declaredTaskIssueNumbers || []).length) {
        errors.push(`${label} declaredTaskIssueNumbers must not contain duplicates`);
      }
      if (entry.taskCount !== declaredUnique.size) errors.push(`${label} taskCount must equal declaredTaskIssueNumbers length`);
      if (entry.tasksCompleted !== (entry.completedTaskIssueNumbers || []).length) {
        errors.push(`${label} tasksCompleted must equal completedTaskIssueNumbers length`);
      }

      const row = rowDataByNumber.get(entry.parentIssueNumber);
      if (row) {
        if (row.taskCount !== entry.taskCount) {
          errors.push(`${label} taskCount does not match dashboard row value for #${entry.parentIssueNumber}`);
        }
        if (row.tasksCompleted !== entry.tasksCompleted) {
          errors.push(`${label} tasksCompleted does not match dashboard row value for #${entry.parentIssueNumber}`);
        }
      }
      if (taskAccountingByNumber.has(entry.parentIssueNumber)) {
        errors.push(`${label} duplicates task accounting for issue #${entry.parentIssueNumber}`);
      }
      taskAccountingByNumber.set(entry.parentIssueNumber, entry);
    }
  }

  if (inventory?.included) {
    for (const item of inventory.included) {
      if (!validInventoryLifecycles.has(item.expectedLifecycle)) {
        errors.push(`tracked inventory #${item.issueNumber} has invalid expectedLifecycle: ${JSON.stringify(item.expectedLifecycle)}`);
        continue;
      }
      const viewLabel = rowByNumber.get(item.issueNumber);
      if (!viewLabel) {
        errors.push(`tracked issue #${item.issueNumber} is missing from dashboard output`);
        continue;
      }
      const topLevelView = viewLabel.split('[')[0];
      if (topLevelView === 'incomplete') {
        // Incomplete quarantine satisfies presence; metadata remediation is operator work.
        continue;
      }
      const expectedView = lifecycleToView[item.expectedLifecycle];
      if (topLevelView !== expectedView) {
        errors.push(`tracked issue #${item.issueNumber} expected in ${expectedView}, found in ${viewLabel}`);
      }
      if (item.expectedPriority !== undefined && ['activePrograms', 'pmoPipeline'].includes(topLevelView)) {
        const row = rowDataByNumber.get(item.issueNumber);
        if (row && !isNumericPriorityDisplay(row.priorityDisplay)) {
          errors.push(`tracked inventory #${item.issueNumber} priority must be numeric, got ${JSON.stringify(row.priorityDisplay)}`);
        } else if (row && Number(row.priorityDisplay) !== item.expectedPriority) {
          errors.push(`tracked issue #${item.issueNumber} expected priority ${item.expectedPriority}, found ${row.priorityDisplay}`);
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
  try {
    await readFile(path.join(outDir, file), 'utf8');
  } catch {
    errors.push(`generated ${file} is missing`);
  }
}

if (errors.length) {
  console.error(errors.map((e) => `- ${e}`).join('\n'));
  process.exit(1);
}
console.log(`PMO dashboard validation passed for ${outDir}`);
