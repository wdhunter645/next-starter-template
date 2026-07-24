// @ts-nocheck -- Runtime contract suite exercises untyped JavaScript controller modules.
import { describe, expect, it } from 'vitest';

import {
  loadControllerConfig,
  runController,
} from '../scripts/agent-routing/controller.mjs';
import {
  evaluateComponentIntegrationTransaction,
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
});
