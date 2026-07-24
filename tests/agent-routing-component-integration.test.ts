// @ts-nocheck
import { describe, expect, it, vi } from 'vitest';

import {
  buildComponentIntegrationIdentity,
  evaluateComponentIntegration,
  executeComponentIntegration,
  INTEGRATION_DISPOSITIONS,
} from '../scripts/agent-routing/lib/component-integration.mjs';
import { verifyPostIntegrationEvidence } from '../scripts/agent-routing/lib/post-integration-verify.mjs';

const HEAD = '1111111111111111111111111111111111111111';
const TARGET_HEAD = '2222222222222222222222222222222222222222';
const MERGE = '3333333333333333333333333333333333333333';

const config = {
  allowedTargets: ['component/deterministic-handoff-controller'],
  allowedTargetPrefixes: ['component/'],
  forbiddenTargets: ['main', 'production'],
  requiredChecks: ['quality'],
  allowedApprovalProfiles: ['component-auto-integration', 'protected-change-review'],
  deterministicApprovalProfiles: ['component-auto-integration'],
  mergeMethod: 'squash',
};

function live(overrides = {}) {
  return {
    sourceIssue: { number: 2772, state: 'OPEN' },
    pullRequest: {
      number: 3000,
      state: 'OPEN',
      headSha: HEAD,
      baseRefName: 'component/deterministic-handoff-controller',
      body: `- **Issue:** #2772
- Target environment: component
- Approval profile: component-auto-integration
- Gate profile: component-child`,
      author: 'cursor-agent',
    },
    headSha: HEAD,
    targetBranchHeadSha: TARGET_HEAD,
    checks: [{ name: 'GATE — Quality Checks', status: 'completed', conclusion: 'success', headSha: HEAD }],
    reviewThreads: [],
    reviewSubmissions: [],
    protectedConditions: [],
    ...overrides,
  };
}

describe('component integration eligibility', () => {
  it('authorizes exactly one clean component mutation', () => {
    const result = evaluateComponentIntegration({
      live: live(), config, expectedHeadSha: HEAD, expectedTargetHeadSha: TARGET_HEAD,
    });
    expect(result.disposition).toBe(INTEGRATION_DISPOSITIONS.ELIGIBLE);
    expect(result.mutationAllowed).toBe(true);
    expect(result.maxMutations).toBe(1);
  });

  it('rejects main without mutation', () => {
    const result = evaluateComponentIntegration({
      live: live({ pullRequest: { ...live().pullRequest, baseRefName: 'main' } }), config,
    });
    expect(result.disposition).toBe(INTEGRATION_DISPOSITIONS.BLOCKED);
    expect(result.code).toBe('target_not_authorized');
    expect(result.mutationAllowed).toBe(false);
  });

  it.each([
    ['head drift', { expectedHeadSha: MERGE }, 'head_drift'],
    ['target drift', { expectedTargetHeadSha: MERGE }, 'target_drift'],
  ])('blocks %s', (_name, args, code) => {
    const result = evaluateComponentIntegration({ live: live(), config, ...args });
    expect(result.code).toBe(code);
    expect(result.mutationAllowed).toBe(false);
  });

  it.each([
    ['failed check', { checks: [{ name: 'quality', status: 'completed', conclusion: 'failure', headSha: HEAD }] }, 'required_check_not_successful'],
    ['pending check', { checks: [{ name: 'quality', status: 'in_progress', conclusion: null, headSha: HEAD }] }, 'required_check_not_successful'],
    ['unresolved thread', { reviewThreads: [{ id: 'thread', isResolved: false, isOutdated: false }] }, 'unresolved_review_threads'],
    ['changes requested', { reviewSubmissions: [{ id: 'review', state: 'CHANGES_REQUESTED', headSha: HEAD }] }, 'changes_requested'],
    ['protected condition', { protectedConditions: ['production'] }, 'protected_condition'],
  ])('blocks %s', (_name, override, code) => {
    const result = evaluateComponentIntegration({ live: live(override), config });
    expect(result.code).toBe(code);
    expect(result.mutationAllowed).toBe(false);
  });

  it('requires independent review for protected change', () => {
    const protectedLive = live({
      pullRequest: {
        ...live().pullRequest,
        body: `- **Issue:** #2772
- Target environment: component
- Approval profile: protected-change-review
- Gate profile: component-child`,
      },
    });
    expect(evaluateComponentIntegration({ live: protectedLive, config }).code).toBe('independent_review_missing');
    const approved = evaluateComponentIntegration({
      live: { ...protectedLive, independentReview: { approved: true, headSha: HEAD, author: 'atlas-reviewer' } }, config,
    });
    expect(approved.disposition).toBe(INTEGRATION_DISPOSITIONS.ELIGIBLE);
  });

  it('suppresses an equivalent recorded integration', () => {
    const result = evaluateComponentIntegration({
      live: live(), config,
      priorIntegrations: [{
        sourceIssueNumber: 2772, prNumber: 3000, headSha: HEAD,
        targetBranch: 'component/deterministic-handoff-controller', mergeSha: MERGE,
      }],
    });
    expect(result.disposition).toBe(INTEGRATION_DISPOSITIONS.SUPPRESSED);
  });
});

