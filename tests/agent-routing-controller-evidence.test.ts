import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  assertObserveOnlyConfigInvariants,
  loadControllerConfig,
  mainAsync,
  runObserveController,
} from '../scripts/agent-routing/controller.mjs';
import {
  ALL_HANDOFF_EVENT_MARKERS,
  buildActionIdentity,
  classifyDecisionAutomatability,
  detectHandoffEventMarker,
  PROTECTED_DECISION_CLASSES,
} from '../scripts/agent-routing/lib/event-contract.mjs';
import {
  assertCurrentHeadSha,
  assertHintsMatchLive,
  assertValidPrNumber,
  collectLiveGitHubEvidence,
  extractPrimarySourceIssueRefs,
  normalizeChecks,
  resolveExactOpenSourceIssue,
} from '../scripts/agent-routing/lib/evidence-collector.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HEAD = '95aa88b98c705b3a93edbe2691b8d616ffc2c24b';
const OTHER = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
type Failure = { ok: false; code: string; message?: string };

function issue(body = '## Acceptance Criteria\n\n- [x] ok\n') {
  return {
    number: 2433,
    state: 'open',
    title: 'TASK: CC-001',
    body,
    labels: [{ name: 'agent:cursor' }, { name: 'handoff:ready' }],
  };
}

function pr(head = HEAD) {
  return {
    number: 2675,
    title: 'docs(#2433)',
    state: 'open',
    body: `- **Issue:** #2433
- Delivery model: B-child
- Target environment: component
- Approval profile: component-auto-integration
- Gate profile: component-child
- Component branch: component/content-collection-phase1
- Component master: #2431
`,
    base: { ref: 'component/content-collection-phase1' },
    head: { ref: 'cursor/2433', sha: head },
    html_url: 'https://github.com/wdhunter645/next-starter-template/pull/2675',
  };
}

function fixture(overrides: Record<string, unknown> = {}) {
  const sourceIssue = { ...issue(), state: 'OPEN', labels: ['agent:cursor', 'handoff:ready'] };
  const pullRequest = {
    ...pr(),
    baseRefName: 'component/content-collection-phase1',
    headRefName: 'cursor/2433',
    headSha: HEAD,
    url: 'https://github.com/wdhunter645/next-starter-template/pull/2675',
  };
  const triggerComment = {
    id: '5029000001',
    createdAt: '2026-07-20T18:00:00Z',
    body: 'CHATGPT HANDOFF\nIssue: #2433\nPR: #2675\n',
  };
  const issueComments = [
    triggerComment,
    {
      id: '5029000002',
      createdAt: '2026-07-20T19:00:00Z',
      body: 'late note',
      author: { login: 'bill' },
    },
  ];
  const live = {
    collectedAt: '2026-07-20T19:05:00Z',
    source: 'github-native',
    finalReread: true,
    sourceIssue,
    pullRequest,
    headSha: HEAD,
    checks: [{ name: 'quality', status: 'completed', conclusion: 'success', headSha: HEAD }],
    changedFiles: ['docs/a.md'],
    reviewThreads: [
      { id: 'open', isResolved: false, path: 'docs/a.md', body: 'open' },
      { id: 'done', isResolved: true, path: 'docs/a.md', body: 'done' },
    ],
    reviewSubmissions: [],
    issueComments,
  };
  return {
    sourceIssue,
    pullRequest,
    triggerComment,
    observedHeadSha: HEAD,
    issueComments,
    reread: { sourceIssue, pullRequest },
    live,
    ...overrides,
  };
}

function response(payload: unknown, ok = true, status = ok ? 200 : 500) {
  return {
    ok,
    status,
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  };
}

