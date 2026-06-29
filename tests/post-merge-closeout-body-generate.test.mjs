import { describe, expect, it } from 'vitest';

import {
	buildReviewerDispositionLines,
	failureRemediationNote,
	generateCloseoutBody,
	resolveAllowlist,
	sanitizeMergedPrBody,
	validateGeneratedBody,
} from '../scripts/ci/post_merge_closeout_body_generate.mjs';
import { isPermittedClosedSourceIssueFollowup } from '../scripts/ci/post_merge_validator.mjs';

describe('post_merge_closeout_body_generate', () => {
	it('sanitizes auto-repair and blocked status from merged PR bodies', () => {
		const body = `Status: BLOCKED
<!-- pr-body-auto-repair:start -->
placeholder
<!-- pr-body-auto-repair:end -->
## CHANGE SUMMARY
- real change
<!-- CURSOR_AGENT_PR_BODY_END -->
<div><a href="https://cursor.com/agents/example">Open in Web</a></div>`;
		const sanitized = sanitizeMergedPrBody(body);
		expect(sanitized).not.toContain('pr-body-auto-repair');
		expect(sanitized).toContain('Status: MERGED');
		expect(sanitized).toContain('real change');
		expect(sanitized).not.toContain('cursor.com');
	});

	it('builds reviewer disposition lines for trusted inline threads', () => {
		const lines = buildReviewerDispositionLines({
			prNumber: 1201,
			reviewComments: [
				{
					id: 100,
					body: 'blocking',
					user: { login: 'Copilot' },
					created_at: '2026-01-01T00:00:00Z',
					line: 12,
					position: 1,
				},
			],
			reviews: [
				{
					id: 200,
					state: 'COMMENTED',
					body: 'request changes',
					user: { login: 'chatgpt-codex-connector[bot]' },
					submitted_at: '2026-01-01T00:00:00Z',
				},
			],
		});
		expect(lines).toEqual([
			'- review-comment:100 — accepted — post-merge closeout remediation for prior PR #1201 — thread state: outdated',
			'- review-comment:200 — accepted — post-merge closeout remediation for prior PR #1201 — thread state: outdated',
		]);
	});

	it('builds reviewer disposition lines for late post-merge trusted findings', () => {
		const lines = buildReviewerDispositionLines({
			prNumber: 1188,
			mergedAt: '2026-06-02T17:00:00Z',
			issueComments: [
				{
					id: 9001,
					created_at: '2026-06-02T17:25:00Z',
					body: 'P1 blocking: must fix this regression.',
					user: { login: 'gemini-code-assist[bot]' },
				},
			],
		});
		expect(lines).toEqual([
			'- review-comment:9001 — accepted — post-merge closeout remediation for prior PR #1188 — thread state: resolved',
		]);
	});

	it('validates generated bodies against late reviewer findings using mergedAt', async () => {
		const mergedAt = '2026-06-02T17:00:00Z';
		const lateReview = {
			id: 4443329728,
			submitted_at: '2026-06-02T17:25:00Z',
			state: 'COMMENTED',
			body: 'P1 blocking: must fix this regression.',
			user: { login: 'copilot-pull-request-reviewer[bot]' },
		};
		const bodyWithoutDisposition = generateCloseoutBody({
			prNumber: 1188,
			mergeSha: 'abc123',
			sourceIssueNumber: 1180,
			mergedAt,
		});
		const failResult = await validateGeneratedBody({
			body: bodyWithoutDisposition,
			mergeSha: 'abc123',
			mergedAt,
			reviews: [lateReview],
			sourceIssue: { number: 1180, state: 'open', labels: [] },
			repoLabels: [{ name: 'status:complete' }],
		});
		expect(failResult.status).toBe('fail');
		expect(failResult.failures).toContainEqual(expect.objectContaining({ code: 'late_reviewer_finding' }));

		const bodyWithDisposition = generateCloseoutBody({
			prNumber: 1188,
			mergeSha: 'abc123',
			sourceIssueNumber: 1180,
			mergedAt,
			reviews: [lateReview],
		});
		const passResult = await validateGeneratedBody({
			body: bodyWithDisposition,
			mergeSha: 'abc123',
			mergedAt,
			reviews: [lateReview],
			sourceIssue: { number: 1180, state: 'open', labels: [] },
			repoLabels: [{ name: 'status:complete' }],
		});
		expect(passResult.failures.filter((failure) => failure.code === 'late_reviewer_finding')).toEqual([]);
	});

	it('generates a closeout body with required sections and PASS verification', () => {
		const body = generateCloseoutBody({
			prNumber: 1201,
			mergeSha: 'abc123',
			sourceIssueNumber: 1196,
			failureCode: 'source_issue_not_open',
			mergedBody: '## CHANGE SUMMARY\n- shipped feature',
			changedFiles: [{ filename: 'src/app/page.tsx' }],
			reviewComments: [],
			reviews: [],
			sourceIssueState: 'closed',
		});

		expect(body).toContain('<!-- CURSOR_AGENT_PR_BODY_BEGIN -->');
		expect(body).toContain('- **Issue:** #1196');
		expect(body).toContain('## BUILD / TEST / VERIFICATION');
		expect(body).toContain('Result summary: PASS');
		expect(body).toContain('## ACCEPTANCE CRITERIA');
		expect(body).toContain('closed-source follow-up closeout evidence is recorded');
		expect(body).not.toContain('source issue exists, is open');
		expect(resolveAllowlist({ mergedBody: body, changedFiles: [{ filename: 'src/app/page.tsx' }] })).toContain(
			'src/app/page.tsx',
		);
		expect(
			isPermittedClosedSourceIssueFollowup({
				body,
				sourceIssue: { state: 'closed', state_reason: 'completed' },
			}),
		).toBe(true);
	});

	it('maps failure codes to remediation notes', () => {
		expect(failureRemediationNote('closeout_blocker_declared')).toMatch(/BLOCKED/);
		expect(failureRemediationNote('late_reviewer_finding')).toMatch(/late post-merge/);
		expect(failureRemediationNote('undispositioned_reviewer_comment')).toMatch(/review-comment/);
	});

	it('fails validation when generated body still contains blocked status', async () => {
		const body = generateCloseoutBody({
			prNumber: 1201,
			mergeSha: 'abc123',
			sourceIssueNumber: 1196,
			mergedBody: 'Status: BLOCKED',
			changedFiles: [],
			reviewComments: [],
			reviews: [],
			sourceIssueState: 'open',
		}).replace('Result summary: PASS', 'Result summary: FAIL');
		const result = await validateGeneratedBody({
			body,
			mergeSha: 'abc123',
			mergedAt: '2026-01-01T00:00:00Z',
			reviewComments: [],
			reviews: [],
			sourceIssue: { number: 1196, state: 'open', labels: [] },
			repoLabels: [{ name: 'status:complete' }],
		});
		expect(result.status).toBe('fail');
		expect(result.failures.length).toBeGreaterThan(0);
	});
});
