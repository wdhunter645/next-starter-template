// @ts-nocheck -- Runtime contract suite exercises untyped JavaScript controller modules.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  loadControllerConfig,
  runController,
} from '../scripts/agent-routing/controller.mjs';
import {
  collectGitHubIntegrationState,
  evaluateComponentIntegrationTransaction,
  executeComponentIntegration,
} from '../scripts/agent-routing/lib/component-integration.mjs';
import {
  buildIntegrationIdentity,
  buildVerificationIdentity,
  identityMarker,
} from '../scripts/agent-routing/lib/idempotency.mjs';
import { verifyPostIntegration } from '../scripts/agent-routing/lib/post-integration-verify.mjs';
import { DISPOSITION_CLASSES } from '../scripts/agent-routing/lib/disposition.mjs';

const HEAD = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const MERGE = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const OTHER = 'cccccccccccccccccccccccccccccccccccccccc';
const TARGET_HEAD = 'dddddddddddddddddddddddddddddddddddddddd';
const TARGET = 'component/deterministic-handoff-controller';

function config() {
  return loadControllerConfig();
}

function cleanPacket(overrides = {}) {
  return {
    sourceIssue: { number: 2772, state: 'OPEN' },
    pullRequest: {
      number: 2999,
      headSha: HEAD,
      headRef: 'cursor/2677-003-component-integration',
      baseRef: TARGET,
      url: 'https://github.com/wdhunter645/next-starter-template/pull/2999',
      deliveryProfile: {
        deliveryModel: 'B-child',
        targetEnvironment: 'component',
        approvalProfile: 'component-auto-integration',
        gateProfile: 'component-child',
        componentBranch: TARGET,
        componentMaster: '#2677',
      },
    },
    checks: [
      {
        name: 'quality',
        status: 'completed',
        conclusion: 'success',
        headSha: HEAD,
      },
    ],
    reviewEvidence: {
      unresolvedReviewThreads: [],
      reviewSubmissions: [],
      lateIssueComments: [],
    },
    ...overrides,
  };
}

function liveCleanInput({
  approvalProfile = 'component-auto-integration',
  baseRefName = TARGET,
  headSha = HEAD,
  prAuthor = 'builder',
  threads = [],
  checks = null,
  reviews = [],
  comments = [],
} = {}) {
  const trigger = {
    id: '5067000001',
    createdAt: '2026-07-24T04:20:00Z',
    author: { login: 'wdhunter645' },
    body: 'CHATGPT HANDOFF\nIssue: #2772\nPR: #2999',
  };
  return {
    live: {
      collectedAt: '2026-07-24T04:30:00Z',
      source: 'github-native',
      finalReread: true,
      sourceIssue: {
        number: 2772,
        state: 'OPEN',
        title: 'TASK: #2677-003',
        body: '## Acceptance Criteria\n- [ ] component integration',
        labels: ['agent:cursor'],
      },
      pullRequest: {
        number: 2999,
        title: 'feat(#2772)',
        state: 'open',
        body: `- **Issue:** #2772
- Delivery model: B-child
- Target environment: component
- Approval profile: ${approvalProfile}
- Gate profile: component-child
- Component branch: ${TARGET}
- Component master: #2677`,
        baseRefName,
        headRefName: 'cursor/2677-003-component-integration',
        headSha,
        head: { sha: headSha },
        user: { login: prAuthor },
        url: 'https://github.com/wdhunter645/next-starter-template/pull/2999',
      },
      headSha,
      changedFiles: ['scripts/agent-routing/lib/component-integration.mjs'],
      checks: checks || [
        {
          name: 'quality',
          status: 'completed',
          conclusion: 'success',
          headSha,
        },
      ],
      issueComments: [trigger, ...comments],
      reviewSubmissions: reviews,
      reviewThreads: threads,
    },
    triggerComment: trigger,
  };
}

describe('component integration identities', () => {
  it('includes source Issue, head, target, disposition, and merge SHA', () => {
    expect(
      buildIntegrationIdentity({
        sourceIssueNumber: 2772,
        prNumber: 2999,
        headSha: HEAD,
        targetBranch: TARGET,
        integrationDisposition: 'clean',
        mergeSha: 'pending',
      }),
    ).toBe(
      `issue:2772:pr:2999:head:${HEAD}:target:${TARGET}:disposition:clean:merge:pending`,
    );
    expect(
      buildVerificationIdentity({
        sourceIssueNumber: 2772,
        prNumber: 2999,
        headSha: HEAD,
        targetBranch: TARGET,
        mergeSha: MERGE,
      }),
    ).toBe(`issue:2772:pr:2999:head:${HEAD}:target:${TARGET}:merge:${MERGE}`);
  });
});

