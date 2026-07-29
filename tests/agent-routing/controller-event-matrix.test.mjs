import { describe, expect, it } from 'vitest';
import { evaluateControllerEvent } from '../../scripts/agent-routing/controller.mjs';
import { validateMutation } from '../../scripts/agent-routing/github-actions.mjs';
import { normalizeIssuePrContractEvidence } from '../../scripts/agent-routing/evidence-adapters/issue-pr-contract.mjs';

const input = {
  project: { issueNumber: 2294, lifecycle: 'active', projectBranch: 'component/agent-issue-polling-handoff-routing' },
  task: { issueNumber: 2593, id: '001', state: 'active', predecessors: [], wakeEligible: true },
  labels: ['agent:cursor', 'handoff:ready'],
  events: [{ id: 1, marker: 'CURSOR ASSIGNMENT', createdAt: '2026-07-17T00:00:00Z' }],
  pullRequests: [], checks: [], reviews: [], claims: [], consumedEventIds: [],
};

describe('controller event and permission matrix', () => {
  it.each(['issues', 'issue_comment', 'pull_request', 'pull_request_review', 'workflow_run', 'workflow_dispatch'])(
    'accepts supported %s events in observe mode',
    (eventName) => {
      const result = evaluateControllerEvent({ eventName, trusted: true, input, policy: { mode: 'observe' } });
      expect(result.ok).toBe(true);
      expect(result.apply).toBe(false);
    },
  );

  it('fails closed for untrusted and unsupported events', () => {
    expect(evaluateControllerEvent({ eventName: 'pull_request', trusted: false, input, policy: { mode: 'advance' } }).plan.class).toBe('halt');
    expect(evaluateControllerEvent({ eventName: 'repository_vulnerability_alert', trusted: true, input, policy: { mode: 'advance' } }).plan.class).toBe('halt');
  });

  it('revalidates expected revision and rejects main mutation', () => {
    expect(validateMutation({ type: 'merge_pr', base: 'main', expectedRevision: 'x' }, { revision: 'x' }).ok).toBe(false);
    expect(validateMutation({ type: 'set_labels', issue: 2593, expectedRevision: 'x' }, { revision: 'y' }).reason).toBe('state_revision_changed');
  });

  it('gates create_draft_pr (#2621) through the same event/permission matrix as every other action', () => {
    const contractInput = {
      ...input,
      labels: ['status:pr-ready'],
      events: [],
      issuePrContract: normalizeIssuePrContractEvidence({
        ok: true,
        rev: 1,
        errors: [],
        fields: { head_branch: 'cursor/9101-example', base_branch: 'component/example' },
        liveSnapshot: { headSha: 'h', baseSha: 'b', hasDiff: true, changedFiles: [] },
      }),
    };

    const observeResult = evaluateControllerEvent({ eventName: 'workflow_dispatch', trusted: true, input: contractInput, policy: { mode: 'observe' } });
    expect(observeResult.plan.class).toBe('observe');
    expect(observeResult.apply).toBe(false);

    const untrustedResult = evaluateControllerEvent({ eventName: 'workflow_dispatch', trusted: false, input: contractInput, policy: { mode: 'advance' } });
    expect(untrustedResult.plan.class).toBe('halt');
    expect(untrustedResult.apply).toBe(false);

    const advanceResult = evaluateControllerEvent({ eventName: 'workflow_dispatch', trusted: true, input: contractInput, policy: { mode: 'advance' } });
    expect(advanceResult.plan.class).toBe('create_draft_pr');
    expect(advanceResult.apply).toBe(true);
  });
});
