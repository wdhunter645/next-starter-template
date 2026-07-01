#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const outDir = process.argv[2] || process.env.PMO_DASHBOARD_OUT_DIR || 'site/pmo-dashboard';
const requiredViews = ['activePrograms', 'pmoPipeline', 'completedPrograms'];
const errors = [];

async function readJson(file) {
  try { return JSON.parse(await readFile(file, 'utf8')); }
  catch (error) { errors.push(`dashboard data is missing or JSON does not parse: ${error.message}`); return null; }
}

function validUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && url.hostname === 'github.com'; }
  catch { return false; }
}

const data = await readJson(path.join(outDir, 'dashboard-data.json'));
if (data) {
  if (data.source !== 'github-issues') errors.push('dashboard source must be github-issues');
  for (const view of requiredViews) {
    if (!Array.isArray(data.views?.[view])) errors.push(`required top-level view missing: ${view}`);
    for (const [index, row] of (data.views?.[view] || []).entries()) {
      const label = `${view}[${index}]`;
      if (!row.name) errors.push(`${label} is missing Program / Project Name`);
      if (!row.status) errors.push(`${label} is missing Status`);
      if (Number.isNaN(row.percentComplete)) errors.push(`${label} percentComplete is NaN`);
      if (row.percentComplete !== null && (typeof row.percentComplete !== 'number' || row.percentComplete < 0 || row.percentComplete > 100)) errors.push(`${label} percentComplete must be null or 0-100`);
      if (!Number.isInteger(row.taskCount) || row.taskCount < 0) errors.push(`${label} taskCount must be a non-negative integer`);
      if (!Number.isInteger(row.tasksCompleted) || row.tasksCompleted < 0) errors.push(`${label} tasksCompleted must be a non-negative integer`);
      if (row.tasksCompleted > row.taskCount) errors.push(`${label} # of Tasks Completed is greater than # of Tasks`);
      if (!validUrl(row.issueUrl)) errors.push(`${label} contains an obviously invalid issue link`);
    }
  }
}
for (const file of ['index.html', 'assets/pmo-dashboard.css', 'assets/pmo-dashboard.js']) {
  try { await readFile(path.join(outDir, file), 'utf8'); }
  catch { errors.push(`generated ${file} is missing`); }
}
if (errors.length) { console.error(errors.map((e) => `- ${e}`).join('\n')); process.exit(1); }
console.log(`PMO dashboard validation passed for ${outDir}`);
