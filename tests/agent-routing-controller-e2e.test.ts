// @ts-nocheck -- Runtime contract suite exercises untyped JavaScript controller modules.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  loadControllerConfig,
  resolveMutationSwitches,
  runController,
} from '../scripts/agent-routing/controller.mjs';
import { runReconciliation } from '../scripts/agent-routing/reconcile.mjs';
import {
  buildIntegrationIdentity,
  buildReconciliationIdentity,
  identityMarker,
} from '../scripts/agent-routing/lib/idempotency.mjs';
import { evaluateCloseoutSuccessorTransaction } from '../scripts/agent-routing/lib/child-closeout.mjs';
import { DISPOSITION_CLASSES } from '../scripts/agent-routing/lib/disposition.mjs';
import { collectLiveGitHubEvidence } from '../scripts/agent-routing/lib/evidence-collector.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.join(__dirname, 'fixtures/agent-routing');

const HEAD = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const MERGE = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const STALE = 'cccccccccccccccccccccccccccccccccccccccc';
const TARGET = 'component/content-collection-phase1';

function readFixture(name: string) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, name), 'utf8'));
}

function launchPackageBody(number: number, successor = number + 1): string {
  return `Parent Project: #2431
Predecessor: #${number - 1}
Successor: #${successor}
Implementation Agent: Cursor Local
Runtime: local
Delivery Model: Model B child
Project branch / PR target: \`${TARGET}\`
Working branch: \`cursor/${number}-work\`

## Exact file-touch allowlist

- \`scripts/example.mjs\`

## Acceptance criteria

- [x] Fixture acceptance is explicit.

## Validation

- \`npm test\`

## Rollback

Revert the task PR.

## Stop point

Open one PR and stop.
`;
}

