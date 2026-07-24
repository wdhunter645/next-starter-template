import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  assertObserveOnlyConfigInvariants,
  loadControllerConfig,
  runObserveController,
} from '../scripts/agent-routing/controller.mjs';
import {
  ALL_HANDOFF_EVENT_MARKERS,
  assertEventAuthority,
  buildActionIdentity,
  classifyDecisionAutomatability,
  detectHandoffEventMarker,
  PROTECTED_DECISION_CLASSES,
} from '../scripts/agent-routing/lib/event-contract.mjs';
import {
  assertCurrentHeadSha,
  assertHintsMatchLive,
  assertValidPrNumber,
  buildEvidencePacket,
  collectLiveGitHubEvidence,
  extractPrimarySourceIssueRefs,
  normalizeChecks,
  resolveExactOpenSourceIssue,
} from '../scripts/agent-routing/lib/evidence-collector.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HEAD_SHA = '95aa88b98c705b3a93edbe2691b8d616ffc2c24b';
const STALE_SHA = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

type FailClosed = { ok: false; code: string; message?: string };
type ObserveSuccess = {
  ok: true;
  packet: {
    mode: string;
    mutationAllowed: boolean;
    sourceIssue: { number: number };
    pullRequest: { number: number; headSha: string; changedFiles: string[] };
    event: { eventType: string; actionIdentity: string };
    checks: Array<{ name: string; headSha?: string }>;
    reviewEvidence: {
      unresolvedReviewThreads: unknown[];
      resolvedReviewThreads: unknown[];
      lateIssueComments: unknown[];
      distinctions: {
        unresolvedThreadsRepresentedSeparately: boolean;
        lateCommentsRepresentedSeparately: boolean;
      };
    };
    protectedBoundaries: {
      classes: string[];
      nonAutomatable: Array<{ nonAutomatable: boolean }>;
    };
    reread: { performed: boolean; source?: string };
  };
};
type ObserveResult = FailClosed | ObserveSuccess;

function asResult(value: unknown): ObserveResult {
  return value as ObserveResult;
}

