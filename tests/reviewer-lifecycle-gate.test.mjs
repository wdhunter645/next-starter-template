import { describe, expect, it } from 'vitest';
import {
  assessReviewerLifecycle,
  buildReviewerLifecycleReport,
  hasExceptionLabel,
  humanChangesRequested,
  isProtectedPath,
  isTrustedReviewer,
  latestReviewByAuthor,
  unresolvedReviewThreads,
} from '../scripts/ci/reviewer_lifecycle_gate.mjs';

describe('GitHub-native reviewer lifecycle gate assessment', () => {
  it('uses latest review state per author', () => {
    const latest = latestReviewByAuthor([
      { author: { login: 'human-reviewer' }, state: 'CHANGES_REQUESTED', submittedAt: '2026-07-01T00:00:00Z' },
      { author: { login: 'human-reviewer' }, state: 'APPROVED', submittedAt: '2026-07-02T00:00:00Z' },
    ]);

    expect(latest.get('human-reviewer').state).toBe('APPROVED');
    expect(humanChangesRequested([...latest.values()])).toEqual([]);
  });

  it('blocks when a human reviewer latest state is CHANGES_REQUESTED', () => {
    const result = assessReviewerLifecycle({
      enforceFailure: true,
      files: ['src/app/page.tsx'],
      reviews: [
        { author: { login: 'human-reviewer' }, state: 'COMMENTED', submittedAt: '2026-07-01T00:00:00Z' },
        { author: { login: 'human-reviewer' }, state: 'CHANGES_REQUESTED', submittedAt: '2026-07-02T00:00:00Z' },
      ],
    });

    expect(result.shouldFail).toBe(true);
    expect(result.assessment.reason).toBe('human-changes-requested');
    expect(result.humanChangesRequested).toHaveLength(1);
  });

  it('does not block on trusted bot CHANGES_REQUESTED review state', () => {
    const result = assessReviewerLifecycle({
      enforceFailure: true,
      files: ['src/app/page.tsx'],
      reviews: [
        { author: { login: 'copilot-pull-request-reviewer[bot]' }, state: 'CHANGES_REQUESTED', submittedAt: '2026-07-02T00:00:00Z' },
      ],
    });

    expect(result.shouldFail).toBe(false);
    expect(result.assessment.ok).toBe(true);
  });

  it('blocks unresolved non-outdated human review threads', () => {
    const result = assessReviewerLifecycle({
      enforceFailure: true,
      files: ['src/app/page.tsx'],
      reviewThreads: [{
        id: 'thread-1',
        isResolved: false,
        isOutdated: false,
        path: 'src/app/page.tsx',
        comments: { nodes: [{ author: { login: 'human-reviewer' }, body: 'Please fix this.' }] },
      }],
    });

    expect(result.shouldFail).toBe(true);
    expect(result.assessment.reason).toBe('unresolved-human-review-thread');
    expect(result.reviewThreads.blocking).toHaveLength(1);
  });

  it('does not block resolved or outdated review threads', () => {
    const state = unresolvedReviewThreads([
      {
        id: 'resolved-thread',
        isResolved: true,
        isOutdated: false,
        comments: { nodes: [{ author: { login: 'human-reviewer' }, body: 'Resolved.' }] },
      },
      {
        id: 'outdated-thread',
        isResolved: false,
        isOutdated: true,
        comments: { nodes: [{ author: { login: 'human-reviewer' }, body: 'Outdated.' }] },
      },
    ]);

    expect(state.blocking).toEqual([]);
    expect(state.resolved).toHaveLength(1);
    expect(state.outdated).toHaveLength(1);
  });

  it('keeps trusted bot review threads advisory by default', () => {
    const result = assessReviewerLifecycle({
      enforceFailure: true,
      files: ['scripts/ci/reviewer_lifecycle_gate.mjs'],
      reviewThreads: [{
        id: 'bot-thread',
        isResolved: false,
        isOutdated: false,
        path: 'scripts/ci/reviewer_lifecycle_gate.mjs',
        comments: { nodes: [{ author: { login: 'cubic-dev-ai[bot]' }, body: 'Advisory bot finding.' }] },
      }],
    });

    expect(result.shouldFail).toBe(false);
    expect(result.assessment.severity).toBe('advisory');
    expect(result.reviewThreads.advisory).toHaveLength(1);
  });

  it('supports explicit trusted-bot exception label case-insensitively', () => {
    expect(hasExceptionLabel(['Reviewer-Lifecycle-Exception'], 'reviewer-lifecycle-exception')).toBe(true);

    const result = assessReviewerLifecycle({
      enforceFailure: true,
      labels: ['Reviewer-Lifecycle-Exception'],
      reviewThreads: [{
        id: 'bot-thread',
        isResolved: false,
        isOutdated: false,
        comments: { nodes: [{ author: { login: 'copilot-pull-request-reviewer[bot]' }, body: 'Trusted bot finding.' }] },
      }],
    });

    expect(result.shouldFail).toBe(false);
    expect(result.exceptionActive).toBe(true);
    expect(result.reviewThreads.advisory[0].exceptionActive).toBe(true);
  });

  it('fails closed when pagination would make the reviewer decision incomplete', () => {
    const result = assessReviewerLifecycle({
      enforceFailure: true,
      paginationFailures: ['review thread pagination not supported; refusing to make an incomplete reviewer lifecycle decision.'],
    });

    expect(result.shouldFail).toBe(true);
    expect(result.assessment.reason).toBe('pagination-incomplete');
  });

  it('renders a report without PR-body reviewer ledger requirements', () => {
    const result = assessReviewerLifecycle({
      enforceFailure: true,
      files: ['src/app/page.tsx'],
      reviews: [{ author: { login: 'human-reviewer' }, state: 'CHANGES_REQUESTED', submittedAt: '2026-07-02T00:00:00Z' }],
    });
    const report = buildReviewerLifecycleReport(result);

    expect(report).toContain('GitHub-native review state');
    expect(report).toContain('PR body is not used as a reviewer comment ledger');
    expect(report).not.toContain('review-comment:');
    expect(report).not.toContain('thread state');
  });

  it('detects protected CI paths', () => {
    expect(isProtectedPath('scripts/ci/reviewer_lifecycle_gate.mjs')).toBe(true);
    expect(isProtectedPath('.github/workflows/reviewer-response-completion.yml')).toBe(true);
    expect(isProtectedPath('src/app/page.tsx')).toBe(false);
  });

  it('accepts configured trusted bot logins', () => {
    const trusted = new Set(['custom-bot']);
    expect(isTrustedReviewer('custom-bot', trusted)).toBe(true);
    expect(isTrustedReviewer('human-reviewer', trusted)).toBe(false);
  });
});
