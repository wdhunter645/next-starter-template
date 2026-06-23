import { describe, expect, it } from 'vitest';
import {
  assessReviewerLifecycle,
  computeCurrentHeadLinkedReview,
  countUnresolvedProtectedThreads,
  hasProtectedScopeBreakGlass,
  hasStaleTrustedReviewOnly,
  isProtectedPath,
} from '../scripts/ci/reviewer_lifecycle_gate.mjs';

describe('reviewer lifecycle gate assessment', () => {
  it('does not block docs-only PRs without current-head review artifacts', () => {
    const result = assessReviewerLifecycle({
      eventName: 'pull_request_target',
      labels: ['docs-only'],
      files: ['docs/explanation/ci/lgfc-reviewer-lifecycle-redesign.md'],
      enforceFailure: true,
      issueComments: [{ user: { login: 'copilot-pull-request-reviewer[bot]' }, body: 'Advisory note only.' }],
    });

    expect(result.shouldFail).toBe(false);
    expect(result.assessment.ok).toBe(true);
    expect(result.assessment.severity).toBe('advisory');
  });

  it('blocks protected workflow changes without a current-head trusted review', () => {
    const result = assessReviewerLifecycle({
      eventName: 'pull_request_target',
      labels: ['infra'],
      files: ['.github/workflows/reviewer-response-completion.yml'],
      enforceFailure: true,
      reviews: [],
      reviewComments: [],
      headSha: 'abc123',
    });

    expect(result.shouldFail).toBe(true);
    expect(result.assessment.reason).toBe('missing-current-head-review-for-protected-scope');
  });

  it('enforces failure on pull_request_review events with undispositioned comments', () => {
    const result = assessReviewerLifecycle({
      eventName: 'pull_request_review',
      labels: ['infra'],
      files: ['.github/workflows/reviewer-response-completion.yml'],
      enforceFailure: true,
      headSha: 'abc123',
      body: '## REVIEWER RESPONSE ACCOUNTING\n- reviewed',
      reviewComments: [{
        id: 4001,
        user: { login: 'copilot-pull-request-reviewer[bot]' },
        commit_id: 'abc123',
        path: 'src/app/page.tsx',
        line: 10,
        body: 'P1: Please fix this issue.',
        created_at: '2026-06-01T00:00:00Z',
      }],
      reviews: [{
        user: { login: 'copilot-pull-request-reviewer[bot]' },
        commit_id: 'abc123',
        state: 'COMMENTED',
      }],
    });

    expect(result.shouldFail).toBe(true);
    expect(result.assessment.severity).toBe('blocking');
  });

  it('detects current-head linked trusted review artifacts', () => {
    const linked = computeCurrentHeadLinkedReview({
      headSha: 'abc123',
      reviews: [{ user: { login: 'copilot-pull-request-reviewer[bot]' }, commit_id: 'abc123', state: 'COMMENTED' }],
      reviewComments: [],
    });

    expect(linked).toBe(true);
  });

  it('does not accept stale trusted review on an earlier commit for protected scope', () => {
    const result = assessReviewerLifecycle({
      eventName: 'pull_request_target',
      labels: ['infra'],
      files: ['.github/workflows/reviewer-response-completion.yml'],
      enforceFailure: true,
      headSha: 'new-sha',
      reviews: [{
        user: { login: 'copilot-pull-request-reviewer[bot]' },
        commit_id: 'old-sha',
        state: 'APPROVED',
      }],
      reviewComments: [],
    });

    expect(result.shouldFail).toBe(true);
    expect(result.assessment.reason).toBe('stale-trusted-review-for-protected-scope');
    expect(hasStaleTrustedReviewOnly({
      headSha: 'new-sha',
      reviews: [{
        user: { login: 'copilot-pull-request-reviewer[bot]' },
        commit_id: 'old-sha',
        state: 'APPROVED',
      }],
    })).toBe(true);
  });

  it('allows protected scope break-glass with recovery label and explicit marker', () => {
    const result = assessReviewerLifecycle({
      eventName: 'pull_request_target',
      labels: ['recovery'],
      files: ['.github/workflows/reviewer-response-completion.yml'],
      body: 'Emergency fix.\n<!-- reviewer-lifecycle-break-glass -->',
      enforceFailure: true,
      headSha: 'new-sha',
      reviews: [],
      reviewComments: [],
    });

    expect(result.shouldFail).toBe(false);
    expect(result.breakGlassOverride).toBe(true);
    expect(result.assessment.reason).toBe('break-glass-override-for-protected-scope');
    expect(hasProtectedScopeBreakGlass({
      labels: ['recovery'],
      body: '<!-- reviewer-lifecycle-break-glass -->',
    })).toBe(true);
  });

  it('does not allow break-glass marker without recovery label', () => {
    const result = assessReviewerLifecycle({
      eventName: 'pull_request_target',
      labels: ['infra'],
      files: ['.github/workflows/reviewer-response-completion.yml'],
      body: '<!-- reviewer-lifecycle-break-glass -->',
      enforceFailure: true,
      headSha: 'new-sha',
    });

    expect(result.shouldFail).toBe(true);
    expect(result.breakGlassOverride).toBe(false);
  });

  it('counts unresolved protected inline review threads', () => {
    const count = countUnresolvedProtectedThreads({
      reviewComments: [{
        id: 1,
        user: { login: 'copilot-pull-request-reviewer[bot]' },
        commit_id: 'abc123',
        path: 'scripts/ci/reviewer_lifecycle_gate.mjs',
        line: 12,
        body: 'Please fix this protected CI script issue.',
      }],
      reviews: [],
    });

    expect(count).toBe(1);
    expect(isProtectedPath('scripts/ci/reviewer_lifecycle_gate.mjs')).toBe(true);
  });

  it('still counts stale-commit protected threads after a new head commit', () => {
    const count = countUnresolvedProtectedThreads({
      reviewComments: [{
        id: 1,
        user: { login: 'copilot-pull-request-reviewer[bot]' },
        commit_id: 'old-sha',
        path: 'scripts/ci/reviewer_lifecycle_gate.mjs',
        line: 12,
        body: 'Please fix this protected CI script issue.',
      }],
      reviews: [],
    });

    expect(count).toBe(1);
  });

  it('does not count protected threads dispositioned in the PR body', () => {
    const count = countUnresolvedProtectedThreads({
      body: [
        '## REVIEWER RESPONSE ACCOUNTING',
        'Reviewer items:',
        '- review-comment:3382496983 — accepted — Added optional chaining — thread state: resolved',
      ].join('\n'),
      reviewComments: [{
        id: 3382496983,
        user: { login: 'gemini-code-assist[bot]' },
        commit_id: 'abc123',
        path: 'scripts/ci/post_merge_remediation_issue.mjs',
        line: 12,
        body: 'Add optional chaining.',
      }],
      reviews: [],
    });

    expect(count).toBe(0);
  });

  it('does not count protected threads resolved by a later reply', () => {
    const count = countUnresolvedProtectedThreads({
      reviewComments: [
        {
          id: 1,
          user: { login: 'copilot-pull-request-reviewer[bot]' },
          commit_id: 'old-sha',
          path: 'scripts/ci/reviewer_lifecycle_gate.mjs',
          line: 12,
          body: 'Please fix this protected CI script issue.',
          created_at: '2026-06-01T00:00:00Z',
        },
        {
          id: 2,
          in_reply_to_id: 1,
          user: { login: 'author' },
          commit_id: 'new-sha',
          path: 'scripts/ci/reviewer_lifecycle_gate.mjs',
          line: 12,
          body: '✅ Addressed in latest commit.',
          created_at: '2026-06-02T00:00:00Z',
        },
      ],
      reviews: [],
    });

    expect(count).toBe(0);
  });

  it('uses the latest trusted review state instead of stale changes requested', () => {
    const count = countUnresolvedProtectedThreads({
      reviewComments: [],
      reviews: [
        {
          id: 1,
          user: { login: 'copilot-pull-request-reviewer[bot]' },
          commit_id: 'old-sha',
          state: 'CHANGES_REQUESTED',
          body: 'Please update the workflow.',
          submitted_at: '2026-06-01T00:00:00Z',
        },
        {
          id: 2,
          user: { login: 'copilot-pull-request-reviewer[bot]' },
          commit_id: 'new-sha',
          state: 'APPROVED',
          body: 'Looks good now.',
          submitted_at: '2026-06-02T00:00:00Z',
        },
      ],
    });

    expect(count).toBe(0);
  });

  it('does not block website-only PR when late findings are dispositioned', () => {
    const body = [
      'Status: READY FOR REVIEW',
      '## REVIEWER RESPONSE ACCOUNTING',
      '- review-comment:9001 — accepted — Fixed in latest commit — thread state: resolved',
    ].join('\n');

    const result = assessReviewerLifecycle({
      eventName: 'pull_request_target',
      labels: ['infra'],
      files: ['src/app/admin/cms/page.tsx'],
      enforceFailure: true,
      headSha: 'current-head',
      body,
      readyForReviewAt: '2026-06-11T10:00:00Z',
      reviewComments: [{
        id: 9001,
        user: { login: 'copilot-pull-request-reviewer[bot]' },
        commit_id: 'current-head',
        path: 'src/app/admin/cms/page.tsx',
        line: 10,
        body: 'Please fix this after ready.',
        created_at: '2026-06-11T12:00:00Z',
      }],
      reviews: [{
        user: { login: 'copilot-pull-request-reviewer[bot]' },
        commit_id: 'current-head',
        state: 'COMMENTED',
      }],
    });

    expect(result.shouldFail).toBe(false);
    expect(result.reviewerDisposition.lateFindingsCount).toBe(1);
    expect(result.reviewerDisposition.lateUndispositionedCount).toBe(0);
  });

  it('blocks current-head undispositioned inline findings on website scope', () => {
    const result = assessReviewerLifecycle({
      eventName: 'pull_request_target',
      labels: ['infra'],
      files: ['src/app/admin/cms/page.tsx'],
      enforceFailure: true,
      headSha: 'current-head',
      body: '## REVIEWER RESPONSE ACCOUNTING\n- reviewed',
      reviewComments: [{
        id: 9002,
        user: { login: 'copilot-pull-request-reviewer[bot]' },
        commit_id: 'current-head',
        path: 'src/app/admin/cms/page.tsx',
        line: 10,
        body: 'Please fix this blocking issue.',
        created_at: '2026-06-01T00:00:00Z',
      }],
    });

    expect(result.shouldFail).toBe(true);
    expect(result.assessment.reason).toBe('undispositioned-reviewer-comment');
  });

  it('does not block outdated prior-head findings with explicit disposition', () => {
    const result = assessReviewerLifecycle({
      eventName: 'pull_request_target',
      labels: ['infra'],
      files: ['src/app/admin/cms/page.tsx'],
      enforceFailure: true,
      headSha: 'new-sha',
      body: [
        '## REVIEWER RESPONSE ACCOUNTING',
        '- review-comment:9003 — acknowledged — Superseded by refactor — thread state: outdated',
      ].join('\n'),
      reviewComments: [{
        id: 9003,
        user: { login: 'gemini-code-assist[bot]' },
        commit_id: 'old-sha',
        path: 'src/app/admin/cms/page.tsx',
        line: 12,
        body: 'Outdated finding on prior commit.',
        created_at: '2026-06-01T00:00:00Z',
      }],
    });

    expect(result.shouldFail).toBe(false);
  });

  it('blocks protected scope when unresolved threads survive a new commit', () => {
    const result = assessReviewerLifecycle({
      eventName: 'pull_request_target',
      labels: ['infra'],
      files: ['.github/workflows/reviewer-response-completion.yml'],
      enforceFailure: true,
      headSha: 'new-sha',
      reviews: [{
        user: { login: 'copilot-pull-request-reviewer[bot]' },
        commit_id: 'new-sha',
        state: 'COMMENTED',
      }],
      reviewComments: [{
        id: 1,
        user: { login: 'copilot-pull-request-reviewer[bot]' },
        commit_id: 'old-sha',
        path: 'scripts/ci/reviewer_lifecycle_gate.mjs',
        line: 12,
        body: 'Unresolved protected CI finding.',
      }],
    });

    expect(result.shouldFail).toBe(true);
    expect(['unresolved-protected-review-thread', 'outdated-reviewer-thread-without-disposition', 'undispositioned-reviewer-comment']).toContain(result.assessment.reason);
  });
});