function fixture2433(overrides: Record<string, unknown> = {}) {
  const handoffCreatedAt = '2026-07-20T18:00:00Z';
  const sourceIssue = {
    number: 2433,
    state: 'OPEN',
    title: 'TASK: CC-001 content asset contract freeze',
    labels: ['agent:cursor', 'handoff:ready', 'docs'],
    body: `## Acceptance Criteria

- [x] CC-001 gap matrix resolved
- [ ] Feature lanes remain blocked until Atlas verifies freeze
`,
  };

  const pullRequest = {
    number: 2675,
    title: 'docs(#2433): CC-001 content asset contract freeze',
    state: 'OPEN',
    baseRefName: 'component/content-collection-phase1',
    headRefName: 'cursor/2433-cc-001-contract-freeze-2e48',
    headSha: HEAD_SHA,
    url: 'https://github.com/wdhunter645/next-starter-template/pull/2675',
    body: `# PR Summary

- **Issue:** #2433
- Intent label: docs-only
- Delivery model: B-child
- Target environment: component
- Approval profile: component-auto-integration
- Gate profile: component-child
- Component branch: component/content-collection-phase1
- Component master: #2431

## Acceptance Criteria

- [x] Docs evidence supports the contract state
- [ ] Freeze verified by Atlas
`,
  };

  const triggerComment = {
    id: '5029000001',
    createdAt: handoffCreatedAt,
    body: `CHATGPT HANDOFF

Issue: #2433
PR: #2675
Branch: cursor/2433-cc-001-contract-freeze-2e48
Head SHA: ${HEAD_SHA}
Status: READY FOR REVIEW
`,
  };

  const checks = [
    {
      name: 'GATE — Quality Checks',
      status: 'completed',
      conclusion: 'success',
      headSha: HEAD_SHA,
    },
    {
      name: 'GATE — Diff Scope',
      status: 'completed',
      conclusion: 'success',
      headSha: HEAD_SHA,
    },
  ];

  const changedFiles = [
    'docs/ops/implementation-plans/content-collection/packages/cc-001-content-asset-model-package.md',
    'docs/reference/content/lgfc-content-candidate-model.md',
    'docs/reference/website/content-inventory-model.md',
    'docs/reference/website/lou-gehrig-content-metadata-schema.md',
    'docs/reference/website/unified-content-workflow.md',
  ];

  const reviewThreads = [
    {
      id: 'PRRT_unresolved_2675',
      isResolved: false,
      isOutdated: false,
      path: 'docs/reference/website/unified-content-workflow.md',
      line: 40,
      body: 'Clarify deferred SEO ownership before freeze verification.',
    },
    {
      id: 'PRRT_resolved_2675',
      isResolved: true,
      isOutdated: false,
      path: 'docs/reference/content/lgfc-content-candidate-model.md',
      line: 12,
      body: 'Nit addressed.',
    },
  ];

  const reviewSubmissions = [
    {
      id: 'PRR_1',
      state: 'COMMENTED',
      author: { login: 'atlas-reviewer' },
      submittedAt: '2026-07-20T18:30:00Z',
      body: 'Actionable clarification required on deferred SEO.',
    },
  ];

  const issueComments = [
    triggerComment,
    {
      id: '5029000002',
      createdAt: '2026-07-20T19:00:00Z',
      author: { login: 'wdhunter645' },
      body: 'Late note after handoff: keep feature lanes blocked.',
    },
  ];

  const live = {
    collectedAt: '2026-07-20T19:05:00Z',
    source: 'github-native',
    sourceIssue,
    pullRequest,
    headSha: HEAD_SHA,
    checks,
    changedFiles,
    reviewThreads,
    reviewSubmissions,
    issueComments,
  };

  return {
    sourceIssue,
    pullRequest,
    triggerComment,
    observedHeadSha: HEAD_SHA,
    changedFiles,
    checks,
    reviewThreads,
    reviewSubmissions,
    issueComments,
    // Caller-supplied reread is a hint only; authoritative state is live.
    reread: {
      at: '2026-07-20T19:05:00Z',
      sourceIssue,
      pullRequest,
    },
    live,
    ...overrides,
  };
}

describe('agent routing event contract', () => {
  it('recognizes canonical and legacy adapter markers without treating labels as authority', () => {
    expect(detectHandoffEventMarker('IMPLEMENTATION HANDOFF\nIssue: #1')?.eventType).toBe(
      'implementation_handoff',
    );
    expect(detectHandoffEventMarker('PR REVIEW REQUEST\nIssue: #1')?.eventType).toBe(
      'pr_review_request',
    );
    expect(detectHandoffEventMarker('CHATGPT HANDOFF\nIssue: #1')?.adapter).toBe(true);
    expect(ALL_HANDOFF_EVENT_MARKERS).toEqual([
      'IMPLEMENTATION HANDOFF',
      'PR REVIEW REQUEST',
      'CHATGPT HANDOFF',
    ]);

    const denied = assertEventAuthority({
      labels: ['agent:cursor', 'handoff:ready'],
      comment: { body: 'please review when you can' },
    } as never) as FailClosed;
    expect(denied.ok).toBe(false);
    expect(denied.code).toBe('missing_canonical_event');

    const allowed = assertEventAuthority({
      labels: [],
      comment: { body: 'IMPLEMENTATION HANDOFF\nIssue: #2433' },
    } as never) as { ok: boolean; labelsAreAuthority: boolean };
    expect(allowed.ok).toBe(true);
    expect(allowed.labelsAreAuthority).toBe(false);
  });

  it('builds stable action identities', () => {
    expect(
      buildActionIdentity({
        sourceIssueNumber: 2433,
        eventType: 'chatgpt_handoff_legacy',
        eventCommentId: '5029000001',
        prNumber: 2675,
        headSha: HEAD_SHA,
      } as never),
    ).toBe(
      `issue:2433:event:chatgpt_handoff_legacy:comment:5029000001:pr:2675:head:${HEAD_SHA}`,
    );
  });

  it('marks protected decision classes non-automatable', () => {
    for (const decisionClass of PROTECTED_DECISION_CLASSES) {
      const result = classifyDecisionAutomatability(decisionClass) as {
        nonAutomatable: boolean;
        automatable: boolean;
      };
      expect(result.nonAutomatable).toBe(true);
      expect(result.automatable).toBe(false);
    }
    expect(
      (classifyDecisionAutomatability('bounded-correction') as { automatable: boolean })
        .automatable,
    ).toBe(true);
  });
});

