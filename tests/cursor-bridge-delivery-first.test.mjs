import { describe, expect, it } from 'vitest';
import {
  validateEligibility,
  assessSemanticReadiness,
  parseResume,
  resolveDeliveryKey,
  sanitizeDeliveryKey,
} from '../scripts/cursor-bridge/lib/eligibility.mjs';
import {
  shouldDeliverCursorWake,
  isNonCursorDirectedTraffic,
  hasCursorRoutingSignal,
} from '../scripts/cursor-bridge/lib/wake-ingress.mjs';
import { buildPrompt } from '../scripts/cursor-bridge/lib/launch.mjs';
import { shouldQueueRecovery, buildRecoveryPacket } from '../scripts/cursor-bridge/lib/reconcile.mjs';
import { consumedPath } from '../scripts/cursor-bridge/lib/claim.mjs';
import path from 'node:path';

const baseIssue = {
  number: 2997,
  state: 'OPEN',
  title: 'DEFECT: delivery-first Bridge',
  body: 'Trusted notifications must reach Cursor.',
  labels: [{ name: 'agent:cursor' }, { name: 'handoff:ready' }],
  url: 'https://github.com/wdhunter645/next-starter-template/issues/2997',
  repository: { nameWithOwner: 'wdhunter645/next-starter-template' },
};

const response = {
  id: 5153153493,
  url: 'https://github.com/wdhunter645/next-starter-template/issues/2997#issuecomment-5153153493',
  body: 'CHATGPT RESPONSE\nDisposition: IMPLEMENTATION AUTHORIZED\n',
  createdAt: '2026-08-01T19:55:29Z',
};

