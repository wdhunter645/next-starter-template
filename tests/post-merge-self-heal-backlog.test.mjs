import { describe, expect, it } from 'vitest';

import {
	BACKLOG_DISPOSITIONS,
	buildBacklogReport,
	dispositionComment,
	executeBacklogReport,
	isPostMergeExceptionIssue,
	parsePostMergeExceptionIssue,
	POST_MERGE_EXCEPTION_SIGNATURE,
} from '../scripts/ci/post_merge_self_heal_backlog.mjs';

function exceptionIssue(overrides = {}) {
	return {
		number: 1900,
		state: 'open',
		title: 'Post-merge closeout exception for PR #1888 / source #1851 / closeout_exception',
		body: [
			POST_MERGE_EXCEPTION_SIGNATURE,
			'',
			'- PR: #1888',
			'- Source issue: #1851',
			'- Validator status: pass',
			'- Remediation required: no',
		].join('\n'),
		labels: [{ name: 'post-merge-failure' }],
		created_at: '2026-06-20T00:00:00Z',
		...overrides,
	};
}

describe('post-merge self-healing backlog matching', () => {
	it('matches post-merge exception issues by title, body signature, or label', () => {
		expect(isPostMergeExceptionIssue(exceptionIssue({ labels: [] }))).toBe(true);
		expect(isPostMergeExceptionIssue(exceptionIssue({ title: 'Other title' }))).toBe(true);
		expect(isPostMergeExceptionIssue(exceptionIssue({
			title: 'Other title',
			body: 'Other body',
			labels: [{ name: 'post-merge-failure' }],
		}))).toBe(true);
		expect(isPostMergeExceptionIssue({ title: 'Unrelated issue', body: '', labels: [] })).toBe(false);
	});

	it('parses PR, source, failure, and canonical evidence from issue bodies', () => {
		const parsed = parsePostMergeExceptionIssue(exceptionIssue({
			body: [
				POST_MERGE_EXCEPTION_SIGNATURE,
				'- PR: #1888',
				'- Source issue: #1851',
				'## Detected failure condition',
				'- closeout_blocker_declared: blocked scaffold',
				'Canonical remediation issue: #1902',
			].join('\n'),
		}));

		expect(parsed).toMatchObject({
			pr_number: 1888,
			source_issue: 1851,
			failure_code: 'closeout_blocker_declared',
			canonical_issue: 1902,
		});
	});
});

describe('post-merge self-healing backlog classification', () => {
	it('reports required burn-down counts for safe stale and duplicate issues', () => {
		const issues = [
			exceptionIssue({ number: 1900, created_at: '2026-06-20T00:00:00Z' }),
			exceptionIssue({ number: 1901, created_at: '2026-06-21T00:00:00Z' }),
			exceptionIssue({
				number: 1902,
				source_issue: 1852,
				body: [
					POST_MERGE_EXCEPTION_SIGNATURE,
					'- PR: #1889',
					'- Source issue: #1852',
					'## Detected failure condition',
					'- missing_reviewer_disposition: reviewer evidence is ambiguous',
				].join('\n'),
			}),
		];

		const report = buildBacklogReport({
			issues,
			sourceIssuesByNumber: {
				1851: { number: 1851, state: 'closed', state_reason: 'completed', labels: [{ name: 'status:complete' }] },
				1852: { number: 1852, state: 'open', labels: [{ name: 'status:active' }] },
			},
			dryRun: true,
		});

		expect(report.summary).toMatchObject({
			total_scanned: 3,
			auto_close_planned: 2,
			duplicate_closures_planned: 1,
			preserved_active_source_issues: 1,
			before_open_post_merge_issue_count: 3,
			after_open_post_merge_issue_count: 3,
		});
		expect(report.classifications.find((entry) => entry.issue_number === 1900).disposition)
			.toBe(BACKLOG_DISPOSITIONS.DUPLICATE_OF_CANONICAL_REMEDIATION);
	});

	it('preserves ambiguous reviewer/source/verification evidence', () => {
		const report = buildBacklogReport({
			issues: [
				exceptionIssue({
					number: 1903,
					body: [
						POST_MERGE_EXCEPTION_SIGNATURE,
						'- PR: #1890',
						'- Source issue candidates: #1850, #1851',
						'## Reviewer findings',
						'- trusted reviewer finding lacks disposition',
					].join('\n'),
				}),
			],
			sourceIssuesByNumber: {},
			dryRun: true,
		});

		expect(report.classifications[0].disposition)
			.toBe(BACKLOG_DISPOSITIONS.PRESERVE_AMBIGUOUS_EVIDENCE);
		expect(report.summary.preserved_ambiguous_issues).toBe(1);
	});
});

describe('post-merge self-healing backlog execution', () => {
	it('closes only deterministic stale/duplicate issues and comments on preserved issues', async () => {
		const report = buildBacklogReport({
			issues: [
				exceptionIssue({ number: 1900, created_at: '2026-06-20T00:00:00Z' }),
				exceptionIssue({ number: 1901, created_at: '2026-06-21T00:00:00Z' }),
				exceptionIssue({
					number: 1902,
					body: [
						POST_MERGE_EXCEPTION_SIGNATURE,
						'- PR: #1889',
						'- Source issue: #1852',
						'## Detected failure condition',
						'- missing_reviewer_disposition: reviewer evidence is ambiguous',
					].join('\n'),
				}),
			],
			sourceIssuesByNumber: {
				1851: { number: 1851, state: 'closed', state_reason: 'completed', labels: [{ name: 'status:complete' }] },
				1852: { number: 1852, state: 'closed', state_reason: 'completed', labels: [{ name: 'status:complete' }] },
			},
			dryRun: false,
		});
		const calls = [];
		const outcome = await executeBacklogReport(report, {
			dryRun: false,
			token: 'token',
			repository: 'owner/repo',
			requestFn: async (args) => {
				calls.push(args);
				return {};
			},
		});

		const patches = calls.filter((call) => call.method === 'PATCH');
		const comments = calls.filter((call) => call.path.endsWith('/comments'));

		expect(outcome.summary.closed).toBe(2);
		expect(outcome.summary.commented).toBe(1);
		expect(patches.map((call) => call.path)).toEqual(['/issues/1900', '/issues/1901']);
		expect(comments).toHaveLength(3);
		expect(dispositionComment(report.classifications[2])).toContain('preserving this issue');
	});
});
