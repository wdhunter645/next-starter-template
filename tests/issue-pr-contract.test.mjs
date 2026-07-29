import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  findContractBlocks,
  parseIssuePrContract,
  selectIssuePrContract,
  validateIssuePrContract,
} from '../scripts/ci/issue_pr_contract.mjs';
import { CONTRACT_ERROR_CODES } from '../scripts/ci/pr_contract.mjs';
import { parseAllowedFiles } from '../scripts/ci/pr_hygiene_audit.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.join(__dirname, 'fixtures/issue-pr-contract');

function readFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, name), 'utf8'));
}

describe('issue-pr-contract parsing and selection (#2619)', () => {
  it('finds exactly one contract block and parses its fields', () => {
    const fixture = readFixture('valid-b-child.json');
    const blocks = findContractBlocks(fixture.issueBody);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].rev).toBe(1);

    const parsed = parseIssuePrContract(blocks[0].innerText);
    expect(parsed.fields.intent_label).toBe('intent:feature');
    expect(parsed.fields.pr_class).toBe('code');
    expect(parsed.fields.allowed_paths).toEqual(['scripts/example.mjs', 'tests/example.test.mjs']);
    expect(parsed.fields.verification_commands).toEqual(['npm test']);
  });

  it('selects the single contract block and surfaces no staleness without prior status comments', () => {
    const fixture = readFixture('valid-b-child.json');
    const selection = selectIssuePrContract({
      issue: { number: fixture.issueNumber, body: fixture.issueBody },
      comments: [],
    });
    expect(selection.ok).toBe(true);
    expect(selection.errors).toEqual([]);
    expect(selection.contract.rev).toBe(1);
    expect(selection.lastStatus).toBeNull();
  });

  it('fails contract_missing when no block is present', () => {
    const selection = selectIssuePrContract({ issue: { number: 1, body: 'no contract here' }, comments: [] });
    expect(selection.ok).toBe(false);
    expect(selection.errors[0].code).toBe(CONTRACT_ERROR_CODES.CONTRACT_MISSING);
  });

  it('fails contract_duplicate when two blocks are present', () => {
    const fixture = readFixture('duplicate-contract.json');
    const selection = selectIssuePrContract({ issue: { number: fixture.issueNumber, body: fixture.issueBody }, comments: [] });
    expect(selection.ok).toBe(false);
    expect(selection.errors[0].code).toBe(CONTRACT_ERROR_CODES.CONTRACT_DUPLICATE);
  });

  it('fails contract_unauthorized_trigger for an actor outside the authorized list', () => {
    const fixture = readFixture('valid-b-child.json');
    const selection = selectIssuePrContract({
      issue: { number: fixture.issueNumber, body: fixture.issueBody, triggerActor: 'random-user' },
      comments: [],
      authorizedActors: ['wdhunter645', 'chatgpt-bot'],
    });
    expect(selection.ok).toBe(false);
    expect(selection.errors[0].code).toBe(CONTRACT_ERROR_CODES.UNAUTHORIZED_TRIGGER);
  });

  it('passes for an authorized actor', () => {
    const fixture = readFixture('valid-b-child.json');
    const selection = selectIssuePrContract({
      issue: { number: fixture.issueNumber, body: fixture.issueBody, triggerActor: 'wdhunter645' },
      comments: [],
      authorizedActors: ['wdhunter645', 'chatgpt-bot'],
    });
    expect(selection.ok).toBe(true);
  });

  it('detects the most recent validation-status comment for staleness comparison', () => {
    const fixture = readFixture('valid-b-child.json');
    const selection = selectIssuePrContract({
      issue: { number: fixture.issueNumber, body: fixture.issueBody },
      comments: [
        { id: 1, body: '<!-- issue-pr-contract-status:v1:invalid:rev=1 -->\nsome earlier failure' },
        { id: 2, body: '<!-- issue-pr-contract-status:v1:valid:rev=1 -->\nlooks good' },
      ],
    });
    expect(selection.lastStatus).toEqual({ state: 'valid', rev: 1, commentId: 2 });
  });
});