describe('agent routing evidence collector', () => {
  it('rejects missing or multiple source Issues', () => {
    expect((resolveExactOpenSourceIssue([]) as FailClosed).code).toBe('missing_source_issue');
    expect(
      (
        resolveExactOpenSourceIssue([
          { number: 2433, state: 'OPEN' },
          { number: 2434, state: 'OPEN' },
        ]) as FailClosed
      ).code,
    ).toBe('ambiguous_source_issue');
  });

  it('rejects a stale PR head', () => {
    expect(
      (
        assertCurrentHeadSha({
          expectedHeadSha: HEAD_SHA,
          observedHeadSha: STALE_SHA,
        }) as FailClosed
      ).code,
    ).toBe('stale_head_sha');
  });

  it('fails closed on missing or invalid PR numbers', () => {
    expect((assertValidPrNumber(null) as FailClosed).code).toBe('invalid_pr_number');
    expect((assertValidPrNumber(undefined) as FailClosed).code).toBe('invalid_pr_number');
    expect((assertValidPrNumber('abc') as FailClosed).code).toBe('invalid_pr_number');
    expect((assertValidPrNumber(NaN) as FailClosed).code).toBe('invalid_pr_number');
    expect((assertValidPrNumber(0) as FailClosed).code).toBe('invalid_pr_number');
    expect((assertValidPrNumber(-3) as FailClosed).code).toBe('invalid_pr_number');
    expect((assertValidPrNumber(2675) as { ok: true; prNumber: number }).prNumber).toBe(2675);
  });

  it('filters check evidence to the authoritative head SHA', () => {
    const normalized = normalizeChecks(
      [
        { name: 'current', headSha: HEAD_SHA, conclusion: 'success' },
        { name: 'stale', headSha: STALE_SHA, conclusion: 'success' },
        { name: 'also-current', head_sha: HEAD_SHA, conclusion: 'failure' },
      ],
      HEAD_SHA as never,
    ) as Array<{ name: string }>;
    expect(normalized.map((check) => check.name)).toEqual(['current', 'also-current']);
  });

  it('parses exactly one primary PR source Issue for the #2433 fixture', () => {
    const refs = extractPrimarySourceIssueRefs(String(fixture2433().pullRequest.body));
    expect(refs).toEqual([2433]);
  });
});

