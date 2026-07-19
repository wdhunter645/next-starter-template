#!/usr/bin/env node
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.join(__dirname, 'fixtures/issues-label-driven.json');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function byNumber(rows) {
  return new Map(rows.map((row) => [row.issueNumber, row]));
}

async function main() {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'pmo-dashboard-fixture-'));
  try {
    await execFileAsync('node', [path.join(__dirname, 'build-dashboard.mjs')], {
      env: {
        ...process.env,
        PMO_DASHBOARD_ISSUES_FIXTURE: fixture,
        PMO_DASHBOARD_OUT_DIR: outDir
      }
    });
    await execFileAsync('node', [path.join(__dirname, 'validate-dashboard.mjs'), outDir], {
      env: {
        ...process.env,
        PMO_DASHBOARD_SKIP_INVENTORY_VALIDATION: '1'
      }
    });

    const data = JSON.parse(await readFile(path.join(outDir, 'dashboard-data.json'), 'utf8'));
    assert(data.trackingModel === 'pmo-label', 'trackingModel must be pmo-label');
    assert(data.contractVersion === 'pmo-july-2026', 'contractVersion must be pmo-july-2026');

    const active = data.views.activePrograms;
    const pipeline = data.views.pmoPipeline;
    const completed = data.views.completedPrograms;
    const incomplete = data.views.incomplete;

    assert(Array.isArray(incomplete), 'incomplete view must exist');
    assert(active.length === 2, `expected two active portfolio rows, got ${active.length}`);
    const activeMap = byNumber(active);
    assert(activeMap.has(9001), 'active program should be #9001');
    assert(activeMap.has(9028), 'active label must beat stale pipeline body metadata for #9028');
    assert(activeMap.get(9028).lifecycle === 'active', '#9028 lifecycle must be active');
    assert(activeMap.get(9028).priorityDisplay === '4', '#9028 priority must come from priority label');

    const program = activeMap.get(9001);
    assert(program.children?.length === 3, 'active program should have three nested children including completed child');
    assert(program.children[0].issueNumber === 9003, 'first child should be sequence 1 (#9003)');
    assert(program.children[1].issueNumber === 9002, 'second child should be sequence 2 (#9002)');
    assert(program.children[2].issueNumber === 9008, 'third child should be sequence 3 completed child (#9008)');
    assert(program.taskCount === 3, 'parent taskCount must include linked pmo:task issues');
    assert(program.tasksCompleted === 1, 'parent tasksCompleted must count pmo:closed tasks');
    assert(program.percentComplete === 33, 'percentComplete must round linked task completion');

    const pipelineMap = byNumber(pipeline);
    assert(pipelineMap.has(9004), 'standalone pipeline project must remain visible');
    assert(pipelineMap.has(9005), 'idea-priority strategy must remain in pipeline');
    assert(pipelineMap.get(9005).priorityDisplay === 'Idea', 'pmo:priority:idea must display as Idea');
    assert(pipelineMap.get(9005).priorityLabel === 'pmo:priority:idea', 'idea priority label must be preserved');
    assert(pipelineMap.get(9004).pipelineStageDisplay === 'Ready for launch', 'pipeline stage display must map from stage label');
    assert(!pipelineMap.has(9002) && !pipelineMap.has(9003), 'nested children must not appear in pipeline');
    assert(!pipelineMap.has(9010), 'title-prefix issue without PMO label must be excluded');
    assert(!pipelineMap.has(9020) && !pipelineMap.has(9021) && !pipelineMap.has(9022), 'valid tasks must not appear as standalone rows');

    const completedMap = byNumber(completed);
    assert(completed[0].issueNumber === 9006, 'completed section should sort newest closed first');
    assert(completedMap.has(9011), 'closed reconciled project must appear in completed');
    assert(completedMap.get(9011).status === 'Completed', 'closed reconciled project must display Completed');
    assert(completedMap.has(9007), 'older completed program should remain in completed');
    assert(!completedMap.has(9008), 'completed child under active parent must not duplicate in Completed section');

    const incompleteMap = byNumber(incomplete);
    for (const issueNumber of [9023, 9024, 9025, 9026, 9027, 9029, 9030]) {
      assert(incompleteMap.has(issueNumber), `issue #${issueNumber} must quarantine in Incomplete`);
      const row = incompleteMap.get(issueNumber);
      assert(row.lifecycle === 'incomplete', `#${issueNumber} lifecycle must be incomplete`);
      assert(row.dataQualityErrors.length > 0, `#${issueNumber} must expose dataQualityErrors`);
      assert(row.requiredRemediation.length > 0, `#${issueNumber} must expose requiredRemediation`);
      assert(Array.isArray(row.labels), `#${issueNumber} must expose labels`);
    }
    assert(incompleteMap.get(9027).dataQualityErrors.some((error) => /pmo:priority:none/.test(error)), 'none priority must be reported');
    assert(incompleteMap.get(9029).dataQualityErrors.some((error) => /not reconciled to pmo:closed/.test(error)), 'closed/lifecycle conflict must be reported');

    const accounting = new Map(data.taskAccounting.map((entry) => [entry.parentIssueNumber, entry]));
    const parentAccounting = accounting.get(9001);
    assert(parentAccounting, 'task accounting must include active parent #9001');
    assert(parentAccounting.declaredTaskIssueNumbers.sort().join(',') === '9020,9021,9022', 'linked tasks must remain in accounting');
    assert(parentAccounting.completedTaskIssueNumbers.includes(9022), 'completed task must remain in accounting');

    const allStandalone = [...active, ...pipeline, ...completed, ...incomplete];
    for (const row of allStandalone) {
      assert(Number.isInteger(row.issueNumber) && row.issueNumber > 0, `row missing issue number: ${row.name}`);
      assert(typeof row.issueUrl === 'string' && row.issueUrl.includes('github.com'), `row missing issue URL: #${row.issueNumber}`);
      assert(Array.isArray(row.dataQualityErrors), `row missing dataQualityErrors: #${row.issueNumber}`);
    }

    console.log('PMO label-driven fixture test passed');

    // Keep single-authority transition coverage on the same CI-executed deterministic path.
    const transition = await execFileAsync('node', [path.join(__dirname, 'test-lifecycle-transitions.mjs')], {
      env: { ...process.env }
    });
    if (transition.stdout) process.stdout.write(transition.stdout);
    if (transition.stderr) process.stderr.write(transition.stderr);
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
