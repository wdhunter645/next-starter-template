import { describe, expect, it } from 'vitest';
import {
  AUTO_REPAIR_END,
  AUTO_REPAIR_START,
  canAutoRepairPullRequest,
  extractSourceIssue,
  hasHeading,
  repairPullRequestBody,
} from '../scripts/ci/pr_body_auto_repair.mjs';

const sameRepoPull = {
  state: 'open',
  head: {
    sha: 'abc123',
    repo: {
      full_name: 'wdhunter645/next-starter-template',
      fork: false,
    },
  },
  base: {
    repo: {
      full_name: 'wdhunter645/next-starter-template',
    },
  },
};

describe('PR body auto-repair safety', () => {
  it('allows open same-repository PRs on trusted workflow events', () => {
    expect(canAutoRepairPullRequest({
      pull: sameRepoPull,
      eventName: 'pull_request_target',
    })).toBe(true);
  });

  it('skips fork PRs', () => {
    expect(canAutoRepairPullRequest({
      pull: {
        ...sameRepoPull,
        head: {
          ...sameRepoPull.head,
          repo: {
            full_name: 'contributor/next-starter-template',
            fork: true,
          },
        },
      },
      eventName: 'pull_request_target',
    })).toBe(false);
  });

  it('skips closed PRs', () => {
    expect(canAutoRepairPullRequest({
      pull: {
        ...sameRepoPull,
        state: 'closed',
      },
      eventName: 'pull_request_target',
    })).toBe(false);
  });
});

describe('PR body auto-repair generation', () => {
  it('extracts the canonical source issue line', () => {
    expect(extractSourceIssue('- **Issue:** #1715')).toBe('1715');
  });

  it('detects canonical headings', () => {
    expect(hasHeading('## FILE-TOUCH ALLOWLIST (MANDATORY)', '## FILE-TOUCH ALLOWLIST (MANDATORY)')).toBe(true);
  });

  it('adds a managed repair block with changed-file allowlist evidence', () => {
    const result = repairPullRequestBody({
      body: '- **Issue:** #1715\n\n## CHANGE SUMMARY\n- Original summary',
      pull: sameRepoPull,
      files: [
        { filename: '.github/workflows/reviewer-response-completion.yml' },
        { filename: 'scripts/ci/pr_body_auto_repair.mjs' },
      ],
      headSha: 'abc123',
    });

    expect(result.changed).toBe(true);
    expect(result.body).toContain(AUTO_REPAIR_START);
    expect(result.body).toContain(AUTO_REPAIR_END);
    expect(result.body).toContain('`scripts/ci/pr_body_auto_repair.mjs`');
    expect(result.body).toContain('Source issue detected: #1715');
    expect(result.body).toContain('Intent inferred by automation: infra');
  });

  it('replaces an existing managed block instead of appending duplicates', () => {
    const result = repairPullRequestBody({
      body: ['- **Issue:** #1715', AUTO_REPAIR_START, 'old block', AUTO_REPAIR_END].join('\n'),
      pull: sameRepoPull,
      files: [{ filename: 'docs/example.md' }],
      headSha: 'abc123',
    });

    expect(result.body.match(new RegExp(AUTO_REPAIR_START, 'g'))).toHaveLength(1);
    expect(result.body).not.toContain('old block');
    expect(result.body).toContain('Docs-only inferred by automation: yes');
  });

  it('creates reviewer disposition placeholders for undispositioned trusted review comments', () => {
    const result = repairPullRequestBody({
      body: '- **Issue:** #1715\n\n## REVIEWER RESPONSE ACCOUNTING\n- [ ] Reviewed all reviewer comments.',
      pull: sameRepoPull,
      files: [{ filename: 'scripts/ci/pr_body_auto_repair.mjs' }],
      reviewComments: [{
        id: 3427000000,
        user: { login: 'gemini-code-assist[bot]' },
        commit_id: 'abc123',
        path: 'scripts/ci/pr_body_auto_repair.mjs',
        line: 42,
        body: 'Please update this implementation.',
        created_at: '2026-06-17T00:00:00Z',
      }],
      headSha: 'abc123',
    });

    expect(result.body).toContain('review-comment:3427000000');
    expect(result.body).toContain('auto-generated disposition placeholder');
  });
});
