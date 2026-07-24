import { describe, expect, it } from 'vitest';

import { runController as runControllerRaw } from '../scripts/agent-routing/controller.mjs';
import {
  classifyDisposition as classifyDispositionRaw,
  DISPOSITION_CLASSES,
  extractSourceIssueAuthorizations as extractSourceIssueAuthorizationsRaw,
} from '../scripts/agent-routing/lib/disposition.mjs';
import {
  buildDispositionIdentity as buildDispositionIdentityRaw,
  compareRevisions,
} from '../scripts/agent-routing/lib/idempotency.mjs';
import { routeRemediation as routeRemediationRaw } from '../scripts/agent-routing/lib/remediation-router.mjs';

const runController = runControllerRaw as (...args: any[]) => any;
const classifyDisposition = classifyDispositionRaw as (...args: any[]) => any;
const extractSourceIssueAuthorizations = extractSourceIssueAuthorizationsRaw as (
  ...args: any[]
) => any;
const buildDispositionIdentity = buildDispositionIdentityRaw as (input: any) => string;
const routeRemediation = routeRemediationRaw as (...args: any[]) => any;

const HEAD_A = '1111111111111111111111111111111111111111';
const HEAD_B = '2222222222222222222222222222222222222222';

function packet(overrides: Record<string, unknown> = {}) {
  return {
    sourceIssue: { number: 2771, state: 'OPEN' },
    pullRequest: {
      number: 2835,
      headSha: HEAD_A,
      headRef: 'cursor/2677-002-review-remediation-routing-f1de',
      url: 'https://github.com/wdhunter645/next-starter-template/pull/2835',
    },
    checks: [
      { name: 'quality', status: 'completed', conclusion: 'success', headSha: HEAD_A },
    ],
    reviewEvidence: {
      unresolvedReviewThreads: [],
      reviewSubmissions: [],
      lateIssueComments: [],
    },
    ...overrides,
  };
}

function currentHeadThread(id = 'thread-1', decisionClass = 'engineering-approval') {
  return {
    id,
    isResolved: false,
    body: 'Correct the bounded response wording.',
    decisionClass,
  };
}

function sourceDecision({
  id = '5066000001',
  findingIdentity = 'review-thread:thread-1',
  headSha = HEAD_A,
  decisionClass = 'implementation',
  revision = '3',
} = {}) {
  return {
    id,
    createdAt: '2026-07-24T03:30:00Z',
    author: { login: 'wdhunter645' },
    body: `ADJUSTMENT
Status: bounded correction authorized
PR: #2835
Head SHA: ${headSha}
Finding identity: ${findingIdentity}
Decision class: ${decisionClass}
Disposition revision: ${revision}
Requested action:
- Correct only the response wording.`,
  };
}

function liveInput({
  threads = [currentHeadThread()],
  comments = [sourceDecision()],
  headSha = HEAD_A,
} = {}) {
  const trigger = {
    id: '5065000001',
    createdAt: '2026-07-24T03:00:00Z',
    author: { login: 'wdhunter645' },
    body: 'CHATGPT HANDOFF\nIssue: #2771\nPR: #2835',
  };
  const issueComments = [trigger, ...comments];
  return {
    live: {
      collectedAt: '2026-07-24T03:40:00Z',
      source: 'github-native',
      finalReread: true,
      sourceIssue: {
        number: 2771,
        state: 'OPEN',
        title: 'TASK: #2677-002',
        body: '## Acceptance Criteria\n- [ ] bounded routing',
        labels: ['agent:cursor'],
      },
      pullRequest: {
        number: 2835,
        title: 'feat(#2771)',
        state: 'open',
        body: `- **Issue:** #2771
- Delivery model: B-child
- Target environment: component
- Approval profile: component-auto-integration
- Gate profile: component-child
- Component branch: component/deterministic-handoff-controller
- Component master: #2677`,
        baseRefName: 'component/deterministic-handoff-controller',
        headRefName: 'cursor/2677-002-review-remediation-routing-f1de',
        headSha,
        head: { sha: headSha },
        url: 'https://github.com/wdhunter645/next-starter-template/pull/2835',
      },
      headSha,
      changedFiles: ['scripts/agent-routing/lib/disposition.mjs'],
      checks: [
        { name: 'quality', status: 'completed', conclusion: 'success', headSha },
      ],
      issueComments,
      reviewSubmissions: [],
      reviewThreads: threads,
    },
    triggerComment: trigger,
  };
}

