import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { selectIssuePrContract, validateIssuePrContract } from '../scripts/ci/issue_pr_contract.mjs';
import { renderPrBody } from '../scripts/ci/pr_body_renderer.mjs';
import { validateRenderedPrBody } from '../scripts/ci/pr_contract.mjs';
import { parseDeliveryMetadata } from '../scripts/ci/delivery_profile.mjs';
import { buildPrHygieneReport } from '../scripts/ci/pr_hygiene_audit.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.join(__dirname, 'fixtures/issue-pr-contract');

function readFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, name), 'utf8'));
}

describe('renderPrBody round-trip (#2619)', () => {
  it('renders a body that passes the same hygiene/diff-scope/delivery-profile validation used on live PRs', () => {
    const fixture = readFixture('valid-b-child.json');
    const issue = { number: fixture.issueNumber, body: fixture.issueBody };

    const selection = selectIssuePrContract({ issue, comments: [] });
    expect(selection.ok).toBe(true);

    const validated = validateIssuePrContract({
      issue,
      contract: selection.contract,
      liveState: { headBranchExists: true, hasDiff: true, openPrExists: false },
    });
    expect(validated.ok).toBe(true);

    const deliveryProfile = parseDeliveryMetadata(fixture.issueBody);
    const body = renderPrBody({ issue, contract: { fields: validated.fields }, deliveryProfile });

    expect(body).toContain(`- **Issue:** #${fixture.issueNumber}`);
    expect(body).toContain('- [ ] I have read all human review threads on this PR');

    const hygiene = buildPrHygieneReport({ body, changedFiles: fixture.changedFiles });
    expect(hygiene.isClean).toBe(true);

    const rendered = validateRenderedPrBody({
      body,
      baseRef: fixture.baseBranch,
      headRef: fixture.headBranch,
      changedFiles: fixture.changedFiles,
    });
    expect(rendered.ok).toBe(true);
    expect(rendered.delivery.errors).toEqual([]);
  });

  it('always emits reviewer attestation unchecked even when the contract tries to imply otherwise', () => {
    const fixture = readFixture('valid-b-child.json');
    const deliveryProfile = parseDeliveryMetadata(fixture.issueBody);
    const body = renderPrBody({
      issue: { number: fixture.issueNumber },
      contract: { fields: { intent_label: 'intent:feature', pr_class: 'code', allowed_paths: ['scripts/example.mjs'] } },
      deliveryProfile,
    });
    expect(body).toMatch(/- \[ \] I have read all human review threads on this PR/);
    expect(body).toMatch(/- \[ \] I have read all bot\/advisory findings on this PR/);
    expect(body).not.toMatch(/- \[x\] I have read all human review threads on this PR/);
  });

  it('renders well-formed markdown when verification_commands is empty (Copilot review, PR #2937)', () => {
    const fixture = readFixture('valid-b-child.json');
    const deliveryProfile = parseDeliveryMetadata(fixture.issueBody);
    const body = renderPrBody({
      issue: { number: fixture.issueNumber },
      contract: { fields: { intent_label: 'intent:feature', pr_class: 'code', allowed_paths: ['scripts/example.mjs'], verification_commands: [] } },
      deliveryProfile,
    });
    expect(body).not.toMatch(/Command: ``/);
    expect(body).toContain('- Command: (none)');
  });
});

describe('validateRenderedPrBody scope enforcement (Copilot review, PR #2937)', () => {
  it('fails when changed files are outside the declared Allowed paths, even if hygiene checks alone would not catch it', () => {
    const fixture = readFixture('valid-b-child.json');
    const issue = { number: fixture.issueNumber, body: fixture.issueBody };
    const selection = selectIssuePrContract({ issue, comments: [] });
    const validated = validateIssuePrContract({
      issue,
      contract: selection.contract,
      liveState: { headBranchExists: true, hasDiff: true, openPrExists: false },
    });
    const deliveryProfile = parseDeliveryMetadata(fixture.issueBody);
    const body = renderPrBody({ issue, contract: { fields: validated.fields }, deliveryProfile });

    const rendered = validateRenderedPrBody({
      body,
      baseRef: fixture.baseBranch,
      headRef: fixture.headBranch,
      changedFiles: [...fixture.changedFiles, 'scripts/unrelated-out-of-scope.mjs'],
    });
    expect(rendered.scope.ok).toBe(false);
    expect(rendered.ok).toBe(false);
    expect(rendered.errors.some((error) => error.scope)).toBe(true);
  });
});