function githubFetch(options: {
  finalHead?: string;
  finalIssueBody?: string;
  checkFailure?: boolean;
  multipage?: boolean;
  missingThreadCursor?: boolean;
} = {}) {
  let issueReads = 0;
  let prReads = 0;
  return async (url: string, init?: { body?: string }) => {
    if (url.includes('/graphql')) {
      const variables = JSON.parse(init?.body || '{}').variables || {};
      if (variables.after == null) {
        return response({
          data: {
            repository: {
              pullRequest: {
                reviewThreads: {
                  nodes: [{ id: 'thread-1', isResolved: false, path: 'docs/a.md', comments: { nodes: [{ body: 'first' }] } }],
                  pageInfo: {
                    hasNextPage: Boolean(options.multipage || options.missingThreadCursor),
                    endCursor: options.missingThreadCursor ? null : options.multipage ? 'cursor-1' : null,
                  },
                },
              },
            },
          },
        });
      }
      return response({
        data: {
          repository: {
            pullRequest: {
              reviewThreads: {
                nodes: [{ id: 'thread-2', isResolved: true, path: 'docs/b.md', comments: { nodes: [{ body: 'second' }] } }],
                pageInfo: { hasNextPage: false, endCursor: null },
              },
            },
          },
        },
      });
    }

    const apiPath = url.replace(
      'https://api.github.com/repos/wdhunter645/next-starter-template',
      '',
    );
    if (apiPath === '/issues/2433') {
      issueReads += 1;
      return response(issue(issueReads > 1 && options.finalIssueBody ? options.finalIssueBody : undefined));
    }
    if (apiPath === '/pulls/2675') {
      prReads += 1;
      return response(pr(prReads > 1 && options.finalHead ? options.finalHead : HEAD));
    }
    if (apiPath === '/pulls/2675/files?per_page=100&page=1') {
      return response([{ filename: 'docs/a.md' }]);
    }
    if (apiPath === '/issues/2433/comments?per_page=100&page=1') {
      return response([{ id: 1, created_at: '2026-07-20T18:00:00Z', body: 'CHATGPT HANDOFF\nIssue: #2433\n', user: { login: 'bill' } }]);
    }
    if (apiPath === '/pulls/2675/reviews?per_page=100&page=1') return response([]);
    const match = apiPath.match(new RegExp(`^/commits/${HEAD}/check-runs\\?per_page=100&page=(\\d+)$`));
    if (match) {
      if (options.checkFailure) return response({ message: 'forbidden' }, false, 403);
      const page = Number(match[1]);
      if (options.multipage && page === 1) {
        return response({
          total_count: 101,
          check_runs: Array.from({ length: 100 }, (_, index) => ({
            name: `check-${index}`,
            status: 'completed',
            conclusion: 'success',
            head_sha: HEAD,
          })),
        });
      }
      if (options.multipage && page === 2) {
        return response({
          total_count: 101,
          check_runs: [{ name: 'check-100', status: 'completed', conclusion: 'success', head_sha: HEAD }],
        });
      }
      return response({
        total_count: 1,
        check_runs: [{ name: 'quality', status: 'completed', conclusion: 'success', head_sha: HEAD }],
      });
    }
    return response({ message: `missing ${apiPath}` }, false, 404);
  };
}

describe('event and evidence primitives', () => {
  it('recognizes canonical markers and stable identities', () => {
    expect(ALL_HANDOFF_EVENT_MARKERS).toEqual([
      'IMPLEMENTATION HANDOFF',
      'PR REVIEW REQUEST',
      'CHATGPT HANDOFF',
    ]);
    expect(detectHandoffEventMarker('CHATGPT HANDOFF\nIssue: #1')?.adapter).toBe(true);
    expect(buildActionIdentity({
      sourceIssueNumber: 2433,
      eventType: 'chatgpt_handoff_legacy',
      eventCommentId: '1',
      prNumber: 2675,
      headSha: HEAD,
    } as never)).toContain(`head:${HEAD}`);
  });

  it('marks all protected decisions non-automatable', () => {
    for (const decisionClass of PROTECTED_DECISION_CLASSES) {
      expect(classifyDecisionAutomatability(decisionClass).nonAutomatable).toBe(true);
    }
  });

  it('fails closed on missing/ambiguous Issues, invalid PRs, and stale heads', () => {
    expect((resolveExactOpenSourceIssue([]) as Failure).code).toBe('missing_source_issue');
    expect((resolveExactOpenSourceIssue([{ number: 1 }, { number: 2 }]) as Failure).code)
      .toBe('ambiguous_source_issue');
    expect((assertValidPrNumber('bad') as Failure).code).toBe('invalid_pr_number');
    expect((assertCurrentHeadSha({ expectedHeadSha: HEAD, observedHeadSha: OTHER }) as Failure).code)
      .toBe('stale_head_sha');
    expect(extractPrimarySourceIssueRefs(pr().body)).toEqual([2433]);
    expect(normalizeChecks([
      { name: 'current', headSha: HEAD },
      { name: 'stale', headSha: OTHER },
    ], HEAD).map((check) => check.name)).toEqual(['current']);
  });
});

