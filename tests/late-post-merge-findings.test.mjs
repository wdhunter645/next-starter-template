import { describe, expect, it } from 'vitest';
import { isTrustedReviewer, DEFAULT_TRUSTED_BOT_LOGINS } from '../scripts/ci/reviewer_trusted_bots.mjs';
import { reviewerFindings } from '../scripts/ci/post_merge_validator.mjs';
import { collectLateAuditFindings } from '../scripts/ci/post_merge_reviewer_audit.mjs';
import { evaluateReviewerCommentDisposition } from '../scripts/ci/reviewer_comment_disposition.mjs';

describe('trusted reviewer bots (#3036)', () => {
  it('treats Copilot login as trusted (inline review comments)', () => {
    expect(isTrustedReviewer('Copilot')).toBe(true);
    expect(isTrustedReviewer('copilot')).toBe(true);
    expect(isTrustedReviewer('copilot-pull-request-reviewer[bot]')).toBe(true);
    expect(DEFAULT_TRUSTED_BOT_LOGINS.map((l) => l.toLowerCase())).toContain('copilot');
  });
});

describe('late post-merge findings detector (#3036)', () => {
  const mergedAt = '2026-08-03T12:48:03Z';
  const pr = {
    merged_at: mergedAt,
    html_url: 'https://github.com/wdhunter645/next-starter-template/pull/3015',
    body: '',
  };

  const lateInline = [
    {
      id: 3704003871,
      user: { login: 'Copilot' },
      created_at: '2026-08-03T12:53:00Z',
      line: 52,
      position: 88,
      body: 'isNonCursorDirectedTraffic only rejects non-Cursor agent labels when agent:cursor is absent.',
      html_url: 'https://github.com/example/comment/1',
    },
    {
      id: 3704003946,
      user: { login: 'Copilot' },
      created_at: '2026-08-03T12:53:01Z',
      line: 20,
      position: 27,
      body: 'Eligibility currently has no mechanical-error category for conflicting agent labels.',
      html_url: 'https://github.com/example/comment/2',
    },
    {
      id: 3704003986,
      user: { login: 'Copilot' },
      created_at: '2026-08-03T12:53:01Z',
      line: 269,
      position: 420,
      body: 'Wake-ingress tests do not assert fail-closed mixed agent:cursor labels.',
      html_url: 'https://github.com/example/comment/3',
    },
  ];

  it('reviewerFindings counts late Copilot inline comments without P0/P1 wording', () => {
    const findings = reviewerFindings({
      pr: { mergedAt, url: pr.html_url, body: '' },
      reviewComments: lateInline,
    });
    expect(findings).toHaveLength(3);
    expect(findings.every((f) => f.reviewer === 'Copilot')).toBe(true);
  });

  it('collectLateAuditFindings matches the #3015 post-merge race shape', () => {
    const findings = collectLateAuditFindings({
      pr,
      reviewComments: lateInline,
    });
    expect(findings).toHaveLength(3);
  });

  it('disposition evaluator fails closed on late undispositioned Copilot threads', () => {
    const result = evaluateReviewerCommentDisposition({
      body: '',
      reviewComments: lateInline,
      mergedAt,
      auditPhase: 'post_merge',
    });
    expect(result.ok).toBe(false);
    expect(result.lateFindingsCount).toBeGreaterThanOrEqual(3);
    expect(result.lateUndispositionedCount).toBeGreaterThanOrEqual(3);
  });

  it('does not count pre-merge comments as late', () => {
    const findings = reviewerFindings({
      pr: { mergedAt, url: pr.html_url, body: '' },
      reviewComments: [
        {
          ...lateInline[0],
          created_at: '2026-08-03T12:40:00Z',
        },
      ],
    });
    expect(findings).toHaveLength(0);
  });
});
