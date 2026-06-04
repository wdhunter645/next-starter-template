import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  classifyProtectedScope,
  evaluateIntentAllowlist,
  evaluateIssueAccounting,
  evaluateReviewerAccounting,
  simulateGovernanceCase,
} from '../scripts/ci/reviewer-gate-simulation.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureRoot = path.join(__dirname, 'fixtures', 'reviewer-gate');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(fixtureRoot, relativePath), 'utf8'));
}

describe('reviewer-gate event fixtures', () => {
  it.each([
    ['events/pull_request.opened.json', 'pull_request', 'opened'],
    ['events/pull_request.synchronize.json', 'pull_request', 'synchronize'],
    ['events/pull_request.ready_for_review.json', 'pull_request', 'ready_for_review'],
    ['events/pull_request_review.submitted.json', 'pull_request_review', 'submitted'],
    ['events/labeled.json', 'pull_request', 'labeled'],
    ['events/unlabeled.json', 'pull_request', 'unlabeled'],
  ])('loads deterministic fixture %s', (fixture, eventName, action) => {
    const payload = readJson(fixture);
    expect(payload.eventName).toBe(eventName);
    expect(payload.action).toBe(action);
    expect(payload.pull_request.number).toBe(1069);
    expect(payload.pull_request.head.sha).toMatch(/^[a-f0-9]{40}$/);
  });
});

describe('reviewer-gate governance simulation', () => {
  it.each(readJson('cases.json'))('simulates $name', (testCase) => {
    const payload = typeof testCase.payload === 'string' ? readJson(testCase.payload) : testCase.payload;
    const result = simulateGovernanceCase({ ...testCase, payload });

    if ('mergeSafe' in testCase.expected) {
      expect(result.mergeSafe).toBe(testCase.expected.mergeSafe);
    }
    if (testCase.expected.issueReason) {
      expect(result.issue.reason).toBe(testCase.expected.issueReason);
    }
    if (testCase.expected.allowlistReason) {
      expect(result.allowlist.reason).toBe(testCase.expected.allowlistReason);
    }
    if (testCase.expected.reviewerReason) {
      expect(result.reviewer.reason).toBe(testCase.expected.reviewerReason);
    }
    if (testCase.expected.reviewerSeverity) {
      expect(result.reviewer.severity).toBe(testCase.expected.reviewerSeverity);
    }
    if ('hasProtectedScope' in testCase.expected) {
      expect(result.protectedScope.hasProtectedScope).toBe(testCase.expected.hasProtectedScope);
    }
    if ('docsOnly' in testCase.expected) {
      expect(result.protectedScope.docsOnly).toBe(testCase.expected.docsOnly);
    }
    if ('websiteOnly' in testCase.expected) {
      expect(result.protectedScope.websiteOnly).toBe(testCase.expected.websiteOnly);
    }
  });

  it('keeps advisory workflows from hard-failing docs-only PRs', () => {
    const result = evaluateReviewerAccounting({
      eventName: 'pull_request_target',
      labels: ['docs-only'],
      files: ['docs/explanation/reviewer-gate-simulation-harness.md'],
      advisoryFindings: 3,
      currentHeadLinkedReview: false,
    });

    expect(result.ok).toBe(true);
    expect(result.severity).toBe('advisory');
  });

  it('blocks protected scope when only stale trusted review exists', () => {
    const result = evaluateReviewerAccounting({
      eventName: 'pull_request_target',
      labels: ['infra'],
      files: ['.github/workflows/reviewer-response-completion.yml'],
      currentHeadLinkedReview: false,
      staleTrustedReviewOnly: true,
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('stale-trusted-review-for-protected-scope');
  });

  it('allows protected scope break-glass override on pull_request_target', () => {
    const result = evaluateReviewerAccounting({
      eventName: 'pull_request_target',
      labels: ['recovery'],
      files: ['scripts/ci/reviewer_lifecycle_gate.mjs'],
      currentHeadLinkedReview: false,
      breakGlassOverride: true,
    });

    expect(result.ok).toBe(true);
    expect(result.severity).toBe('break-glass');
    expect(result.reason).toBe('break-glass-override-for-protected-scope');
  });

  it('keeps protected workflow changes deterministically blocking without current review', () => {
    const result = evaluateReviewerAccounting({
      eventName: 'pull_request_target',
      labels: ['infra'],
      files: ['.github/workflows/reviewer-response-completion.yml'],
      currentHeadLinkedReview: false,
    });

    expect(result.ok).toBe(false);
    expect(result.severity).toBe('blocking');
    expect(result.reason).toBe('missing-current-head-review-for-protected-scope');
  });

  it('downgrades advisory findings for remediation-labeled governance PRs', () => {
    const result = evaluateReviewerAccounting({
      eventName: 'pull_request_target',
      labels: ['infra', 'remediation'],
      files: ['scripts/ci/reviewer-gate-simulation.mjs'],
      currentHeadLinkedReview: true,
      advisoryFindings: 2,
    });

    expect(result.ok).toBe(true);
    expect(result.advisoryDowngraded).toBe(true);
    expect(result.reason).toBe('advisory-downgraded-for-remediation');
  });

  it('classifies protected and non-protected scopes without live repository state', () => {
    expect(classifyProtectedScope(['.github/workflows/gate-drift.yml']).hasProtectedScope).toBe(true);
    expect(classifyProtectedScope(['scripts/ci/verify_pr_intent_allowlist.mjs']).hasProtectedScope).toBe(true);
    expect(classifyProtectedScope(['docs/governance/PR_GOVERNANCE.md']).docsOnly).toBe(true);
    expect(classifyProtectedScope(['src/app/page.tsx']).websiteOnly).toBe(true);
  });
});

describe('issue accounting and allowlist simulation', () => {
  it('accepts semantic issue forms without network calls', () => {
    const result = evaluateIssueAccounting({
      body: 'Related Issue: #1069',
      openIssues: [1069],
    });

    expect(result.ok).toBe(true);
    expect(result.uniqueIssues).toEqual([1069]);
  });

  it('rejects malformed, missing, multiple, and cross-repository issue mappings', () => {
    expect(evaluateIssueAccounting({ body: 'Issue: not-an-issue' }).reason).toBe('missing-issue-mapping');
    expect(evaluateIssueAccounting({ body: 'No source issue here.' }).reason).toBe('missing-issue-mapping');
    expect(evaluateIssueAccounting({ body: 'Issue: #1069\nRelated Issue: #1058' }).reason).toBe('multiple-issue-violation');
    expect(evaluateIssueAccounting({
      body: 'Issue: https://github.com/other/repo/issues/1069',
    }).reason).toBe('invalid-issue-reference');
  });

  it('validates allowlist violations deterministically from fixture file lists', () => {
    const result = evaluateIntentAllowlist(
      ['.github/workflows/gate-drift.yml'],
      ['docs-only']
    );

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('allowlist-violation');
  });
});
