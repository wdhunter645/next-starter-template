import { describe, expect, it } from 'vitest';

import {
  evaluatePostMergeReadinessGate,
  renderGateReport,
} from '../scripts/ci/post_merge_readiness_gate.mjs';

const compliantBody = [
  '- **Issue:** #1544',
  '',
  '## CHANGE SUMMARY',
  '- Added post-merge readiness enforcement.',
  '',
  '## BUILD / TEST / VERIFICATION',
  '- Commands run:',
  '  - `npm test -- tests/gate-post-merge-readiness.test.mjs` — PASS',
  '- Result summary: PASS',
  '',
  '## FILE-TOUCH ALLOWLIST (MANDATORY)',
  'Allowed files:',
  '- scripts/ci/post_merge_readiness_gate.mjs',
  '',
  'All other files are out of scope',
  '',
  '## REVIEWER RESPONSE ACCOUNTING',
  '- review-comment:101 — accepted — fixed by the readiness gate — thread state: resolved',
  '',
  '## ACCEPTANCE CRITERIA',
  '- [x] Gate passes compliant PR bodies.',
  '',
  '## REQUIRED PRE-REVIEW SELF-CHECK',
  '- [x] PR body contains all required sections with exact headings',
].join('\n');

const compliantPr = {
  number: 1544,
  body: compliantBody,
  base: { ref: 'main' },
  head: { sha: 'abc123' },
  updated_at: '2026-06-11T12:00:00Z',
};

const compliantFiles = [{ filename: 'scripts/ci/post_merge_readiness_gate.mjs', status: 'added' }];

function evaluate(overrides = {}) {
  return evaluatePostMergeReadinessGate({
    pr: { ...compliantPr, ...(overrides.pr || {}) },
    files: overrides.files || compliantFiles,
    issueComments: overrides.issueComments || [],
    reviewComments: overrides.reviewComments || [],
    reviews: overrides.reviews || [],
    repository: 'wdhunter645/next-starter-template',
  });
}

describe('post-merge readiness gate', () => {
  it('passes a compliant PR body and matching allowlist', () => {
    const result = evaluate();

    expect(result.status).toBe('pass');
    expect(result.source_issue).toBe('1544');
    expect(result.failures).toEqual([]);
    expect(renderGateReport(result)).toContain('Post-merge readiness gate result: pass');
  });

  it('fails when a required post-merge body section is missing', () => {
    const result = evaluate({
      pr: { body: compliantBody.replace('## BUILD / TEST / VERIFICATION', '## VERIFICATION') },
    });

    expect(result.status).toBe('fail');
    expect(result.metadata_failures).toContainEqual(expect.objectContaining({
      code: 'missing_required_section',
      message: expect.stringContaining('## BUILD / TEST / VERIFICATION'),
    }));
  });

  it('fails when changed files are absent from the declared allowlist', () => {
    const result = evaluate({
      files: [
        ...compliantFiles,
        { filename: '.github/workflows/gate-post-merge-readiness.yml', status: 'added' },
      ],
    });

    expect(result.status).toBe('fail');
    expect(result.implementation_failures).toContainEqual(expect.objectContaining({
      code: 'allowlist_violation',
      message: expect.stringContaining('.github/workflows/gate-post-merge-readiness.yml'),
    }));
  });

  it('fails forbidden placeholder tokens before merge', () => {
    const result = evaluate({
      pr: { body: `${compliantBody}\n\nTBD after review.` },
    });

    expect(result.status).toBe('fail');
    expect(result.metadata_failures).toContainEqual(expect.objectContaining({
      code: 'forbidden_placeholder_token',
    }));
  });

  it('fails undispositioned trusted reviewer findings', () => {
    const result = evaluate({
      issueComments: [{
        id: 202,
        user: { login: 'gemini-code-assist' },
        body: 'P1 blocking: please fix the gate before merge.',
        created_at: '2026-06-11T11:00:00Z',
      }],
    });

    expect(result.status).toBe('fail');
    expect(result.reviewer_disposition_failures).toContainEqual(expect.objectContaining({
      code: 'undispositioned_reviewer_comment',
      commentId: '202',
    }));
  });
});
