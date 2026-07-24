import { describe, expect, it } from 'vitest';

import {
  classifyDisposition as classifyDispositionRaw,
  DISPOSITION_CLASSES,
} from '../scripts/agent-routing/lib/disposition.mjs';
import {
  buildDispositionIdentity as buildDispositionIdentityRaw,
  compareRevisions,
} from '../scripts/agent-routing/lib/idempotency.mjs';
import { routeRemediation as routeRemediationRaw } from '../scripts/agent-routing/lib/remediation-router.mjs';

const classifyDisposition = classifyDispositionRaw as (...args: any[]) => any;
const buildDispositionIdentity = buildDispositionIdentityRaw as (input: any) => string;
const routeRemediation = routeRemediationRaw as (input: any) => any;

const HEAD_A = '1111111111111111111111111111111111111111';
const HEAD_B = '2222222222222222222222222222222222222222';
const SOURCE_DECISION =
  'https://github.com/wdhunter645/next-starter-template/issues/2771#issuecomment-5066000001';

function packet(overrides: Record<string, unknown> = {}) {
  return {
    sourceIssue: { number: 2771, state: 'OPEN' },
    pullRequest: {
      number: 2820,
      headSha: HEAD_A,
      headRef: 'cursor/2677-002-review-remediation-routing-f1de',
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

function currentHeadThread(id = 'thread-1') {
  return {
    id,
    isResolved: false,
    body: 'Correct the bounded response wording.',
  };
}

function boundedAuthorization(findingIdentity = 'review-thread:thread-1') {
  return {
    findingIdentity,
    disposition: DISPOSITION_CLASSES.BOUNDED_CORRECTION,
    authorized: true,
    decisionClass: 'bounded-correction',
    sourceIssueDecisionUrl: SOURCE_DECISION,
    headSha: HEAD_A,
    requestedAction: 'Correct only the response wording.',
  };
}

describe('current-head finding classification', () => {
  it('classifies clean evidence without a remediation resume', () => {
    const result = classifyDisposition(packet());
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected classification');
    expect(result.classification).toBe(DISPOSITION_CLASSES.CLEAN);
    expect(result.evidence.currentHeadFindingIdentities).toEqual([]);
  });

  it('keeps unresolved current-head review findings controlling despite green checks', () => {
    const result = classifyDisposition(
      packet({
        reviewEvidence: {
          unresolvedReviewThreads: [currentHeadThread()],
          reviewSubmissions: [],
          lateIssueComments: [],
        },
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected classification');
    expect(result.classification).toBe(DISPOSITION_CLASSES.PROTECTED_STOP);
    expect(result.evidence.checkConclusions).toEqual([
      { name: 'quality', conclusion: 'success' },
    ]);
  });

  it('classifies an exact source-Issue-authorized correction as bounded', () => {
    const result = classifyDisposition(
      packet({
        reviewEvidence: {
          unresolvedReviewThreads: [currentHeadThread()],
          reviewSubmissions: [],
          lateIssueComments: [],
        },
      }),
      { authorizations: [boundedAuthorization()] },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected classification');
    expect(result.classification).toBe(DISPOSITION_CLASSES.BOUNDED_CORRECTION);
    expect(result.findings[0].sourceIssueDecision).toBe(true);
  });

  it('does not accept a PR-only comment as source-Issue routing', () => {
    const authorization = {
      ...boundedAuthorization(),
      sourceIssueDecisionUrl:
        'https://github.com/wdhunter645/next-starter-template/pull/2820#issuecomment-5066000001',
    };
    const result = classifyDisposition(
      packet({
        reviewEvidence: {
          unresolvedReviewThreads: [currentHeadThread()],
          reviewSubmissions: [],
          lateIssueComments: [],
        },
      }),
      { authorizations: [authorization] },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected classification');
    expect(result.classification).toBe(DISPOSITION_CLASSES.PROTECTED_STOP);
    expect(result.findings[0].sourceIssueDecision).toBe(false);
  });

  it('re-enters remediation for a late actionable finding after green checks', () => {
    const result = classifyDisposition(
      packet({
        reviewEvidence: {
          unresolvedReviewThreads: [],
          reviewSubmissions: [],
          lateIssueComments: [
            {
              id: 'late-1',
              bodyPreview: 'PR REVIEW FINDING: correct the late race.',
            },
          ],
        },
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected classification');
    expect(result.classification).toBe(DISPOSITION_CLASSES.PROTECTED_STOP);
    expect(result.evidence.currentHeadFindingIdentities).toEqual([
      'late-comment:late-1',
    ]);
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
  ])('halts protected decision class %s', (decisionClass) => {
    const result = classifyDisposition(packet(), {
      findings: [
        {
          identity: `protected-${decisionClass}`,
          actionable: true,
          decisionClass,
          headSha: HEAD_A,
        },
      ],
      authorizations: [
        {
          findingIdentity: `protected-${decisionClass}`,
          disposition: DISPOSITION_CLASSES.BOUNDED_CORRECTION,
          authorized: true,
          decisionClass,
          sourceIssueDecisionUrl: SOURCE_DECISION,
          headSha: HEAD_A,
        },
      ],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected classification');
    expect(result.classification).toBe(DISPOSITION_CLASSES.PROTECTED_STOP);
    expect(result.findings[0].protectedDecision).toBe(true);
  });
});

describe('idempotent remediation routing', () => {
  const packetWithThread = () =>
    packet({
      reviewEvidence: {
        unresolvedReviewThreads: [currentHeadThread()],
        reviewSubmissions: [],
        lateIssueComments: [],
      },
    });

  it('emits one source-Issue response and one exact local resume', () => {
    const result = routeRemediation({
      packet: packetWithThread(),
      authorizations: [boundedAuthorization()],
      dispositionRevision: '3',
    });
    expect(result.ok).toBe(true);
    expect(result.actions.map((action: any) => action.type)).toEqual([
      'post_source_issue_response',
      'post_local_cursor_resume',
    ]);
    expect(result.actions[0].body).toContain('Subject: #2771');
    expect(result.actions[1].bodyTemplate).toContain('LOCAL CURSOR RESUME');
    expect(result.actions[1].bodyTemplate).toContain('{{RESPONSE_COMMENT_URL}}');
  });

  it('suppresses equivalent response and resume events', () => {
    const first = routeRemediation({
      packet: packetWithThread(),
      authorizations: [boundedAuthorization()],
      dispositionRevision: '3',
    });
    expect(first.ok).toBe(true);
    const existingComments = first.actions.map((action: any, index: number) => ({
      id: index + 1,
      body: action.body || action.bodyTemplate,
      html_url: `https://github.com/example/issues/2771#issuecomment-${index + 1}`,
    }));
    const repeated = routeRemediation({
      packet: packetWithThread(),
      authorizations: [boundedAuthorization()],
      dispositionRevision: '3',
      existingComments,
    });
    expect(repeated.ok).toBe(true);
    expect(repeated.actions).toEqual([]);
  });

  it('uses a changed head for a new identity and requires re-evaluation', () => {
    const changedHeadPacket = packetWithThread();
    changedHeadPacket.pullRequest.headSha = HEAD_B;
    changedHeadPacket.checks[0].headSha = HEAD_B;
    const authorization = { ...boundedAuthorization(), headSha: HEAD_B };
    const result = routeRemediation({
      packet: changedHeadPacket,
      authorizations: [authorization],
      dispositionRevision: '1',
      latestDisposition: {
        headSha: HEAD_A,
        dispositionRevision: '9',
      },
    });
    expect(result.ok).toBe(true);
    expect(result.expectedState.requiresCurrentHeadReevaluation).toBe(true);
    expect(result.dispositionIdentity).toContain(`head:${HEAD_B}`);
  });

  it('emits one escalation and no response or resume for protected findings', () => {
    const result = routeRemediation({
      packet: packetWithThread(),
      dispositionRevision: '1',
    });
    expect(result.ok).toBe(true);
    expect(result.actions.map((action: any) => action.type)).toEqual([
      'post_source_issue_escalation',
    ]);
    expect(result.actions[0].body).toContain('Mutation boundary:');
    expect(result.actions[0].body).toContain('No remediation response, resume, merge, closeout');
  });

  it('includes all required disposition identity dimensions', () => {
    expect(
      buildDispositionIdentity({
        sourceIssueNumber: 2771,
        prNumber: 2820,
        headSha: HEAD_A,
        findingIdentities: ['b', 'a'],
        dispositionRevision: '4',
      }),
    ).toBe(`issue:2771:pr:2820:head:${HEAD_A}:findings:a,b:revision:4`);
    expect(compareRevisions('10', '2')).toBeGreaterThan(0);
  });
});
