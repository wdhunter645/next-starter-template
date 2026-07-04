import { describe, expect, it } from 'vitest';
import {
  buildPrProcessMetricsRecord,
  dedupeTrackedChecks,
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

  it('dedupes duplicate check names by latest completed timestamp', () => {
    const deduped = dedupeTrackedChecks([
      { name: 'quality', conclusion: 'failure', completedAt: '2026-01-01T10:00:00Z' },
      { name: 'quality', conclusion: 'success', completedAt: '2026-01-01T11:00:00Z' },
      { name: 'gitleaks', conclusion: 'success', completedAt: '2026-01-01T10:30:00Z' },
    ]);

    expect(deduped).toHaveLength(2);
    expect(deduped.find((check) => check.name === 'quality')?.conclusion).toBe('success');
  });

  it('uses later entry when duplicate checks lack timestamps', () => {
    const deduped = dedupeTrackedChecks([
      { name: 'quality', conclusion: 'failure' },
      { name: 'quality', conclusion: 'success' },
    ]);

    expect(deduped).toEqual([{ name: 'quality', conclusion: 'success' }]);
  });

  it('keeps required checks green when stale failed attempt is followed by latest success', () => {
    const record = buildPrProcessMetricsRecord({
      prNumber: 2225,
      headSha: 'abc123',
      runAttempt: 2,
      checks: [
        { name: 'quality', conclusion: 'failure', required: true, completedAt: '2026-01-01T10:00:00Z' },
        { name: 'quality', conclusion: 'success', required: true, completedAt: '2026-01-01T11:00:00Z' },
        { name: 'gitleaks', conclusion: 'failure', required: true, completedAt: '2026-01-01T10:05:00Z' },
        { name: 'gitleaks', conclusion: 'success', required: true, completedAt: '2026-01-01T11:05:00Z' },
        { name: 'pr-hygiene', conclusion: 'failure', required: false, completedAt: '2026-01-01T10:10:00Z' },
        { name: 'pr-hygiene', conclusion: 'success', required: false, completedAt: '2026-01-01T11:10:00Z' },
      ],
    });

    expect(record.requiredChecksGreen).toBe(true);
    expect(record.failedRequiredChecks).toEqual([]);
    expect(record.failedAdvisoryChecks).toEqual([]);
    expect(record.secondPassSuccess).toBe(true);
    expect(record.firstPassSuccess).toBe(false);
  });

  it('does not flip first-pass success when stale duplicates fail but latest passes', () => {
    const record = buildPrProcessMetricsRecord({
      prNumber: 2225,
      headSha: 'abc123',
      runAttempt: 1,
      checks: [
        { name: 'quality', conclusion: 'failure', required: true },
        { name: 'quality', conclusion: 'success', required: true },
        { name: 'gitleaks', conclusion: 'success', required: true },
        { name: 'pr-hygiene', conclusion: 'failure', required: false },
        { name: 'pr-hygiene', conclusion: 'success', required: false },
        { name: 'diff-scope', conclusion: 'success', required: false },
        { name: 'reviewer-response-completion', conclusion: 'success', required: false },
      ],
    });

    expect(record.requiredChecksGreen).toBe(true);
    expect(record.firstPassSuccess).toBe(true);
    expect(record.failedRequiredChecks).toEqual([]);
    expect(record.failedAdvisoryChecks).toEqual([]);
  });
});