describe('current-head classification', () => {
  it('classifies clean evidence without remediation', () => {
    const result = classifyDisposition(packet());
    expect(result.ok).toBe(true);
    expect((result as any).classification).toBe(DISPOSITION_CLASSES.CLEAN);
  });

  it('keeps unresolved findings controlling despite green checks', () => {
    const result = classifyDisposition(packet({
      reviewEvidence: {
        unresolvedReviewThreads: [currentHeadThread()],
        reviewSubmissions: [],
        lateIssueComments: [],
      },
    }));
    expect(result.ok).toBe(true);
    expect((result as any).classification).toBe(DISPOSITION_CLASSES.PROTECTED_STOP);
  });

  it('derives a bounded authorization from an exact live source-Issue comment', () => {
    const findings = [{
      identity: 'review-thread:thread-1',
      source: 'review_thread',
      decisionClass: 'engineering-approval',
      summary: 'fix',
      headSha: HEAD_A,
    }];
    const extracted = extractSourceIssueAuthorizations({
      comments: [sourceDecision()],
      findings,
      sourceIssueNumber: 2771,
      prNumber: 2835,
      headSha: HEAD_A,
    }) as any;
    expect(extracted.ok).toBe(true);
    expect(extracted.authorizations).toHaveLength(1);
    expect(extracted.authorizations[0].sourceIssueDecisionUrl)
      .toContain('/issues/2771#issuecomment-5066000001');

    const result = classifyDisposition(packet({
      reviewEvidence: {
        unresolvedReviewThreads: [currentHeadThread()],
        reviewSubmissions: [],
        lateIssueComments: [],
      },
    }), {
      findings,
      authorizations: extracted.authorizations,
      dispositionRevision: extracted.dispositionRevision,
    });
    expect((result as any).classification).toBe(DISPOSITION_CLASSES.BOUNDED_CORRECTION);
  });

  it('rejects stale or incomplete source-Issue decisions', () => {
    const findings = [{
      identity: 'review-thread:thread-1',
      source: 'review_thread',
      decisionClass: 'engineering-approval',
      summary: 'fix',
      headSha: HEAD_A,
    }];
    const stale = extractSourceIssueAuthorizations({
      comments: [sourceDecision({ headSha: HEAD_B })],
      findings,
      sourceIssueNumber: 2771,
      prNumber: 2835,
      headSha: HEAD_A,
    }) as any;
    expect(stale.authorizations).toEqual([]);

    const missingFinding = extractSourceIssueAuthorizations({
      comments: [sourceDecision({ findingIdentity: 'review-thread:other' })],
      findings,
      sourceIssueNumber: 2771,
      prNumber: 2835,
      headSha: HEAD_A,
    }) as any;
    expect(missingFinding.authorizations).toEqual([]);
  });

  it.each([
    'product',
    'design',
    'engineering-approval',
    'recovery',
    'credential',
    'secret',
    'destructive',
    'rights-privacy-publication',
    'production',
  ])('halts protected class %s even when a source comment exists', (decisionClass) => {
    const input = liveInput({
      comments: [sourceDecision({ decisionClass })],
    });
    const result = runController(input) as any;
    expect(result.ok).toBe(true);
    expect(result.remediation.classification.classification)
      .toBe(DISPOSITION_CLASSES.PROTECTED_STOP);
    expect(result.remediation.actions.map((action: any) => action.type))
      .toEqual(['post_source_issue_escalation']);
  });

  it('re-enters remediation for a late actionable review comment', () => {
    const result = classifyDisposition(packet({
      reviewEvidence: {
        unresolvedReviewThreads: [],
        reviewSubmissions: [],
        lateIssueComments: [{
          id: 'late-1',
          bodyPreview: 'PR REVIEW FINDING: correct the late race.',
        }],
      },
    })) as any;
    expect(result.classification).toBe(DISPOSITION_CLASSES.PROTECTED_STOP);
    expect(result.evidence.currentHeadFindingIdentities).toEqual(['late-comment:late-1']);
  });
});