function baseLive({
  approvalProfile = 'component-auto-integration',
  headSha = HEAD,
  threads = [],
  reviews = [],
  comments = [],
  checks = null,
  prAuthor = 'builder',
  collectedAt = '2026-07-24T12:00:00Z',
} = {}) {
  const trigger = {
    id: '5029000001',
    createdAt: '2026-07-20T18:00:00Z',
    author: { login: 'wdhunter645' },
    body: 'CHATGPT HANDOFF\nIssue: #2433\nPR: #2675',
  };
  return {
    live: {
      collectedAt,
      source: 'github-native',
      finalReread: true,
      sourceIssue: {
        number: 2433,
        state: 'OPEN',
        title: 'TASK: CC-001',
        body: launchPackageBody(2433),
        labels: ['agent:cursor', 'handoff:ready'],
      },
      pullRequest: {
        number: 2675,
        title: 'docs(#2433)',
        state: 'open',
        body: `- **Issue:** #2433
- Delivery model: B-child
- Target environment: component
- Approval profile: ${approvalProfile}
- Gate profile: component-child
- Component branch: ${TARGET}
- Component master: #2431`,
        baseRefName: TARGET,
        headRefName: 'cursor/2433-cc-001-contract-freeze-2e48',
        headSha,
        head: { sha: headSha },
        author: prAuthor,
        user: { login: prAuthor },
        url: 'https://github.com/wdhunter645/next-starter-template/pull/2675',
      },
      headSha,
      changedFiles: ['docs/a.md'],
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

function closeoutInputs(fixture) {
  return {
    sourceIssue: {
      number: fixture.sourceIssueNumber,
      state: 'OPEN',
      title: 'TASK: CC-001',
      body: launchPackageBody(fixture.sourceIssueNumber, fixture.successorIssueNumber),
      labels: ['agent:cursor', 'handoff:ready', 'status:post-merge-verify'],
    },
    parentIssue: {
      number: 2431,
      state: 'OPEN',
      title: 'PROJECT',
      body: 'Project authority: execute #2433 before activating successor #2434.',
      labels: ['pmo:active'],
    },
    successorIssue: {
      number: fixture.successorIssueNumber,
      state: 'OPEN',
      title: 'TASK: CC-002',
      body: launchPackageBody(fixture.successorIssueNumber),
      labels: ['status:blocked', 'team:engineering'],
    },
    pullRequest: {
      number: fixture.prNumber,
      state: 'closed',
      merged: true,
      merge_commit_sha: fixture.mergeSha,
      body: `- **Issue:** #${fixture.sourceIssueNumber}\n`,
      head: { sha: fixture.headSha },
      base: { ref: fixture.targetBranch },
    },
    sourceComments: [
      {
        id: 9001,
        author: { login: 'wdhunter645' },
        body: `APPROVED FOR CLOSEOUT
Issue: #${fixture.sourceIssueNumber}
PR: #${fixture.prNumber}
Head SHA: ${fixture.headSha}
Target branch: ${fixture.targetBranch}
Integration SHA: ${fixture.mergeSha}
Successor: #${fixture.successorIssueNumber}
Review disposition: accepted
Integration verification: verified
Status: closeout and successor activation authorized`,
      },
    ],
    parentComments: [],
    successorComments: [
      {
        id: 9002,
        author: { login: 'wdhunter645' },
        body: `CHATGPT RESPONSE
Issue: #${fixture.successorIssueNumber}
Disposition: APPROVED TO IMPLEMENT`,
      },
    ],
    targetContainsIntegrationSha: true,
    expected: {
      sourceIssueNumber: fixture.sourceIssueNumber,
      prNumber: fixture.prNumber,
      headSha: fixture.headSha,
      targetBranch: fixture.targetBranch,
      integrationSha: fixture.mergeSha,
      successorIssueNumber: fixture.successorIssueNumber,
    },
    config: loadControllerConfig().closeoutSuccessor,
  };
}

describe('agent-routing controller e2e (#2774)', () => {
  it('completes the #2433 → #2434 fixture through exactly one successor wake', () => {
    const fixture = readFixture('2433-2434.json');
    const clean = runController(baseLive({ approvalProfile: fixture.approvalProfile }));
    expect(clean.ok).toBe(true);
    expect(clean.remediation.classification.classification).toBe(DISPOSITION_CLASSES.CLEAN);
    expect(clean.integration.ok).toBe(true);
    expect(clean.integration.eligible).toBe(true);
    expect(clean.integration.actions).toHaveLength(1);
    expect(clean.observability.events.some((event) => event.kind === 'handoff_received')).toBe(
      true,
    );
    expect(clean.observability.events.some((event) => event.kind === 'evidence_complete')).toBe(
      true,
    );
    expect(clean.observability.events.some((event) => event.kind === 'integration')).toBe(true);

    const verified = runController({
      ...baseLive({ approvalProfile: fixture.approvalProfile }),
      recordedMergeSha: fixture.mergeSha,
      targetBranchContainsMergeSha: true,
      targetBranchHeadSha: fixture.mergeSha,
    });
    expect(verified.verification.verified).toBe(true);
    expect(verified.observability.events.some((event) => event.kind === 'verification')).toBe(
      true,
    );

    const closeout = evaluateCloseoutSuccessorTransaction(closeoutInputs(fixture));
    expect(closeout.ok).toBe(true);
    expect(closeout.eligible).toBe(true);
    expect(closeout.successorIssueNumber).toBe(fixture.successorIssueNumber);

    const wakeCount = closeout.ok && closeout.eligible ? 1 : 0;
    expect(wakeCount).toBe(fixture.expectedSuccessorWakes);
  });

  it('passes clean, bounded-remediation, late-review, duplicate, stale-event, and protected-stop fixtures', async () => {
    const clean = runController(baseLive());
    expect(clean.remediation.classification.classification).toBe(DISPOSITION_CLASSES.CLEAN);

    const lateFixture = readFixture('late-review.json');
    const lateFindingIdentity = `review-thread:${lateFixture.lateReview.id}`;
    const late = runController(
      baseLive({
        threads: [lateFixture.lateReview],
        comments: [
          {
            id: '5066000001',
            createdAt: '2026-07-24T13:00:00Z',
            author: { login: 'wdhunter645' },
            body: `ADJUSTMENT
Status: bounded correction authorized
PR: #2675
Head SHA: ${HEAD}
Finding identity: ${lateFindingIdentity}
Decision class: implementation
Disposition revision: 1
Requested action:
- Correct only the bounded late-review defect.`,
          },
        ],
      }),
    );
    expect(late.remediation.classification.classification).toBe(
      DISPOSITION_CLASSES.BOUNDED_CORRECTION,
    );
    expect(late.integration.ok).toBe(false);

    const protectedFixture = readFixture('protected-stop.json');
    const protectedResult = runController(
      baseLive({
        threads: [protectedFixture.protectedFinding],
      }),
    );
    expect(protectedResult.remediation.classification.classification).toBe(
      DISPOSITION_CLASSES.PROTECTED_STOP,
    );
    expect(protectedResult.integration.ok).toBe(false);
    expect(
      protectedResult.observability.events.some((event) => event.kind === 'escalation'),
    ).toBe(true);

    const identity = buildIntegrationIdentity({
      sourceIssueNumber: 2433,
      prNumber: 2675,
      headSha: HEAD,
      targetBranch: TARGET,
      integrationDisposition: 'clean',
      mergeSha: 'pending',
    });
    const duplicateFixture = readFixture('duplicate-events.json');
    const duplicateInput = baseLive({
      comments: [
        {
          id: '7001',
          author: { login: 'github-actions[bot]' },
          body: `Integration recorded\n${identityMarker('integration', identity)}`,
        },
      ],
    });
    const first = runController(duplicateInput);
    expect(first.integration.ok).toBe(true);
    expect(first.integration.suppressed).toBe(true);
    expect(first.integration.code).toBe('integration_already_recorded');
    expect(first.integration.eligible).toBe(false);
    expect(
      first.observability.events.some(
        (event) =>
          event.kind === 'duplicate_suppression' && event.outcome === 'integration',
      ),
    ).toBe(true);
    expect(
      first.observability.events.some(
        (event) =>
          event.kind === 'mutation_disabled' &&
          event.code === 'component_integration_mutation_disabled',
      ),
    ).toBe(false);

    const reconcileDup = await runReconciliation({
      ...duplicateInput,
      now: '2026-07-24T20:00:00Z',
    });
    expect(reconcileDup.mutations).toBe(0);
    expect(reconcileDup.duplicate || reconcileDup.suppressed).toBe(true);
    expect(duplicateFixture.expectedDuplicateSuppression).toBe(true);

    const staleHead = runController(baseLive({ headSha: STALE }));
    // Stale head creates a distinct disposition path; prior HEAD markers must not apply.
    expect(staleHead.packet.pullRequest.headSha).toBe(STALE);
    expect(staleHead.packet.idempotency.key.headSha).toBe(STALE);
  });

  it('prevents event-driven and reconciliation paths from duplicating integration/closeout/successor', async () => {
    const identity = buildIntegrationIdentity({
      sourceIssueNumber: 2433,
      prNumber: 2675,
      headSha: HEAD,
      targetBranch: TARGET,
      integrationDisposition: 'clean',
      mergeSha: MERGE,
    });
    const live = baseLive({
      comments: [
        {
          id: '7100',
          author: { login: 'github-actions[bot]' },
          body: `Already integrated\n${identityMarker('integration', identity)}`,
        },
      ],
    });
    const eventDriven = runController({
      ...live,
      recordedMergeSha: MERGE,
      targetBranchContainsMergeSha: true,
    });
    const reconciled = await runReconciliation({
      ...live,
      recordedMergeSha: MERGE,
      targetBranchContainsMergeSha: true,
      now: '2026-07-24T20:00:00Z',
    });

    expect(eventDriven.ok).toBe(true);
    expect(reconciled.ok).toBe(true);
    expect(reconciled.mutations).toBe(0);
    expect(reconciled.path).toBe('reconciliation');
    expect(reconciled.duplicate || reconciled.suppressed).toBe(true);
    expect(reconciled.recommendedPath || 'event-driven').toBe('event-driven');

    const reconId = buildReconciliationIdentity({
      sourceIssueNumber: 2433,
      prNumber: 2675,
      headSha: HEAD,
      actionIdentity: eventDriven.packet.idempotency.actionIdentity,
    });
    expect(reconciled.reconciliationIdentity).toContain('reconcile:issue:2433');
    expect(typeof reconId).toBe('string');
  });

  it('preserves blocker, duplicate, and eligible semantics when integration mutation is disabled', () => {
    const config = loadControllerConfig();
    const disabled = {
      ...config,
      mutationSwitches: {
        remediationInstructions: false,
        componentIntegration: false,
        closeoutSuccessor: false,
        reconciliationMutations: false,
      },
      componentIntegration: {
        ...config.componentIntegration,
        enabled: true,
      },
      closeoutSuccessor: {
        ...config.closeoutSuccessor,
        enabled: true,
      },
    };
    expect(resolveMutationSwitches(disabled).diagnosticsOnly).toBe(true);

    // 1) Eligible/actionable → mutation-disabled suppression only.
    const eligible = runController(baseLive(), disabled);
    expect(eligible.diagnosticsOnly).toBe(true);
    expect(eligible.remediation.actions).toEqual([]);
    expect(eligible.integration.ok).toBe(true);
    expect(eligible.integration.eligible).toBe(true);
    expect(eligible.integration.suppressed).toBe(true);
    expect(eligible.integration.mutationDisabled).toBe(true);
    expect(eligible.integration.code).toBe('component_integration_mutation_disabled');
    expect(eligible.integration.actions).toEqual([]);
    expect(eligible.integration.underlyingEligible).toBe(true);
    expect(
      eligible.observability.events.some(
        (event) =>
          event.kind === 'mutation_disabled' &&
          event.outcome === 'integration' &&
          event.code === 'component_integration_mutation_disabled',
      ),
    ).toBe(true);
    expect(
      eligible.observability.events.some(
        (event) =>
          event.kind === 'duplicate_suppression' &&
          event.code === 'component_integration_mutation_disabled',
      ),
    ).toBe(false);

    // 2) Real blocker/error → fail-closed blocker remains (not relabeled mutation-disabled).
    const protectedFixture = readFixture('protected-stop.json');
    const blocked = runController(
      baseLive({
        threads: [protectedFixture.protectedFinding],
      }),
      disabled,
    );
    expect(blocked.integration.ok).toBe(false);
    expect(blocked.integration.eligible).toBe(false);
    expect(blocked.integration.mutationDisabled).toBe(false);
    expect(blocked.integration.code).not.toBe('component_integration_mutation_disabled');
    expect(blocked.integration.code).toBeTruthy();
    expect(blocked.integration.actions).toEqual([]);
    expect(blocked.integration.mutationSwitchDisabled).toBe(true);
    expect(blocked.integration.underlyingCode).toBe(blocked.integration.code);
    expect(
      blocked.observability.events.some(
        (event) =>
          event.kind === 'integration' && event.outcome === 'blocked',
      ),
    ).toBe(true);
    expect(
      blocked.observability.events.some(
        (event) =>
          event.kind === 'mutation_disabled' &&
          event.code === 'component_integration_mutation_disabled',
      ),
    ).toBe(false);

    // 3) Duplicate/already-recorded → duplicate semantics remain intact.
    const identity = buildIntegrationIdentity({
      sourceIssueNumber: 2433,
      prNumber: 2675,
      headSha: HEAD,
      targetBranch: TARGET,
      integrationDisposition: 'clean',
      mergeSha: 'pending',
    });
    const duplicate = runController(
      baseLive({
        comments: [
          {
            id: '7201',
            author: { login: 'github-actions[bot]' },
            body: `Integration recorded\n${identityMarker('integration', identity)}`,
          },
        ],
      }),
      disabled,
    );
    expect(duplicate.integration.ok).toBe(true);
    expect(duplicate.integration.eligible).toBe(false);
    expect(duplicate.integration.suppressed).toBe(true);
    expect(duplicate.integration.code).toBe('integration_already_recorded');
    expect(duplicate.integration.mutationDisabled).toBe(false);
    expect(duplicate.integration.actions).toEqual([]);
    expect(duplicate.integration.mutationSwitchDisabled).toBe(true);
    expect(duplicate.integration.underlyingCode).toBe('integration_already_recorded');
    expect(
      duplicate.observability.events.some(
        (event) =>
          event.kind === 'duplicate_suppression' &&
          event.outcome === 'integration' &&
          event.code === 'integration_already_recorded',
      ),
    ).toBe(true);
    expect(
      duplicate.observability.events.some(
        (event) =>
          event.kind === 'mutation_disabled' &&
          event.code === 'component_integration_mutation_disabled',
      ),
    ).toBe(false);
  });

  it('emits structured observability for required transitions', () => {
    const enabled = runController(baseLive());
    const kinds = new Set(enabled.observability.events.map((event) => event.kind));
    expect(kinds.has('handoff_received')).toBe(true);
    expect(kinds.has('evidence_complete')).toBe(true);
    expect(kinds.has('disposition')).toBe(true);
    expect(kinds.has('integration')).toBe(true);
  });

  it('proves collector-to-controller protected review identity path', async () => {
    let prReads = 0;
    const fetchFn = async (url: string) => {
      const apiPath = String(url).replace(
        'https://api.github.com/repos/wdhunter645/next-starter-template',
        '',
      );
      if (String(url).includes('api.github.com/graphql')) {
        return {
          ok: true,
          status: 200,
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
      if (apiPath === '/issues/2433') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            number: 2433,
            state: 'open',
            title: 'TASK: CC-001',
            body: launchPackageBody(2433),
            labels: [{ name: 'docs' }],
          }),
          text: async () => '',
        };
      }
      if (apiPath === '/pulls/2675') {
        prReads += 1;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            number: 2675,
            title: 'docs(#2433)',
            state: 'open',
            body: `- **Issue:** #2433
- Delivery model: B-child
- Target environment: component
- Approval profile: protected-change-review
- Gate profile: component-child
- Component branch: ${TARGET}
- Component master: #2431`,
            base: { ref: TARGET },
            head: { ref: 'cursor/2433', sha: HEAD },
            user: { login: 'builder' },
            html_url: 'https://github.com/wdhunter645/next-starter-template/pull/2675',
          }),
          text: async () => '',
        };
      }
      if (apiPath.startsWith('/pulls/2675/files')) {
        return { ok: true, status: 200, json: async () => [{ filename: 'docs/a.md' }], text: async () => '' };
      }
      if (apiPath.startsWith('/issues/2433/comments')) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            {
              id: 5029000001,
              created_at: '2026-07-20T18:00:00Z',
              user: { login: 'wdhunter645' },
              body: 'CHATGPT HANDOFF\nIssue: #2433\nPR: #2675',
            },
          ],
          text: async () => '',
        };
      }
      if (apiPath.startsWith('/pulls/2675/reviews')) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            {
              id: 91,
              state: 'APPROVED',
              user: { login: 'chatgpt-atlas' },
              submitted_at: '2026-07-20T19:00:00Z',
              body: 'LGTM',
              commit_id: HEAD,
            },
          ],
          text: async () => '',
        };
      }
      if (apiPath.includes('/check-runs')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            total_count: 1,
            check_runs: [
              {
                name: 'quality',
                status: 'completed',
                conclusion: 'success',
                head_sha: HEAD,
                completed_at: '2026-07-20T18:45:00Z',
              },
            ],
          }),
          text: async () => '',
        };
      }
      return { ok: false, status: 404, text: async () => 'missing', json: async () => ({}) };
    };

    const collected = await collectLiveGitHubEvidence({
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2433,
      prNumber: 2675,
      token: 'test-token',
      fetchFn,
    });
    expect(collected.ok).toBe(true);
    expect(prReads).toBeGreaterThanOrEqual(2);
    expect(collected.live.pullRequest.author).toBe('builder');
    expect(collected.live.reviewSubmissions[0].commit_id).toBe(HEAD);

    const accepted = runController({
      live: collected.live,
      triggerComment: collected.live.issueComments[0],
      observabilitySource: 'event-driven',
    });
    expect(accepted.integration.ok).toBe(true);
    expect(accepted.integration.eligible).toBe(true);
    expect(accepted.integration.authority.kind).toBe('independent_review');

    const failClosedCases = [
      {
        name: 'self-review',
        mutate(live) {
          live.reviewSubmissions[0].author = { login: 'builder' };
        },
      },
      {
        name: 'missing-pr-author',
        mutate(live) {
          live.pullRequest.author = null;
          live.pullRequest.user = { login: null };
        },
      },
      {
        name: 'stale-commit',
        mutate(live) {
          live.reviewSubmissions[0].commit_id = STALE;
          live.reviewSubmissions[0].commitId = STALE;
          live.reviewSubmissions[0].headSha = STALE;
        },
      },
      {
        name: 'headless-review',
        mutate(live) {
          live.reviewSubmissions[0].commit_id = null;
          live.reviewSubmissions[0].commitId = null;
          live.reviewSubmissions[0].headSha = null;
        },
      },
    ];

    for (const testCase of failClosedCases) {
      const live = structuredClone(collected.live);
      testCase.mutate(live);
      const result = runController({
        live,
        triggerComment: live.issueComments[0],
      });
      expect(result.integration.ok, testCase.name).toBe(false);
      expect(result.integration.code, testCase.name).toBe('missing_independent_review');
    }
  });

  it('refuses main mutation and keeps reconciliation non-mutating', async () => {
    const mainTarget = runController(
      baseLive({
        // force base to main via live PR body/base
      }),
    );
    // Default fixture targets component/*; explicit main base must fail closed.
    const blocked = runController({
      ...baseLive(),
      live: {
        ...baseLive().live,
        pullRequest: {
          ...baseLive().live.pullRequest,
          baseRefName: 'main',
          body: `- **Issue:** #2433
- Delivery model: B-child
- Target environment: production
- Approval profile: chat-bill-production
- Gate profile: production-candidate
- Component branch: not-applicable`,
        },
      },
    });
    expect(blocked.ok === false || blocked.integration?.ok === false).toBe(true);

    const config = loadControllerConfig();
    expect(config.mutationAllowed).toBe(false);
    expect(config.reconciliation.mutationAllowed).toBe(false);
    expect(config.mutationSwitches.reconciliationMutations).toBe(false);
    expect(config.componentIntegration.allowMain).toBe(false);
    expect(config.workflowCapabilities.mutateMain).toBe(false);

    const reconcile = await runReconciliation(baseLive());
    expect(reconcile.mutations).toBe(0);
    expect(reconcile.diagnosticsOnly).toBe(true);
    expect(mainTarget.ok).toBe(true);
  });
});
