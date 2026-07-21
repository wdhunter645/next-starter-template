import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  generatePrBody,
  runGeneratorCli,
  validateGeneratorInput,
} from '../scripts/ci/pr_body_generator.mjs';
import {
  FAILURE_CODES,
  findProhibitedPlaceholders,
  runValidateCli,
  validatePrBody,
} from '../scripts/ci/validate_pr_body.mjs';
import {
  hasRequiredIssueLine,
  hasVerificationEvidence,
  missingTemplateSections,
  parseAllowedFiles,
} from '../scripts/ci/pr_hygiene_audit.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureDir = path.join(__dirname, '../scripts/ci/fixtures/pr_body_generator');

function readFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(fixtureDir, name), 'utf8'));
}

describe('CI-001 PR body generator', () => {
  it('produces template-compatible output for the valid Content Collection fixture', () => {
    const fixture = readFixture('valid-cc-task.json');
    const result = generatePrBody(fixture);

    expect(result.ok).toBe(true);
    expect(hasRequiredIssueLine(result.body)).toBe(true);
    expect(result.body).toContain('- **Issue:** #2436');
    expect(missingTemplateSections(result.body)).toEqual([]);
    expect(hasVerificationEvidence(result.body)).toBe(true);
    expect(parseAllowedFiles(result.body).length).toBeGreaterThan(0);
    expect(result.body).toContain('Package path:');
    expect(result.validation.mergeAuthorityUnchanged).toBe(true);
    expect(result.body).toMatch(/Merge authority remains Bill \/ ChatGPT/i);
    expect(result.body).not.toMatch(/\b(is|are|will be)\s+pre-approved(?:\s+for)?\s+merge\b/i);
    expect(result.body).not.toMatch(/\b(?:will|shall|must)\s+auto-?(?:approve|merge)\b/i);
  });

  it('dry-run CLI exits 0 for the valid fixture', () => {
    const logs = [];
    const code = runGeneratorCli(
      ['--dry-run', '--fixture', path.join(fixtureDir, 'valid-cc-task.json')],
      {
        stdout: (line) => logs.push(String(line)),
        stderr: (line) => logs.push(String(line)),
      },
    );

    expect(code).toBe(0);
    expect(logs.join('\n')).toContain('PASS');
    expect(logs.join('\n')).toContain('Merge authority: Bill / ChatGPT unchanged');
  });

  const invalidCases = [
    ['invalid-missing-source-issue.json', FAILURE_CODES.MISSING_SOURCE_ISSUE],
    ['invalid-missing-package-path.json', FAILURE_CODES.MISSING_PACKAGE_PATH],
    ['invalid-placeholder-token.json', FAILURE_CODES.PLACEHOLDER_TOKEN],
    ['invalid-off-allowlist-file.json', FAILURE_CODES.OFF_ALLOWLIST_FILE],
    ['invalid-missing-validation.json', FAILURE_CODES.MISSING_VALIDATION],
    ['invalid-ui-missing-design-compliance.json', FAILURE_CODES.MISSING_DESIGN_COMPLIANCE],
    ['invalid-pipeline-missing-2286.json', FAILURE_CODES.MISSING_2286_INHERITANCE],
  ];

  it.each(invalidCases)('fails %s with %s', (fixtureName, expectedCode) => {
    const fixture = readFixture(fixtureName);
    const inputCheck = validateGeneratorInput(fixture);
    expect(inputCheck.ok).toBe(false);
    expect(inputCheck.failures.some((failure) => failure.code === expectedCode)).toBe(true);

    const generated = generatePrBody(fixture);
    expect(generated.ok).toBe(false);
    expect(generated.failures.some((failure) => failure.code === expectedCode)).toBe(true);
  });

  it('validator rejects a rendered body that drops design compliance for UI work', () => {
    const body = `# PR Summary

- **Issue:** #2436
- Intent label: intent:feature
- PR class: code

## Scope

Allowed paths:
- \`app/components/Example.tsx\`

Out-of-scope changes present: NO
Exception issue/approval if YES: not-applicable

## Change Summary

UI change without design compliance.

## Package Compliance

- Package ID: \`FE-UI\`
- Package path: \`docs/ops/implementation-plans/content-collection/packages/ci-001-pr-body-generator-package.md\`

## Verification

Local verification:
- Command: \`npm test\`
  Result: PASS

CI verification:
- Required checks expected to pass: YES
- Known failing/advisory checks: none

## Acceptance Criteria

- [x] Source issue acceptance criteria reviewed

Follow-up issue required: NO
Follow-up issue if required: not-applicable

## Reviewer / Bot Review Attestation

- [ ] I have read all human review threads on this PR
- [ ] I have read all bot/advisory findings on this PR
`;

    const report = validatePrBody({
      body,
      changedFiles: ['app/components/Example.tsx'],
      requiresDesignCompliance: true,
    });

    expect(report.ok).toBe(false);
    expect(report.failures.some((failure) => failure.code === FAILURE_CODES.MISSING_DESIGN_COMPLIANCE)).toBe(true);
  });

  it('rejects lowercase and mixed-case tbd placeholder tokens', () => {
    expect(findProhibitedPlaceholders('Status: tbd')).toContain('tbd_token');
    expect(findProhibitedPlaceholders('Status: Tbd')).toContain('tbd_token');
    expect(findProhibitedPlaceholders('Status: TBD')).toContain('tbd_token');
    expect(findProhibitedPlaceholders('updated')).not.toContain('tbd_token');
  });

  it('validate CLI fails fast when --fixture lacks a rendered body field', () => {
    const errors = [];
    const code = runValidateCli(
      ['--fixture', path.join(fixtureDir, 'valid-cc-task.json')],
      {
        stdout: () => {},
        stderr: (line) => errors.push(String(line)),
      },
    );

    expect(code).toBe(2);
    expect(errors.join('\n')).toMatch(/must include a string "body" field/i);
    expect(errors.join('\n')).not.toMatch(/missing_source_issue/i);
  });

  it('validate CLI accepts the rendered-body validator fixture', () => {
    const logs = [];
    const code = runValidateCli(
      ['--fixture', path.join(fixtureDir, 'valid-cc-rendered-body.json')],
      {
        stdout: (line) => logs.push(String(line)),
        stderr: (line) => logs.push(String(line)),
      },
    );

    expect(code).toBe(0);
    expect(logs.join('\n')).toContain('PASS');
  });

  it('validator rejects pipeline bodies without #2286 inheritance', () => {
    const body = `# PR Summary

- **Issue:** #2436
- Intent label: intent:feature
- PR class: code

## Scope

Allowed paths:
- \`lib/content-pipeline/example.ts\`

Out-of-scope changes present: NO
Exception issue/approval if YES: not-applicable

## Change Summary

Pipeline change without inheritance statement.

## Package Compliance

- Package ID: \`PIPE-01\`
- Package path: \`docs/ops/implementation-plans/content-collection/packages/ci-001-pr-body-generator-package.md\`

## Verification

Local verification:
- Command: \`npm test\`
  Result: PASS

CI verification:
- Required checks expected to pass: YES
- Known failing/advisory checks: none

## Acceptance Criteria

- [x] Source issue acceptance criteria reviewed

Follow-up issue required: NO
Follow-up issue if required: not-applicable

## Reviewer / Bot Review Attestation

- [ ] I have read all human review threads on this PR
- [ ] I have read all bot/advisory findings on this PR
`;

    const report = validatePrBody({
      body,
      changedFiles: ['lib/content-pipeline/example.ts'],
      requires2286Inheritance: true,
    });

    expect(report.ok).toBe(false);
    expect(report.failures.some((failure) => failure.code === FAILURE_CODES.MISSING_2286_INHERITANCE)).toBe(true);
  });
});