describe('normalized observe packet', () => {
  it('represents the fixture, review distinctions, and protected boundaries', () => {
    const result = runObserveController(fixture()) as any;
    expect(result.ok).toBe(true);
    expect(result.packet.sourceIssue.number).toBe(2433);
    expect(result.packet.pullRequest.headSha).toBe(HEAD);
    expect(result.packet.event.eventCommentId).toBe('5029000001');
    expect(result.packet.reviewEvidence.unresolvedReviewThreads).toHaveLength(1);
    expect(result.packet.reviewEvidence.resolvedReviewThreads).toHaveLength(1);
    expect(result.packet.reviewEvidence.lateIssueComments).toHaveLength(1);
    expect(result.packet.protectedBoundaries.classes).toEqual([...PROTECTED_DECISION_CLASSES]);
    expect(result.packet.reread.source).toBe('github-native');
  });

  it('rejects stale/fabricated hints and missing live evidence', () => {
    expect((runObserveController({ ...fixture(), observedHeadSha: OTHER }) as Failure).code)
      .toBe('stale_head_sha');
    const base = fixture();
    expect((runObserveController({
      ...base,
      reread: { sourceIssue: { ...base.sourceIssue, number: 9999 }, pullRequest: base.pullRequest },
    }) as Failure).code).toBe('fabricated_reread_rejected');
    const { live: _live, ...withoutLive } = fixture();
    expect((runObserveController(withoutLive) as Failure).code).toBe('live_evidence_unavailable');
  });

  it('requires event authority to match live Issue comments', () => {
    const base = fixture();
    expect((runObserveController({
      ...base,
      triggerComment: { ...base.triggerComment, id: 'missing' },
    }) as Failure).code).toBe('trigger_comment_not_in_live_evidence');
    expect((runObserveController({
      ...base,
      triggerComment: { ...base.triggerComment, body: 'CHATGPT HANDOFF\nforged' },
    }) as Failure).code).toBe('trigger_comment_not_in_live_evidence');
    expect((runObserveController({
      ...base,
      triggerComment: undefined,
      live: { ...base.live, issueComments: [{ id: '2', body: 'not an event' }] },
    }) as Failure).code).toBe('missing_canonical_event');
  });

  it('rejects caller delivery-profile overrides', () => {
    expect((runObserveController({
      ...fixture(),
      deliveryProfile: { deliveryModel: 'A', targetEnvironment: 'production' },
    }) as Failure).code).toBe('delivery_profile_hint_mismatch');
  });
});

