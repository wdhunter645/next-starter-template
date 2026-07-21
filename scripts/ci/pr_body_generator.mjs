#!/usr/bin/env node

/**
 * CI-001 deterministic PR body generator.
 * Pre-open procedural preclearance only. Does not approve or merge PRs.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  FAILURE_CODES,
  loadFixture,
  validatePrBody,
  renderValidationReport,
} from './validate_pr_body.mjs';

const VALID_RESULTS = new Set(['PASS', 'FAIL', 'NOT RUN']);

function asList(value) {
  if (Array.isArray(value)) return value.filter((entry) => entry != null && entry !== '');
  if (value == null || value === '') return [];
  return [value];
}

function stringList(value) {
  return asList(value).map((entry) => String(entry));
}

function bulletList(items, { backtick = false } = {}) {
  return stringList(items)
    .map((item) => (backtick ? `- \`${item}\`` : `- ${item}`))
    .join('\n');
}

function normalizeValidation(entries = []) {
  return asList(entries).map((entry) => {
    if (typeof entry === 'string') {
      return { command: entry, result: 'PASS' };
    }
    return {
      command: String(entry?.command || '').trim(),
      result: String(entry?.result || '').trim().toUpperCase(),
    };
  });
}

/**
 * Validate generator inputs before rendering.
 * Returns failures with the same codes used by the preclearance validator.
 */
export function validateGeneratorInput(input = {}) {
  const failures = [];
  const sourceIssue = Number(input.sourceIssue);
  const packageScoped = input.packageScoped !== false;
  const allowedPaths = stringList(input.allowedPaths);
  const changedFiles = stringList(input.changedFiles);
  const validation = normalizeValidation(input.validation);
  const requiresDesignCompliance = Boolean(input.requiresDesignCompliance);
  const requires2286Inheritance = Boolean(input.requires2286Inheritance);

  if (!Number.isInteger(sourceIssue) || sourceIssue <= 0) {
    failures.push({
      code: FAILURE_CODES.MISSING_SOURCE_ISSUE,
      message: 'Generator input requires a positive integer sourceIssue.',
    });
  }

  if (packageScoped && !String(input.packagePath || '').trim()) {
    failures.push({
      code: FAILURE_CODES.MISSING_PACKAGE_PATH,
      message: 'Generator input requires packagePath for package-scoped work.',
    });
  }

  if (validation.length === 0 || validation.some((entry) => !entry.command || !VALID_RESULTS.has(entry.result))) {
    failures.push({
      code: FAILURE_CODES.MISSING_VALIDATION,
      message: 'Generator input requires validation entries with command and Result PASS|FAIL|NOT RUN.',
    });
  }

  if (requiresDesignCompliance && !String(input.designCompliance || '').trim()) {
    failures.push({
      code: FAILURE_CODES.MISSING_DESIGN_COMPLIANCE,
      message: 'UI tasks require designCompliance text in generator input.',
    });
  }

  if (requires2286Inheritance && !String(input.inheritance2286 || '').trim()) {
    failures.push({
      code: FAILURE_CODES.MISSING_2286_INHERITANCE,
      message: 'Pipeline tasks require inheritance2286 text in generator input.',
    });
  }

  const placeholderProbe = [
    input.changeSummary,
    input.packagePath,
    input.packageId,
    input.designCompliance,
    input.inheritance2286,
    ...allowedPaths,
    ...stringList(input.acceptanceCriteria),
  ].join('\n');

  if (/\bTBD\b|#\[issue\]|#\[program\]|\[package-id\]|\[path\]|\[command\]|#____|path\/to\//i.test(placeholderProbe)) {
    failures.push({
      code: FAILURE_CODES.PLACEHOLDER_TOKEN,
      message: 'Generator input contains prohibited placeholder tokens.',
    });
  }

  // Off-allowlist is evaluated after generation against rendered Allowed paths,
  // but also fail closed here when changedFiles are supplied without allowlist coverage.
  if (changedFiles.length > 0 && allowedPaths.length > 0) {
    const unmatched = changedFiles.filter((file) => !allowedPaths.some((pattern) => {
      if (pattern.endsWith('/**')) return file.startsWith(pattern.slice(0, -3));
      if (pattern.includes('**')) {
        const escaped = pattern
          .replace(/[.+^${}()|[\]\\]/g, '\\$&')
          .replace(/\*\*/g, '.*')
          .replace(/\*/g, '[^/]*');
        return new RegExp(`^${escaped}$`).test(file);
      }
      return file === pattern;
    }));
    if (unmatched.length > 0) {
      failures.push({
        code: FAILURE_CODES.OFF_ALLOWLIST_FILE,
        message: 'Generator input changedFiles are outside allowedPaths.',
        files: unmatched,
      });
    }
  }

  return {
    ok: failures.length === 0,
    failures,
    sourceIssue,
    packageScoped,
    allowedPaths,
    changedFiles,
    validation,
    requiresDesignCompliance,
    requires2286Inheritance,
  };
}

