import { describe, expect, it } from 'vitest';
import { evaluateControllerEvent } from '../../scripts/agent-routing/controller.mjs';
import { validateMutation } from '../../scripts/agent-routing/github-actions.mjs';

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
});