describe('authorized non-main component integration', () => {
  it('integrates an authorized clean component PR once', () => {
    const result = runController(liveCleanInput(), config());
    expect(result.ok).toBe(true);
    expect(result.remediation.classification.classification).toBe(DISPOSITION_CLASSES.CLEAN);
    expect(result.integration.ok).toBe(true);
    expect(result.integration.eligible).toBe(true);
    expect(result.integration.actions).toHaveLength(1);
    expect(result.integration.actions[0].type).toBe('integrate_component_pr');
    expect(result.integration.actions[0].targetBranch).toBe(TARGET);
    expect(result.integration.authority.kind).toBe('deterministic_profile');
    expect(result.integration.authority.humanApproval).toBe(false);
    expect(result.verification.code).toBe('verification_deferred_until_merge_sha');
  });

  it('rejects a PR targeting main without mutation', () => {
    const blocked = evaluateComponentIntegrationTransaction({
      packet: cleanPacket({
        pullRequest: {
          ...cleanPacket().pullRequest,
          baseRef: 'main',
          deliveryProfile: {
            ...cleanPacket().pullRequest.deliveryProfile,
            componentBranch: 'main',
            targetEnvironment: 'component',
          },
        },
      }),
      classification: DISPOSITION_CLASSES.CLEAN,
      requiredChecks: ['quality'],
      componentIntegration: config().componentIntegration,
      observedTargetBranch: 'main',
    });
    expect(blocked.ok).toBe(false);
    expect(blocked.code).toBe('forbidden_target_main_or_production');
    expect(blocked.actions).toEqual([]);
  });

  it('blocks changed head SHA before integration', () => {
    const input = liveCleanInput({ headSha: HEAD });
    input.observedTargetBranch = TARGET;
    // Force packet/live mismatch path through evaluate helper directly.
    const blocked = evaluateComponentIntegrationTransaction({
      packet: cleanPacket({
        pullRequest: {
          ...cleanPacket().pullRequest,
          headSha: OTHER,
        },
      }),
      classification: DISPOSITION_CLASSES.CLEAN,
      requiredChecks: ['quality'],
      componentIntegration: config().componentIntegration,
      observedTargetBranch: TARGET,
    });
    // quality check still targets HEAD, so this fails as stale required check.
    expect(blocked.ok).toBe(false);
    expect(blocked.code).toBe('stale_required_check_head');
  });

  it('blocks failed required checks', () => {
    const result = runController(
      liveCleanInput({
        checks: [
          {
            name: 'quality',
            status: 'completed',
            conclusion: 'failure',
            headSha: HEAD,
          },
        ],
      }),
      config(),
    );
    expect(result.ok).toBe(true);
    // Failed required check becomes a remediation finding first.
    expect(result.remediation.classification.classification).not.toBe(
      DISPOSITION_CLASSES.CLEAN,
    );
    expect(result.integration.ok).toBe(false);
    expect(result.integration.code).toBe('integration_requires_clean_disposition');
    expect(result.integration.actions).toEqual([]);
  });

  it('blocks unresolved blocking threads', () => {
    const result = runController(
      liveCleanInput({
        threads: [
          {
            id: 'thread-block',
            isResolved: false,
            body: 'Unresolved blocker',
            decisionClass: 'engineering-approval',
          },
        ],
      }),
      config(),
    );
    expect(result.ok).toBe(true);
    expect(result.remediation.classification.classification).toBe(
      DISPOSITION_CLASSES.PROTECTED_STOP,
    );
    expect(result.integration.ok).toBe(false);
    expect(result.integration.code).toBe('integration_requires_clean_disposition');
  });

  it('blocks missing independent review for protected approval profile', () => {
    const result = runController(
      liveCleanInput({ approvalProfile: 'protected-change-review' }),
      config(),
    );
    expect(result.ok).toBe(true);
    expect(result.remediation.classification.classification).toBe(DISPOSITION_CLASSES.CLEAN);
    expect(result.integration.ok).toBe(false);
    expect(result.integration.code).toBe('missing_independent_review');
    expect(result.integration.actions).toEqual([]);
  });

  it('accepts recorded independent review for protected approval profile', () => {
    const result = runController(
      liveCleanInput({
        approvalProfile: 'protected-change-review',
        reviews: [
          {
            id: 'review-1',
            state: 'APPROVED',
            commit_id: HEAD,
            author: { login: 'chatgpt-atlas' },
          },
        ],
      }),
      config(),
    );
    expect(result.integration.ok).toBe(true);
    expect(result.integration.eligible).toBe(true);
    expect(result.integration.authority.kind).toBe('independent_review');
    expect(result.integration.authority.humanApproval).toBe(true);
  });

  it('rejects untrusted, stale, headless, and self review approvals', () => {
    const cases = [
      {
        name: 'untrusted',
        reviews: [
          {
            id: 'review-untrusted',
            state: 'APPROVED',
            commit_id: HEAD,
            author: { login: 'drive-by-reviewer' },
          },
        ],
      },
      {
        name: 'stale',
        reviews: [
          {
            id: 'review-stale',
            state: 'APPROVED',
            commit_id: OTHER,
            author: { login: 'chatgpt-atlas' },
          },
        ],
      },
      {
        name: 'headless',
        reviews: [
          {
            id: 'review-headless',
            state: 'APPROVED',
            author: { login: 'chatgpt-atlas' },
          },
        ],
      },
      {
        name: 'missing-pr-author',
        prAuthor: '',
        reviews: [
          {
            id: 'review-missing-pr-author',
            state: 'APPROVED',
            commit_id: HEAD,
            author: { login: 'chatgpt-atlas' },
          },
        ],
      },
      {
        name: 'self',
        prAuthor: 'chatgpt-atlas',
        reviews: [
          {
            id: 'review-self',
            state: 'APPROVED',
            commit_id: HEAD,
            author: { login: 'chatgpt-atlas' },
          },
        ],
      },
    ];
    for (const item of cases) {
      const result = runController(
        liveCleanInput({
          approvalProfile: 'protected-change-review',
          prAuthor: item.prAuthor,
          reviews: item.reviews,
        }),
        config(),
      );
      expect(result.integration.ok, item.name).toBe(false);
      expect(result.integration.code, item.name).toBe('missing_independent_review');
      expect(result.integration.actions, item.name).toEqual([]);
    }
  });

  it('rejects an approval that does not identify the reviewed head', () => {
    const result = runController(
      liveCleanInput({
        approvalProfile: 'protected-change-review',
        reviews: [
          {
            id: 'review-headless',
            state: 'APPROVED',
            author: { login: 'chatgpt-atlas' },
          },
        ],
      }),
      config(),
    );
    expect(result.integration.ok).toBe(false);
    expect(result.integration.code).toBe('missing_independent_review');
    expect(result.integration.actions).toEqual([]);
  });

  it('rejects protected approval when PR-author identity is missing', () => {
    const result = runController(
      liveCleanInput({
        approvalProfile: 'protected-change-review',
        prAuthor: '',
        reviews: [
          {
            id: 'review-trusted-current-head',
            state: 'APPROVED',
            commit_id: HEAD,
            author: { login: 'chatgpt-atlas' },
          },
        ],
      }),
      config(),
    );
    expect(result.integration.ok).toBe(false);
    expect(result.integration.code).toBe('missing_independent_review');
    expect(result.integration.actions).toEqual([]);
  });

  it('accepts only exact trusted source-Issue integration authorization', () => {
    const authorized = {
      id: 'auth-1',
      createdAt: '2026-07-24T04:40:00Z',
      author: { login: 'wdhunter645' },
      body: `APPROVED FOR INTEGRATION
Issue: #2772
PR: #2999
Head SHA: ${HEAD}
Target branch: ${TARGET}`,
    };
    const result = runController(
      liveCleanInput({
        approvalProfile: 'protected-change-review',
        comments: [authorized],
      }),
      config(),
    );
    expect(result.integration.ok).toBe(true);
    expect(result.integration.authority.kind).toBe('source_issue_authorization');
  });

  it('rejects source-Issue integration authorization with missing or mismatched fields', () => {
    const cases = [
      {
        name: 'missing target',
        body: `APPROVED FOR INTEGRATION
Issue: #2772
PR: #2999
Head SHA: ${HEAD}`,
      },
      {
        name: 'missing head',
        body: `APPROVED FOR INTEGRATION
Issue: #2772
PR: #2999
Target branch: ${TARGET}`,
      },
      {
        name: 'wrong pr',
        body: `APPROVED FOR INTEGRATION
Issue: #2772
PR: #3000
Head SHA: ${HEAD}
Target branch: ${TARGET}`,
      },
      {
        name: 'untrusted author',
        author: 'drive-by-reviewer',
        body: `APPROVED FOR INTEGRATION
Issue: #2772
PR: #2999
Head SHA: ${HEAD}
Target branch: ${TARGET}`,
      },
    ];
    for (const item of cases) {
      const result = runController(
        liveCleanInput({
          approvalProfile: 'protected-change-review',
          comments: [
            {
              id: `auth-${item.name}`,
              author: { login: item.author || 'wdhunter645' },
              body: item.body,
            },
          ],
        }),
        config(),
      );
      expect(result.integration.ok, item.name).toBe(false);
      expect(result.integration.code, item.name).toBe('missing_independent_review');
      expect(result.integration.actions, item.name).toEqual([]);
    }
  });

  it('requires exact current-head required checks', () => {
    const cases = [
      {
        name: 'headless',
        checks: [{ name: 'quality', status: 'completed', conclusion: 'success' }],
        code: 'missing_required_check_head',
      },
      {
        name: 'fuzzy',
        checks: [
          {
            name: 'quality / advisory',
            status: 'completed',
            conclusion: 'success',
            headSha: HEAD,
          },
        ],
        code: 'missing_required_check',
      },
      {
        name: 'pending',
        checks: [{ name: 'quality', status: 'queued', conclusion: null, headSha: HEAD }],
        code: 'failed_required_check',
      },
      {
        name: 'cancelled',
        checks: [
          {
            name: 'quality',
            status: 'completed',
            conclusion: 'cancelled',
            headSha: HEAD,
          },
        ],
        code: 'failed_required_check',
      },
      {
        name: 'action_required',
        checks: [
          {
            name: 'quality',
            status: 'completed',
            conclusion: 'action_required',
            headSha: HEAD,
          },
        ],
        code: 'failed_required_check',
      },
    ];
    for (const item of cases) {
      const result = evaluateComponentIntegrationTransaction({
        packet: cleanPacket({ checks: item.checks }),
        classification: DISPOSITION_CLASSES.CLEAN,
        requiredChecks: ['quality'],
        componentIntegration: config().componentIntegration,
        observedTargetBranch: TARGET,
      });
      expect(result.ok, item.name).toBe(false);
      expect(result.code, item.name).toBe(item.code);
      expect(result.actions, item.name).toEqual([]);
    }
  });

  it('blocks target drift from declared component branch', () => {
    const blocked = evaluateComponentIntegrationTransaction({
      packet: cleanPacket(),
      classification: DISPOSITION_CLASSES.CLEAN,
      requiredChecks: ['quality'],
      componentIntegration: config().componentIntegration,
      observedTargetBranch: 'component/other-branch',
    });
    expect(blocked.ok).toBe(false);
    expect(blocked.code).toBe('target_base_drift');
  });

  it('suppresses a repeated event after successful integration', () => {
    const completedIdentity = buildIntegrationIdentity({
      sourceIssueNumber: 2772,
      prNumber: 2999,
      headSha: HEAD,
      targetBranch: TARGET,
      integrationDisposition: 'clean',
      mergeSha: MERGE,
    });
    const comments = [
      {
        id: 'integration-1',
        createdAt: '2026-07-24T04:35:00Z',
        author: { login: 'wdhunter645' },
        body: `COMPONENT INTEGRATION
Issue: #2772
PR: #2999
Head SHA: ${HEAD}
Target branch: ${TARGET}
Integration disposition: clean
${identityMarker('integration', completedIdentity)}`,
      },
    ];
    const repeated = runController(liveCleanInput({ comments }), config());
    expect(repeated.integration.ok).toBe(true);
    expect(repeated.integration.suppressed).toBe(true);
    expect(repeated.integration.code).toBe('integration_already_completed');
    expect(repeated.integration.actions).toEqual([]);
  });

  it('suppresses an already-merged equivalent PR after target verification', async () => {
    let mutations = 0;
    let verifications = 0;
    const result = await executeComponentIntegration({
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2772,
      prNumber: 2999,
      expectedHeadSha: HEAD,
      targetBranch: TARGET,
      expectedTargetHeadSha: TARGET_HEAD,
      componentIntegration: config().componentIntegration,
      collectState: async () => ({
        ok: true,
        state: executionState({
          pullRequest: {
            ...executionState().pullRequest,
            state: 'CLOSED',
            merged: true,
            mergeSha: MERGE,
          },
        }),
      }),
      mergePullRequest: async () => {
        mutations += 1;
        return { ok: true, merged: true, mergeSha: MERGE };
      },
      verifyTargetContainsSha: async ({ mergeSha }) => {
        verifications += 1;
        return { ok: true, contains: mergeSha === MERGE };
      },
    });
    expect(result.ok).toBe(true);
    expect(result.suppressed).toBe(true);
    expect(result.code).toBe('equivalent_integration_already_completed');
    expect(result.mutations).toBe(0);
    expect(mutations).toBe(0);
    expect(verifications).toBe(1);
  });
});