describe('authority-bound controller routing', () => {
  it('emits one response and one exact resume from live source authority', () => {
    const result = runController(liveInput()) as any;
    expect(result.ok).toBe(true);
    expect(result.remediation.classification.classification)
      .toBe(DISPOSITION_CLASSES.BOUNDED_CORRECTION);
    expect(result.remediation.actions.map((action: any) => action.type)).toEqual([
      'post_source_issue_response',
      'post_local_cursor_resume',
    ]);
    expect(result.remediation.actions[0].body).toContain('Subject: #2771');
    expect(result.remediation.actions[1].bodyTemplate).toContain('{{RESPONSE_COMMENT_URL}}');
  });

  it('ignores fabricated caller authorization objects', () => {
    const input: any = liveInput({ comments: [] });
    input.authorizations = [{
      findingIdentity: 'review-thread:thread-1',
      disposition: DISPOSITION_CLASSES.BOUNDED_CORRECTION,
      authorized: true,
      decisionClass: 'implementation',
      sourceIssueDecisionUrl:
        'https://github.com/wdhunter645/next-starter-template/issues/2771#issuecomment-999',
      headSha: HEAD_A,
    }];
    input.disposition = { authorizations: input.authorizations };
    const result = runController(input) as any;
    expect(result.ok).toBe(true);
    expect(result.remediation.classification.classification)
      .toBe(DISPOSITION_CLASSES.PROTECTED_STOP);
  });

  it('does not treat authorization or emitted transaction comments as new findings', () => {
    const input: any = liveInput();
    input.live.issueComments.push({
      id: 'response',
      createdAt: '2026-07-24T03:35:00Z',
      body: `ADJUSTMENT
Status: bounded correction authorized
Finding identity: review-thread:thread-1
<!-- agent-routing-response:response:existing -->`,
    });
    const result = runController(input) as any;
    expect(result.ok).toBe(true);
    expect(result.remediation.classification.evidence.currentHeadFindingIdentities)
      .toEqual(['review-thread:thread-1']);
  });

  it('suppresses equivalent response and resume identities', () => {
    const first = runController(liveInput()) as any;
    const comments = [
      sourceDecision(),
      ...first.remediation.actions.map((action: any, index: number) => ({
        id: `existing-${index}`,
        createdAt: `2026-07-24T03:4${index}:00Z`,
        body: action.body || action.bodyTemplate,
      })),
    ];
    const repeated = runController(liveInput({ comments })) as any;
    expect(repeated.ok).toBe(true);
    expect(repeated.remediation.actions).toEqual([]);
  });

  it('uses a changed head for a new disposition identity', () => {
    const result = routeRemediation({
      packet: packet({
        pullRequest: {
          number: 2835,
          headSha: HEAD_B,
          headRef: 'cursor/branch',
        },
      }),
      findings: [{
        identity: 'review-thread:thread-1',
        source: 'review_thread',
        decisionClass: 'implementation',
        summary: 'fix',
        headSha: HEAD_B,
      }],
      authorizations: [{
        findingIdentity: 'review-thread:thread-1',
        disposition: DISPOSITION_CLASSES.BOUNDED_CORRECTION,
        authorized: true,
        decisionClass: 'implementation',
        sourceIssueDecisionUrl:
          'https://github.com/wdhunter645/next-starter-template/issues/2771#issuecomment-1',
        headSha: HEAD_B,
        requestedAction: 'fix',
      }],
      latestDisposition: { headSha: HEAD_A, dispositionRevision: '9' },
    }) as any;
    expect(result.ok).toBe(true);
    expect(result.expectedState.requiresCurrentHeadReevaluation).toBe(true);
    expect(result.dispositionIdentity).toContain(`head:${HEAD_B}`);
  });

  it('suppresses a stale lower disposition revision', () => {
    const result = routeRemediation({
      packet: packet({
        reviewEvidence: {
          unresolvedReviewThreads: [currentHeadThread()],
          reviewSubmissions: [],
          lateIssueComments: [],
        },
      }),
      authorizations: [{
        findingIdentity: 'review-thread:thread-1',
        disposition: DISPOSITION_CLASSES.BOUNDED_CORRECTION,
        authorized: true,
        decisionClass: 'implementation',
        sourceIssueDecisionUrl:
          'https://github.com/wdhunter645/next-starter-template/issues/2771#issuecomment-1',
        headSha: HEAD_A,
      }],
      dispositionRevision: '2',
      latestDisposition: { headSha: HEAD_A, dispositionRevision: '10' },
    }) as any;
    expect(result.ok).toBe(false);
    expect(result.code).toBe('stale_disposition_revision');
    expect(result.actions).toEqual([]);
  });

  it('includes all disposition identity dimensions', () => {
    expect(buildDispositionIdentity({
      sourceIssueNumber: 2771,
      prNumber: 2835,
      headSha: HEAD_A,
      findingIdentities: ['b', 'a'],
      dispositionRevision: '4',
    })).toBe(`issue:2771:pr:2835:head:${HEAD_A}:findings:a,b:revision:4`);
    expect(compareRevisions('10', '2')).toBeGreaterThan(0);
  });
});
