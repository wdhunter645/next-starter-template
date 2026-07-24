// @ts-nocheck -- Runtime contract suite exercises untyped JavaScript controller modules.
import { describe, expect, it } from 'vitest';

import { runController } from '../scripts/agent-routing/controller.mjs';
import {
  classifyDisposition,
  collectRequiredCheckFindings,
  DISPOSITION_CLASSES,
} from '../scripts/agent-routing/lib/disposition.mjs';
import { routeRemediation } from '../scripts/agent-routing/lib/remediation-router.mjs';

const HEAD = '1111111111111111111111111111111111111111';
const OTHER = '2222222222222222222222222222222222222222';

function packet(overrides = {}) {
  return {
    sourceIssue: { number: 2771, state: 'OPEN' },
    pullRequest: {
      number: 2835,
      headSha: HEAD,
      headRef: 'cursor/2677-002-review-remediation-routing-f1de',
      url: 'https://github.com/wdhunter645/next-starter-template/pull/2835',
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

function reviewThread(decisionClass = 'implementation', extra = {}) {
  return {
    id: 'thread-1',
    isResolved: false,
    isOutdated: false,
    body: 'Correct the bounded implementation defect.',
    decisionClass,
    ...extra,
  };
}

function decisionComment(overrides = {}) {
  const id = overrides.id || '5066000001';
  return {
    id,
    html_url:
      `https://github.com/wdhunter645/next-starter-template/issues/2771#issuecomment-${id}`,
    createdAt: '2026-07-24T03:30:00Z',
    author: { login: overrides.author || 'wdhunter645' },
    body: `ADJUSTMENT
Status: bounded correction authorized
PR: #2835
Head SHA: ${overrides.headSha || HEAD}
Finding identity: ${overrides.findingIdentity || 'review-thread:thread-1'}
Decision class: ${overrides.decisionClass || 'implementation'}
Disposition revision: ${overrides.revision || '3'}
Requested action:
- Correct only the bounded implementation defect.`,
  };
}

function liveInput(overrides = {}) {
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
- Approval profile: protected-change-review
- Gate profile: component-child
- Component branch: component/deterministic-handoff-controller
- Component master: #2677`,
        baseRefName: 'component/deterministic-handoff-controller',
        headRefName: 'cursor/2677-002-review-remediation-routing-f1de',
        headSha: HEAD,
        head: { sha: HEAD },
        url: 'https://github.com/wdhunter645/next-starter-template/pull/2835',
      },
      headSha: HEAD,
      changedFiles: ['scripts/agent-routing/lib/disposition.mjs'],
      checks: overrides.checks || [
        {
          name: 'quality',
          status: 'completed',
          conclusion: 'success',
          headSha: HEAD,
        },
      ],
      issueComments: [trigger, ...(overrides.comments || [decisionComment()])],
      reviewSubmissions: [],
      reviewThreads: overrides.threads || [reviewThread()],
    },
    triggerComment: trigger,
  };
}

describe('required current-head checks', () => {
  it('classifies clean only when configured checks are current and successful', () => {
    const result = classifyDisposition(packet(), { requiredChecks: ['quality'] });
    expect(result.classification).toBe(DISPOSITION_CLASSES.CLEAN);
  });

  it.each([
    ['missing', []],
    [
      'pending',
      [{ name: 'quality', status: 'in_progress', conclusion: null, headSha: HEAD }],
    ],
    [
      'failed',
      [{ name: 'quality', status: 'completed', conclusion: 'failure', headSha: HEAD }],
    ],
    [
      'stale',
      [{ name: 'quality', status: 'completed', conclusion: 'success', headSha: OTHER }],
    ],
  ])('blocks %s required-check evidence', (_label, checks) => {
    const result = classifyDisposition(packet({ checks }), {
      requiredChecks: ['quality'],
    });
    expect(result.classification).toBe(DISPOSITION_CLASSES.PROTECTED_STOP);
  });

  it('fails closed when the required-check set is empty', () => {
    expect(collectRequiredCheckFindings(packet(), []).map((finding) => finding.identity))
      .toEqual(['checks:required-set-missing']);
  });
});

describe('current-head review authority', () => {
  it('excludes outdated and prior-head review evidence', () => {
    const result = classifyDisposition(packet({
      reviewEvidence: {
        unresolvedReviewThreads: [
          reviewThread('implementation', { isOutdated: true }),
          reviewThread('implementation', { headSha: OTHER }),
        ],
        reviewSubmissions: [],
        lateIssueComments: [],
      },
    }), { requiredChecks: ['quality'] });
    expect(result.classification).toBe(DISPOSITION_CLASSES.CLEAN);
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
    const result = runController(liveInput({
      threads: [reviewThread(decisionClass)],
      comments: [decisionComment({ decisionClass: 'implementation' })],
    }));
    expect(result.remediation.classification.classification)
      .toBe(DISPOSITION_CLASSES.PROTECTED_STOP);
    expect(result.remediation.actions.map((action) => action.type))
      .toEqual(['post_source_issue_escalation']);
  });

  it('ignores untrusted source-Issue authority', () => {
    const result = runController(liveInput({
      comments: [decisionComment({ author: 'untrusted-user' })],
    }));
    expect(result.remediation.classification.classification)
      .toBe(DISPOSITION_CLASSES.PROTECTED_STOP);
  });

  it('does not reclassify a valid source decision as a late finding', () => {
    const result = runController(liveInput());
    expect(result.remediation.classification.evidence.currentHeadFindingIdentities)
      .toEqual(['review-thread:thread-1']);
  });
});

describe('one-transition remediation transaction', () => {
  it('emits response first, resume after live reread, then deduplicates', () => {
    const first = runController(liveInput());
    expect(first.remediation.actions.map((action) => action.type))
      .toEqual(['post_source_issue_response']);

    const responseComment = {
      id: '5067000001',
      html_url:
        'https://github.com/wdhunter645/next-starter-template/issues/2771#issuecomment-5067000001',
      createdAt: '2026-07-24T03:41:00Z',
      author: { login: 'wdhunter645' },
      body: first.remediation.actions[0].body,
    };
    const second = runController(liveInput({
      comments: [decisionComment(), responseComment],
    }));
    expect(second.remediation.actions.map((action) => action.type))
      .toEqual(['post_local_cursor_resume']);
    expect(second.remediation.actions[0].body).toContain(responseComment.html_url);

    const resumeComment = {
      id: '5067000002',
      createdAt: '2026-07-24T03:42:00Z',
      author: { login: 'wdhunter645' },
      body: second.remediation.actions[0].body,
    };
    const third = runController(liveInput({
      comments: [decisionComment(), responseComment, resumeComment],
    }));
    expect(third.remediation.actions).toEqual([]);
  });

  it('suppresses a stale lower revision on the same head', () => {
    const result = routeRemediation({
      packet: packet({
        reviewEvidence: {
          unresolvedReviewThreads: [reviewThread()],
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
        headSha: HEAD,
      }],
      dispositionRevision: '2',
      latestDisposition: { headSha: HEAD, dispositionRevision: '10' },
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe('stale_disposition_revision');
    expect(result.actions).toEqual([]);
  });
});