describe('post-integration verification', () => {
  it('records exact target and merge SHA while leaving the source Issue open', () => {
    const verified = verifyPostIntegration({
      packet: cleanPacket(),
      targetBranch: TARGET,
      mergeSha: MERGE,
      targetBranchContainsMergeSha: true,
      componentIntegration: config().componentIntegration,
    });
    expect(verified.ok).toBe(true);
    expect(verified.verified).toBe(true);
    expect(verified.targetBranch).toBe(TARGET);
    expect(verified.mergeSha).toBe(MERGE);
    expect(verified.sourceIssueState).toBe('OPEN');
    expect(verified.closeout).toBe(false);
    expect(verified.successorActivation).toBe(false);
    expect(verified.actions).toHaveLength(1);
    expect(verified.actions[0].type).toBe('record_post_integration_verification');
    expect(verified.actions[0].body).toContain(`Merge SHA: ${MERGE}`);
    expect(verified.actions[0].body).toContain('Source Issue state: OPEN');
  });

  it('fails closed when the merge SHA is absent from the target', () => {
    const failed = verifyPostIntegration({
      packet: cleanPacket(),
      targetBranch: TARGET,
      mergeSha: MERGE,
      targetBranchContainsMergeSha: false,
      targetBranchHeadSha: OTHER,
      componentIntegration: config().componentIntegration,
    });
    expect(failed.ok).toBe(false);
    expect(failed.code).toBe('merge_sha_not_on_target');
    expect(failed.actions).toEqual([]);
  });

  it('fails closed when source-Issue state is unavailable', () => {
    const failed = verifyPostIntegration({
      packet: cleanPacket({
        sourceIssue: { number: 2772 },
      }),
      targetBranch: TARGET,
      mergeSha: MERGE,
      targetBranchContainsMergeSha: true,
      componentIntegration: config().componentIntegration,
    });
    expect(failed.ok).toBe(false);
    expect(failed.code).toBe('source_issue_state_unavailable');
    expect(failed.actions).toEqual([]);
  });

  it('wires verification through the controller after a recorded merge SHA', () => {
    const result = runController(
      {
        ...liveCleanInput(),
        recordedMergeSha: MERGE,
        targetBranchContainsMergeSha: true,
      },
      config(),
    );
    // With a recorded merge SHA and no prior integration marker, pending integrate
    // may still emit once; verification records the merge evidence separately.
    expect(result.verification.ok).toBe(true);
    expect(result.verification.verified).toBe(true);
    expect(result.verification.mergeSha).toBe(MERGE);
    expect(result.verification.targetBranch).toBe(TARGET);
    expect(result.verification.sourceIssueState).toBe('OPEN');
    expect(result.verification.closeout).toBe(false);
  });
});

