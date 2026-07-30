import { describe, expect, it } from 'vitest';
import {
  APPROVAL_MARKER,
  DEFAULT_AUTHORIZED_APPROVAL_ACCOUNTS,
  evaluateRoleApprovalGuard,
  isAuthorizedApprovalAccount,
  parseApprovalComment,
  parseSourceIssueNumber,
} from '../scripts/ci/role_approval_guard.mjs';
import {
  applyRoleApprovalToIntegrationResult,
  evaluateComponentIntegrationWithRoleApproval,
} from '../scripts/ci/component_integration_role_adapter.mjs';

const headSha = 'a'.repeat(40);
const AUTHORIZED_LOGIN = DEFAULT_AUTHORIZED_APPROVAL_ACCOUNTS[0];

function approvalComment(overrides = {}) {
  const values = {
    sourceIssue: 2622,
    prNumber: 3001,
    headSha,
    reviewerRole: 'PR Approver / Engineering',
    reviewerActor: 'ChatGPT',
    implementationActor: 'Claude Code',
    decision: 'APPROVED FOR INTEGRATION',
    id: 1,
    login: AUTHORIZED_LOGIN,
    accountType: 'User',
    authorAssociation: 'OWNER',
    ...overrides,
  };

  return {
    id: values.id,
    author_association: values.authorAssociation,
    user: { login: values.login, type: values.accountType },
    body: `${APPROVAL_MARKER}\nAPPROVED FOR INTEGRATION\nSource Issue: #${values.sourceIssue}\nPR: #${values.prNumber}\nHead SHA: ${values.headSha}\nReviewer role: ${values.reviewerRole}\nReviewer actor: ${values.reviewerActor}\nImplementation actor: ${values.implementationActor}\nDecision: ${values.decision}`,
  };
}

function protectedProfile() {
  return {
    body: [
      '- **Issue:** #2622',
      '- Size: medium',
      '- Delivery model: B-child',
      '- Change mode: project',
      '- Target environment: component',
      '- Approval profile: protected-change-review',
      '- Gate profile: component-child',
      '- Rollback profile: multi-step',
      '- Component branch: component/issue-contract-draft-pr',
      '- Component master: #2615',
    ].join('\n'),
    baseRef: 'component/issue-contract-draft-pr',
    headRef: 'cursor/2622-example',
    baseBehindComponentHead: 0,
  };
}

const greenChecks = [
  { name: 'GATE — Quality Checks', conclusion: 'success' },
  { name: 'GATE — Diff Scope', conclusion: 'success' },
  { name: 'GATE — Secret Scan', conclusion: 'success' },
];

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

  it('blocks a protected PR without an exact-head approval-evidence event', () => {
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

    expect(result).toMatchObject({
      required: true,
      approved: true,
      sourceIssue: 2622,
      acceptedLogin: AUTHORIZED_LOGIN,
      acceptedAuthorAssociation: 'OWNER',
    });
    expect(result.blockedReasons).toEqual([]);
  });

  it('rejects stale-head, wrong-PR, wrong-role, wrong-actor, and self-approval events', () => {
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

    const selfApproval = evaluateRoleApprovalGuard({
      ...base,
      implementationActor: 'ChatGPT',
      comments: [approvalComment({ implementationActor: 'ChatGPT' })],
    });
    expect(selfApproval.approved).toBe(false);
  });

  it('rejects the retired "ChatGPT / Atlas" terminology as a reviewer-actor value', () => {
    const result = evaluateRoleApprovalGuard({
      prBody: '- **Issue:** #2622',
      changedFiles: ['scripts/ci/example.mjs'],
      comments: [approvalComment({ reviewerActor: 'ChatGPT / Atlas' })],
      prNumber: 3001,
      headSha,
      implementationActor: 'Claude Code',
    });

    expect(result.approved).toBe(false);
    expect(result.blockedReasons.map((reason) => reason.code)).toContain('missing-role-approval');
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

  describe('GitHub-account provenance (not authenticated separation of duties)', () => {
    it('rejects an otherwise-perfectly-formed approval event posted by an unauthorized outside account', () => {
      const result = evaluateRoleApprovalGuard({
        prBody: '- **Issue:** #2622',
        changedFiles: ['scripts/ci/example.mjs'],
        comments: [approvalComment({ login: 'random-outside-collaborator' })],
        prNumber: 3001,
        headSha,
        implementationActor: 'Claude Code',
      });

      expect(result.approved).toBe(false);
      const reason = result.blockedReasons.find((entry) => entry.code === 'unauthorized-approval-account');
      expect(reason).toBeTruthy();
      expect(reason.observedLogins).toEqual(['random-outside-collaborator']);
    });

    it('rejects an approval event posted by a bot account even if the login is on the authorized list', () => {
      const result = evaluateRoleApprovalGuard({
        prBody: '- **Issue:** #2622',
        changedFiles: ['scripts/ci/example.mjs'],
        comments: [approvalComment({ login: AUTHORIZED_LOGIN, accountType: 'Bot' })],
        prNumber: 3001,
        headSha,
        implementationActor: 'Claude Code',
      });

      expect(result.approved).toBe(false);
      expect(result.blockedReasons.map((reason) => reason.code)).toContain('unauthorized-approval-account');
    });

    it('accepts a custom authorized-accounts list distinct from the default', () => {
      const result = evaluateRoleApprovalGuard({
        prBody: '- **Issue:** #2622',
        changedFiles: ['scripts/ci/example.mjs'],
        comments: [approvalComment({ login: 'a-different-authorized-account' })],
        prNumber: 3001,
        headSha,
        implementationActor: 'Claude Code',
        authorizedAccounts: ['a-different-authorized-account'],
      });

      expect(result.approved).toBe(true);
      expect(result.acceptedLogin).toBe('a-different-authorized-account');
    });

    it('documents the shared-identity limitation: account authorization alone cannot separate ChatGPT from Claude Code', () => {
      // Both a genuine-looking approval and a self-serving one are posted by
      // the SAME authorized GitHub account. isAuthorizedApprovalAccount
      // accepts both identically — GitHub-native provenance has no way to
      // tell them apart. The only thing standing between them is the
      // free-text self-declaration check below, which a forger controls.
      const genuine = parseApprovalComment(approvalComment());
      const selfServing = parseApprovalComment(approvalComment({ implementationActor: 'ChatGPT' }));

      expect(isAuthorizedApprovalAccount(genuine, DEFAULT_AUTHORIZED_APPROVAL_ACCOUNTS)).toBe(true);
      expect(isAuthorizedApprovalAccount(selfServing, DEFAULT_AUTHORIZED_APPROVAL_ACCOUNTS)).toBe(true);
      expect(genuine.login).toBe(selfServing.login);
    });
  });
});

