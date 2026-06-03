import { describe, expect, it } from 'vitest';
import {
  assessReviewerLifecycle,
  computeCurrentHeadLinkedReview,
  countUnresolvedProtectedThreads,
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

  it('does not enforce failure on non-target events', () => {
    const result = assessReviewerLifecycle({
      eventName: 'pull_request_review',
      labels: ['infra'],
      files: ['.github/workflows/reviewer-response-completion.yml'],
      enforceFailure: false,
      currentHeadLinkedReview: false,
    });

    expect(result.shouldFail).toBe(false);
  });

  it('detects current-head linked trusted review artifacts', () => {
    const linked = computeCurrentHeadLinkedReview({
      headSha: 'abc123',
      reviews: [{ user: { login: 'copilot-pull-request-reviewer[bot]' }, commit_id: 'abc123', state: 'COMMENTED' }],
      reviewComments: [],
    });

    expect(linked).toBe(true);
  });

  it('counts unresolved protected inline review threads', () => {
    const count = countUnresolvedProtectedThreads({
      headSha: 'abc123',
      reviewComments: [{
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
});
