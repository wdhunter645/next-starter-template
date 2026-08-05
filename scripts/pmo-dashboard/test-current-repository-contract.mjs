#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { promisify } from 'node:util';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.join(__dirname, 'fixtures/issues-current-repository-contract.json');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'pmo-dashboard-current-repository-'));
  try {
    const env = {
      ...process.env,
      PMO_DASHBOARD_ISSUES_FIXTURE: fixture,
      PMO_DASHBOARD_OUT_DIR: outDir,
      GITHUB_REPOSITORY_OWNER: '',
      GITHUB_REPOSITORY: ''
    };

    await execFileAsync(process.execPath, [path.join(__dirname, 'run-dashboard-build.mjs')], { env });
    await execFileAsync(process.execPath, [path.join(__dirname, 'validate-dashboard.mjs'), outDir], {
      env: { ...env, PMO_DASHBOARD_SKIP_INVENTORY_VALIDATION: '1' }
    });

    const data = JSON.parse(await readFile(path.join(outDir, 'dashboard-data.json'), 'utf8'));
    assert(data.repository === 'wdhunter465/next-starter-template', `unexpected repository ${data.repository}`);

    const row = data.views.activePrograms.find((entry) => entry.issueNumber === 9100);
    assert(row, 'expected active project #9100');
    assert(row.ownerAgent === 'cursor', `owner label must override stale body metadata, got ${row.ownerAgent}`);
    assert(row.taskCount === 1 && row.tasksCompleted === 1 && row.percentComplete === 100, 'closed direct child accounting');

    console.log('PMO current repository and owner contract test passed');
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
