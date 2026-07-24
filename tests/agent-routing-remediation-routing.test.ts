import { describe, expect, it } from 'vitest';

import {
  classifyDisposition as classifyDispositionRaw,
  DISPOSITION_CLASSES,
  resolveLiveAuthorizations as resolveLiveAuthorizationsRaw,
} from '../scripts/agent-routing/lib/disposition.mjs';
import {
  buildDispositionIdentity as buildDispositionIdentityRaw,
  compareRevisions,
  deriveLatestDisposition as deriveLatestDispositionRaw,
} from '../scripts/agent-routing/lib/idempotency.mjs';
import { routeRemediation as routeRemediationRaw } from '../scripts/agent-routing/lib/remediation-router.mjs';

const classifyDisposition = classifyDispositionRaw as (...args: any[]) => any;
const resolveLiveAuthorizations = resolveLiveAuthorizationsRaw as (...args: any[]) => any;
const buildDispositionIdentity = buildDispositionIdentityRaw as (input: any) => string;
const deriveLatestDisposition = deriveLatestDispositionRaw as (...args: any[]) => any;
const routeRemediation = routeRemediationRaw as (input: any) => any;

const HEAD_A = '1111111111111111111111111111111111111111';
const HEAD_B = '2222222222222222222222222222222222222222';
const SOURCE_DECISION =
  'https://github.com/wdhunter645/next-starter-template/issues/2771#issuecomment-5066000001';
const TRUSTED_AUTHORS = ['wdhunter645'];