describe('cursor bridge delivery-first eligibility (#2997)', () => {
  it('delivers a trusted notification with zero parser-recognized bullet actions', () => {
    const resume = {
      id: 1,
      url: 'https://github.com/example/1',
      body: `LOCAL CURSOR RESUME
Issue: #2997
Response: ${response.url}

Do the work described in the response without a Next local action list.
`,
      createdAt: '2026-08-01T19:55:38Z',
    };
    const r = validateEligibility(baseIssue, [response, resume], {
      expectedRepo: 'wdhunter645/next-starter-template',
    });
    expect(r.ok).toBe(true);
    expect(r.errors).toEqual([]);
    expect(r.semanticFindings.some((f) => f.startsWith('resume_action_count'))).toBe(true);
  });

  it('delivers a trusted notification with multiple parser-recognized actions', () => {
    const resume = {
      id: 2,
      url: 'https://github.com/example/2',
      body: `LOCAL CURSOR RESUME
Issue: #2997
Resume from: ${response.url}
Next local action:
- first thing
- second thing
`,
      createdAt: '2026-08-01T19:55:38Z',
    };
    const r = validateEligibility(baseIssue, [response, resume]);
    expect(r.ok).toBe(true);
    expect(r.semanticFindings).toContain('resume_action_count:2');
  });

  it('passes a missing or ambiguous response reference to Cursor as a finding', () => {
    const resume = {
      id: 3,
      url: 'https://github.com/example/3',
      body: `LOCAL CURSOR RESUME
Issue: #2997
Next local action:
- Inspect only
`,
      createdAt: '2026-08-01T19:55:38Z',
    };
    const r = validateEligibility(baseIssue, [response, resume]);
    expect(r.ok).toBe(true);
    expect(r.semanticFindings).toContain('resume_missing_response_reference');
  });

  it('accepts lowercase open state and fails closed on null issue without throwing', () => {
    const lowercase = validateEligibility({ ...baseIssue, state: 'open' }, [response]);
    expect(lowercase.ok).toBe(true);

    expect(() => validateEligibility(null, [response])).not.toThrow();
    const missing = validateEligibility(null, [response]);
    expect(missing.ok).toBe(false);
    expect(missing.errors).toContain('missing_issue');

    expect(() => assessSemanticReadiness(null, [response])).not.toThrow();
  });

  it('still blocks untrusted repository identity and closed issues before launch', () => {
    const closed = validateEligibility({ ...baseIssue, state: 'CLOSED' }, [response]);
    expect(closed.ok).toBe(false);
    expect(closed.errors).toContain('source_issue_not_open');

    const wrongRepo = validateEligibility(
      {
        ...baseIssue,
        repository: { nameWithOwner: 'evil/other' },
      },
      [response],
      { expectedRepo: 'wdhunter645/next-starter-template' },
    );
    expect(wrongRepo.ok).toBe(false);
    expect(wrongRepo.errors).toContain('repository_mismatch');

    const missingLabel = validateEligibility(
      { ...baseIssue, labels: [{ name: 'handoff:ready' }] },
      [response],
    );
    expect(missingLabel.ok).toBe(false);
    expect(missingLabel.errors).toContain('missing_label:agent:cursor');
  });

  it('builds a prompt with live Issue/comment context and disposition instructions', () => {
    const resume = {
      id: 4,
      url: 'https://github.com/example/4',
      body: `LOCAL CURSOR RESUME
Issue: #2997
Response: ${response.url}
Action: Implement the bounded bridge correction
`,
      createdAt: '2026-08-01T19:55:38Z',
    };
    const assessed = assessSemanticReadiness(baseIssue, [response, resume]);
    const prompt = buildPrompt({
      issueNumber: 2997,
      issue: baseIssue,
      comments: [response, resume],
      resumeUrl: resume.url,
      responseUrl: response.url,
      action: assessed.parsed.actions[0],
      semanticFindings: assessed.findings,
      workspace: '/tmp/ws',
    });
    expect(prompt).toContain('delivery-first');
    expect(prompt).toContain('Trusted notifications must reach Cursor.');
    expect(prompt).toContain('CHATGPT RESPONSE');
    expect(prompt).toContain('Required disposition after evaluating live Issue + comments + governance:');
    expect(prompt).toContain('- hold: post a Cursor-authored hold explaining the semantic blocker;');
    expect(prompt).toContain('Implement the bounded bridge correction');
    expect(parseResume(resume.body).responseRef).toContain('issuecomment-5153153493');
  });

  it('reconciliation follows the delivery-first mechanical contract', () => {
    expect(
      shouldQueueRecovery({
        eligibilityOk: true,
        deliveryKey: 'issue-2997',
        resumeId: null,
        consumed: false,
        hasPendingPacket: false,
        claimBlocks: false,
      }),
    ).toEqual({ queue: true, reason: 'missed_eligible_handoff' });

    expect(
      shouldQueueRecovery({
        eligibilityOk: false,
        deliveryKey: 'issue-2997',
        consumed: false,
        hasPendingPacket: false,
        claimBlocks: false,
      }).queue,
    ).toBe(false);

    const packet = buildRecoveryPacket({
      issueNumber: 2997,
      deliveryKey: 'issue-2997',
    });
    expect(packet.resumeHint).toBe('issue-2997');
    expect(packet.deliveryId).toContain('reconcile-issue-2997-');
  });

  it('does not queue reconciliation recovery for ChatGPT/Claude-only issues', () => {
    const chatgptOnly = validateEligibility(
      {
        ...baseIssue,
        labels: [{ name: 'agent:ChatGPT' }, { name: 'handoff:ready' }],
      },
      [response],
    );
    expect(chatgptOnly.ok).toBe(false);
    expect(
      shouldQueueRecovery({
        eligibilityOk: chatgptOnly.ok,
        deliveryKey: 'issue-2997',
        consumed: false,
        hasPendingPacket: false,
        claimBlocks: false,
      }).queue,
    ).toBe(false);

    const claudeOnly = validateEligibility(
      {
        ...baseIssue,
        labels: [{ name: 'agent:claude' }],
      },
      [],
    );
    expect(claudeOnly.ok).toBe(false);
    expect(
      shouldQueueRecovery({
        eligibilityOk: claudeOnly.ok,
        deliveryKey: resolveDeliveryKey({
          packet: null,
          eligibility: claudeOnly,
          issueNumber: 2997,
        }),
        consumed: false,
        hasPendingPacket: false,
        claimBlocks: false,
      }).reason,
    ).toBe('ineligible');
  });

  it('resolveDeliveryKey prefers resume id and sanitizes unsafe packet identities', () => {
    expect(
      resolveDeliveryKey({
        packet: { deliveryId: 'wake-1' },
        eligibility: { resume: { id: 99 } },
        issueNumber: 2997,
      }),
    ).toBe('99');
    expect(
      resolveDeliveryKey({
        packet: { deliveryId: 'wake-1' },
        eligibility: { resume: null },
        issueNumber: 2997,
      }),
    ).toBe('wake-1');
    expect(
      resolveDeliveryKey({
        packet: null,
        eligibility: { resume: null },
        issueNumber: 2997,
      }),
    ).toBe('issue-2997');

    const traversal = resolveDeliveryKey({
      packet: { deliveryId: '../x' },
      eligibility: { resume: null },
      issueNumber: 2997,
    });
    expect(traversal).toMatch(/^enc-[0-9a-f]+$/);
    expect(traversal.includes('..')).toBe(false);
    expect(traversal.includes('/')).toBe(false);

    const urlKey = resolveDeliveryKey({
      packet: { resumeHint: 'https://example.com/a/b' },
      eligibility: { resume: null },
      issueNumber: 2997,
    });
    expect(urlKey).toMatch(/^enc-[0-9a-f]+$/);

    const recovery = buildRecoveryPacket({
      issueNumber: 2997,
      deliveryKey: '../../etc/passwd',
    });
    expect(recovery.deliveryId.startsWith('reconcile-enc-')).toBe(true);
    expect(recovery.deliveryId.includes('..')).toBe(false);
  });

  it('sanitizeDeliveryKey and consumedPath block path traversal', () => {
    expect(sanitizeDeliveryKey('99')).toBe('99');
    expect(sanitizeDeliveryKey('../x')).toMatch(/^enc-/);
    expect(sanitizeDeliveryKey('a/b')).toMatch(/^enc-/);
    expect(sanitizeDeliveryKey('')).toBe('issue-unknown');

    const home = '/tmp/lgfc-bridge-home';
    process.env.LGFC_CURSOR_BRIDGE_HOME = home;
    try {
      const p = consumedPath({ consumedDir: 'consumed' }, '../x');
      expect(p.startsWith(path.join(home, 'consumed'))).toBe(true);
      expect(p.includes(`${path.sep}..${path.sep}`)).toBe(false);
      expect(path.basename(p)).toMatch(/^enc-[0-9a-f]+\.json$/);
    } finally {
      delete process.env.LGFC_CURSOR_BRIDGE_HOME;
    }
  });
});

