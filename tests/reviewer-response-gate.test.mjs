import { describe, expect, it } from 'vitest';
import { assessReviewerResponseGate } from '../scripts/ci/reviewer-response-gate.mjs';
import { assessReviewerLifecycle } from '../scripts/ci/reviewer_lifecycle_gate.mjs';
import { evaluateReviewerAccounting, isEnforcingReviewerLifecycleEvent } from '../scripts/ci/reviewer-gate-simulation.mjs';

const trustedInlineComment = {
  id: 7001,
  user: { login: 'copilot-pull-request-reviewer[bot]' },
  commit_id: 'head-sha',
  path: 'src/app/page.tsx',
  line: 10,
  body: 'P1: Please fix this blocking issue.',
  created_at: '2026-06-01T00:00:00Z',
};

const dispositionBody = [
  '## REVIEWER RESPONSE ACCOUNTING',
  '- review-comment:7001 — accepted — Fixed in latest commit — thread state: resolved',
].join('\n');

describe('reviewer lifecycle enforcing events', () => {
  it('recognizes all pre-merge reviewer lifecycle enforcing events', () => {
    expect(isEnforcingReviewerLifecycleEvent('pull_request_target')).toBe(true);
    expect(isEnforcingReviewerLifecycleEvent('pull_request_review')).toBe(true);
    expect(isEnforcingReviewerLifecycleEvent('pull_request_review_comment')).toBe(true);
    expect(isEnforcingReviewerLifecycleEvent('issue_comment')).toBe(true);
    expect(isEnforcingReviewerLifecycleEvent('pull_request')).toBe(false);
  });
});

describe('reviewer lifecycle native enforcement by event', () => {
  it('passes initial pull_request_target with no review blockers', () => {
    const lifecycle = assessReviewerLifecycle({
      eventName: 'pull_request_target',
      labels: ['infra'],
      files: ['src/app/page.tsx'],
      enforceFailure: true,
      reviewThreads: [],
      reviews: [],
    });

    expect(lifecycle.shouldFail).toBe(false);
    expect(lifecycle.assessment.ok).toBe(true);
  });

  it('blocks pull_request_review_comment when a human review thread is unresolved', () => {
    const lifecycle = assessReviewerLifecycle({
      eventName: 'pull_request_review_comment',
      labels: ['infra'],
      files: ['src/app/page.tsx'],
      enforceFailure: true,
      reviewThreads: [{
        id: 'thread-7001',
        isResolved: false,
        isOutdated: false,
        path: 'src/app/page.tsx',
        comments: { nodes: [{ author: { login: 'human-reviewer' }, body: 'Please fix this blocking issue.' }] },
      }],
    });

    expect(lifecycle.shouldFail).toBe(true);
    expect(lifecycle.assessment.severity).toBe('blocking');
    expect(lifecycle.assessment.reason).toBe('unresolved-human-review-thread');
  });

  it('blocks pull_request_review when latest human review requests changes', () => {
    const lifecycle = assessReviewerLifecycle({
      eventName: 'pull_request_review',
      labels: ['infra'],
      files: ['src/app/page.tsx'],
      enforceFailure: true,
      reviews: [{
        author: { login: 'human-reviewer' },
        state: 'CHANGES_REQUESTED',
        submittedAt: '2026-06-01T00:00:00Z',
      }],
    });

    expect(lifecycle.shouldFail).toBe(true);
    expect(lifecycle.assessment.severity).toBe('blocking');
    expect(lifecycle.assessment.reason).toBe('human-changes-requested');
  });

  it('does not require PR-body disposition after GitHub thread is resolved', () => {
    const lifecycle = assessReviewerLifecycle({
      eventName: 'issue_comment',
      labels: ['infra'],
      files: ['src/app/page.tsx'],
      enforceFailure: true,
      reviewThreads: [{
        id: 'thread-7001',
        isResolved: true,
        isOutdated: false,
        path: 'src/app/page.tsx',
        comments: { nodes: [{ author: { login: 'human-reviewer' }, body: 'Resolved finding.' }] },
      }],
    });

    expect(lifecycle.shouldFail).toBe(false);
    expect(lifecycle.assessment.ok).toBe(true);
  });

  it('keeps trusted bot inline findings advisory by default', () => {
    const lifecycle = assessReviewerLifecycle({
      eventName: 'pull_request_review_comment',
      labels: ['infra'],
      files: ['src/app/page.tsx'],
      enforceFailure: true,
      reviewThreads: [{
        id: 'bot-thread',
        isResolved: false,
        isOutdated: false,
        path: 'src/app/page.tsx',
        comments: { nodes: [{ author: { login: 'copilot-pull-request-reviewer[bot]' }, body: 'P1: Please fix this.' }] },
      }],
    });

    expect(lifecycle.shouldFail).toBe(false);
    expect(lifecycle.assessment.severity).toBe('advisory');
  });

  it('does not block outdated GitHub review threads', () => {
    const lifecycle = assessReviewerLifecycle({
      eventName: 'pull_request_review',
      labels: ['infra'],
      files: ['src/app/page.tsx'],
      enforceFailure: true,
      reviewThreads: [{
        id: 'thread-9003',
        isResolved: false,
        isOutdated: true,
        path: 'src/app/page.tsx',
        comments: { nodes: [{ author: { login: 'human-reviewer' }, body: 'Outdated finding on prior commit.' }] },
      }],
    });

    expect(lifecycle.shouldFail).toBe(false);
    expect(lifecycle.reviewThreads.outdated).toHaveLength(1);
  });

  it('reports blocking severity through legacy response gate until retired', () => {
    const gate = assessReviewerResponseGate({
      enforceFailure: true,
      body: '## REVIEWER RESPONSE ACCOUNTING\n- reviewed',
      reviewComments: [trustedInlineComment],
      headSha: 'head-sha',
    });

    expect(gate.shouldFail).toBe(true);
    expect(gate.report).toContain('Reviewer response gate failed.');
    expect(gate.report).toContain('Enforcing event: yes');
  });

  it('legacy response gate passes when body disposition is present until retired', () => {
    const gate = assessReviewerResponseGate({
      enforceFailure: true,
      body: dispositionBody,
      reviewComments: [trustedInlineComment],
      headSha: 'head-sha',
    });

    expect(gate.shouldFail).toBe(false);
  });

  it('legacy accounting helper still blocks when explicitly given undispositioned comments', () => {
    const accounting = evaluateReviewerAccounting({
      eventName: 'pull_request_review',
      labels: ['infra'],
      files: ['src/app/page.tsx'],
      currentHeadLinkedReview: true,
      undispositionedReviewerComments: 1,
    });

    expect(accounting.ok).toBe(false);
    expect(accounting.severity).toBe('blocking');
    expect(accounting.reason).toBe('undispositioned-reviewer-comment');
  });
});
