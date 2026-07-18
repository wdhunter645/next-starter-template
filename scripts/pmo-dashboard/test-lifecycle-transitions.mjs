#!/usr/bin/env node
/**
 * Deterministic lifecycle/priority transition coverage for #2612.
 * Validates that live Issue metadata drives placement without editing a static live-state ledger.
 */
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function issue({
  number,
  title = `PROGRAM: Transition fixture #${number}`,
  state = 'open',
  labels = [],
  body = 'Owner / Agent: Cursor\nProgram Description: Transition fixture.\n',
  updated_at = '2026-07-18T12:00:00Z',
  closed_at = null
}) {
  return {
    number,
    title,
    state,
    html_url: `https://github.com/wdhunter645/next-starter-template/issues/${number}`,
    body,
    labels: labels.map((name) => ({ name })),
    updated_at,
    closed_at
  };
}

function findView(data, issueNumber) {
  for (const view of ['activePrograms', 'pmoPipeline', 'completedPrograms', 'incomplete']) {
    const row = (data.views[view] || []).find((entry) => entry.issueNumber === issueNumber);
    if (row) return { view, row };
  }
  for (const parent of data.views.activePrograms || []) {
    const child = (parent.children || []).find((entry) => entry.issueNumber === issueNumber);
    if (child) return { view: 'activePrograms.children', row: child, parent };
  }
  return null;
}

async function buildAndValidate(issues, { skipInventory = false } = {}) {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'pmo-dashboard-transition-'));
  const fixturePath = path.join(outDir, 'issues.json');
  await writeFile(fixturePath, JSON.stringify(issues, null, 2));
  try {
    await execFileAsync('node', [path.join(__dirname, 'build-dashboard.mjs')], {
      env: {
        ...process.env,
        PMO_DASHBOARD_ISSUES_FIXTURE: fixturePath,
        PMO_DASHBOARD_OUT_DIR: outDir
      }
    });
    const validateEnv = {
      ...process.env,
      ...(skipInventory ? { PMO_DASHBOARD_SKIP_INVENTORY_VALIDATION: '1' } : {})
    };
    await execFileAsync('node', [path.join(__dirname, 'validate-dashboard.mjs'), outDir], {
      env: validateEnv
    });
    const data = JSON.parse(await readFile(path.join(outDir, 'dashboard-data.json'), 'utf8'));
    return { outDir, data };
  } catch (error) {
    await rm(outDir, { recursive: true, force: true });
    throw error;
  } finally {
    // caller may keep outDir briefly; cleaned by each case below
  }
}

async function withBuild(issues, fn, options) {
  const result = await buildAndValidate(issues, options);
  try {
    await fn(result.data);
  } finally {
    await rm(result.outDir, { recursive: true, force: true });
  }
}

