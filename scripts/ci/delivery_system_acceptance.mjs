#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCENARIOS } from '../../tests/fixtures/delivery-system/scenarios.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

export function runDeliverySystemAcceptance({ scenarios = SCENARIOS } = {}) {
  const results = [];

  for (const scenario of scenarios) {
    const started = Date.now();
    try {
      scenario.run();
      results.push({
        id: scenario.id,
        name: scenario.name,
        status: 'PASS',
        durationMs: Date.now() - started,
      });
    } catch (error) {
      results.push({
        id: scenario.id,
        name: scenario.name,
        status: 'FAIL',
        durationMs: Date.now() - started,
        error: error?.message || String(error),
      });
    }
  }

  const failed = results.filter((result) => result.status === 'FAIL');
  return {
    gate: 'delivery-system-acceptance',
    schemaVersion: 1,
    ok: failed.length === 0,
    passed: results.length - failed.length,
    failed: failed.length,
    total: results.length,
    results,
  };
}

export function renderAcceptanceReport(report) {
  const lines = [
    '# Delivery System v1 acceptance',
    '',
    `Result: ${report.ok ? 'PASS' : 'FAIL'}`,
    `Passed: ${report.passed}/${report.total}`,
    '',
    '| ID | Scenario | Status | Duration |',
    '| --- | --- | --- | --- |',
  ];

  for (const result of report.results) {
    lines.push(`| ${result.id} | ${result.name} | ${result.status} | ${result.durationMs}ms |`);
  }

  const failures = report.results.filter((result) => result.status === 'FAIL');
  if (failures.length) {
    lines.push('', '## Failures', '');
    for (const failure of failures) {
      lines.push(`- Scenario ${failure.id}: ${failure.error}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

function writeJsonIfRequested(report, env = process.env) {
  if (!env.DELIVERY_SYSTEM_ACCEPTANCE_JSON) return;
  const outPath = path.isAbsolute(env.DELIVERY_SYSTEM_ACCEPTANCE_JSON)
    ? env.DELIVERY_SYSTEM_ACCEPTANCE_JSON
    : path.join(ROOT, env.DELIVERY_SYSTEM_ACCEPTANCE_JSON);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
}

export function main(argv = process.argv.slice(2), env = process.env) {
  const report = runDeliverySystemAcceptance();
  const rendered = renderAcceptanceReport(report);
  writeJsonIfRequested(report, env);

  if (argv.includes('--json')) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    process.stdout.write(rendered);
  }

  return report.ok ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = main();
}
