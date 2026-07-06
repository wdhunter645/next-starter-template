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

    const active = data.views.activePrograms;
    const pipeline = data.views.pmoPipeline;
    const completed = data.views.completedPrograms;

    assert(active.length === 1, `expected one active program, got ${active.length}`);
    assert(active[0].issueNumber === 9001, 'active program should be #9001');
    assert(active[0].children?.length === 2, 'active program should have two nested children');
    assert(active[0].children[0].issueNumber === 9003, 'first child should be sequence 1 (#9003)');
    assert(active[0].children[1].issueNumber === 9002, 'second child should be sequence 2 (#9002)');

    const pipelineNumbers = new Set(pipeline.map((row) => row.issueNumber));
    assert(!pipelineNumbers.has(9002) && !pipelineNumbers.has(9003), 'nested children must not appear in pipeline');
    assert(pipelineNumbers.has(9004) && pipelineNumbers.has(9005), 'standalone pipeline rows must remain visible');
    assert(!pipelineNumbers.has(9010), 'title-prefix issue without PMO label must be excluded');

    assert(completed[0].issueNumber === 9006, 'completed section should sort newest closed first');
    assert(completed[1].issueNumber === 9007, 'older completed program should sort second');

    const standardStatuses = new Set([
      'Active', 'Implementation Ready', 'Planning', 'Strategy Defined',
      'Strategy Development', 'Idea', 'Completed'
    ]);
    const allRows = [...active, ...pipeline, ...completed, ...(active[0].children || [])];
    for (const row of allRows) {
      assert(standardStatuses.has(row.status), `row #${row.issueNumber} has non-standard status: ${row.status}`);
    }
    assert(pipeline.find((row) => row.issueNumber === 9004)?.status === 'Implementation Ready', 'PMO Intake should normalize to Implementation Ready');
    assert(active[0].children.every((child) => Number.isInteger(child.childSequence) && child.childSequence > 0), 'nested children must carry positive integer childSequence');

    console.log('PMO label-driven fixture test passed');
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
