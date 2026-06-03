#!/usr/bin/env node
/**
 * T50 launch readiness orchestrator.
 *
 * Runs invariant checks, targeted unit tests, static assess harness, optional
 * conditional routes, and Playwright route smoke when `out/` exists.
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { routeToFilePath } from '../lib/html-checks.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const MANIFEST_PATH = join(__dirname, 'manifest.json');
const REPORT_DIR = join(ROOT, 'reports/launch-readiness');
const REPORT_MD = join(REPORT_DIR, 'summary.md');
const OUT_DIR = join(ROOT, 'out');

const args = new Set(process.argv.slice(2));
const skipE2e = args.has('--skip-e2e');
const skipAssess = args.has('--skip-assess');

function runStep(name, command) {
  console.log(`\n▶ ${name}`);
  console.log(`  $ ${command}`);
  try {
    execSync(command, { cwd: ROOT, stdio: 'inherit', env: process.env });
    return { name, passed: true };
  } catch (error) {
    return { name, passed: false, error: error?.message || String(error) };
  }
}

function checkConditionalRoutes(manifest) {
  const routes = manifest.conditionalRoutes || [];
  const result = { name: 'Conditional routes (T48+)', passed: true, details: { checked: [], skipped: [] } };

  for (const route of routes) {
    const paths = routeToFilePath(route, 'out');
    const found = paths.some((filePath) => existsSync(join(ROOT, filePath)));
    if (found) {
      result.details.checked.push(route);
      console.log(`   ✅ ${route} present`);
    } else {
      result.details.skipped.push(route);
      console.log(`   ⏭ ${route} not present yet (ok before T48 merge)`);
    }
  }

  return result;
}

function writeSummary(steps) {
  mkdirSync(REPORT_DIR, { recursive: true });
  const passed = steps.filter((step) => step.passed).length;
  const failed = steps.length - passed;
  const lines = [
    '# Launch readiness summary',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Passed: ${passed}/${steps.length}`,
    '',
    '| Step | Result |',
    '|------|--------|',
    ...steps.map((step) => `| ${step.name} | ${step.passed ? 'PASS' : 'FAIL'} |`),
    '',
  ];

  if (failed > 0) {
    lines.push('## Failures', '');
    for (const step of steps.filter((s) => !s.passed)) {
      lines.push(`- **${step.name}**: ${step.error || 'see command output'}`);
    }
    lines.push('');
  }

  writeFileSync(REPORT_MD, lines.join('\n'), 'utf8');
  console.log(`\n📄 ${REPORT_MD}`);
}

function main() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const steps = [];

  steps.push(runStep('Design invariants', 'node scripts/ci/verify_lgfc_invariants.mjs'));
  steps.push(
    runStep(
      'Launch readiness unit bundle',
      'npx vitest run tests/launch-readiness-manifest.test.ts tests/d1-b2-fail-closed.test.ts tests/homepage-structure.test.tsx tests/join-login-auth.test.tsx tests/mobile-navigation.test.tsx',
    ),
  );

  if (!skipAssess) {
    steps.push(runStep('Static assess harness', 'npm run assess'));
  }

  if (existsSync(OUT_DIR)) {
    steps.push(checkConditionalRoutes(manifest));
  } else {
    steps.push({
      name: 'Conditional routes (T48+)',
      passed: true,
      details: { skipped: 'out/ missing; run assess first' },
    });
  }

  if (!skipE2e) {
    if (!existsSync(OUT_DIR)) {
      steps.push({
        name: 'Playwright route smoke',
        passed: false,
        error: 'Missing out/ directory. Run assess or npm run build first.',
      });
    } else {
      steps.push(
        runStep(
          'Playwright route smoke',
          'LAUNCH_READINESS_E2E=1 npx playwright test tests/e2e/launch-readiness-public-routes.spec.ts tests/e2e/launch-readiness-fanclub-routes.spec.ts tests/e2e/homepage-sections.spec.ts tests/e2e/mobile-navigation.spec.ts',
        ),
      );
    }
  }

  writeSummary(steps);

  const failed = steps.some((step) => !step.passed);
  if (failed) {
    console.error('\n❌ Launch readiness suite failed.');
    process.exit(1);
  }

  console.log('\n✅ Launch readiness suite passed.');
}

main();