function packet(overrides: Record<string, unknown> = {}) {
  return {
    sourceIssue: { number: 2771, state: 'OPEN' },
    pullRequest: {
      number: 2820,
      headSha: HEAD_A,
      headRef: 'cursor/2677-002-review-remediation-routing-f1de',
    },
    checks: [
      {
        name: 'quality',
        status: 'completed',
        conclusion: 'success',
        headSha: HEAD_A,
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

function currentHeadThread(id = 'thread-1') {
  return {
    id,
    isResolved: false,
    isOutdated: false,
    headSha: HEAD_A,
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

function authorityComment(overrides: Record<string, unknown> = {}) {
  return {
    id: '5066000001',
    author: { login: 'wdhunter645' },
    html_url: SOURCE_DECISION,
    url: SOURCE_DECISION,
    body: `CHATGPT RESPONSE
Issue: #2771
PR: #2820
Head SHA: ${HEAD_A}
Disposition: bounded_correction
Finding: review-thread:thread-1
Decision class: bounded-correction
Requested action:
- Correct only the response wording.`,
    ...overrides,
  };
}

describe('current-head finding classification', () => {
  it('classifies clean evidence without a remediation resume', () => {
    const result = classifyDisposition(packet(), { requiredChecks: ['quality'] });
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
      { requiredChecks: ['quality'] },
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
      {
        authorizations: [boundedAuthorization()],
        requiredChecks: ['quality'],
      },
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
      { authorizations: [authorization], requiredChecks: ['quality'] },
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
      { requiredChecks: ['quality'] },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected classification');
    expect(result.classification).toBe(DISPOSITION_CLASSES.PROTECTED_STOP);
    expect(result.evidence.currentHeadFindingIdentities).toEqual([
      'late-comment:late-1',
    ]);
  });

  it('excludes outdated review threads from current-head findings', () => {
    const result = classifyDisposition(
      packet({
        reviewEvidence: {
          unresolvedReviewThreads: [
            { ...currentHeadThread(), isOutdated: true },
          ],
          reviewSubmissions: [],
          lateIssueComments: [],
        },
      }),
      { requiredChecks: ['quality'] },
    );
    expect(result.ok).toBe(true);
    expect(result.classification).toBe(DISPOSITION_CLASSES.CLEAN);
  });

  it('excludes explicit prior-head review threads and submissions', () => {
    const result = classifyDisposition(
      packet({
        reviewEvidence: {
          unresolvedReviewThreads: [
            { ...currentHeadThread(), headSha: HEAD_B },
          ],
          reviewSubmissions: [
            {
              id: 'review-old',
              state: 'CHANGES_REQUESTED',
              headSha: HEAD_B,
              body: 'Old-head review.',
            },
          ],
          lateIssueComments: [],
        },
      }),
      { requiredChecks: ['quality'] },
    );
    expect(result.ok).toBe(true);
    expect(result.classification).toBe(DISPOSITION_CLASSES.CLEAN);
  });

  it.each([
    {
      label: 'missing',
      checks: [],
    },
    {
      label: 'pending',
      checks: [
        {
          name: 'quality',
          status: 'in_progress',
          conclusion: null,
          headSha: HEAD_A,
        },
      ],
    },
    {
      label: 'failed',
      checks: [
        {
          name: 'quality',
          status: 'completed',
          conclusion: 'failure',
          headSha: HEAD_A,
        },
      ],
    },
    {
      label: 'stale-head',
      checks: [
        {
          name: 'quality',
          status: 'completed',
          conclusion: 'success',
          headSha: HEAD_B,
        },
      ],
    },
  ])('does not classify $label required-check evidence as clean', ({ checks }) => {
    const result = classifyDisposition(packet({ checks }), {
      requiredChecks: ['quality'],
    });
    expect(result.ok).toBe(true);
    expect(result.classification).toBe(DISPOSITION_CLASSES.PROTECTED_STOP);
    expect(result.findings.some((finding: any) => finding.source === 'required_check')).toBe(
      true,
    );
  });

  it('does not allow an authorization to downgrade a protected finding', () => {
    const identity = 'provided:production-change';
    const result = classifyDisposition(packet(), {
      findings: [
        {
          identity,
          actionable: true,
          decisionClass: 'production',
          headSha: HEAD_A,
          summary: 'Change Production behavior.',
        },
      ],
      authorizations: [
        {
          ...boundedAuthorization(identity),
          decisionClass: 'bounded-correction',
        },
      ],
      requiredChecks: ['quality'],
    });
    expect(result.ok).toBe(true);
    expect(result.classification).toBe(DISPOSITION_CLASSES.PROTECTED_STOP);
    expect(result.findings[0].protectedDecision).toBe(true);
    expect(result.findings[0].decisionClass).toBe('production');
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
      requiredChecks: ['quality'],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected classification');
    expect(result.classification).toBe(DISPOSITION_CLASSES.PROTECTED_STOP);
    expect(result.findings[0].protectedDecision).toBe(true);
  });
});

describe('live source-Issue decision authority', () => {
  it('resolves a bounded authorization only from a matching trusted live comment', () => {
    const result = resolveLiveAuthorizations({
      selectors: [boundedAuthorization()],
      liveComments: [authorityComment()],
      repository: 'wdhunter645/next-starter-template',
      sourceIssueNumber: 2771,
      prNumber: 2820,
      headSha: HEAD_A,
      trustedAuthors: TRUSTED_AUTHORS,
    });
    expect(result.ok).toBe(true);
    expect(result.authorizations).toHaveLength(1);
    expect(result.authorizations[0].findingIdentity).toBe('review-thread:thread-1');
  });

  it('fails closed when the selected decision comment is absent', () => {
    const result = resolveLiveAuthorizations({
      selectors: [boundedAuthorization()],
      liveComments: [],
      repository: 'wdhunter645/next-starter-template',
      sourceIssueNumber: 2771,
      prNumber: 2820,
      headSha: HEAD_A,
      trustedAuthors: TRUSTED_AUTHORS,
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe('source_issue_decision_not_live');
  });

  it('fails closed for an untrusted decision author', () => {
    const result = resolveLiveAuthorizations({
      selectors: [boundedAuthorization()],
      liveComments: [authorityComment({ author: { login: 'untrusted-user' } })],
      repository: 'wdhunter645/next-starter-template',
      sourceIssueNumber: 2771,
      prNumber: 2820,
      headSha: HEAD_A,
      trustedAuthors: TRUSTED_AUTHORS,
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe('source_issue_decision_author_untrusted');
  });

  it('fails closed when action, head, or finding details do not match the live body', () => {
    const result = resolveLiveAuthorizations({
      selectors: [
        {
          ...boundedAuthorization(),
          requestedAction: 'Invent a different action.',
        },
      ],
      liveComments: [authorityComment()],
      repository: 'wdhunter645/next-starter-template',
      sourceIssueNumber: 2771,
      prNumber: 2820,
      headSha: HEAD_A,
      trustedAuthors: TRUSTED_AUTHORS,
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe('source_issue_decision_mismatch');
  });

  it('derives the latest trusted disposition and ignores forged higher revisions', () => {
    const trusted = {
      id: '5066000100',
      author: { login: 'wdhunter645' },
      body: `ADJUSTMENT
Subject: #2771
PR: #2820
Head SHA: ${HEAD_A}
Disposition revision: 3
Disposition identity: trusted-three
<!-- agent-routing-response:response:trusted-three -->`,
    };
    const forged = {
      id: '5066000200',
      author: { login: 'untrusted-user' },
      body: `ADJUSTMENT
Subject: #2771
PR: #2820
Head SHA: ${HEAD_A}
Disposition revision: 99
Disposition identity: forged-ninety-nine
<!-- agent-routing-response:response:forged-ninety-nine -->`,
    };
    const result = deriveLatestDisposition({
      comments: [trusted, forged],
      sourceIssueNumber: 2771,
      prNumber: 2820,
      trustedAuthors: TRUSTED_AUTHORS,
    });
    expect(result).toMatchObject({
      headSha: HEAD_A,
      dispositionRevision: '3',
      dispositionIdentity: 'trusted-three',
    });
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

  it('emits the source-Issue response as the only first transaction', () => {
    const result = routeRemediation({
      packet: packetWithThread(),
      authorizations: [boundedAuthorization()],
      dispositionRevision: '3',
      requiredChecks: ['quality'],
    });
    expect(result.ok).toBe(true);
    expect(result.actions.map((action: any) => action.type)).toEqual([
      'post_source_issue_response',
    ]);
    expect(result.actions[0].body).toContain('Subject: #2771');
  });

  it('emits the exact resume only after the response exists with a real URL', () => {
    const first = routeRemediation({
      packet: packetWithThread(),
      authorizations: [boundedAuthorization()],
      dispositionRevision: '3',
      requiredChecks: ['quality'],
    });
    const responseComment = {
      id: '1',
      body: first.actions[0].body,
      html_url: 'https://github.com/example/issues/2771#issuecomment-1',
      author: { login: 'github-actions[bot]' },
    };
    const second = routeRemediation({
      packet: packetWithThread(),
      authorizations: [boundedAuthorization()],
      dispositionRevision: '3',
      requiredChecks: ['quality'],
      existingComments: [responseComment],
    });
    expect(second.ok).toBe(true);
    expect(second.actions.map((action: any) => action.type)).toEqual([
      'post_local_cursor_resume',
    ]);
    expect(second.actions[0].body).toContain('LOCAL CURSOR RESUME');
    expect(second.actions[0].body).toContain(responseComment.html_url);
    expect(second.actions[0].body).not.toContain('{{RESPONSE_COMMENT_URL}}');
  });

  it('suppresses equivalent response and resume events across both phases', () => {
    const first = routeRemediation({
      packet: packetWithThread(),
      authorizations: [boundedAuthorization()],
      dispositionRevision: '3',
      requiredChecks: ['quality'],
    });
    const responseComment = {
      id: '1',
      body: first.actions[0].body,
      html_url: 'https://github.com/example/issues/2771#issuecomment-1',
    };
    const second = routeRemediation({
      packet: packetWithThread(),
      authorizations: [boundedAuthorization()],
      dispositionRevision: '3',
      requiredChecks: ['quality'],
      existingComments: [responseComment],
    });
    const resumeComment = {
      id: '2',
      body: second.actions[0].body,
      html_url: 'https://github.com/example/issues/2771#issuecomment-2',
    };
    const repeated = routeRemediation({
      packet: packetWithThread(),
      authorizations: [boundedAuthorization()],
      dispositionRevision: '3',
      requiredChecks: ['quality'],
      existingComments: [responseComment, resumeComment],
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
      requiredChecks: ['quality'],
    });
    expect(result.ok).toBe(true);
    expect(result.expectedState.requiresCurrentHeadReevaluation).toBe(true);
    expect(result.dispositionIdentity).toContain(`head:${HEAD_B}`);
  });

  it('emits one escalation and no response or resume for protected findings', () => {
    const result = routeRemediation({
      packet: packetWithThread(),
      dispositionRevision: '1',
      requiredChecks: ['quality'],
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
