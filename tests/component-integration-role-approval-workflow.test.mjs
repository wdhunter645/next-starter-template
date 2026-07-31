import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const WORKFLOW_PATH = resolve(
  process.cwd(),
  '.github/workflows/component-child-integration.yml',
);

function readWorkflowSource() {
  return readFileSync(WORKFLOW_PATH, 'utf8');
}

function stepBlock(source, name) {
  const start = source.indexOf(`- name: ${name}`);
  if (start === -1) return '';
  const next = source.indexOf('\n      - name:', start + 1);
  return next === -1 ? source.slice(start) : source.slice(start, next);
}

// #2615 remediation: this control cannot authenticate separation of duties
// (ChatGPT and Claude Code write through the shared wdhunter645 identity),
// so the workflow must not claim otherwise, must remain visible when it
// can't route a review request anywhere, and must not accumulate duplicate
// check-runs on every re-evaluation of the same head SHA.
describe('component-child-integration.yml role-approval remediation (#2615)', () => {
  const source = readWorkflowSource();

  it('does not use retired "ChatGPT / Atlas" role terminology in user-facing text', () => {
    // The `atlas/*` branch-name prefix match is an existing, unrelated git
    // naming convention (e.g. `atlas/2615-role-approval-guard`), not the
    // retired role terminology this check guards against.
    expect(source).not.toMatch(/chatgpt\s*\/\s*atlas/i);
    expect(source).not.toMatch(/atlas approval/i);
  });

  it('materializes an authorized-accounts list and feeds it to the eligibility step', () => {
    expect(source).toContain('ROLE_APPROVAL_AUTHORIZED_ACCOUNTS: wdhunter645');
    expect(source).toContain('role_approval_authorized_accounts.json');
    expect(source).toContain('COMPONENT_INTEGRATION_ROLE_APPROVAL_AUTHORIZED_ACCOUNTS_JSON');
  });

  it('posts a visible PR-side explanation when no source Issue can be resolved', () => {
    const block = stepBlock(source, 'Upsert missing-source-issue explanation on the PR');
    expect(block).toBeTruthy();
    expect(block).toContain("steps.pr_meta.outputs.source_issue == '0'");
    expect(block).toContain('gh api --method POST "repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/comments"');
  });

  it('routes the source-Issue review request only when a source Issue exists, and the PR-side explanation only when it does not', () => {
    const reviewRequest = stepBlock(source, 'Upsert exact-head PR review request');
    const missingSource = stepBlock(source, 'Upsert missing-source-issue explanation on the PR');
    expect(reviewRequest).toContain("steps.pr_meta.outputs.source_issue != '0'");
    expect(missingSource).toContain("steps.pr_meta.outputs.source_issue == '0'");
  });

  it('documents the shared-identity limitation in the routed review request text', () => {
    const block = stepBlock(source, 'Upsert exact-head PR review request');
    expect(block).toMatch(/cannot cryptographically distinguish either pr approver \/ engineering holder/i);
  });

  it('updates the same check-run record instead of always creating a new one for the same head SHA', () => {
    const block = stepBlock(source, 'Publish component integration check');
    expect(block).toContain('check-runs/${EXISTING_CHECK_ID}');
    expect(block).toMatch(/--method PATCH/);
    // The POST fallback must remain for the genuinely-first evaluation of a head SHA.
    expect(block).toContain('gh api "repos/${GITHUB_REPOSITORY}/check-runs"');
  });

  it('reports the accepted approval-evidence account and the limitation note in the check summary', () => {
    const block = stepBlock(source, 'Publish component integration check');
    expect(block).toContain('Approval-evidence account');
    expect(block).toMatch(/not authenticated reviewer identity/i);
  });
});