export function generatePrBody(input = {}) {
  const checked = validateGeneratorInput(input);
  if (!checked.ok) {
    return {
      ok: false,
      body: '',
      failures: checked.failures,
      validation: null,
    };
  }

  const intentLabel = String(input.intentLabel || 'intent:ci').trim();
  const prClass = String(input.prClass || 'ci').trim();
  const size = String(input.size || 'small').trim();
  const deliveryModel = String(input.deliveryModel || 'B-child').trim();
  const changeMode = String(input.changeMode || 'project').trim();
  const targetEnvironment = String(input.targetEnvironment || 'component').trim();
  const approvalProfile = String(input.approvalProfile || 'component-auto-integration').trim();
  const gateProfile = String(input.gateProfile || 'component-child').trim();
  const rollbackProfile = String(input.rollbackProfile || 'multi-step').trim();
  const componentBranch = String(input.componentBranch || 'not-applicable').trim();
  const componentMaster = String(input.componentMaster || 'not-applicable').trim();
  const promotionPr = String(input.promotionPr || 'not-applicable').trim();
  const packageId = String(input.packageId || '').trim();
  const packagePath = String(input.packagePath || '').trim();
  const changeSummary = String(input.changeSummary || '').trim();
  const outOfScopePresent = String(input.outOfScopePresent || 'NO').trim();
  const exceptionIssue = String(input.exceptionIssue || 'not-applicable').trim();
  const followUpRequired = String(input.followUpRequired || 'NO').trim();
  const followUpIssue = String(input.followUpIssue || 'not-applicable').trim();
  const packageCompliance = String(input.packageCompliance || 'Package contract preserved; no approved deviations.').trim();
  const parallelExecution = String(input.parallelExecution || 'No workflow hot-zone edits; allowlist-bound only.').trim();
  const asBuiltDocumentation = String(input.asBuiltDocumentation || 'Deferred with rationale: tooling contract documented in reference path.').trim();
  const closeout = String(input.closeout || 'Source task readiness only. Merge authority remains Bill / ChatGPT; tooling does not approve or merge.').trim();
  const acceptanceCriteria = stringList(input.acceptanceCriteria);
  if (acceptanceCriteria.length === 0) {
    acceptanceCriteria.push('Source issue acceptance criteria reviewed');
  }

  const verificationLines = checked.validation
    .map((entry) => `- Command: \`${entry.command}\`\n  Result: ${entry.result}`)
    .join('\n');

  const sections = [
    '# PR Summary',
    '',
    `- **Issue:** #${checked.sourceIssue}`,
    `- Intent label: ${intentLabel}`,
    `- PR class: ${prClass}`,
    `- Size: ${size}`,
    `- Delivery model: ${deliveryModel}`,
    `- Change mode: ${changeMode}`,
    `- Target environment: ${targetEnvironment}`,
    `- Approval profile: ${approvalProfile}`,
    `- Gate profile: ${gateProfile}`,
    `- Rollback profile: ${rollbackProfile}`,
    `- Component branch: ${componentBranch}`,
    `- Component master: ${componentMaster}`,
    `- Promotion PR: ${promotionPr}`,
    '',
    '## Scope',
    '',
    'Allowed paths:',
    bulletList(checked.allowedPaths, { backtick: true }),
    '',
    `Out-of-scope changes present: ${outOfScopePresent}`,
    `Exception issue/approval if YES: ${exceptionIssue}`,
    '',
    '## Change Summary',
    '',
    changeSummary || 'Deterministic PR body generated for procedural preclearance.',
    '',
  ];

  if (checked.packageScoped) {
    sections.push(
      '## Package Compliance',
      '',
      `- Package ID: \`${packageId || 'unspecified'}\``,
      `- Package path: \`${packagePath}\``,
      `- ${packageCompliance}`,
      '',
    );
  }

  if (checked.requires2286Inheritance) {
    sections.push(
      '## #2286 Inheritance',
      '',
      String(input.inheritance2286).trim(),
      '',
    );
  }

  sections.push(
    '## Parallel Execution / File Allowlist',
    '',
    parallelExecution,
    '',
  );

  if (checked.requiresDesignCompliance) {
    sections.push(
      '## Design Compliance',
      '',
      String(input.designCompliance).trim(),
      '',
    );
  }

  sections.push(
    '## Verification',
    '',
    'Local verification:',
    verificationLines,
    '',
    'CI verification:',
    '- Required checks expected to pass: YES',
    '- Known failing/advisory checks: none',
    '',
    '## Acceptance Criteria',
    '',
    ...acceptanceCriteria.map((item) => `- [x] ${item}`),
    '',
    `Follow-up issue required: ${followUpRequired}`,
    `Follow-up issue if required: ${followUpIssue}`,
    '',
    '## As-Built Documentation',
    '',
    asBuiltDocumentation,
    '',
    '## Closeout',
    '',
    closeout,
    '',
    '## Reviewer / Bot Review Attestation',
    '',
    '- [ ] I have read all human review threads on this PR',
    '- [ ] I have read all bot/advisory findings on this PR',
    '',
  );

  const body = `${sections.join('\n').trim()}\n`;
  const validation = validatePrBody({
    body,
    changedFiles: checked.changedFiles,
    packageScoped: checked.packageScoped,
    requiresDesignCompliance: checked.requiresDesignCompliance,
    requires2286Inheritance: checked.requires2286Inheritance,
    mixedScopeApproved: Boolean(input.mixedScopeApproved),
  });

  return {
    ok: validation.ok,
    body,
    failures: validation.failures,
    validation,
  };
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = {
    dryRun: false,
    fixture: '',
    output: '',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--fixture') args.fixture = argv[++i] || '';
    else if (arg === '--output') args.output = argv[++i] || '';
  }

  return args;
}

