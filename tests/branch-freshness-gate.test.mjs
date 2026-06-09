import { describe, expect, it } from 'vitest';

import {
  assessBranchFreshness,
  countCommitsBehind,
  formatGateReport,
  isAncestor,
  REMEDIATION,
} from '../scripts/ci/branch_freshness_gate.mjs';

describe('branch freshness gate', () => {
  it('treats identical SHAs as fresh', () => {
    const result = assessBranchFreshness({
      eventName: 'pull_request',
      baseSha: 'abc123',
      headSha: 'abc123',
    });

    expect(result.ok).toBe(true);
    expect(result.reason).toBe('fresh');
  });

  it('passes when base is an ancestor of head', () => {
    const git = {
      calls: [],
      fn(args) {
        this.calls.push(args);
        if (args[0] === 'merge-base' && args[1] === '--is-ancestor') {
          return '';
        }
        if (args[0] === 'rev-list' && args[1] === '--count') {
          return '0';
        }
        return '';
      },
    };

    const result = assessBranchFreshness({
      eventName: 'pull_request',
      baseSha: 'base',
      headSha: 'head',
      isAncestorFn: (ancestor, descendant) => isAncestor(ancestor, descendant, { run: git.fn.bind(git) }),
      countBehindFn: (base, head) => countCommitsBehind(base, head, { run: git.fn.bind(git) }),
    });

    expect(result.ok).toBe(true);
    expect(result.behindCount).toBe(0);
  });

  it('fails when head is behind base', () => {
    const git = {
      fn(args) {
        if (args[0] === 'merge-base' && args[1] === '--is-ancestor') {
          throw new Error('not ancestor');
        }
        if (args[0] === 'rev-list' && args[1] === '--count') {
          return '3';
        }
        return '';
      },
    };

    const result = assessBranchFreshness({
      eventName: 'pull_request',
      baseSha: 'base',
      headSha: 'head',
      isAncestorFn: (ancestor, descendant) => isAncestor(ancestor, descendant, { run: git.fn.bind(git) }),
      countBehindFn: (base, head) => countCommitsBehind(base, head, { run: git.fn.bind(git) }),
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('behind-base');
    expect(result.behindCount).toBe(3);
    expect(result.remediation).toBe(REMEDIATION);
  });

  it('checks push events against origin/main', () => {
    const result = assessBranchFreshness({
      eventName: 'push',
      ref: 'refs/heads/feature',
      headSha: 'head',
      mainRef: 'origin/main',
      isAncestorFn: () => true,
      countBehindFn: () => 0,
    });

    expect(result.ok).toBe(true);
    expect(result.baseSha).toBe('origin/main');
  });

  it('skips main push events', () => {
    const result = assessBranchFreshness({
      eventName: 'push',
      ref: 'refs/heads/main',
      headSha: 'head',
    });

    expect(result.ok).toBe(true);
    expect(result.skipped).toBe(true);
    expect(result.reason).toBe('main-push');
  });

  it('formats actionable remediation on failure', () => {
    const report = formatGateReport({
      ok: false,
      reason: 'behind-base',
      summary: 'Branch is 2 commit(s) behind the required base.',
      behindCount: 2,
      baseSha: 'base',
      headSha: 'head',
      remediation: REMEDIATION,
    });

    expect(report).toContain('FAIL');
    expect(report).toContain('Commits behind base: 2');
    expect(report).toContain('git fetch origin main');
  });
});
