#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CURRENT_REPOSITORY = 'wdhunter465/next-starter-template';
const [currentOwner, currentRepo] = CURRENT_REPOSITORY.split('/');
const outDir = process.env.PMO_DASHBOARD_OUT_DIR || 'site/pmo-dashboard';

function runCoreBuilder() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, 'build-dashboard.mjs')], {
      env: {
        ...process.env,
        GITHUB_REPOSITORY_OWNER: process.env.GITHUB_REPOSITORY_OWNER || currentOwner,
        GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY || CURRENT_REPOSITORY
      },
      stdio: 'inherit'
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`PMO dashboard core builder failed (${signal || `exit ${code}`})`));
    });
  });
}

function labelName(label) {
  return typeof label === 'string' ? label : label?.name;
}

function reconcileOwner(row) {
  const ownerLabel = (row.labels || [])
    .map(labelName)
    .find((label) => typeof label === 'string' && label.startsWith('owner:'));
  if (ownerLabel) row.ownerAgent = ownerLabel.slice('owner:'.length);
  for (const child of row.children || []) reconcileOwner(child);
}

async function main() {
  await runCoreBuilder();

  const dataPath = path.join(outDir, 'dashboard-data.json');
  const data = JSON.parse(await readFile(dataPath, 'utf8'));
  data.repository = process.env.GITHUB_REPOSITORY || CURRENT_REPOSITORY;

  for (const rows of Object.values(data.views || {})) {
    for (const row of rows || []) reconcileOwner(row);
  }

  await writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Reconciled PMO dashboard repository and owner authority for ${data.repository}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