describe('parseAllowedFiles heading-anchor support (#2619)', () => {
  it('parses allowed paths from a heading anchor, as used by .github/ISSUE_TEMPLATE/delivery-task.md', () => {
    const headingBody = '## Scope\n\n### Allowed paths\n\n- `scripts/example.mjs`\n- `tests/example.test.mjs`\n\nAll other paths are out of scope.\n';
    expect(parseAllowedFiles(headingBody)).toEqual(['scripts/example.mjs', 'tests/example.test.mjs']);
  });
});

describe('validateIssuePrContract (#2619)', () => {
  it('passes a complete, in-scope, non-stale contract', () => {
    const fixture = readFixture('valid-b-child.json');
    const selection = selectIssuePrContract({ issue: { number: fixture.issueNumber, body: fixture.issueBody }, comments: [] });
    const result = validateIssuePrContract({
      issue: { number: fixture.issueNumber, body: fixture.issueBody },
      contract: selection.contract,
      liveState: {
        lastValidatedRev: undefined,
        headBranchExists: true,
        hasDiff: true,
        openPrExists: false,
      },
    });
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.primarySourceIssue).toBe(fixture.issueNumber);
  });

  it('fails deterministically for missing, placeholder, and invalid fields', () => {
    const fixture = readFixture('missing-fields.json');
    const selection = selectIssuePrContract({ issue: { number: fixture.issueNumber, body: fixture.issueBody }, comments: [] });
    const result = validateIssuePrContract({
      issue: { number: fixture.issueNumber, body: fixture.issueBody },
      contract: selection.contract,
      liveState: {},
    });
    expect(result.ok).toBe(false);
    const codes = result.errors.map((error) => error.code);
    expect(codes).toContain(CONTRACT_ERROR_CODES.FIELD_MISSING);
    expect(codes).toContain(CONTRACT_ERROR_CODES.FIELD_PLACEHOLDER);
  });

  it('fails contract_scope_widens_issue_allowlist when contract paths exceed the Issue allowlist', () => {
    const fixture = readFixture('scope-widening.json');
    const selection = selectIssuePrContract({ issue: { number: fixture.issueNumber, body: fixture.issueBody }, comments: [] });
    const result = validateIssuePrContract({
      issue: { number: fixture.issueNumber, body: fixture.issueBody },
      contract: selection.contract,
      liveState: {},
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.code === CONTRACT_ERROR_CODES.SCOPE_WIDENS_ISSUE_ALLOWLIST)).toBe(true);
  });

  it('fails contract_stale_revision when the last validated revision does not match the current one', () => {
    const fixture = readFixture('valid-b-child.json');
    const selection = selectIssuePrContract({ issue: { number: fixture.issueNumber, body: fixture.issueBody }, comments: [] });
    const result = validateIssuePrContract({
      issue: { number: fixture.issueNumber, body: fixture.issueBody },
      contract: selection.contract,
      liveState: { lastValidatedRev: 0 },
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.code === CONTRACT_ERROR_CODES.STALE_REVISION)).toBe(true);
  });

  it('fails branch_missing, diff_empty, and pr_already_exists from liveState', () => {
    const fixture = readFixture('valid-b-child.json');
    const selection = selectIssuePrContract({ issue: { number: fixture.issueNumber, body: fixture.issueBody }, comments: [] });
    const result = validateIssuePrContract({
      issue: { number: fixture.issueNumber, body: fixture.issueBody },
      contract: selection.contract,
      liveState: { headBranchExists: false, hasDiff: false, openPrExists: true },
    });
    expect(result.ok).toBe(false);
    const codes = result.errors.map((error) => error.code);
    expect(codes).toContain(CONTRACT_ERROR_CODES.BRANCH_MISSING);
    expect(codes).toContain(CONTRACT_ERROR_CODES.DIFF_EMPTY);
    expect(codes).toContain(CONTRACT_ERROR_CODES.PR_ALREADY_EXISTS);
  });
});
