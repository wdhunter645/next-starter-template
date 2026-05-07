import { describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';

process.env.GITHUB_REPOSITORY = 'owner/repo';
process.env.PR_NUMBER = '42';
process.env.SYNC_ACTION = 'closed';

const createIssues = await import('../scripts/orchestrator/create-issues.mjs');
const createDraftPr = await import('../scripts/orchestrator/create-draft-pr.mjs');
const advanceQueue = await import('../scripts/orchestrator/advance-queue.mjs');
const syncPrState = await import('../scripts/orchestrator/sync-pr-state.mjs');

function issue(number, status, createdAt) {
  return {
    number,
    title: `Task ${number}`,
    createdAt,
    labels: [
      { name: 'orchestrator' },
      { name: status }
    ]
  };
}

function queryFor(statuses) {
  return vi.fn(() => Object.values(statuses).flat());
}

describe('orchestrator issue creation queue model', () => {
  it('labels the first produced task as queued and subsequent tasks as blocked', () => {
    const tasks = [
      { type: 'repository', agent: 'codex' },
      { type: 'website', agent: 'cursor' },
      { type: 'docs', agent: 'atlas' }
    ];

    const labels = tasks.map((task, index) =>
      createIssues.labelsForTask(task, createIssues.statusLabelForCreatedTask(index))
    );

    expect(labels[0]).toContain('status:queued');
    expect(labels[1]).toContain('status:blocked');
    expect(labels[2]).toContain('status:blocked');
  });

  it('labels every produced task as blocked when an orchestrator issue is already open', () => {
    const tasks = [
      { type: 'repository', agent: 'codex' },
      { type: 'website', agent: 'cursor' }
    ];

    const labels = tasks.map((task, index) =>
      createIssues.labelsForTask(task, createIssues.statusLabelForCreatedTask(index, true))
    );

    expect(labels[0]).toContain('status:blocked');
    expect(labels[1]).toContain('status:blocked');
  });

  it('does not count skipped existing tasks when assigning the first newly created task status', () => {
    const taskAlreadyHasIssue = [true, true, true, false];
    const producedStatuses = [];
    let createdIssueCount = 0;

    for (const exists of taskAlreadyHasIssue) {
      if (exists) continue;
      producedStatuses.push(createIssues.statusLabelForCreatedTask(createdIssueCount));
      createdIssueCount += 1;
    }

    expect(producedStatuses).toEqual(['status:queued']);
  });
});

describe('orchestrator draft PR preflight model', () => {
  it('recognizes standard duplicate issue markers', () => {
    expect(createDraftPr.isDuplicateIssueBody('Duplicate of #973')).toBe(true);
    expect(createDraftPr.isDuplicateIssueBody('Duplicate of Issue #973')).toBe(true);
    expect(createDraftPr.isDuplicateIssueBody('This was closed as duplicate during triage.')).toBe(true);
    expect(createDraftPr.isDuplicateIssueBody('Related to #973 but still active.')).toBe(false);
  });

  it('uses one focused search query for existing implementation PRs', () => {
    expect(createDraftPr.issuePrSearchQuery(981)).toContain('orchestrator-source-issue: 981');
    expect(createDraftPr.issuePrSearchQuery(981)).toContain('- **Issue:** #981');
    expect(createDraftPr.issuePrSearchQuery(981)).toContain('issues/981');
  });
});

describe('orchestrator queue advancement', () => {
  it('keeps a three-task queue serial until merge verification completes, then queues the next task', () => {
    const tasks = [
      { type: 'repository', agent: 'codex' },
      { type: 'website', agent: 'cursor' },
      { type: 'docs', agent: 'atlas' }
    ];
    const producedStatuses = tasks.map((task, index) =>
      createIssues.labelsForTask(task, createIssues.statusLabelForCreatedTask(index))
        .find((label) => label.startsWith('status:'))
    );

    expect(producedStatuses).toEqual(['status:queued', 'status:blocked', 'status:blocked']);

    const blockedOlder = issue(2, 'status:blocked', '2026-05-05T19:01:00Z');
    const blockedNewer = issue(3, 'status:blocked', '2026-05-05T19:02:00Z');
    const pipelineStates = [
      'status:queued',
      'status:pr-draft',
      'status:implementation',
      'status:review',
      'status:post-merge-verify'
    ];

    for (const state of pipelineStates) {
      expect(
        advanceQueue.queueAdvanceDecision(
          queryFor({
            [state]: [issue(1, state, '2026-05-05T19:00:00Z')],
            'status:blocked': [blockedOlder, blockedNewer]
          })
        )
      ).not.toMatchObject({ action: 'advance' });
    }

    const transitions = [];
    const merged = syncPrState.syncPrState({
      prNumber: '42',
      action: 'merged',
      pr: { body: '**Issue:** #1', mergedAt: '2026-05-05T19:05:00Z', state: 'MERGED', url: 'https://example.test/pr/42' },
      setStatusFn: (...args) => transitions.push(args)
    });
    const complete = syncPrState.syncPrState({
      prNumber: '42',
      action: 'post_merge_success',
      pr: { body: '**Issue:** #1', mergedAt: '2026-05-05T19:05:00Z', state: 'MERGED', url: 'https://example.test/pr/42' },
      setStatusFn: (...args) => transitions.push(args),
      run: vi.fn()
    });

    expect(merged).toBe('post_merge_verify');
    expect(complete).toBe('complete');
    expect(transitions.map((transition) => transition.slice(1, 3))).toEqual([
      ['status:review', 'status:post-merge-verify'],
      ['status:post-merge-verify', 'status:complete']
    ]);
    expect(advanceQueue.queueAdvanceDecision(queryFor({ 'status:blocked': [blockedNewer, blockedOlder] })))
      .toMatchObject({ action: 'advance', issue: { number: 2 } });
  });

  it('advances the oldest blocked task only after the active pipeline completes', () => {
    const queued = issue(1, 'status:queued', '2026-05-05T19:00:00Z');
    const blockedOlder = issue(2, 'status:blocked', '2026-05-05T19:01:00Z');
    const blockedNewer = issue(3, 'status:blocked', '2026-05-05T19:02:00Z');

    const pipelineStates = [
      'status:queued',
      'status:pr-draft',
      'status:implementation',
      'status:review',
      'status:post-merge-verify'
    ];

    for (const state of pipelineStates) {
      const activeIssue = { ...queued, labels: [{ name: 'orchestrator' }, { name: state }] };
      expect(
        advanceQueue.queueAdvanceDecision(queryFor({ [state]: [activeIssue], 'status:blocked': [blockedOlder, blockedNewer] }))
      ).not.toMatchObject({ action: 'advance' });
    }

    const decision = advanceQueue.queueAdvanceDecision(
      queryFor({ 'status:blocked': [blockedNewer, blockedOlder] })
    );

    expect(decision).toMatchObject({ action: 'advance', issue: { number: 2 } });
  });

  it('relabels the next blocked task and leaves traceability comment that triggers issue handoff', () => {
    const run = vi.fn();

    advanceQueue.advanceIssue(issue(2, 'status:blocked', '2026-05-05T19:01:00Z'), run);

    expect(run).toHaveBeenNthCalledWith(1, [
      'issue',
      'edit',
      '2',
      '--repo',
      'owner/repo',
      '--remove-label',
      'status:blocked',
      '--add-label',
      'status:queued'
    ]);
    expect(run).toHaveBeenNthCalledWith(2, [
      'issue',
      'comment',
      '2',
      '--repo',
      'owner/repo',
      '--body',
      'Queue advance: blocked → queued'
    ]);
  });

  it('halts without advancing when a post-merge failure applies status:failed', () => {
    const blocked = issue(3, 'status:blocked', '2026-05-05T19:02:00Z');
    const failed = issue(1, 'status:failed', '2026-05-05T19:00:00Z');
    const query = queryFor({ 'status:failed': [failed], 'status:blocked': [blocked] });
    const logs = [];
    const transitions = [];

    const failedTransition = syncPrState.syncPrState({
      prNumber: '42',
      action: 'post_merge_failure',
      pr: { body: '**Issue:** #1', mergedAt: '2026-05-05T19:05:00Z', state: 'MERGED', url: 'https://example.test/pr/42' },
      setStatusFn: (...args) => transitions.push(args)
    });

    const decision = advanceQueue.queueAdvanceDecision(query);
    advanceQueue.logDecision(decision, (message) => logs.push(message));

    expect(failedTransition).toBe('failed');
    expect(transitions[0].slice(1, 3)).toEqual(['status:post-merge-verify', 'status:failed']);
    expect(decision).toEqual({ action: 'halt_failed' });
    expect(logs).toEqual(['halt: failed']);
  });
});

describe('orchestrator workflow trigger compatibility', () => {
  it('uses status:queued labels for issue handoff and label changes for queue advancement', () => {
    const draftWorkflow = fs.readFileSync('.github/workflows/orchestrator-draft-pr.yml', 'utf8');
    const queueWorkflow = fs.readFileSync('.github/workflows/orchestrator-queue-advance.yml', 'utf8');
    const enforcePrOnlyWorkflow = fs.readFileSync('.github/workflows/enforce-pr-only.yml', 'utf8');
    const postMergeWorkflow = fs.readFileSync('.github/workflows/post-merge-intent-verification.yml', 'utf8');
    const createIssuesScript = fs.readFileSync('scripts/orchestrator/create-issues.mjs', 'utf8');
    const createDraftPrScript = fs.readFileSync('scripts/orchestrator/create-draft-pr.mjs', 'utf8');

    expect(draftWorkflow).toContain('types: [opened, labeled]');
    expect(draftWorkflow).toContain("contains(github.event.issue.labels.*.name, 'status:queued')");
    expect(queueWorkflow).toContain('types: [labeled]');
    expect(queueWorkflow).toContain("node-version: '22'");
    expect(queueWorkflow).toContain("github.event.label.name == 'status:complete'");
    expect(queueWorkflow).toContain("github.event.label.name == 'status:failed'");
    expect(enforcePrOnlyWorkflow).toContain('commits/${GITHUB_SHA}/pulls');
    expect(postMergeWorkflow).toContain('commits/${GITHUB_SHA}/pulls');
    expect(createIssuesScript).toMatch(/['"]--state['"],\s*['"]all['"]/s);
    expect(createDraftPrScript).toContain('existingOpenPrForIssue(issue.number)');
    expect(createDraftPrScript).toContain("issue.state !== 'OPEN'");
    expect(createDraftPrScript).toContain('no placeholder PR was created');
    expect(createDraftPrScript).not.toContain('orchestrator-placeholder-pr: true');
    expect(createDraftPrScript).not.toContain('commit --allow-empty');
  });
});
