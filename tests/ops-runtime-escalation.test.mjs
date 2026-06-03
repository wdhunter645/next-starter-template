import { describe, expect, it } from 'vitest';
import {
  buildOpsRuntimeEscalationBody,
  escalationTitle,
  OPS_RUNTIME_ESCALATION_MARKER,
} from '../scripts/ci/ops_runtime_escalation.mjs';

describe('OPS runtime escalation helper', () => {
  it('builds evidence-rich escalation bodies', () => {
    const body = buildOpsRuntimeEscalationBody({
      workflowName: 'OPS — B2 S3 Smoke Test',
      runUrl: 'https://github.test/actions/1',
      commitSha: 'abc123',
      details: 'Smoke test failed on list-objects.',
      nextSteps: ['Review B2 credentials', 'Re-run workflow_dispatch manually'],
      retryEvidence: '- Retry attempts: 0\n- Result: failed before retry',
    });

    expect(body).toContain(OPS_RUNTIME_ESCALATION_MARKER);
    expect(body).toContain('OPS — B2 S3 Smoke Test');
    expect(body).toContain('Smoke test failed on list-objects.');
    expect(body).toContain('Review B2 credentials');
  });

  it('creates stable escalation titles', () => {
    expect(escalationTitle({ workflowName: 'OPS — Snapshot Backup' }))
      .toBe('OPS — Snapshot Backup — failure detected');
  });
});
