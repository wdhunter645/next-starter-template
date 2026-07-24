import { describe, expect, it } from 'vitest';

import {
  buildCloseoutIdentity,
  evaluateCloseoutSuccessorTransaction,
  executeCloseoutSuccessorTransaction,
} from '../scripts/agent-routing/lib/child-closeout.mjs';

const HEAD_SHA = '1111111111111111111111111111111111111111';
const MERGE_SHA = '2222222222222222222222222222222222222222';
const TARGET = 'component/content-collection-phase1';

function launchPackageBody(number: number): string {
  return `Parent Project: #2431
Predecessor: #${number - 1}
Successor: #${number + 1}
Implementation Agent: Cursor Local
Runtime: local
Delivery Model: Model B child
Project branch / PR target: \`${TARGET}\`
Working branch: \`cursor/${number}-work\`

## Exact file-touch allowlist

- \`scripts/example.mjs\`

## Acceptance criteria

- [x] Fixture acceptance is explicit.

## Validation

- \`npm test\`

## Rollback

Revert the task PR.

## Stop point

Open one PR and stop.
`;
}

function fixture(overrides: any = {}): any {
  const identity = buildCloseoutIdentity({
    sourceIssueNumber: 2433,
    prNumber: 2675,
    headSha: HEAD_SHA,
    targetBranch: TARGET,
    integrationSha: MERGE_SHA,
    successorIssueNumber: 2434,
  });
  const sourceIssue = {
    number: 2433,
    state: 'OPEN',
    title: 'TASK: CC-001 content asset contract freeze',
    body: launchPackageBody(2433),
    labels: ['agent:cursor', 'handoff:ready', 'status:post-merge-verify'],
  };
  const parentIssue = {
    number: 2431,
    state: 'OPEN',
    title: 'PROJECT: Content collection phase 1',
    body: 'Project authority: execute #2433 before activating successor #2434.',
    labels: ['pmo:active'],
  };
  const successorIssue = {
    number: 2434,
    state: 'OPEN',
    title: 'TASK: CC-002 implementation',
    body: launchPackageBody(2434),
    labels: ['status:blocked', 'team:engineering', 'eng:priority:2'],
  };
  const pullRequest = {
    number: 2675,
    state: 'closed',
    merged: true,
    merge_commit_sha: MERGE_SHA,
    body: '- **Issue:** #2433\n',
    head: { sha: HEAD_SHA },
    base: { ref: TARGET },
  };
  const sourceComments = [
    {
      id: 1,
      author: { login: 'wdhunter645' },
      body: `APPROVED FOR CLOSEOUT
Issue: #2433
PR: #2675
Head SHA: ${HEAD_SHA}
Target branch: ${TARGET}
Integration SHA: ${MERGE_SHA}
Successor: #2434
Review disposition: accepted
Integration verification: verified
Status: closeout and successor activation authorized`,
    },
  ];
  const successorComments = [
    {
      id: 2,
      author: { login: 'wdhunter645' },
      body: 'CHATGPT RESPONSE\nIssue: #2434\nDisposition: APPROVED TO IMPLEMENT',
    },
  ];
  return {
    identity,
    sourceIssue,
    parentIssue,
    successorIssue,
    pullRequest,
    sourceComments,
    parentComments: [],
    successorComments,
    targetContainsIntegrationSha: true,
    expected: {
      sourceIssueNumber: 2433,
      prNumber: 2675,
      headSha: HEAD_SHA,
      targetBranch: TARGET,
      integrationSha: MERGE_SHA,
      successorIssueNumber: 2434,
    },
    config: {
      enabled: true,
      trustedDecisionAuthors: ['wdhunter645'],
      trustedControllerAuthors: ['wdhunter645', 'github-actions[bot]'],
      maxTransactionsPerRun: 1,
      allowMain: false,
      allowProduction: false,
      resumeMarker: 'LOCAL CURSOR RESUME',
    },
    ...overrides,
  };
}