async function main() {
  // T1 Active numeric priority
  await withBuild(
    [
      issue({
        number: 9101,
        labels: ['pmo', 'pmo:active', 'pmo:priority:1']
      })
    ],
    (data) => {
      const hit = findView(data, 9101);
      assert(hit?.view === 'activePrograms', 'T1: Active placement');
      assert(hit.row.priorityDisplay === '1', 'T1: numeric priority display');
    }
  );

  // T2 Pipeline with stage
  await withBuild(
    [
      issue({
        number: 9102,
        title: 'PROJECT: Pipeline stage fixture',
        labels: ['pmo', 'pmo:pipeline', 'pmo:priority:2', 'pmo:stage:prep']
      })
    ],
    (data) => {
      const hit = findView(data, 9102);
      assert(hit?.view === 'pmoPipeline', 'T2: Pipeline placement');
      assert(hit.row.pipelineStageLabel === 'pmo:stage:prep', 'T2: stage label');
    }
  );

  // T3 Idea priority pipeline
  await withBuild(
    [
      issue({
        number: 9103,
        title: 'STRATEGY: Idea fixture',
        labels: ['pmo', 'pmo:pipeline', 'pmo:priority:idea', 'pmo:stage:intake']
      })
    ],
    (data) => {
      const hit = findView(data, 9103);
      assert(hit?.view === 'pmoPipeline', 'T3: Pipeline placement');
      assert(hit.row.priorityDisplay === 'Idea', 'T3: Idea display');
    }
  );

  // T4 Completed closed reconciliation
  await withBuild(
    [
      issue({
        number: 9104,
        state: 'closed',
        closed_at: '2026-07-18T10:00:00Z',
        labels: ['pmo', 'pmo:closed', 'pmo:priority:3']
      })
    ],
    (data) => {
      const hit = findView(data, 9104);
      assert(hit?.view === 'completedPrograms', 'T4: Completed placement');
      assert(hit.row.status === 'Completed', 'T4: Completed status');
    }
  );

  // T5 Missing lifecycle → Incomplete
  await withBuild(
    [issue({ number: 9105, labels: ['pmo', 'pmo:priority:1'] })],
    (data) => {
      const hit = findView(data, 9105);
      assert(hit?.view === 'incomplete', 'T5: Incomplete for missing lifecycle');
      assert(hit.row.dataQualityErrors.some((e) => /lifecycle/i.test(e)), 'T5: lifecycle error');
    }
  );

  // T6 Conflicting lifecycle → Incomplete
  await withBuild(
    [issue({ number: 9106, labels: ['pmo', 'pmo:active', 'pmo:pipeline', 'pmo:priority:1'] })],
    (data) => {
      const hit = findView(data, 9106);
      assert(hit?.view === 'incomplete', 'T6: Incomplete for conflicting lifecycle');
      assert(hit.row.dataQualityErrors.some((e) => /conflicting lifecycle/i.test(e)), 'T6: conflict error');
    }
  );

  // T7 prohibited priority none
  await withBuild(
    [issue({ number: 9107, labels: ['pmo', 'pmo:active', 'pmo:priority:none'] })],
    (data) => {
      const hit = findView(data, 9107);
      assert(hit?.view === 'incomplete', 'T7: Incomplete for priority none');
      assert(hit.row.dataQualityErrors.some((e) => /pmo:priority:none/.test(e)), 'T7: none error');
    }
  );

  // T8 Pipeline missing stage
  await withBuild(
    [issue({ number: 9108, title: 'PROJECT: Missing stage', labels: ['pmo', 'pmo:pipeline', 'pmo:priority:2'] })],
    (data) => {
      const hit = findView(data, 9108);
      assert(hit?.view === 'incomplete', 'T8: Incomplete for missing stage');
      assert(hit.row.dataQualityErrors.some((e) => /stage/i.test(e)), 'T8: stage error');
    }
  );

  // T9 Open issue with pmo:closed
  await withBuild(
    [issue({ number: 9109, state: 'open', labels: ['pmo', 'pmo:closed', 'pmo:priority:1'] })],
    (data) => {
      const hit = findView(data, 9109);
      assert(hit?.view === 'incomplete', 'T9: Incomplete for open+closed mismatch');
    }
  );

  // T10 Closed issue without pmo:closed
  await withBuild(
    [
      issue({
        number: 9110,
        state: 'closed',
        closed_at: '2026-07-18T09:00:00Z',
        labels: ['pmo', 'pmo:active', 'pmo:priority:1']
      })
    ],
    (data) => {
      const hit = findView(data, 9110);
      assert(hit?.view === 'incomplete', 'T10: Incomplete for closed without pmo:closed');
      assert(
        hit.row.dataQualityErrors.some((e) => /not reconciled to pmo:closed/.test(e)),
        'T10: reconciliation error'
      );
    }
  );

  // T11 Explicit exclusion honored even with valid pmo labels (uses production exclusion #2101)
  await withBuild(
    [
      issue({
        number: 2101,
        title: 'DESIGN: Excluded fixture',
        labels: ['pmo', 'pmo:active', 'pmo:priority:1']
      }),
      issue({
        number: 9111,
        labels: ['pmo', 'pmo:active', 'pmo:priority:2']
      })
    ],
    (data) => {
      assert(!findView(data, 2101), 'T11: excluded issue must be absent');
      assert(findView(data, 9111)?.view === 'activePrograms', 'T11: non-excluded issue still emits');
    }
  );

  // T12 Numeric reprioritization without inventory edit (inventory validation enabled)
  await withBuild(
    [issue({ number: 9112, labels: ['pmo', 'pmo:active', 'pmo:priority:1'] })],
    (data) => {
      assert(findView(data, 9112).row.priorityDisplay === '1', 'T12a: priority 1');
    }
  );
  await withBuild(
    [issue({ number: 9112, labels: ['pmo', 'pmo:active', 'pmo:priority:5'] })],
    (data) => {
      assert(findView(data, 9112).row.priorityDisplay === '5', 'T12b: priority 5 without inventory sync');
    }
  );

  // T13 Pipeline → Active without inventory edit
  await withBuild(
    [
      issue({
        number: 9113,
        title: 'PROJECT: Transition target',
        labels: ['pmo', 'pmo:pipeline', 'pmo:priority:2', 'pmo:stage:prep']
      })
    ],
    (data) => {
      assert(findView(data, 9113)?.view === 'pmoPipeline', 'T13a: starts in Pipeline');
    }
  );
  await withBuild(
    [
      issue({
        number: 9113,
        title: 'PROJECT: Transition target',
        labels: ['pmo', 'pmo:active', 'pmo:priority:2']
      })
    ],
    (data) => {
      assert(findView(data, 9113)?.view === 'activePrograms', 'T13b: Active after label change without inventory edit');
    }
  );

  // T14 Task accounting + T15 missing parent → Incomplete
  await withBuild(
    [
      issue({
        number: 9120,
        title: 'PROGRAM: Parent with tasks',
        labels: ['pmo', 'pmo:active', 'pmo:priority:1'],
        body: 'Owner / Agent: Cursor\nProgram Description: Parent.\n'
      }),
      issue({
        number: 9121,
        title: 'TASK: Open child task',
        labels: ['pmo', 'pmo:task', 'pmo:active', 'pmo:priority:1'],
        body: 'Parent: #9120\n'
      }),
      issue({
        number: 9122,
        title: 'TASK: Closed child task',
        state: 'closed',
        closed_at: '2026-07-18T08:00:00Z',
        labels: ['pmo', 'pmo:task', 'pmo:closed', 'pmo:priority:1'],
        body: 'Parent: #9120\n'
      }),
      issue({
        number: 9123,
        title: 'TASK: Orphan task',
        labels: ['pmo', 'pmo:task', 'pmo:active', 'pmo:priority:1'],
        body: 'No parent reference here.\n'
      })
    ],
    (data) => {
      const parent = findView(data, 9120);
      assert(parent?.view === 'activePrograms', 'T14: parent active');
      assert(parent.row.taskCount === 2, 'T14: taskCount includes linked tasks');
      assert(parent.row.tasksCompleted === 1, 'T14: tasksCompleted counts closed tasks');
      assert(parent.row.percentComplete === 50, 'T14: percentComplete math');
      const accounting = new Map(data.taskAccounting.map((entry) => [entry.parentIssueNumber, entry]));
      assert(accounting.get(9120)?.declaredTaskIssueNumbers.sort().join(',') === '9121,9122', 'T14: accounting list');
      const orphan = findView(data, 9123);
      assert(orphan?.view === 'incomplete', 'T15: orphan task Incomplete');
      assert(orphan.row.dataQualityErrors.some((e) => /parent/i.test(e)), 'T15: parent error');
    }
  );

  // Invalid → valid correction (issue required case 8)
  await withBuild(
    [issue({ number: 9130, labels: ['pmo', 'pmo:priority:1'] })],
    (data) => {
      assert(findView(data, 9130)?.view === 'incomplete', 'Correction a: starts Incomplete');
    }
  );
  await withBuild(
    [issue({ number: 9130, labels: ['pmo', 'pmo:active', 'pmo:priority:1'] })],
    (data) => {
      assert(findView(data, 9130)?.view === 'activePrograms', 'Correction b: valid Active after fix');
    }
  );

  // Fail closed if frozen expected fields reappear in inventory
  {
    const outDir = await mkdtemp(path.join(os.tmpdir(), 'pmo-dashboard-forbidden-inventory-'));
    const fixturePath = path.join(outDir, 'issues.json');
    const inventoryPath = path.join(outDir, 'pmo-tracked-inventory.json');
    await writeFile(
      fixturePath,
      JSON.stringify([issue({ number: 9140, labels: ['pmo', 'pmo:active', 'pmo:priority:1'] })], null, 2)
    );
    await writeFile(
      inventoryPath,
      JSON.stringify(
        {
          version: 99,
          included: [{ issueNumber: 9140, expectedLifecycle: 'active', expectedPriority: 1 }],
          excluded: []
        },
        null,
        2
      )
    );
    try {
      await execFileAsync('node', [path.join(__dirname, 'build-dashboard.mjs')], {
        env: {
          ...process.env,
          PMO_DASHBOARD_ISSUES_FIXTURE: fixturePath,
          PMO_DASHBOARD_OUT_DIR: outDir
        }
      });
      let failed = false;
      try {
        await execFileAsync('node', [path.join(__dirname, 'validate-dashboard.mjs'), outDir], {
          env: {
            ...process.env,
            PMO_DASHBOARD_INVENTORY_PATH: inventoryPath
          }
        });
      } catch (error) {
        failed = true;
        const stderr = String(error.stderr || error.message || '');
        assert(/must not declare expectedLifecycle/.test(stderr), 'forbidden expectedLifecycle must fail validation');
        assert(/must not declare expectedPriority/.test(stderr), 'forbidden expectedPriority must fail validation');
      }
      assert(failed, 'validator must fail closed when frozen live-state fields reappear');

      const productionInventory = JSON.parse(
        await readFile(path.join(__dirname, 'pmo-tracked-inventory.json'), 'utf8')
      );
      for (const item of productionInventory.included || []) {
        assert(!('expectedLifecycle' in item), 'production inventory must not carry expectedLifecycle');
        assert(!('expectedPriority' in item), 'production inventory must not carry expectedPriority');
      }
      assert(Array.isArray(productionInventory.excluded) && productionInventory.excluded.length > 0, 'exclusions retained');
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  }

  console.log('PMO lifecycle transition tests passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
