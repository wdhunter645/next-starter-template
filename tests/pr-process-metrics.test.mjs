import { describe, expect, it } from 'vitest';
import {
  buildPrProcessMetricsRecord,
  normalizeCheckConclusion,
  renderPrProcessMetricsReport,
} from '../scripts/ci/pr_process_metrics.mjs';

describe('PR process metrics', () => {
  it('normalizes check conclusions', () => {
    expect(normalizeCheckConclusion('success')).toBe('pass');
    expect(normalizeCheckConclusion('failure')).toBe('fail');
    expect(normalizeCheckConclusion('skipped')).toBe('skipped');
  });

  it('records first-pass success when all tracked checks pass on attempt 1', () => {
    const record = buildPrProcessMetricsRecord({
      prNumber: 2224,
      headSha: 'abc123',
      runAttempt: 1,
      checks: [
        { name: 'quality', conclusion: 'success', required: true },
        { name: 'gitleaks', conclusion: 'success', required: true },
        { name: 'pr-hygiene', conclusion: 'success', required: false },
        { name: 'diff-scope', conclusion: 'success', required: false },
      ],
    });

    expect(record.firstPassSuccess).toBe(true);
    expect(record.secondPassSuccess).toBe(false);
    expect(record.requiredChecksGreen).toBe(true);
    expect(record.failedAdvisoryChecks).toEqual([]);
  });

  it('records advisory failures separately from required failures', () => {
    const record = buildPrProcessMetricsRecord({
      prNumber: 2224,
      headSha: 'abc123',
      runAttempt: 1,
      checks: [
        { name: 'quality', conclusion: 'success', required: true },
        { name: 'gitleaks', conclusion: 'success', required: true },
        { name: 'pr-hygiene', conclusion: 'failure', required: false },
      ],
    });

    expect(record.firstPassSuccess).toBe(false);
    expect(record.requiredChecksGreen).toBe(true);
    expect(record.failedAdvisoryChecks).toEqual(['pr-hygiene']);
  });

  it('renders a human-readable metrics report', () => {
    const rendered = renderPrProcessMetricsReport(buildPrProcessMetricsRecord({
      prNumber: 99,
      headSha: 'deadbeef',
      runAttempt: 2,
      checks: [],
    }));

    expect(rendered).toContain('PR Process Metrics');
    expect(rendered).toContain('#99');
    expect(rendered).toContain('Run attempt: 2');
  });
});