describe('cursor-only wake ingress / packet boundary (#2997)', () => {
  const repo = 'wdhunter645/next-starter-template';
  const cursorLabels = ['agent:cursor', 'handoff:ready'];

  it('delivers trusted Cursor labeled and LOCAL CURSOR RESUME events', () => {
    expect(
      shouldDeliverCursorWake({
        repository: repo,
        eventName: 'issues',
        action: 'labeled',
        labelName: 'handoff:ready',
        issueLabels: cursorLabels,
      }),
    ).toEqual({ deliver: true, reason: 'handoff_ready_on_cursor_issue' });

    expect(
      shouldDeliverCursorWake({
        repository: repo,
        eventName: 'issue_comment',
        issueState: 'open',
        issueLabels: cursorLabels,
        commentBody: 'LOCAL CURSOR RESUME\nIssue: #2997\n',
      }).deliver,
    ).toBe(true);
  });

  it('rejects ChatGPT/Atlas-directed traffic at wake ingress', () => {
    expect(
      isNonCursorDirectedTraffic({
        labels: ['agent:ChatGPT', 'handoff:ready'],
        commentBody: '',
      }),
    ).toBe(true);

    expect(
      shouldDeliverCursorWake({
        repository: repo,
        eventName: 'issue_comment',
        issueState: 'open',
        issueLabels: ['agent:ChatGPT', 'handoff:ready'],
        commentBody: 'CHATGPT HANDOFF\nSubject: #1\n',
      }),
    ).toEqual({ deliver: false, reason: 'non_cursor_directed_traffic' });

    expect(
      shouldDeliverCursorWake({
        repository: repo,
        eventName: 'issues',
        action: 'labeled',
        labelName: 'handoff:ready',
        issueLabels: ['agent:ChatGPT', 'handoff:ready'],
      }).deliver,
    ).toBe(false);
  });

  it('rejects Claude/Claude Code-directed traffic at wake ingress', () => {
    expect(
      shouldDeliverCursorWake({
        repository: repo,
        eventName: 'issue_comment',
        issueState: 'open',
        issueLabels: cursorLabels,
        commentBody: 'CLAUDE CODE RESUME\nIssue: #2997\n',
      }),
    ).toEqual({ deliver: false, reason: 'non_cursor_directed_traffic' });

    expect(
      shouldDeliverCursorWake({
        repository: repo,
        eventName: 'issue_comment',
        issueState: 'open',
        issueLabels: ['agent:claude'],
        commentBody: 'CLAUDE CODE WAKE: delivered\n',
      }).deliver,
    ).toBe(false);
  });

  it('rejects other-agent and unrelated GitHub traffic', () => {
    expect(
      shouldDeliverCursorWake({
        repository: repo,
        eventName: 'issues',
        action: 'labeled',
        labelName: 'bug',
        issueLabels: ['bug'],
      }).reason,
    ).toBe('unrelated_issue_label_event');

    expect(
      shouldDeliverCursorWake({
        repository: repo,
        eventName: 'issue_comment',
        issueState: 'open',
        issueLabels: cursorLabels,
        commentBody: 'Thanks for the update',
      }).reason,
    ).toBe('not_cursor_resume_marker');

    expect(
      shouldDeliverCursorWake({
        repository: repo,
        eventName: 'pull_request',
        issueLabels: cursorLabels,
      }).reason,
    ).toBe('unrelated_github_traffic');

    expect(
      shouldDeliverCursorWake({
        repository: 'evil/other',
        eventName: 'issues',
        action: 'labeled',
        labelName: 'handoff:ready',
        issueLabels: cursorLabels,
      }).reason,
    ).toBe('untrusted_repository');

    expect(hasCursorRoutingSignal({ labels: ['agent:codex'] })).toBe(false);
    expect(hasCursorRoutingSignal({ labels: ['agent:cursor'] })).toBe(true);
  });

  it('manual dispatch requires Cursor routing before queue write', () => {
    expect(
      shouldDeliverCursorWake({
        repository: repo,
        eventName: 'workflow_dispatch',
        actor: 'wdhunter645',
        issueLabels: ['agent:cursor'],
      }).deliver,
    ).toBe(true);

    expect(
      shouldDeliverCursorWake({
        repository: repo,
        eventName: 'workflow_dispatch',
        actor: 'wdhunter645',
        issueLabels: ['agent:ChatGPT'],
      }).deliver,
    ).toBe(false);
  });
});
