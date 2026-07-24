import { describe, expect, it } from 'vitest';

import {
  buildCloseoutIdentity,
  evaluateCloseoutSuccessorTransaction,
  executeCloseoutSuccessorTransaction,
} from '../scripts/agent-routing/lib/child-closeout.mjs';

const HEAD_SHA = '1111111111111111111111111111111111111111';
const MERGE_SHA = '2222222222222222222222222222222222222222';
const TARGET = 'component/content-collection-phase1';

function launchPackageBody(number: number) {
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

function fixture(overrides: Record<string, unknown> = {}) {
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
    body: launchPackageBody(2433).replace('Successor: #2434', 'Successor: #2434'),
    labels: ['agent:cursor', 'handoff:ready', 'status:post-merge-verify'],
  };
  const parentIssue = {
    number: 2431,
    state: 'OPEN',
    title: 'PROJECT: Content collection phase 1',
    body: 'Project authority for #2433 then #2434.',
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
    const result = evaluateCloseoutSuccessorTransaction(fixture() as never);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected eligible transaction');
    expect(result.eligible).toBe(true);
    expect(result.sourceIssueNumber).toBe(2433);
    expect(result.successorIssueNumber).toBe(2434);
    expect(result.identity).toContain('source:2433');
  });

  it('fails closed on protected project, program, production, incident, or standalone operations sources', () => {
    const protectedTitles = [
      'PROJECT: Parent project',
      'PROGRAM: Umbrella program',
      'PROMOTION CANDIDATE: Release candidate',
      'PRODUCTION: Deploy',
      'INCIDENT: Outage',
      'OPS: Standalone operational work',
    ];
    for (const title of protectedTitles) {
      const base = fixture();
      const result = evaluateCloseoutSuccessorTransaction({
        ...base,
        sourceIssue: { ...base.sourceIssue, title },
      } as never);
      expect(result.ok, title).toBe(false);
      if (result.ok) throw new Error('expected protected stop');
      expect(result.code).toBe('protected_source_issue_class');
    }
  });

  it('requires the explicit source sequence to identify exactly the requested successor', () => {
    const base = fixture();
    const result = evaluateCloseoutSuccessorTransaction({
      ...base,
      sourceIssue: {
        ...base.sourceIssue,
        body: String(base.sourceIssue.body).replace('Successor: #2434', 'Successor: #9999'),
      },
    } as never);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected successor mismatch');
    expect(result.code).toBe('successor_identity_mismatch');
  });

  it('requires a complete successor launch package and trusted implementation Go', () => {
    const base = fixture();
    const missingPackage = evaluateCloseoutSuccessorTransaction({
      ...base,
      successorIssue: { ...base.successorIssue, body: 'Parent Project: #2431' },
    } as never);
    expect(missingPackage.ok).toBe(false);
    if (missingPackage.ok) throw new Error('expected package failure');
    expect(missingPackage.code).toBe('successor_launch_package_incomplete');

    const missingGo = evaluateCloseoutSuccessorTransaction({
      ...base,
      successorComments: [],
    } as never);
    expect(missingGo.ok).toBe(false);
    if (missingGo.ok) throw new Error('expected implementation Go failure');
    expect(missingGo.code).toBe('successor_implementation_go_missing');
  });

  it('requires exact PR head, component target, integration SHA containment, and trusted closeout authority', () => {
    const base = fixture();
    const stale = evaluateCloseoutSuccessorTransaction({
      ...base,
      pullRequest: { ...base.pullRequest, head: { sha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' } },
    } as never);
    expect(stale.ok).toBe(false);
    if (stale.ok) throw new Error('expected stale head');
    expect(stale.code).toBe('closeout_pr_head_mismatch');

    const uncontained = evaluateCloseoutSuccessorTransaction({
      ...base,
      targetContainsIntegrationSha: false,
    } as never);
    expect(uncontained.ok).toBe(false);
    if (uncontained.ok) throw new Error('expected containment failure');
    expect(uncontained.code).toBe('integration_sha_not_on_target');

    const untrusted = evaluateCloseoutSuccessorTransaction({
      ...base,
      sourceComments: base.sourceComments.map((comment) => ({
        ...comment,
        author: { login: 'untrusted-user' },
      })),
    } as never);
    expect(untrusted.ok).toBe(false);
    if (untrusted.ok) throw new Error('expected authority failure');
    expect(untrusted.code).toBe('closeout_authority_missing');
  });
});