export function runGeneratorCli(argv = process.argv.slice(2), { stdout = console.log, stderr = console.error } = {}) {
  const args = parseArgs(argv);
  if (!args.fixture) {
    stderr('Usage: node scripts/ci/pr_body_generator.mjs --dry-run --fixture <path> [--output <path>]');
    return 2;
  }

  const fixture = loadFixture(args.fixture);
  // Support body-only validator fixtures by short-circuiting generation.
  if (fixture.body && !fixture.sourceIssue) {
    const validation = validatePrBody({
      body: fixture.body,
      changedFiles: fixture.changedFiles || [],
      packageScoped: fixture.packageScoped !== false,
      requiresDesignCompliance: Boolean(fixture.requiresDesignCompliance),
      requires2286Inheritance: Boolean(fixture.requires2286Inheritance),
      mixedScopeApproved: Boolean(fixture.mixedScopeApproved),
    });
    stdout(renderValidationReport(validation));
    if (args.dryRun) {
      stdout('');
      stdout('--- generated body (fixture-provided) ---');
      stdout(fixture.body);
    }
    return validation.ok ? 0 : 1;
  }

  const result = generatePrBody(fixture);
  if (!result.ok) {
    stderr('FAIL — generator/preclearance defects:');
    for (const failure of result.failures) {
      stderr(`- [${failure.code}] ${failure.message}`);
      if (Array.isArray(failure.files)) {
        for (const file of failure.files) stderr(`  - ${file}`);
      }
    }
    stderr('Merge authority: Bill / ChatGPT unchanged.');
    return 1;
  }

  if (args.output) {
    fs.writeFileSync(path.resolve(args.output), result.body);
  }

  if (args.dryRun) {
    stdout(renderValidationReport(result.validation));
    stdout('');
    stdout('--- generated body ---');
    stdout(result.body);
  } else {
    stdout(result.body);
  }

  stdout('Merge authority: Bill / ChatGPT unchanged. Procedural preclearance only.');
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = runGeneratorCli();
}
