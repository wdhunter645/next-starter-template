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
      author: 'builder',
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
        user: { login: 'builder' },
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

  it('blocks untrusted, self, and missing-author protected approvals', () => {
    const cases = [
      {
        name: 'untrusted',
        pullRequest: null,
        reviews: [
          {
            id: 'review-untrusted',
            state: 'APPROVED',
            commit_id: HEAD,
            author: { login: 'unknown-reviewer' },
          },
        ],
      },
      {
        name: 'self',
        pullRequest: null,
        reviews: [
          {
            id: 'review-self',
            state: 'APPROVED',
            commit_id: HEAD,
            author: { login: 'builder' },
          },
        ],
      },
      {
        name: 'missing-author',
        pullRequest: {
          ...cleanPacket().pullRequest,
          author: '',
          deliveryProfile: {
            ...cleanPacket().pullRequest.deliveryProfile,
            approvalProfile: 'protected-change-review',
          },
        },
        reviews: [
          {
            id: 'review-trusted',
            state: 'APPROVED',
            commit_id: HEAD,
            author: { login: 'chatgpt-atlas' },
          },
        ],
      },
    ];
    for (const testCase of cases) {
      const packet = cleanPacket({
        pullRequest: testCase.pullRequest || {
          ...cleanPacket().pullRequest,
          deliveryProfile: {
            ...cleanPacket().pullRequest.deliveryProfile,
            approvalProfile: 'protected-change-review',
          },
        },
      });
      const blocked = evaluateComponentIntegrationTransaction({
        packet,
        classification: DISPOSITION_CLASSES.CLEAN,
        reviewSubmissions: testCase.reviews,
        requiredChecks: ['quality'],
        componentIntegration: config().componentIntegration,
        observedTargetBranch: TARGET,
      });
      expect(blocked.ok, testCase.name).toBe(false);
      expect(blocked.actions, testCase.name).toEqual([]);
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

  it('blocks untrusted, bare, incomplete, and wrong-target source authorizations', () => {
    const completeAuthorization = `APPROVED FOR INTEGRATION
Issue: #2772
PR: #2999
Head SHA: ${HEAD}
Target branch: ${TARGET}
Status: component integration authorized`;
    const cases = [
      {
        name: 'untrusted',
        author: 'unknown-author',
        body: completeAuthorization,
      },
      {
        name: 'bare',
        author: 'wdhunter645',
        body: 'APPROVED FOR INTEGRATION',
      },
      {
        name: 'incomplete',
        author: 'wdhunter645',
        body: `APPROVED FOR INTEGRATION
Issue: #2772
PR: #2999
Head SHA: ${HEAD}
Status: component integration authorized`,
      },
      {
        name: 'wrong-target',
        author: 'wdhunter645',
        body: completeAuthorization.replace(TARGET, 'component/other-target'),
      },
    ];
    for (const testCase of cases) {
      const result = runController(
        liveCleanInput({
          approvalProfile: 'protected-change-review',
          comments: [
            {
              id: `auth-${testCase.name}`,
              createdAt: '2026-07-24T04:25:00Z',
              author: { login: testCase.author },
              body: testCase.body,
            },
          ],
        }),
        config(),
      );
      expect(result.integration.ok, testCase.name).toBe(false);
      expect(result.integration.code, testCase.name).toBe('missing_independent_review');
      expect(result.integration.actions, testCase.name).toEqual([]);
    }
  });

  it('accepts complete trusted source-Issue authorization for protected profile', () => {
    const result = runController(
      liveCleanInput({
        approvalProfile: 'protected-change-review',
        comments: [
          {
            id: 'auth-complete',
            createdAt: '2026-07-24T04:25:00Z',
            author: { login: 'wdhunter645' },
            body: `APPROVED FOR INTEGRATION
Issue: #2772
PR: #2999
Head SHA: ${HEAD}
Target branch: ${TARGET}
Status: component integration authorized`,
          },
        ],
      }),
      config(),
    );
    expect(result.integration.ok).toBe(true);
    expect(result.integration.eligible).toBe(true);
    expect(result.integration.authority.kind).toBe('source_issue_authorization');
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
  it('collects all check-run pages before evaluating required checks', async () => {
    const fetchFn = async (url, options = {}) => {
      const text = async () => '';
      if (String(url).endsWith('/graphql')) {
        return {
          ok: true,
          text,
          json: async () => ({
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
          }),
        };
      }
      const request = new URL(String(url));
      const pathName = request.pathname;
      if (pathName.endsWith('/issues/2772')) {
        return {
          ok: true,
          text,
          json: async () => ({ number: 2772, state: 'open', body: 'source issue' }),
        };
      }
      if (pathName.endsWith('/pulls/2999')) {
        return {
          ok: true,
          text,
          json: async () => ({
            number: 2999,
            state: 'open',
            merged: false,
            body: executionState().pullRequest.body,
            head: { sha: HEAD },
            base: { ref: TARGET },
            user: { login: 'builder' },
          }),
        };
      }
      if (pathName.includes('/git/ref/heads/')) {
        return {
          ok: true,
          text,
          json: async () => ({ object: { sha: TARGET_HEAD } }),
        };
      }
      if (pathName.includes(`/commits/${HEAD}/check-runs`)) {
        const page = Number(request.searchParams.get('page') || '1');
        const checkRuns =
          page === 1
            ? Array.from({ length: 100 }, (_, index) => ({
                name: `advisory-${index}`,
                status: 'completed',
                conclusion: 'success',
                head_sha: HEAD,
              }))
            : [
                {
                  name: 'quality',
                  status: 'completed',
                  conclusion: 'success',
                  head_sha: HEAD,
                },
              ];
        return {
          ok: true,
          text,
          json: async () => ({ total_count: 101, check_runs: checkRuns }),
        };
      }
      if (pathName.endsWith('/pulls/2999/reviews')) {
        return { ok: true, text, json: async () => [] };
      }
      if (pathName.endsWith('/issues/2772/comments')) {
        return { ok: true, text, json: async () => [] };
      }
      throw new Error(`unexpected request ${options.method || 'GET'} ${url}`);
    };

    const collected = await collectGitHubIntegrationState({
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2772,
      prNumber: 2999,
      targetBranch: TARGET,
      token: 'token',
      fetchFn,
    });
    expect(collected.ok).toBe(true);
    expect(collected.state.checks).toHaveLength(101);
    expect(collected.state.checks.some((check) => check.name === 'quality')).toBe(true);
  });

  it('performs two rereads, one merge, and exact target verification', async () => {
    let collections = 0;
    let mutations = 0;
    let verifications = 0;
    let postMergeIssueReads = 0;
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
        return { ok: true, state: executionState() };
      },
      mergePullRequest: async () => {
        mutations += 1;
        return { ok: true, merged: true, mergeSha: MERGE };
      },
      verifyTargetContainsSha: async ({ mergeSha }) => {
        verifications += 1;
        return { ok: true, contains: mergeSha === MERGE };
      },
      rereadSourceIssue: async () => {
        postMergeIssueReads += 1;
        return { ok: true, issue: { number: 2772, state: 'OPEN' } };
      },
    });
    expect(result.ok).toBe(true);
    expect(result.integrated).toBe(true);
    expect(result.mergeSha).toBe(MERGE);
    expect(result.targetBranch).toBe(TARGET);
    expect(result.sourceIssueState).toBe('OPEN');
    expect(result.closeout).toBe(false);
    expect(result.successorActivation).toBe(false);
    expect(collections).toBe(2);
    expect(mutations).toBe(1);
    expect(verifications).toBe(1);
    expect(postMergeIssueReads).toBe(1);
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

  it('blocks comment body drift before any merge mutation', async () => {
    let collections = 0;
    let mutations = 0;
    const initialAuthorization = {
      id: 'auth-drift',
      author: { login: 'wdhunter645' },
      body: `APPROVED FOR INTEGRATION
Issue: #2772
PR: #2999
Head SHA: ${HEAD}
Target branch: ${TARGET}
Status: component integration authorized`,
    };
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
            pullRequest: {
              ...executionState().pullRequest,
              body: executionState().pullRequest.body.replace(
                'Approval profile: component-auto-integration',
                'Approval profile: protected-change-review',
              ),
            },
            comments:
              collections === 1
                ? [initialAuthorization]
                : [
                    {
                      ...initialAuthorization,
                      body: `${initialAuthorization.body}\nEdited authority note: still authorized`,
                    },
                  ],
          }),
        };
      },
      mergePullRequest: async () => {
        mutations += 1;
        return { ok: true, merged: true, mergeSha: MERGE };
      },
      verifyTargetContainsSha: async () => ({ ok: true, contains: true }),
      rereadSourceIssue: async () => ({ ok: true, issue: { number: 2772, state: 'OPEN' } }),
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe('integration_expected_state_drift');
    expect(result.mutations).toBe(0);
    expect(mutations).toBe(0);
  });

  it('fails after one merge when post-merge source Issue reread is closed', async () => {
    let mutations = 0;
    const result = await executeComponentIntegration({
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2772,
      prNumber: 2999,
      expectedHeadSha: HEAD,
      targetBranch: TARGET,
      expectedTargetHeadSha: TARGET_HEAD,
      componentIntegration: config().componentIntegration,
      collectState: async () => ({ ok: true, state: executionState() }),
      mergePullRequest: async () => {
        mutations += 1;
        return { ok: true, merged: true, mergeSha: MERGE };
      },
      verifyTargetContainsSha: async () => ({ ok: true, contains: true }),
      rereadSourceIssue: async () => ({ ok: true, issue: { number: 2772, state: 'CLOSED' } }),
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe('post_merge_source_issue_not_open');
    expect(result.mergeSha).toBe(MERGE);
    expect(result.mutations).toBe(1);
    expect(mutations).toBe(1);
  });
});
