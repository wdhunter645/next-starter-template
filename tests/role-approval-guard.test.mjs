import { describe, expect, it } from 'vitest';
import {
  APPROVAL_MARKER,
  evaluateRoleApprovalGuard,
  parseSourceIssueNumber,
} from '../scripts/ci/role_approval_guard.mjs';

const headSha = 'a'.repeat(40);

function approvalComment(overrides = {}) {
  const values = {
    sourceIssue: 2622,
    prNumber: 3001,
    headSha,
    reviewerRole: 'PR Approver / Engineering',
    reviewerActor: 'ChatGPT / Atlas',
    implementationActor: 'Claude Code',
    decision: 'APPROVED FOR INTEGRATION',
    ...overrides,
  };

  return {
    body: `${APPROVAL_MARKER}\nAPPROVED FOR INTEGRATION\nSource Issue: #${values.sourceIssue}\nPR: #${values.prNumber}\nHead SHA: ${values.headSha}\nReviewer role: ${values.reviewerRole}\nReviewer actor: ${values.reviewerActor}\nImplementation actor: ${values.implementationActor}\nDecision: ${values.decision}`,
  };
}

describe('role approval guard', () => {
  it('parses the source Issue from the stable PR body field', () => {
    expect(parseSourceIssueNumber('- **Issue:** #2622')).toBe(2622);
    expect(parseSourceIssueNumber('Issue: #99')).toBe(99);
  });

  it('does not require role approval for an unprotected component PR', () => {
    const result = evaluateRoleApprovalGuard({
      prBody: '- **Issue:** #2622\n- Approval profile: component-auto-integration',
      changedFiles: ['src/components/example.tsx'],
      comments: [],
      prNumber: 3001,
      headSha,
    });

    expect(result).toMatchObject({ required: false, approved: true, sourceIssue: 2622 });
  });

  it('blocks a protected PR without an exact-head Atlas approval event', () => {
    const result = evaluateRoleApprovalGuard({
      prBody: '- **Issue:** #2622\n- Approval profile: component-auto-integration',
      changedFiles: ['.github/workflows/example.yml'],
      comments: [],
      prNumber: 3001,
      headSha,
    });

    expect(result.required).toBe(true);
    expect(result.approved).toBe(false);
    expect(result.blockedReasons.map((reason) => reason.code)).toContain('missing-role-approval');
  });

  it('accepts a matching role-attested approval for the exact PR and head SHA', () => {
    const result = evaluateRoleApprovalGuard({
      prBody: '- **Issue:** #2622',
      changedFiles: ['scripts/ci/example.mjs'],
      comments: [approvalComment()],
      prNumber: 3001,
      headSha,
      implementationActor: 'Claude Code',
    });

    expect(result).toMatchObject({ required: true, approved: true, sourceIssue: 2622 });
    expect(result.blockedReasons).toEqual([]);
  });

  it('rejects stale-head, wrong-PR, wrong-role, and implementer approval events', () => {
    const base = {
      prBody: '- **Issue:** #2622',
      changedFiles: ['scripts/ci/example.mjs'],
      prNumber: 3001,
      headSha,
      implementationActor: 'Claude Code',
    };

    for (const comment of [
      approvalComment({ headSha: 'b'.repeat(40) }),
      approvalComment({ prNumber: 3002 }),
      approvalComment({ reviewerRole: 'Implementation / Operations' }),
      approvalComment({ reviewerActor: 'Claude Code' }),
    ]) {
      const result = evaluateRoleApprovalGuard({ ...base, comments: [comment] });
      expect(result.approved).toBe(false);
      expect(result.blockedReasons.map((reason) => reason.code)).toContain('missing-role-approval');
    }
  });

  it('fails closed when protected scope has no source Issue', () => {
    const result = evaluateRoleApprovalGuard({
      prBody: '- Approval profile: protected-change-review',
      changedFiles: ['src/example.ts'],
      comments: [],
      prNumber: 3001,
      headSha,
    });

    expect(result.required).toBe(true);
    expect(result.approved).toBe(false);
    expect(result.blockedReasons.map((reason) => reason.code)).toContain('missing-source-issue');
  });
});