describe('closeout and successor execution', () => {
  it('writes one closeout packet, closes once, reports to parent, activates one successor, and resumes once', async () => {
    const base = fixture();
    const operations: Array<Record<string, unknown>> = [];
    let read = 0;
    const result = await executeCloseoutSuccessorTransaction({
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
            { id: 10, body: `CHATGPT CLOSEOUT\n<!-- agent-routing-closeout:${base.identity} -->` },
          ],
          parentComments: [
            { id: 11, body: `CHILD CLOSEOUT REPORT\n<!-- agent-routing-parent:${base.identity} -->` },
          ],
          successorIssue: {
            ...base.successorIssue,
            labels: ['agent:cursor', 'handoff:ready', 'status:in-progress', 'team:engineering', 'eng:priority:2'],
          },
          successorComments: [
            ...base.successorComments,
            { id: 12, body: `LOCAL CURSOR RESUME\n<!-- agent-routing-successor:${base.identity} -->` },
          ],
        };
      },
      mutate: async (operation: Record<string, unknown>) => {
        operations.push(operation);
        return { ok: true };
      },
    } as never);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected execution success');
    expect(result.verified).toBe(true);
    expect(result.transactions).toBe(1);
    expect(operations.map((operation) => operation.type)).toEqual([
      'comment-source-closeout',
      'close-source-issue',
      'comment-parent-report',
      'activate-successor-labels',
      'comment-successor-resume',
    ]);
    const labelOperation = operations.find((operation) => operation.type === 'activate-successor-labels');
    expect(labelOperation?.labels).toContain('eng:priority:2');
    expect(labelOperation?.labels).not.toContain('pmo:priority:2');
    expect(labelOperation?.labels).not.toContain('status:blocked');
  });

  it('suppresses a fully completed duplicate without another mutation', async () => {
    const base = fixture();
    const complete = {
      ...base,
      sourceIssue: { ...base.sourceIssue, state: 'CLOSED', labels: ['status:complete'] },
      sourceComments: [
        ...base.sourceComments,
        { id: 10, body: `CHATGPT CLOSEOUT\n<!-- agent-routing-closeout:${base.identity} -->` },
      ],
      parentComments: [
        { id: 11, body: `CHILD CLOSEOUT REPORT\n<!-- agent-routing-parent:${base.identity} -->` },
      ],
      successorIssue: {
        ...base.successorIssue,
        labels: ['agent:cursor', 'handoff:ready', 'status:in-progress'],
      },
      successorComments: [
        ...base.successorComments,
        { id: 12, body: `LOCAL CURSOR RESUME\n<!-- agent-routing-successor:${base.identity} -->` },
      ],
    };
    const operations: unknown[] = [];
    const result = await executeCloseoutSuccessorTransaction({
      repository: 'wdhunter645/next-starter-template',
      ...base.expected,
      config: base.config,
      collectState: async () => complete,
      mutate: async (operation: unknown) => {
        operations.push(operation);
        return { ok: true };
      },
    } as never);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected duplicate suppression');
    expect(result.code).toBe('closeout_successor_already_completed');
    expect(result.suppressed).toBe(true);
    expect(operations).toHaveLength(0);
  });

  it('blocks expected-state drift between the initial and final reread with zero mutations', async () => {
    const base = fixture();
    let reads = 0;
    const operations: unknown[] = [];
    const result = await executeCloseoutSuccessorTransaction({
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
      mutate: async (operation: unknown) => {
        operations.push(operation);
        return { ok: true };
      },
    } as never);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected drift block');
    expect(result.code).toBe('closeout_expected_state_drift');
    expect(operations).toHaveLength(0);
  });
});
