import { describe, expect, it } from 'vitest';
import {
  validateEligibility,
  assessSemanticReadiness,
  parseResume,
  resolveDeliveryKey,
} from '../scripts/cursor-bridge/lib/eligibility.mjs';
import { buildPrompt } from '../scripts/cursor-bridge/lib/launch.mjs';
import { shouldQueueRecovery, buildRecoveryPacket } from '../scripts/cursor-bridge/lib/reconcile.mjs';

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

  it('resolveDeliveryKey prefers resume id and falls back without inventing duplicates', () => {
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
  });
});