describe('component integration transaction', () => {
  it('executes one merge and verifies exact merge SHA', async () => {
    const mergePullRequest = vi.fn().mockResolvedValue({ merged: true, mergeSha: MERGE });
    const readVerificationEvidence = vi.fn().mockResolvedValue({
      sourceIssueState: 'OPEN', targetHeadSha: MERGE, compareStatus: 'identical',
    });
    const result = await executeComponentIntegration({
      live: live(), config, adapter: { mergePullRequest, readVerificationEvidence },
    });
    expect(result.disposition).toBe(INTEGRATION_DISPOSITIONS.INTEGRATED);
    expect(result.mutationCount).toBe(1);
    expect(result.mergeSha).toBe(MERGE);
    expect(result.closeoutAllowed).toBe(false);
    expect(result.successorActivationAllowed).toBe(false);
    expect(mergePullRequest).toHaveBeenCalledTimes(1);
  });

  it('records protected recovery when verification fails', async () => {
    const result = await executeComponentIntegration({
      live: live(), config,
      adapter: {
        mergePullRequest: vi.fn().mockResolvedValue({ merged: true, mergeSha: MERGE }),
        readVerificationEvidence: vi.fn().mockResolvedValue({ sourceIssueState: 'OPEN', targetHeadSha: TARGET_HEAD, compareStatus: 'behind' }),
      },
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe('merge_not_on_target');
    expect(result.mutationOccurred).toBe(true);
    expect(result.requiresAuthorizedRecovery).toBe(true);
  });

  it('builds stable identity with merge SHA', () => {
    expect(buildComponentIntegrationIdentity({
      sourceIssueNumber: 2772, prNumber: 3000, headSha: HEAD,
      targetBranch: 'component/deterministic-handoff-controller',
      disposition: INTEGRATION_DISPOSITIONS.INTEGRATED, mergeSha: MERGE,
    })).toContain(`merge:${MERGE}`);
  });
});

describe('post-integration verification', () => {
  it('requires the source Issue to remain open', () => {
    expect(verifyPostIntegrationEvidence({
      sourceIssueState: 'CLOSED', targetBranch: 'component/x',
      mergeSha: MERGE, targetHeadSha: MERGE,
      config: { allowedTargetPrefixes: ['component/'] },
    }).code).toBe('source_issue_closed_during_integration');
  });

  it('accepts ahead containment', () => {
    expect(verifyPostIntegrationEvidence({
      sourceIssueState: 'OPEN', targetBranch: 'component/x', mergeSha: MERGE,
      targetHeadSha: TARGET_HEAD, compareStatus: 'ahead',
      config: { allowedTargetPrefixes: ['component/'] },
    }).ok).toBe(true);
  });
});