describe('component integration role adapter', () => {
  it('keeps protected integration blocked when the exact-head approval is absent', () => {
    const result = evaluateComponentIntegrationWithRoleApproval({
      profile: protectedProfile(),
      checks: greenChecks,
      changedFiles: ['scripts/ci/example.mjs'],
      headSha,
      prNumber: 3001,
      sourceIssueComments: [],
      implementationActor: 'Claude Code',
    });

    expect(result.eligible).toBe(false);
    expect(result.requiresChatReview).toBe(true);
    expect(result.blockedReasons.map((reason) => reason.code)).toContain('missing-role-approval');
  });

  it('removes only the protected-change blocker after a valid exact-head approval', () => {
    const result = evaluateComponentIntegrationWithRoleApproval({
      profile: protectedProfile(),
      checks: greenChecks,
      changedFiles: ['scripts/ci/example.mjs'],
      headSha,
      prNumber: 3001,
      sourceIssueComments: [approvalComment()],
      implementationActor: 'Claude Code',
    });

    expect(result.eligible).toBe(true);
    expect(result.requiresChatReview).toBe(false);
    expect(result.blockedReasons).toEqual([]);
    expect(result.roleApproval).toMatchObject({ required: true, approved: true, acceptedLogin: AUTHORIZED_LOGIN });
  });

  it('keeps protected integration blocked when the approval event comes from an unauthorized account', () => {
    const result = evaluateComponentIntegrationWithRoleApproval({
      profile: protectedProfile(),
      checks: greenChecks,
      changedFiles: ['scripts/ci/example.mjs'],
      headSha,
      prNumber: 3001,
      sourceIssueComments: [approvalComment({ login: 'random-outside-collaborator' })],
      implementationActor: 'Claude Code',
    });

    expect(result.eligible).toBe(false);
    expect(result.blockedReasons.map((reason) => reason.code)).toContain('unauthorized-approval-account');
  });

  it('honors a custom authorized-approval-accounts list passed through the adapter', () => {
    const result = evaluateComponentIntegrationWithRoleApproval({
      profile: protectedProfile(),
      checks: greenChecks,
      changedFiles: ['scripts/ci/example.mjs'],
      headSha,
      prNumber: 3001,
      sourceIssueComments: [approvalComment({ login: 'a-different-authorized-account' })],
      implementationActor: 'Claude Code',
      authorizedApprovalAccounts: ['a-different-authorized-account'],
    });

    expect(result.eligible).toBe(true);
    expect(result.roleApproval.acceptedLogin).toBe('a-different-authorized-account');
  });

  it('preserves unrelated blockers even when role approval is valid', () => {
    const integration = {
      eligible: false,
      blockedReasons: [
        { code: 'protected_change', message: 'review required' },
        { code: 'failed_check', message: 'quality failed' },
      ],
      requiresChatReview: true,
    };
    const approved = applyRoleApprovalToIntegrationResult(integration, {
      required: true,
      approved: true,
      blockedReasons: [],
    });

    expect(approved.eligible).toBe(false);
    expect(approved.blockedReasons.map((reason) => reason.code)).toEqual(['failed_check']);
  });
});