describe('closeout and successor evaluation', () => {
  it('accepts one verified integrated child and one explicit launch-ready successor', () => {
    const result: any = evaluateCloseoutSuccessorTransaction(fixture());
    expect(result.ok).toBe(true);
    expect(result.eligible).toBe(true);
    expect(result.sourceIssueNumber).toBe(2433);
    expect(result.successorIssueNumber).toBe(2434);
    expect(result.identity).toContain('source:2433');
  });

  it('fails closed on protected source-Issue classes', () => {
    for (const title of [
      'PROJECT: Parent project',
      'PROGRAM: Umbrella program',
      'PROMOTION CANDIDATE: Release candidate',
      'PRODUCTION: Deploy',
      'INCIDENT: Outage',
      'OPS: Standalone operational work',
    ]) {
      const base = fixture();
      const result: any = evaluateCloseoutSuccessorTransaction({
        ...base,
        sourceIssue: { ...base.sourceIssue, title },
      });
      expect(result.ok, title).toBe(false);
      expect(result.code).toBe('protected_source_issue_class');
    }
  });

  it('requires the explicit source sequence to identify the requested successor', () => {
    const base = fixture();
    const result: any = evaluateCloseoutSuccessorTransaction({
      ...base,
      sourceIssue: {
        ...base.sourceIssue,
        body: String(base.sourceIssue.body).replace('Successor: #2434', 'Successor: #9999'),
      },
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe('successor_identity_mismatch');
  });

  it('requires a complete successor launch package and trusted implementation Go', () => {
    const base = fixture();
    const missingPackage: any = evaluateCloseoutSuccessorTransaction({
      ...base,
      successorIssue: { ...base.successorIssue, body: 'Parent Project: #2431' },
    });
    expect(missingPackage.ok).toBe(false);
    expect(missingPackage.code).toBe('successor_launch_package_incomplete');

    const missingGo: any = evaluateCloseoutSuccessorTransaction({
      ...base,
      successorComments: [],
    });
    expect(missingGo.ok).toBe(false);
    expect(missingGo.code).toBe('successor_implementation_go_missing');
  });

  it('requires exact integration evidence and trusted closeout authority', () => {
    const base = fixture();
    const stale: any = evaluateCloseoutSuccessorTransaction({
      ...base,
      pullRequest: { ...base.pullRequest, head: { sha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' } },
    });
    expect(stale.code).toBe('closeout_pr_head_mismatch');

    const uncontained: any = evaluateCloseoutSuccessorTransaction({
      ...base,
      targetContainsIntegrationSha: false,
    });
    expect(uncontained.code).toBe('integration_sha_not_on_target');

    const untrusted: any = evaluateCloseoutSuccessorTransaction({
      ...base,
      sourceComments: base.sourceComments.map((comment: any) => ({
        ...comment,
        author: { login: 'untrusted-user' },
      })),
    });
    expect(untrusted.code).toBe('closeout_authority_missing');
  });

  it('requires exact accepted review disposition in trusted closeout authority', () => {
    const base = fixture();
    const missing: any = evaluateCloseoutSuccessorTransaction({
      ...base,
      sourceComments: [
        {
          ...base.sourceComments[0],
          body: String(base.sourceComments[0].body).replace('Review disposition: accepted\n', ''),
        },
      ],
    });
    expect(missing.ok).toBe(false);
    expect(missing.code).toBe('closeout_review_disposition_not_accepted');

    const rejected: any = evaluateCloseoutSuccessorTransaction({
      ...base,
      sourceComments: [
        {
          ...base.sourceComments[0],
          body: String(base.sourceComments[0].body).replace(
            'Review disposition: accepted',
            'Review disposition: rejected',
          ),
        },
      ],
    });
    expect(rejected.code).toBe('closeout_review_disposition_not_accepted');
  });

  it('requires exact verified integration evidence in trusted closeout authority', () => {
    const base = fixture();
    const missing: any = evaluateCloseoutSuccessorTransaction({
      ...base,
      sourceComments: [
        {
          ...base.sourceComments[0],
          body: String(base.sourceComments[0].body).replace('Integration verification: verified\n', ''),
        },
      ],
    });
    expect(missing.ok).toBe(false);
    expect(missing.code).toBe('closeout_integration_verification_not_verified');

    const unverified: any = evaluateCloseoutSuccessorTransaction({
      ...base,
      sourceComments: [
        {
          ...base.sourceComments[0],
          body: String(base.sourceComments[0].body).replace(
            'Integration verification: verified',
            'Integration verification: pending',
          ),
        },
      ],
    });
    expect(unverified.code).toBe('closeout_integration_verification_not_verified');
  });

  it('requires parent project body to identify source before successor', () => {
    const base = fixture();
    const reversed: any = evaluateCloseoutSuccessorTransaction({
      ...base,
      parentIssue: {
        ...base.parentIssue,
        body: 'Project authority: activate successor #2434 before child #2433.',
      },
    });
    expect(reversed.ok).toBe(false);
    expect(reversed.code).toBe('parent_sequence_dependency_invalid');

    const missingSuccessor: any = evaluateCloseoutSuccessorTransaction({
      ...base,
      parentIssue: {
        ...base.parentIssue,
        body: 'Project authority: child #2433 only.',
      },
    });
    expect(missingSuccessor.code).toBe('parent_sequence_dependency_invalid');
  });

  it('requires an actual Acceptance criteria section on the open source Issue', () => {
    const base = fixture();
    const result: any = evaluateCloseoutSuccessorTransaction({
      ...base,
      sourceIssue: {
        ...base.sourceIssue,
        body: String(base.sourceIssue.body).replace('## Acceptance criteria\n\n- [x] Fixture acceptance is explicit.\n\n', ''),
      },
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe('source_acceptance_section_missing');
  });

  it('requires OPEN source Issues to retain agent:cursor unless a trusted closeout marker exists', () => {
    const base = fixture();
    const missingOwner: any = evaluateCloseoutSuccessorTransaction({
      ...base,
      sourceIssue: {
        ...base.sourceIssue,
        labels: ['handoff:ready', 'status:post-merge-verify'],
      },
    });
    expect(missingOwner.ok).toBe(false);
    expect(missingOwner.code).toBe('source_owner_label_missing');

    const identity = base.identity;
    const partialRetry: any = evaluateCloseoutSuccessorTransaction({
      ...base,
      sourceIssue: {
        ...base.sourceIssue,
        labels: ['handoff:ready', 'status:post-merge-verify'],
        body: String(base.sourceIssue.body).replace(
          '## Acceptance criteria\n\n- [x] Fixture acceptance is explicit.\n\n',
          '',
        ),
      },
      sourceComments: [
        ...base.sourceComments,
        {
          id: 99,
          author: { login: 'github-actions[bot]' },
          body: `CHATGPT CLOSEOUT\n<!-- agent-routing-closeout:${identity} -->`,
        },
      ],
    });
    expect(partialRetry.ok).toBe(true);
  });

  it('lets a newer complete closeout authority supersede an older incomplete trusted draft', () => {
    const base = fixture();
    const incompleteOlder = {
      id: 1,
      author: { login: 'wdhunter645' },
      body: `APPROVED FOR CLOSEOUT
Issue: #2433
PR: #2675
Head SHA: ${HEAD_SHA}
Target branch: ${TARGET}
Integration SHA: ${MERGE_SHA}
Successor: #2434
Status: closeout and successor activation authorized`,
    };
    const completeNewer = {
      id: 50,
      author: { login: 'wdhunter645' },
      body: `APPROVED FOR CLOSEOUT
Issue: #2433
PR: #2675
Head SHA: ${HEAD_SHA}
Target branch: ${TARGET}
Integration SHA: ${MERGE_SHA}
Successor: #2434
Review disposition: accepted
Integration verification: verified
Status: closeout and successor activation authorized`,
    };
    const result: any = evaluateCloseoutSuccessorTransaction({
      ...base,
      sourceComments: [incompleteOlder, completeNewer],
    });
    expect(result.ok).toBe(true);
    expect(result.eligible).toBe(true);
  });

  it('ignores spoofed idempotency markers from untrusted authors', () => {
    const base = fixture();
    const spoofed: any = evaluateCloseoutSuccessorTransaction({
      ...base,
      sourceComments: [
        ...base.sourceComments,
        {
          id: 100,
          author: { login: 'spoofed-user' },
          body: `CHATGPT CLOSEOUT\n<!-- agent-routing-closeout:${base.identity} -->`,
        },
      ],
    });
    expect(spoofed.ok).toBe(true);
  });
});

describe('closeout and successor execution', () => {
  const trustedControllerAuthor = { login: 'github-actions[bot]' };

  it('closes once, reports to parent, activates one successor, and resumes once', async () => {
    const base = fixture();
    const operations: any[] = [];
    let read = 0;
    const result: any = await executeCloseoutSuccessorTransaction({
      repository: 'wdhunter645/next-starter-template',
      ...base.expected,
      config: base.config,
      collectState: async () => {
        read += 1;
        if (read < 3) return base;
        return {
          ...base,
          sourceIssue: { ...base.sourceIssue, state: 'CLOSED', labels: ['status:complete'] },
          sourceComments: [
            ...base.sourceComments,
            {
              id: 10,
              author: trustedControllerAuthor,
              body: `CHATGPT CLOSEOUT\n<!-- agent-routing-closeout:${base.identity} -->`,
            },
          ],
          parentComments: [
            {
              id: 11,
              author: trustedControllerAuthor,
              body: `CHILD CLOSEOUT REPORT\n<!-- agent-routing-parent:${base.identity} -->`,
            },
          ],
          successorIssue: {
            ...base.successorIssue,
            labels: ['agent:cursor', 'handoff:ready', 'status:in-progress', 'team:engineering', 'eng:priority:2'],
          },
          successorComments: [
            ...base.successorComments,
            {
              id: 12,
              author: trustedControllerAuthor,
              body: `LOCAL CURSOR RESUME\n<!-- agent-routing-successor:${base.identity} -->`,
            },
          ],
        };
      },
      mutate: async (operation: any) => {
        operations.push(operation);
        return { ok: true };
      },
    });

    expect(result.ok).toBe(true);
    expect(result.verified).toBe(true);
    expect(result.transactions).toBe(1);
    expect(operations.map((operation) => operation.type)).toEqual([
      'comment-source-closeout',
      'close-source-issue',
      'comment-parent-report',
      'activate-successor-labels',
      'comment-successor-resume',
    ]);
    const labelOperation: any = operations.find(
      (operation) => operation.type === 'activate-successor-labels',
    );
    expect(labelOperation.labels).toContain('eng:priority:2');
    expect(labelOperation.labels).not.toContain('pmo:priority:2');
    expect(labelOperation.labels).not.toContain('status:blocked');
  });

  it('suppresses a completed duplicate without another mutation', async () => {
    const base = fixture();
    const complete = {
      ...base,
      sourceIssue: { ...base.sourceIssue, state: 'CLOSED', labels: ['status:complete'] },
      sourceComments: [
        ...base.sourceComments,
        {
          id: 10,
          author: trustedControllerAuthor,
          body: `CHATGPT CLOSEOUT\n<!-- agent-routing-closeout:${base.identity} -->`,
        },
      ],
      parentComments: [
        {
          id: 11,
          author: trustedControllerAuthor,
          body: `CHILD CLOSEOUT REPORT\n<!-- agent-routing-parent:${base.identity} -->`,
        },
      ],
      successorIssue: {
        ...base.successorIssue,
        labels: ['agent:cursor', 'handoff:ready', 'status:in-progress'],
      },
      successorComments: [
        ...base.successorComments,
        {
          id: 12,
          author: trustedControllerAuthor,
          body: `LOCAL CURSOR RESUME\n<!-- agent-routing-successor:${base.identity} -->`,
        },
      ],
    };
    const operations: any[] = [];
    const result: any = await executeCloseoutSuccessorTransaction({
      repository: 'wdhunter645/next-starter-template',
      ...base.expected,
      config: base.config,
      collectState: async () => complete,
      mutate: async (operation: any) => {
        operations.push(operation);
        return { ok: true };
      },
    });
    expect(result.code).toBe('closeout_successor_already_completed');
    expect(result.suppressed).toBe(true);
    expect(operations).toHaveLength(0);
  });

  it('blocks expected-state drift with zero mutations', async () => {
    const base = fixture();
    let reads = 0;
    const operations: any[] = [];
    const result: any = await executeCloseoutSuccessorTransaction({
      repository: 'wdhunter645/next-starter-template',
      ...base.expected,
      config: base.config,
      collectState: async () => {
        reads += 1;
        if (reads === 1) return base;
        return {
          ...base,
          successorIssue: { ...base.successorIssue, body: `${base.successorIssue.body}\nlate drift` },
        };
      },
      mutate: async (operation: any) => {
        operations.push(operation);
        return { ok: true };
      },
    });
    expect(result.code).toBe('closeout_expected_state_drift');
    expect(operations).toHaveLength(0);
  });

  it('does not suppress mutations when only untrusted authors posted idempotency markers', async () => {
    const base = fixture();
    const operations: any[] = [];
    let read = 0;
    const result: any = await executeCloseoutSuccessorTransaction({
      repository: 'wdhunter645/next-starter-template',
      ...base.expected,
      config: base.config,
      collectState: async () => {
        read += 1;
        if (read < 3) {
          return {
            ...base,
            sourceComments: [
              ...base.sourceComments,
              {
                id: 10,
                author: { login: 'spoofed-user' },
                body: `CHATGPT CLOSEOUT\n<!-- agent-routing-closeout:${base.identity} -->`,
              },
            ],
            parentComments: [
              {
                id: 11,
                author: { login: 'spoofed-user' },
                body: `CHILD CLOSEOUT REPORT\n<!-- agent-routing-parent:${base.identity} -->`,
              },
            ],
            successorComments: [
              ...base.successorComments,
              {
                id: 12,
                author: { login: 'spoofed-user' },
                body: `LOCAL CURSOR RESUME\n<!-- agent-routing-successor:${base.identity} -->`,
              },
            ],
          };
        }
        return {
          ...base,
          sourceIssue: { ...base.sourceIssue, state: 'CLOSED', labels: ['status:complete'] },
          sourceComments: [
            ...base.sourceComments,
            {
              id: 10,
              author: trustedControllerAuthor,
              body: `CHATGPT CLOSEOUT\n<!-- agent-routing-closeout:${base.identity} -->`,
            },
          ],
          parentComments: [
            {
              id: 11,
              author: trustedControllerAuthor,
              body: `CHILD CLOSEOUT REPORT\n<!-- agent-routing-parent:${base.identity} -->`,
            },
          ],
          successorIssue: {
            ...base.successorIssue,
            labels: ['agent:cursor', 'handoff:ready', 'status:in-progress'],
          },
          successorComments: [
            ...base.successorComments,
            {
              id: 12,
              author: trustedControllerAuthor,
              body: `LOCAL CURSOR RESUME\n<!-- agent-routing-successor:${base.identity} -->`,
            },
          ],
        };
      },
      mutate: async (operation: any) => {
        operations.push(operation);
        return { ok: true };
      },
    });
    expect(result.ok).toBe(true);
    expect(result.suppressed).not.toBe(true);
    expect(operations.length).toBeGreaterThan(0);
  });

  it('does not treat a closed source with only untrusted markers as completed', async () => {
    const base = fixture();
    const operations: any[] = [];
    const result: any = await executeCloseoutSuccessorTransaction({
      repository: 'wdhunter645/next-starter-template',
      ...base.expected,
      config: base.config,
      collectState: async () => ({
        ...base,
        sourceIssue: { ...base.sourceIssue, state: 'CLOSED', labels: ['status:complete'] },
        sourceComments: [
          ...base.sourceComments,
          {
            id: 10,
            author: { login: 'spoofed-user' },
            body: `CHATGPT CLOSEOUT\n<!-- agent-routing-closeout:${base.identity} -->`,
          },
        ],
        parentComments: [
          {
            id: 11,
            author: { login: 'spoofed-user' },
            body: `CHILD CLOSEOUT REPORT\n<!-- agent-routing-parent:${base.identity} -->`,
          },
        ],
        successorIssue: {
          ...base.successorIssue,
          labels: ['agent:cursor', 'handoff:ready', 'status:in-progress'],
        },
        successorComments: [
          ...base.successorComments,
          {
            id: 12,
            author: { login: 'spoofed-user' },
            body: `LOCAL CURSOR RESUME\n<!-- agent-routing-successor:${base.identity} -->`,
          },
        ],
      }),
      mutate: async (operation: any) => {
        operations.push(operation);
        return { ok: true };
      },
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe('closeout_source_issue_not_open');
    expect(operations).toHaveLength(0);
  });

  it('fails post-mutation verification when source labels remain stale', async () => {
    const base = fixture();
    let read = 0;
    const result: any = await executeCloseoutSuccessorTransaction({
      repository: 'wdhunter645/next-starter-template',
      ...base.expected,
      config: base.config,
      collectState: async () => {
        read += 1;
        if (read < 3) return base;
        return {
          ...base,
          sourceIssue: {
            ...base.sourceIssue,
            state: 'CLOSED',
            labels: ['status:complete', 'agent:cursor', 'status:post-merge-verify'],
          },
          sourceComments: [
            ...base.sourceComments,
            {
              id: 10,
              author: trustedControllerAuthor,
              body: `CHATGPT CLOSEOUT\n<!-- agent-routing-closeout:${base.identity} -->`,
            },
          ],
          parentComments: [
            {
              id: 11,
              author: trustedControllerAuthor,
              body: `CHILD CLOSEOUT REPORT\n<!-- agent-routing-parent:${base.identity} -->`,
            },
          ],
          successorIssue: {
            ...base.successorIssue,
            labels: ['agent:cursor', 'handoff:ready', 'status:in-progress'],
          },
          successorComments: [
            ...base.successorComments,
            {
              id: 12,
              author: trustedControllerAuthor,
              body: `LOCAL CURSOR RESUME\n<!-- agent-routing-successor:${base.identity} -->`,
            },
          ],
        };
      },
      mutate: async () => ({ ok: true }),
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe('closeout_post_mutation_verification_failed');
  });

  it('fails post-mutation verification when successor retains status:blocked', async () => {
    const base = fixture();
    let read = 0;
    const result: any = await executeCloseoutSuccessorTransaction({
      repository: 'wdhunter645/next-starter-template',
      ...base.expected,
      config: base.config,
      collectState: async () => {
        read += 1;
        if (read < 3) return base;
        return {
          ...base,
          sourceIssue: { ...base.sourceIssue, state: 'CLOSED', labels: ['status:complete'] },
          sourceComments: [
            ...base.sourceComments,
            {
              id: 10,
              author: trustedControllerAuthor,
              body: `CHATGPT CLOSEOUT\n<!-- agent-routing-closeout:${base.identity} -->`,
            },
          ],
          parentComments: [
            {
              id: 11,
              author: trustedControllerAuthor,
              body: `CHILD CLOSEOUT REPORT\n<!-- agent-routing-parent:${base.identity} -->`,
            },
          ],
          successorIssue: {
            ...base.successorIssue,
            labels: ['agent:cursor', 'handoff:ready', 'status:in-progress', 'status:blocked'],
          },
          successorComments: [
            ...base.successorComments,
            {
              id: 12,
              author: trustedControllerAuthor,
              body: `LOCAL CURSOR RESUME\n<!-- agent-routing-successor:${base.identity} -->`,
            },
          ],
        };
      },
      mutate: async () => ({ ok: true }),
    });
    expect(result.ok).toBe(false);
    expect(result.code).toBe('closeout_post_mutation_verification_failed');
  });
});
