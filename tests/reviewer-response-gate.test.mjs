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

describe('reviewer response gate enforcement by event', () => {
  it('passes initial pull_request_target with no reviewer comments', () => {
    const lifecycle = assessReviewerLifecycle({
      eventName: 'pull_request_target',
      labels: ['infra'],
      files: ['src/app/page.tsx'],
      enforceFailure: true,
      headSha: 'head-sha',
      body: '## REVIEWER RESPONSE ACCOUNTING\n- reviewed',
      reviewComments: [],
      reviews: [],
      issueComments: [],
    });

    expect(lifecycle.shouldFail).toBe(false);
    expect(lifecycle.assessment.ok).toBe(true);
  });

  it('fails pull_request_review_comment when trusted inline comment is undispositioned', () => {
    const lifecycle = assessReviewerLifecycle({
      eventName: 'pull_request_review_comment',
      labels: ['infra'],
      files: ['src/app/page.tsx'],
      enforceFailure: true,
      headSha: 'head-sha',
      body: '## REVIEWER RESPONSE ACCOUNTING\n- reviewed',
      reviewComments: [trustedInlineComment],
    });

    expect(lifecycle.shouldFail).toBe(true);
    expect(lifecycle.assessment.severity).toBe('blocking');
    expect(lifecycle.assessment.reason).toBe('undispositioned-reviewer-comment');
  });

  it('fails pull_request_review when trusted review submission is undispositioned', () => {
    const lifecycle = assessReviewerLifecycle({
      eventName: 'pull_request_review',
      labels: ['infra'],
      files: ['src/app/page.tsx'],
      enforceFailure: true,
      headSha: 'head-sha',
      body: '## REVIEWER RESPONSE ACCOUNTING\n- reviewed',
      reviews: [{
        id: 8001,
        user: { login: 'gemini-code-assist[bot]' },
        commit_id: 'head-sha',
        state: 'CHANGES_REQUESTED',
        body: 'P1: Request changes before merge.',
        submitted_at: '2026-06-01T00:00:00Z',
      }],
    });

    expect(lifecycle.shouldFail).toBe(true);
    expect(lifecycle.assessment.severity).toBe('blocking');
    expect(lifecycle.assessment.reason).toBe('undispositioned-reviewer-comment');
  });

  it('passes issue_comment event after PR body records valid disposition', () => {
    const lifecycle = assessReviewerLifecycle({
      eventName: 'issue_comment',
      labels: ['infra'],
      files: ['src/app/page.tsx'],
      enforceFailure: true,
      headSha: 'head-sha',
      body: dispositionBody,
      reviewComments: [trustedInlineComment],
    });

    expect(lifecycle.shouldFail).toBe(false);
    expect(lifecycle.assessment.ok).toBe(true);
  });

  it('does not block on untrusted general comments', () => {
    const lifecycle = assessReviewerLifecycle({
      eventName: 'pull_request_review_comment',
      labels: ['infra'],
      files: ['src/app/page.tsx'],
      enforceFailure: true,
      headSha: 'head-sha',
      body: '## REVIEWER RESPONSE ACCOUNTING\n- reviewed',
      reviewComments: [{
        id: 9001,
        user: { login: 'random-contributor' },
        commit_id: 'head-sha',
        path: 'src/app/page.tsx',
        line: 4,
        body: 'P1: Please fix this.',
        created_at: '2026-06-01T00:00:00Z',
      }],
      issueComments: [{
        id: 9002,
        user: { login: 'maintainer' },
        body: 'Thanks for the review.',
        created_at: '2026-06-01T01:00:00Z',
      }],
    });

    expect(lifecycle.shouldFail).toBe(false);
    expect(lifecycle.reviewerDisposition.undispositionedCount).toBe(0);
  });

  it('blocks outdated comments without explicit accepted disposition', () => {
    const lifecycle = assessReviewerLifecycle({
      eventName: 'pull_request_review',
      labels: ['infra'],
      files: ['src/app/page.tsx'],
      enforceFailure: true,
      headSha: 'new-sha',
      body: '## REVIEWER RESPONSE ACCOUNTING\n- reviewed',
      reviewComments: [{
        id: 9003,
        user: { login: 'copilot-pull-request-reviewer[bot]' },
        commit_id: 'old-sha',
        path: 'src/app/page.tsx',
        line: 12,
        body: 'P2: Outdated finding on prior commit.',
        created_at: '2026-06-01T00:00:00Z',
      }],
    });

    expect(lifecycle.shouldFail).toBe(true);
    expect(lifecycle.assessment.reason).toBe('outdated-reviewer-thread-without-disposition');
  });

  it('passes outdated comments with explicit accepted exclusion disposition', () => {
    const lifecycle = assessReviewerLifecycle({
      eventName: 'pull_request_review',
      labels: ['infra'],
      files: ['src/app/page.tsx'],
      enforceFailure: true,
      headSha: 'new-sha',
      body: [
        '## REVIEWER RESPONSE ACCOUNTING',
        '- review-comment:9004 — acknowledged — Superseded by refactor — thread state: outdated',
      ].join('\n'),
      reviewComments: [{
        id: 9004,
        user: { login: 'gemini-code-assist[bot]' },
        commit_id: 'old-sha',
        path: 'src/app/page.tsx',
        line: 12,
        body: 'P2: Outdated finding on prior commit.',
        created_at: '2026-06-01T00:00:00Z',
      }],
    });

    expect(lifecycle.shouldFail).toBe(false);
  });

  it('reports blocking severity through assessReviewerResponseGate when enforcing', () => {
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

  it('blocks via evaluateReviewerAccounting on review events with undispositioned comments', () => {
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