describe('fixture #2433 / PR #2675 current-head packet', () => {
  it('produces one normalized current-head packet', () => {
    const result = asResult(runObserveController(fixture2433()));
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected packet');
    const { packet } = result;
    expect(packet.mode).toBe('observe-only');
    expect(packet.mutationAllowed).toBe(false);
    expect(packet.sourceIssue.number).toBe(2433);
    expect(packet.pullRequest.number).toBe(2675);
    expect(packet.pullRequest.headSha).toBe(HEAD_SHA);
    expect(packet.event.eventType).toBe('chatgpt_handoff_legacy');
    expect(packet.event.actionIdentity).toContain('issue:2433:');
    expect(packet.event.actionIdentity).toContain(`head:${HEAD_SHA}`);
    expect(packet.pullRequest.changedFiles).toHaveLength(5);
    expect(packet.checks.map((check) => check.name)).toContain('GATE — Quality Checks');
    expect(packet.reviewEvidence.unresolvedReviewThreads).toHaveLength(1);
    expect(packet.reviewEvidence.resolvedReviewThreads).toHaveLength(1);
    expect(packet.reviewEvidence.lateIssueComments).toHaveLength(1);
    expect(packet.reviewEvidence.distinctions.unresolvedThreadsRepresentedSeparately).toBe(true);
    expect(packet.reviewEvidence.distinctions.lateCommentsRepresentedSeparately).toBe(true);
    expect(packet.protectedBoundaries.classes).toEqual([...PROTECTED_DECISION_CLASSES]);
    expect(packet.protectedBoundaries.nonAutomatable.every((item) => item.nonAutomatable)).toBe(
      true,
    );
    expect(packet.reread.performed).toBe(true);
    expect(packet.reread.source).toBe('github-native');
  });

  it('fails closed on stale head for the #2433 fixture', () => {
    const result = asResult(
      runObserveController(
        fixture2433({
          observedHeadSha: STALE_SHA,
        }),
      ),
    );
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('stale_head_sha');
  });

  it('fails closed when multiple source Issues are supplied as live candidates', () => {
    const base = fixture2433();
    const result = asResult(
      runObserveController({
        ...base,
        live: undefined,
      }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('live_evidence_unavailable');
  });

  it('fails closed when the live source Issue is missing', () => {
    const base = fixture2433();
    const result = asResult(
      runObserveController({
        ...base,
        live: {
          ...(base.live as object),
          sourceIssue: undefined,
        },
      }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('missing_source_issue');
  });

  it('fails closed on contradictory ownership/profile state', () => {
    const base = fixture2433();
    const result = asResult(
      buildEvidencePacket({
        sourceIssue: base.sourceIssue,
        pullRequest: {
          ...base.pullRequest,
          body: String(base.pullRequest.body).replace(
            'Target environment: component',
            'Target environment: production',
          ),
        },
        event: {
          marker: 'CHATGPT HANDOFF',
          eventType: 'chatgpt_handoff_legacy',
          adapter: true,
          commentId: '5029000001',
          createdAt: '2026-07-20T18:00:00Z',
        },
        observedHeadSha: HEAD_SHA,
        checks: base.checks,
        changedFiles: base.changedFiles,
        reviewThreads: base.reviewThreads,
        issueComments: base.issueComments,
      } as never),
    );
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('contradictory_ownership_profile');
  });

  it('rejects fabricated caller reread data that disagrees with live evidence', () => {
    const base = fixture2433();
    const result = asResult(
      runObserveController(
        fixture2433({
          reread: {
            at: '2026-07-20T19:05:00Z',
            sourceIssue: { ...(base.sourceIssue as object), number: 9999 },
            pullRequest: {
              ...(base.pullRequest as object),
              number: 1111,
              headSha: STALE_SHA,
            },
          },
        }),
      ),
    );
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('fabricated_reread_rejected');
  });

  it('cannot treat caller-supplied reread as authoritative when live evidence is absent', () => {
    const base = fixture2433();
    const { live: _live, ...withoutLive } = base as { live: unknown } & Record<string, unknown>;
    const result = asResult(runObserveController(withoutLive));
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('live_evidence_unavailable');
  });

  it('filters stale check evidence out of the emitted packet', () => {
    const base = fixture2433();
    const live = base.live as {
      checks: Array<Record<string, unknown>>;
    };
    const result = asResult(
      runObserveController(
        fixture2433({
          live: {
            ...live,
            checks: [
              ...live.checks,
              {
                name: 'STALE — Old Head Gate',
                status: 'completed',
                conclusion: 'success',
                headSha: STALE_SHA,
              },
            ],
          },
        }),
      ),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected packet');
    expect(result.packet.checks.map((check) => check.name)).not.toContain('STALE — Old Head Gate');
    expect(result.packet.checks.every((check) => check.headSha === HEAD_SHA)).toBe(true);
  });

  it('fails closed when live PR number is invalid', () => {
    const base = fixture2433();
    const live = base.live as { pullRequest: Record<string, unknown> };
    const result = asResult(
      runObserveController(
        fixture2433({
          live: {
            ...live,
            pullRequest: {
              ...live.pullRequest,
              number: 'not-a-number',
            },
          },
        }),
      ),
    );
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('invalid_pr_number');
  });

  it('fails closed when live evidence collection is unavailable', async () => {
    const result = (await collectLiveGitHubEvidence({
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2433,
      prNumber: 2675,
      token: '',
    } as never)) as FailClosed;
    expect(result.ok).toBe(false);
    expect(result.code).toBe('live_evidence_unavailable');
  });

  it('collects live evidence through injectable GitHub fetch and rejects mismatched hints', async () => {
    const routes: Record<string, unknown> = {
      '/issues/2433': {
        number: 2433,
        state: 'open',
        title: 'TASK: CC-001',
        body: '## Acceptance Criteria\n\n- [x] ok\n',
        labels: [{ name: 'docs' }],
      },
      '/pulls/2675': {
        number: 2675,
        title: 'docs(#2433)',
        state: 'open',
        body: '- **Issue:** #2433\n',
        base: { ref: 'component/content-collection-phase1' },
        head: { ref: 'cursor/2433-cc-001-contract-freeze-2e48', sha: HEAD_SHA },
        html_url: 'https://github.com/wdhunter645/next-starter-template/pull/2675',
      },
      '/pulls/2675/files?per_page=100&page=1': [{ filename: 'docs/a.md' }],
      '/issues/2433/comments?per_page=100&page=1': [
        {
          id: 1,
          created_at: '2026-07-20T18:00:00Z',
          user: { login: 'wdhunter645' },
          body: 'CHATGPT HANDOFF\nIssue: #2433\n',
        },
      ],
      '/pulls/2675/reviews?per_page=100&page=1': [
        {
          id: 9,
          state: 'COMMENTED',
          user: { login: 'atlas' },
          submitted_at: '2026-07-20T18:30:00Z',
          body: 'note',
        },
      ],
      [`/commits/${HEAD_SHA}/check-runs?per_page=100`]: {
        check_runs: [
          {
            name: 'GATE — Quality Checks',
            status: 'completed',
            conclusion: 'success',
            head_sha: HEAD_SHA,
          },
        ],
      },
    };

    const fetchFn = async (url: string, init?: { method?: string; body?: string }) => {
      if (String(url).includes('api.github.com/graphql')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              repository: {
                pullRequest: {
                  reviewThreads: {
                    nodes: [
                      {
                        id: 'PRRT_1',
                        isResolved: false,
                        isOutdated: false,
                        path: 'docs/a.md',
                        comments: { nodes: [{ body: 'open thread' }] },
                      },
                    ],
                  },
                },
              },
            },
          }),
        };
      }
      const apiPath = String(url).replace(
        'https://api.github.com/repos/wdhunter645/next-starter-template',
        '',
      );
      const payload = routes[apiPath];
      if (!payload) {
        return {
          ok: false,
          status: 404,
          text: async () => `missing ${apiPath}`,
          json: async () => ({ message: 'not found' }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => payload,
        text: async () => JSON.stringify(payload),
      };
    };

    const collected = (await collectLiveGitHubEvidence({
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2433,
      prNumber: 2675,
      token: 'test-token',
      fetchFn: fetchFn as never,
    } as never)) as
      | FailClosed
      | {
          ok: true;
          live: {
            sourceIssue: { number: number };
            pullRequest: { headSha: string };
            changedFiles: string[];
            reviewThreads: unknown[];
          };
        };
    expect(collected.ok).toBe(true);
    if (!collected.ok) throw new Error('expected live collection');
    expect(collected.live.sourceIssue.number).toBe(2433);
    expect(collected.live.pullRequest.headSha).toBe(HEAD_SHA);
    expect(collected.live.changedFiles).toEqual(['docs/a.md']);
    expect(collected.live.reviewThreads).toHaveLength(1);

    const mismatch = assertHintsMatchLive({
      hints: {
        observedHeadSha: STALE_SHA,
      },
      live: collected.live,
    } as never) as FailClosed;
    expect(mismatch.ok).toBe(false);
    expect(mismatch.code).toBe('stale_head_sha');
  });
});

describe('observe-only controller configuration and workflow', () => {
  it('loads mutation-disabled observe-only config', () => {
    const config = loadControllerConfig(
      path.join(ROOT, 'config/agent-routing/controller.json'),
    ) as {
      mode: string;
      mutationAllowed: boolean;
      labelsAreAuthority: boolean;
      rereadBeforePacket: boolean;
      rejectStaleHeadSha: boolean;
      workflowCapabilities: Record<string, boolean>;
    };
    expect(config.mode).toBe('observe-only');
    expect(config.mutationAllowed).toBe(false);
    expect(config.labelsAreAuthority).toBe(false);
    expect(config.rereadBeforePacket).toBe(true);
    expect(config.rejectStaleHeadSha).toBe(true);
    expect(config.workflowCapabilities.merge).toBe(false);
    expect(config.workflowCapabilities.close).toBe(false);
    expect(config.workflowCapabilities.relabel).toBe(false);
    expect(config.workflowCapabilities.resume).toBe(false);
    expect(config.workflowCapabilities.activateSuccessor).toBe(false);
    expect(config.workflowCapabilities.mutateMain).toBe(false);
  });

  it('fails closed on observe-only configuration drift', () => {
    const config = loadControllerConfig(
      path.join(ROOT, 'config/agent-routing/controller.json'),
    ) as Record<string, unknown>;
    expect(() =>
      assertObserveOnlyConfigInvariants({
        ...config,
        workflowCapabilities: {
          ...(config.workflowCapabilities as object),
          merge: true,
        },
      }),
    ).toThrow(/controller_capability_must_be_false:merge/);

    const drifted = asResult(
      runObserveController(fixture2433(), {
        ...config,
        labelsAreAuthority: true,
      } as never),
    );
    expect(drifted.ok).toBe(false);
    if (drifted.ok) throw new Error('expected failure');
    expect(drifted.code).toBe('controller_config_drift');
  });

  it('keeps the workflow read-only (no write permissions; no mutation jobs)', () => {
    const workflow = fs.readFileSync(
      path.join(ROOT, '.github/workflows/ops-agent-routing-controller.yml'),
      'utf8',
    );
    expect(workflow).toMatch(/observe-only/);
    expect(workflow).toMatch(/contents:\s*read/);
    expect(workflow).toMatch(/issues:\s*read/);
    expect(workflow).toMatch(/pull-requests:\s*read/);
    expect(workflow).toMatch(/issue_number/);
    expect(workflow).toMatch(/pr_number/);
    expect(workflow).toMatch(/Live GitHub reread/);
    expect(workflow).not.toMatch(/issues:\s*write/);
    expect(workflow).not.toMatch(/pull-requests:\s*write/);
    expect(workflow).not.toMatch(/contents:\s*write/);
    expect(workflow).not.toMatch(/\bgh\s+pr\s+merge\b/);
    expect(workflow).not.toMatch(/\bgh\s+issue\s+close\b/);
    expect(workflow).not.toMatch(/\bgh\s+label\b/);
  });

  it('documents stable identities, required sections, and protected boundaries in the contract', () => {
    const contract = fs.readFileSync(
      path.join(ROOT, 'docs/reference/ci/agent-routing-controller-contract.md'),
      'utf8',
    );
    expect(contract).toContain('## Purpose');
    expect(contract).toContain('## Scope');
    expect(contract).toContain('## Current known truth');
    expect(contract).toContain('## Intended final state');
    expect(contract).toContain('actionIdentity');
    expect(contract).toContain('Expected-state reads');
    expect(contract).toContain('github-native');
    expect(contract).toContain('product');
    expect(contract).toContain('engineering-approval');
    expect(contract).toContain('recovery');
    expect(contract).toContain('credential');
    expect(contract).toContain('destructive');
    expect(contract).toContain('production');
    expect(contract).toContain('mutationAllowed: false');
  });

  it('rejects loading a drifted config file from disk', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'controller-config-'));
    const driftedPath = path.join(tmp, 'controller.json');
    const good = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'config/agent-routing/controller.json'), 'utf8'),
    );
    good.mutationAllowed = true;
    fs.writeFileSync(driftedPath, JSON.stringify(good, null, 2));
    expect(() => loadControllerConfig(driftedPath)).toThrow(/controller_mutation_must_be_disabled/);
  });
});
