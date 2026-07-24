import { describe, expect, it } from 'vitest';

import {
  assertObserveOnlyConfigInvariants,
  loadControllerConfig,
  runController,
} from '../scripts/agent-routing/controller.mjs';
import {
  classifyDisposition,
  collectRequiredCheckFindings,
  DISPOSITION_CLASSES,
  extractSourceIssueAuthorizations,
} from '../scripts/agent-routing/lib/disposition.mjs';
import {
  buildDispositionIdentity,
  compareRevisions,
} from '../scripts/agent-routing/lib/idempotency.mjs';
import { routeRemediation } from '../scripts/agent-routing/lib/remediation-router.mjs';

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

function thread(
  id = 'thread-1',
  decisionClass = 'implementation',
  extra: Record<string, unknown> = {},
) {
  return {
    id,
    isResolved: false,
    isOutdated: false,
    body: 'Correct the bounded implementation defect.',
    decisionClass,
    ...extra,
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
    html_url:
      `https://github.com/wdhunter645/next-starter-template/issues/2771#issuecomment-${id}`,
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
- Correct only the bounded implementation defect.`,
  };
}

function liveInput({
  threads = [thread()],
  comments = [sourceDecision()],
  checks = [
    {
      name: 'quality',
      status: 'completed',
      conclusion: 'success',
      headSha: HEAD_A,
    },
  ],
  headSha = HEAD_A,
} = {}) {
  const trigger = {
    id: '5065000001',
    createdAt: '2026-07-24T03:00:00Z',
    author: { login: 'wdhunter645' },
    body: 'CHATGPT HANDOFF\nIssue: #2771\nPR: #2835',
  };
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
      checks,
      issueComments: [trigger, ...comments],
      reviewSubmissions: [],
      reviewThreads: threads,
    },
    triggerComment: trigger,
  };
}

describe('configuration invariants', () => {
  it('requires a nonempty required-check set', () => {
    const config = loadControllerConfig() as Record<string, any>;
    expect(config.remediationRouting.requiredChecks).toEqual(['quality']);
    expect(() =>
      assertObserveOnlyConfigInvariants({
        ...config,
        remediationRouting: {
          ...config.remediationRouting,
          requiredChecks: [],
        },
      }),
    ).toThrow(/requires_nonempty_required_checks/);
  });
});

describe('current-head classification', () => {
  it('classifies clean only with successful configured checks', () => {
    const result = classifyDisposition(packet(), { requiredChecks: ['quality'] }) as any;
    expect(result.classification).toBe(DISPOSITION_CLASSES.CLEAN);
  });

  it.each([
    { label: 'missing', checks: [] },
    {
      label: 'pending',
      checks: [{ name: 'quality', status: 'in_progress', conclusion: null, headSha: HEAD_A }],
    },
    {
      label: 'failed',
      checks: [{ name: 'quality', status: 'completed', conclusion: 'failure', headSha: HEAD_A }],
    },
    {
      label: 'stale',
      checks: [{ name: 'quality', status: 'completed', conclusion: 'success', headSha: HEAD_B }],
    },
  ])('blocks $label required checks', ({ checks }) => {
    const result = classifyDisposition(packet({ checks }), {
      requiredChecks: ['quality'],
    }) as any;
    expect(result.classification).toBe(DISPOSITION_CLASSES.PROTECTED_STOP);
    expect(result.evidence.currentHeadFindingIdentities[0]).toContain('check:quality');
  });

  it('fails closed when the required-check configuration is empty', () => {
    const findings = collectRequiredCheckFindings(packet(), []);
    expect(findings.map((finding: any) => finding.identity))
      .toEqual(['checks:required-set-missing']);
  });

  it('excludes outdated and prior-head review evidence', () => {
    const result = classifyDisposition(packet({
      reviewEvidence: {
        unresolvedReviewThreads: [
          thread('outdated', 'implementation', { isOutdated: true }),
          thread('prior', 'implementation', { headSha: HEAD_B }),
        ],
        reviewSubmissions: [],
        lateIssueComments: [],
      },
    }), { requiredChecks: ['quality'] }) as any;
    expect(result.classification).toBe(DISPOSITION_CLASSES.CLEAN);
  });

  it('allows one exact live bounded implementation authorization', () => {
    const findings = [{
      identity: 'review-thread:thread-1',
      source: 'review_thread',
      decisionClass: 'implementation',
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
    const result = classifyDisposition(packet({
      reviewEvidence: {
        unresolvedReviewThreads: [thread()],
        reviewSubmissions: [],
        lateIssueComments: [],
      },
    }), {
      requiredChecks: ['quality'],
      findings,
      authorizations: extracted.authorizations,
      dispositionRevision: extracted.dispositionRevision,
    }) as any;
    expect(result.classification).toBe(DISPOSITION_CLASSES.BOUNDED_CORRECTION);
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
  ])('never downgrades protected class %s', (decisionClass) => {
    const input = liveInput({
      threads: [thread('thread-1', decisionClass)],
      comments: [sourceDecision({ decisionClass: 'implementation' })],
    });
    const result = runController(input) as any;
    expect(result.remediation.classification.classification)
      .toBe(DISPOSITION_CLASSES.PROTECTED_STOP);
    expect(result.remediation.actions.map((action: any) => action.type))
      .toEqual(['post_source_issue_escalation']);
  });
});

describe('one-transition remediation transaction', () => {
  it('emits response first, resume after live reread, then deduplicates', () => {
    const first = runController(liveInput()) as any;
    expect(first.ok).toBe(true);
    expect(first.remediation.actions.map((action: any) => action.type))
      .toEqual(['post_source_issue_response']);

    const responseComment = {
      id: '5067000001',
      html_url:
        'https://github.com/wdhunter645/next-starter-template/issues/2771#issuecomment-5067000001',
      createdAt: '2026-07-24T03:41:00Z',
      body: first.remediation.actions[0].body,
    };
    const second = runController(liveInput({
      comments: [sourceDecision(), responseComment],
    })) as any;
    expect(second.remediation.actions.map((action: any) => action.type))
      .toEqual(['post_local_cursor_resume']);
    expect(second.remediation.actions[0].body).toContain(responseComment.html_url);

    const resumeComment = {
      id: '5067000002',
      createdAt: '2026-07-24T03:42:00Z',
      body: second.remediation.actions[0].body,
    };
    const third = runController(liveInput({
      comments: [sourceDecision(), responseComment, resumeComment],
    })) as any;
    expect(third.remediation.actions).toEqual([]);
  });

  it('ignores fabricated caller authority', () => {
    const input: any = liveInput({ comments: [] });
    input.findings = [{ identity: 'review-thread:thread-1' }];
    input.authorizations = [{
      findingIdentity: 'review-thread:thread-1',
      authorized: true,
      disposition: DISPOSITION_CLASSES.BOUNDED_CORRECTION,
      decisionClass: 'implementation',
      headSha: HEAD_A,
      sourceIssueDecisionUrl:
        'https://github.com/wdhunter645/next-starter-template/issues/2771#issuecomment-999',
    }];
    const result = runController(input) as any;
    expect(result.remediation.classification.classification)
      .toBe(DISPOSITION_CLASSES.PROTECTED_STOP);
  });

  it('does not self-trigger on emitted transaction comments', () => {
    const input: any = liveInput();
    input.live.issueComments.push({
      id: 'response',
      createdAt: '2026-07-24T03:35:00Z',
      body: 'ADJUSTMENT\n<!-- agent-routing-response:response:existing -->',
    });
    const result = runController(input) as any;
    expect(result.remediation.classification.evidence.currentHeadFindingIdentities)
      .toEqual(['review-thread:thread-1']);
  });

  it('suppresses a stale lower revision on the same head', () => {
    const result = routeRemediation({
      packet: packet({
        reviewEvidence: {
          unresolvedReviewThreads: [thread()],
          reviewSubmissions: [],
          lateIssueComments: [],
        },
      }),
      requiredChecks: ['quality'],
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

  it('uses all disposition identity dimensions', () => {
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
