import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { loadControllerConfig, runObserveController } from '../scripts/agent-routing/controller.mjs';
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
  buildEvidencePacket,
  extractPrimarySourceIssueRefs,
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
    checks: Array<{ name: string }>;
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
    reread: { performed: boolean };
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

  return {
    sourceIssue,
    pullRequest,
    triggerComment,
    observedHeadSha: HEAD_SHA,
    changedFiles: [
      'docs/ops/implementation-plans/content-collection/packages/cc-001-content-asset-model-package.md',
      'docs/reference/content/lgfc-content-candidate-model.md',
      'docs/reference/website/content-inventory-model.md',
      'docs/reference/website/lou-gehrig-content-metadata-schema.md',
      'docs/reference/website/unified-content-workflow.md',
    ],
    checks: [
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
    ],
    reviewThreads: [
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
    ],
    reviewSubmissions: [
      {
        id: 'PRR_1',
        state: 'COMMENTED',
        author: { login: 'atlas-reviewer' },
        submittedAt: '2026-07-20T18:30:00Z',
        body: 'Actionable clarification required on deferred SEO.',
      },
    ],
    issueComments: [
      triggerComment,
      {
        id: '5029000002',
        createdAt: '2026-07-20T19:00:00Z',
        author: { login: 'wdhunter645' },
        body: 'Late note after handoff: keep feature lanes blocked.',
      },
    ],
    reread: {
      at: '2026-07-20T19:05:00Z',
      sourceIssue,
      pullRequest,
    },
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

  it('fails closed when multiple source Issues are supplied', () => {
    const base = fixture2433();
    const result = asResult(
      runObserveController({
        ...base,
        sourceIssue: undefined,
        sourceIssues: [
          base.sourceIssue,
          { number: 2434, state: 'OPEN', title: 'successor', body: '', labels: [] },
        ],
      }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('ambiguous_source_issue');
  });

  it('fails closed when the source Issue is missing', () => {
    const base = fixture2433();
    const result = asResult(
      runObserveController({
        ...base,
        sourceIssue: undefined,
        sourceIssues: [],
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
});

describe('observe-only controller configuration and workflow', () => {
  it('loads mutation-disabled observe-only config', () => {
    const config = loadControllerConfig(
      path.join(ROOT, 'config/agent-routing/controller.json'),
    ) as {
      mode: string;
      mutationAllowed: boolean;
      labelsAreAuthority: boolean;
      workflowCapabilities: Record<string, boolean>;
    };
    expect(config.mode).toBe('observe-only');
    expect(config.mutationAllowed).toBe(false);
    expect(config.labelsAreAuthority).toBe(false);
    expect(config.workflowCapabilities.merge).toBe(false);
    expect(config.workflowCapabilities.close).toBe(false);
    expect(config.workflowCapabilities.relabel).toBe(false);
    expect(config.workflowCapabilities.resume).toBe(false);
    expect(config.workflowCapabilities.activateSuccessor).toBe(false);
    expect(config.workflowCapabilities.mutateMain).toBe(false);
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
    expect(workflow).not.toMatch(/issues:\s*write/);
    expect(workflow).not.toMatch(/pull-requests:\s*write/);
    expect(workflow).not.toMatch(/contents:\s*write/);
    expect(workflow).not.toMatch(/\bgh\s+pr\s+merge\b/);
    expect(workflow).not.toMatch(/\bgh\s+issue\s+close\b/);
    expect(workflow).not.toMatch(/\bgh\s+label\b/);
  });

  it('documents stable identities and protected boundaries in the contract', () => {
    const contract = fs.readFileSync(
      path.join(ROOT, 'docs/reference/ci/agent-routing-controller-contract.md'),
      'utf8',
    );
    expect(contract).toContain('actionIdentity');
    expect(contract).toContain('Expected-state reads');
    expect(contract).toContain('product');
    expect(contract).toContain('engineering-approval');
    expect(contract).toContain('recovery');
    expect(contract).toContain('credential');
    expect(contract).toContain('destructive');
    expect(contract).toContain('production');
    expect(contract).toContain('mutationAllowed: false');
  });
});