describe('config and mutation boundaries', () => {
  it('keeps observe-only workflow mutation capabilities disabled', () => {
    const cfg = config();
    expect(cfg.mode).toBe('observe-only');
    expect(cfg.mutationAllowed).toBe(false);
    expect(cfg.workflowCapabilities.merge).toBe(false);
    expect(cfg.workflowCapabilities.mutateMain).toBe(false);
    expect(cfg.componentIntegration.enabled).toBe(true);
    expect(cfg.componentIntegration.allowMain).toBe(false);
    expect(cfg.componentIntegration.capabilities.close).toBe(false);
    expect(cfg.componentIntegration.capabilities.activateSuccessor).toBe(false);
  });

  it('permits the documented component-integration rollback switch', () => {
    const schema = JSON.parse(
      fs.readFileSync(
        path.resolve('config/agent-routing/controller.schema.json'),
        'utf8',
      ),
    );
    expect(schema.properties.componentIntegration.properties.enabled).toEqual({
      type: 'boolean',
    });
  });

  it('defines a separate write-scoped integration job while route stays read-only', () => {
    const workflow = fs.readFileSync(
      path.resolve('.github/workflows/ops-agent-routing-controller.yml'),
      'utf8',
    );
    expect(workflow).toMatch(/integrate-component:/);
    expect(workflow).toMatch(/pull-requests:\s*["']write["']/);
    expect(workflow).toMatch(/contents:\s*["']write["']/);
    expect(workflow).toMatch(/--expected-head "\$EXPECTED_HEAD_SHA"/);
    expect(workflow).toMatch(/--expected-target-head "\$EXPECTED_TARGET_HEAD_SHA"/);
    const topPermissions = workflow.match(
      /^permissions:\n([\s\S]*?)(?=\n\S|\nconcurrency:)/m,
    );
    expect(topPermissions?.[1]).toMatch(/issues:\s*read/);
    expect(topPermissions?.[1]).not.toMatch(/\bwrite\b/);
  });
});

function executionState(overrides = {}) {
  return {
    sourceIssue: {
      number: 2772,
      state: 'OPEN',
      body: 'authorized task',
    },
    pullRequest: {
      number: 2999,
      state: 'OPEN',
      merged: false,
      mergeSha: '',
      body: `- **Issue:** #2772
- Delivery model: B-child
- Target environment: component
- Approval profile: component-auto-integration
- Gate profile: component-child
- Component branch: ${TARGET}
- Component master: #2677`,
      headSha: HEAD,
      baseRef: TARGET,
      author: 'builder',
    },
    targetBranch: TARGET,
    targetHeadSha: TARGET_HEAD,
    checks: [
      {
        name: 'quality',
        status: 'completed',
        conclusion: 'success',
        headSha: HEAD,
      },
    ],
    reviews: [],
    comments: [],
    reviewThreads: [],
    ...overrides,
  };
}

describe('write-scoped component integration executor', () => {
  it('performs two rereads, one merge, and exact target verification', async () => {
    let collections = 0;
    let mutations = 0;
    let verifications = 0;
    const result = await executeComponentIntegration({
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2772,
      prNumber: 2999,
      expectedHeadSha: HEAD,
      targetBranch: TARGET,
      expectedTargetHeadSha: TARGET_HEAD,
      componentIntegration: config().componentIntegration,
      collectState: async () => {
        collections += 1;
        return {
          ok: true,
          state:
            collections < 3
              ? executionState()
              : executionState({
                  pullRequest: {
                    ...executionState().pullRequest,
                    state: 'CLOSED',
                    merged: true,
                    mergeSha: MERGE,
                  },
                }),
        };
      },
      mergePullRequest: async () => {
        mutations += 1;
        return { ok: true, merged: true, mergeSha: MERGE };
      },
      verifyTargetContainsSha: async ({ mergeSha }) => {
        verifications += 1;
        return { ok: true, contains: mergeSha === MERGE };
      },
    });
    expect(result.ok).toBe(true);
    expect(result.integrated).toBe(true);
    expect(result.mergeSha).toBe(MERGE);
    expect(result.targetBranch).toBe(TARGET);
    expect(result.sourceIssueState).toBe('OPEN');
    expect(result.closeout).toBe(false);
    expect(result.successorActivation).toBe(false);
    expect(collections).toBe(3);
    expect(mutations).toBe(1);
    expect(verifications).toBe(1);
  });

  it('blocks target-head drift before any merge mutation', async () => {
    let collections = 0;
    let mutations = 0;
    const result = await executeComponentIntegration({
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2772,
      prNumber: 2999,
      expectedHeadSha: HEAD,
      targetBranch: TARGET,
      expectedTargetHeadSha: TARGET_HEAD,
      componentIntegration: config().componentIntegration,
      collectState: async () => {
        collections += 1;
        return {
          ok: true,
          state: executionState({
            targetHeadSha: collections === 1 ? TARGET_HEAD : OTHER,
          }),
        };
      },
      mergePullRequest: async () => {
        mutations += 1;
        return { ok: true, merged: true, mergeSha: MERGE };
      },
      verifyTargetContainsSha: async () => ({ ok: true, contains: true }),
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe('expected_target_head_drift');
    expect(result.mutations).toBe(0);
    expect(mutations).toBe(0);
  });

  it('blocks source-authorization author drift between rereads before merge mutation', async () => {
    let collections = 0;
    let mutations = 0;
    const result = await executeComponentIntegration({
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2772,
      prNumber: 2999,
      expectedHeadSha: HEAD,
      targetBranch: TARGET,
      expectedTargetHeadSha: TARGET_HEAD,
      componentIntegration: {
        ...config().componentIntegration,
        trustedIntegrationAuthors: ['wdhunter645', 'chatgpt-atlas'],
      },
      collectState: async () => {
        collections += 1;
        return {
          ok: true,
          state:
            collections === 1
              ? protectedExecutionState({ comments: [sourceAuthorizationComment()] })
              : protectedExecutionState({
                  comments: [sourceAuthorizationComment({ author: 'chatgpt-atlas' })],
                }),
        };
      },
      mergePullRequest: async () => {
        mutations += 1;
        return { ok: true, merged: true, mergeSha: MERGE };
      },
      verifyTargetContainsSha: async () => ({ ok: true, contains: true }),
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe('integration_expected_state_drift');
    expect(result.mutations).toBe(0);
    expect(mutations).toBe(0);
  });

  it('blocks source-authorization body head or target drift between rereads before merge mutation', async () => {
    const cases = [
      {
        name: 'head',
        comment: sourceAuthorizationComment({ headSha: OTHER }),
      },
      {
        name: 'target',
        comment: sourceAuthorizationComment({ targetBranch: 'component/other-target' }),
      },
    ];
    for (const item of cases) {
      let collections = 0;
      let mutations = 0;
      const result = await executeComponentIntegration({
        repository: 'wdhunter645/next-starter-template',
        issueNumber: 2772,
        prNumber: 2999,
        expectedHeadSha: HEAD,
        targetBranch: TARGET,
        expectedTargetHeadSha: TARGET_HEAD,
        componentIntegration: config().componentIntegration,
        collectState: async () => {
          collections += 1;
          return {
            ok: true,
            state:
              collections === 1
                ? protectedExecutionState({ comments: [sourceAuthorizationComment()] })
                : protectedExecutionState({ comments: [item.comment] }),
          };
        },
        mergePullRequest: async () => {
          mutations += 1;
          return { ok: true, merged: true, mergeSha: MERGE };
        },
        verifyTargetContainsSha: async () => ({ ok: true, contains: true }),
      });
      expect(result.ok, item.name).toBe(false);
      expect(result.code, item.name).toBe('integration_expected_state_drift');
      expect(result.mutations, item.name).toBe(0);
      expect(mutations, item.name).toBe(0);
    }
  });

  it('requires every expected-state identity before collection', async () => {
    let collections = 0;
    const result = await executeComponentIntegration({
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2772,
      prNumber: 2999,
      expectedHeadSha: HEAD,
      targetBranch: TARGET,
      expectedTargetHeadSha: '',
      componentIntegration: config().componentIntegration,
      collectState: async () => {
        collections += 1;
        return { ok: true, state: executionState() };
      },
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe('missing_expected_target_head_sha');
    expect(collections).toBe(0);
  });

  it('collects required check-runs across paginated GitHub check-run pages', async () => {
    const collected = await collectGitHubIntegrationState({
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2772,
      prNumber: 2999,
      targetBranch: TARGET,
      token: 'test-token',
      fetchFn: paginatedIntegrationFetch(),
    });
    expect(collected.ok).toBe(true);
    expect(collected.state.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'quality',
          status: 'completed',
          conclusion: 'success',
          headSha: HEAD,
        }),
      ]),
    );
  });

  it('fails closed when check-run pagination is malformed or incomplete', async () => {
    const malformed = await collectGitHubIntegrationState({
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2772,
      prNumber: 2999,
      targetBranch: TARGET,
      token: 'test-token',
      fetchFn: paginatedIntegrationFetch({ malformedCheckPage: 2 }),
    });
    expect(malformed.ok).toBe(false);
    expect(malformed.code).toBe('live_evidence_unavailable');
    expect(malformed.message).toContain('check-runs response did not include a check_runs array');

    const incomplete = await collectGitHubIntegrationState({
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2772,
      prNumber: 2999,
      targetBranch: TARGET,
      token: 'test-token',
      fetchFn: paginatedIntegrationFetch({ incompleteCheckRuns: true }),
    });
    expect(incomplete.ok).toBe(false);
    expect(incomplete.code).toBe('live_evidence_unavailable');
    expect(incomplete.message).toContain('check-runs pagination incomplete');
  });

  it('fails closed when post-merge source-Issue state is unavailable', async () => {
    let collections = 0;
    let mutations = 0;
    const result = await executeComponentIntegration({
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2772,
      prNumber: 2999,
      expectedHeadSha: HEAD,
      targetBranch: TARGET,
      expectedTargetHeadSha: TARGET_HEAD,
      componentIntegration: config().componentIntegration,
      collectState: async () => {
        collections += 1;
        return {
          ok: true,
          state:
            collections < 3
              ? executionState()
              : executionState({
                  sourceIssue: { number: 2772, body: 'state unavailable' },
                  pullRequest: {
                    ...executionState().pullRequest,
                    state: 'CLOSED',
                    merged: true,
                    mergeSha: MERGE,
                  },
                }),
        };
      },
      mergePullRequest: async () => {
        mutations += 1;
        return { ok: true, merged: true, mergeSha: MERGE };
      },
      verifyTargetContainsSha: async () => ({ ok: true, contains: true }),
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe('source_issue_state_unavailable_after_merge');
    expect(result.mutations).toBe(1);
    expect(mutations).toBe(1);
  });
});

function protectedExecutionState(overrides = {}) {
  return executionState({
    pullRequest: {
      ...executionState().pullRequest,
      body: `- **Issue:** #2772
- Delivery model: B-child
- Target environment: component
- Approval profile: protected-change-review
- Gate profile: component-child
- Component branch: ${TARGET}
- Component master: #2677`,
    },
    ...overrides,
  });
}

function sourceAuthorizationComment({
  id = 'auth-1',
  author = 'wdhunter645',
  headSha = HEAD,
  targetBranch = TARGET,
} = {}) {
  return {
    id,
    author: { login: author },
    body: `APPROVED FOR INTEGRATION
Issue: #2772
PR: #2999
Head SHA: ${headSha}
Target branch: ${targetBranch}`,
  };
}

function paginatedIntegrationFetch({
  malformedCheckPage = null,
  incompleteCheckRuns = false,
} = {}) {
  const fillerChecks = Array.from({ length: 100 }, (_, index) => ({
    name: `advisory-${index}`,
    status: 'completed',
    conclusion: 'success',
    head_sha: HEAD,
  }));
  const payload = (value) =>
    new Response(JSON.stringify(value), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  return async (url, options = {}) => {
    const parsed = new URL(url);
    if (parsed.hostname === 'api.github.com' && parsed.pathname === '/graphql') {
      return payload({
        data: {
          repository: {
            pullRequest: {
              reviewThreads: {
                pageInfo: { hasNextPage: false, endCursor: null },
                nodes: [],
              },
            },
          },
        },
      });
    }
    if (parsed.pathname.endsWith('/issues/2772')) {
      return payload({ number: 2772, state: 'open', body: 'source issue body' });
    }
    if (parsed.pathname.endsWith('/pulls/2999')) {
      return payload({
        number: 2999,
        state: 'open',
        merged: false,
        merge_commit_sha: null,
        body: executionState().pullRequest.body,
        head: { sha: HEAD },
        base: { ref: TARGET },
        user: { login: 'builder' },
      });
    }
    if (parsed.pathname.includes('/git/ref/heads/')) {
      return payload({ object: { sha: TARGET_HEAD } });
    }
    if (parsed.pathname.includes(`/commits/${HEAD}/check-runs`)) {
      const page = Number(parsed.searchParams.get('page') || '1');
      if (page === malformedCheckPage) return payload({ total_count: 101 });
      if (page === 1) {
        return payload({
          total_count: 101,
          check_runs: incompleteCheckRuns ? fillerChecks.slice(0, 50) : fillerChecks,
        });
      }
      return payload({
        total_count: 101,
        check_runs: [
          {
            name: 'quality',
            status: 'completed',
            conclusion: 'success',
            head_sha: HEAD,
          },
        ],
      });
    }
    if (parsed.pathname.endsWith('/pulls/2999/reviews')) return payload([]);
    if (parsed.pathname.endsWith('/issues/2772/comments')) return payload([]);
    throw new Error(`Unexpected fetch ${options.method || 'GET'} ${url}`);
  };
}