describe('GitHub-native collection', () => {
  it('collects current-head evidence and final rereads', async () => {
    const result = await collectLiveGitHubEvidence({
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2433,
      prNumber: 2675,
      token: 'test',
      fetchFn: githubFetch() as never,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected success');
    expect(result.live.finalReread).toBe(true);
    expect(result.live.pullRequest.headSha).toBe(HEAD);
    expect(result.live.changedFiles).toEqual(['docs/a.md']);
  });

  it('fails closed on mid-collection PR or Issue drift', async () => {
    const headDrift = await collectLiveGitHubEvidence({
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2433,
      prNumber: 2675,
      token: 'test',
      fetchFn: githubFetch({ finalHead: OTHER }) as never,
    }) as Failure;
    expect(headDrift.code).toBe('stale_head_sha');

    const issueDrift = await collectLiveGitHubEvidence({
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2433,
      prNumber: 2675,
      token: 'test',
      fetchFn: githubFetch({ finalIssueBody: 'changed' }) as never,
    }) as Failure;
    expect(issueDrift.code).toBe('live_identity_drift');
  });

  it('fails closed on check API failure', async () => {
    const result = await collectLiveGitHubEvidence({
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2433,
      prNumber: 2675,
      token: 'test',
      fetchFn: githubFetch({ checkFailure: true }) as never,
    }) as Failure;
    expect(result.code).toBe('live_evidence_unavailable');
    expect(result.message).toMatch(/check-runs/i);
  });

  it('paginates check runs and review threads', async () => {
    const result = await collectLiveGitHubEvidence({
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2433,
      prNumber: 2675,
      token: 'test',
      fetchFn: githubFetch({ multipage: true }) as never,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected success');
    expect(result.live.checks).toHaveLength(101);
    expect(result.live.reviewThreads.map((thread) => thread.id)).toEqual(['thread-1', 'thread-2']);
  });

  it('fails closed on incomplete review-thread pagination', async () => {
    const result = await collectLiveGitHubEvidence({
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2433,
      prNumber: 2675,
      token: 'test',
      fetchFn: githubFetch({ missingThreadCursor: true }) as never,
    }) as Failure;
    expect(result.code).toBe('live_evidence_unavailable');
    expect(result.message).toMatch(/endCursor/);
  });

  it('rejects unavailable live collection and mismatched hints', async () => {
    expect((await collectLiveGitHubEvidence({
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2433,
      prNumber: 2675,
      token: '',
    }) as Failure).code).toBe('live_evidence_unavailable');
    expect((assertHintsMatchLive({
      hints: { observedHeadSha: OTHER },
      live: fixture().live,
    } as never) as Failure).code).toBe('stale_head_sha');
  });
});

describe('operational CLI boundary', () => {
  it('rejects embedded input.live when Issue/PR identity is absent', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'controller-bypass-'));
    const inputPath = path.join(dir, 'input.json');
    fs.writeFileSync(inputPath, JSON.stringify({ live: fixture().live }));
    const code = await mainAsync([
      '--config',
      path.join(ROOT, 'config/agent-routing/controller.json'),
      '--input',
      inputPath,
    ], { fetchFn: (async () => { throw new Error('must not fetch'); }) as never });
    expect(code).toBe(2);
  });

  it('overwrites embedded input.live with GitHub-native collection', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'controller-collect-'));
    const inputPath = path.join(dir, 'input.json');
    const outputPath = path.join(dir, 'output.json');
    fs.writeFileSync(inputPath, JSON.stringify({ live: { sourceIssue: { number: 9999 } } }));
    const oldToken = process.env.GITHUB_TOKEN;
    process.env.GITHUB_TOKEN = 'test';
    try {
      const code = await mainAsync([
        '--config',
        path.join(ROOT, 'config/agent-routing/controller.json'),
        '--repository',
        'wdhunter645/next-starter-template',
        '--issue',
        '2433',
        '--pr',
        '2675',
        '--input',
        inputPath,
        '--output',
        outputPath,
      ], { fetchFn: githubFetch() as never });
      expect(code).toBe(0);
      const output = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      expect(output.packet.sourceIssue.number).toBe(2433);
    } finally {
      if (oldToken == null) delete process.env.GITHUB_TOKEN;
      else process.env.GITHUB_TOKEN = oldToken;
    }
  });
});

describe('observe-only configuration, workflow, and contract', () => {
  it('loads locked config and rejects mutation drift', () => {
    const config = loadControllerConfig(
      path.join(ROOT, 'config/agent-routing/controller.json'),
    ) as Record<string, any>;
    expect(config.mode).toBe('observe-only');
    expect(config.mutationAllowed).toBe(false);
    expect(() => assertObserveOnlyConfigInvariants({
      ...config,
      workflowCapabilities: { ...config.workflowCapabilities, merge: true },
    })).toThrow(/controller_capability_must_be_false:merge/);
  });

  it('keeps the workflow read-only', () => {
    const workflow = fs.readFileSync(
      path.join(ROOT, '.github/workflows/ops-agent-routing-controller.yml'),
      'utf8',
    );
    expect(workflow).toMatch(/contents:\s*read/);
    expect(workflow).toMatch(/issues:\s*read/);
    expect(workflow).toMatch(/pull-requests:\s*read/);
    expect(workflow).not.toMatch(/contents:\s*write/);
    expect(workflow).not.toMatch(/issues:\s*write/);
    expect(workflow).not.toMatch(/pull-requests:\s*write/);
  });

  it('documents stable identities and protected boundaries', () => {
    const contract = fs.readFileSync(
      path.join(ROOT, 'docs/reference/ci/agent-routing-controller-contract.md'),
      'utf8',
    );
    for (const heading of [
      '## Purpose',
      '## Scope',
      '## Current known truth',
      '## Intended final state',
    ]) expect(contract).toContain(heading);
    expect(contract).toContain('actionIdentity');
    expect(contract).toContain('github-native');
    expect(contract).toContain('mutationAllowed: false');
  });
});
