import { describe, expect, it } from 'vitest';

import {
	remediationCloseComment,
	remediationIssuesForPr,
} from '../scripts/ci/close_remediation_issues_for_pr.mjs';
import { loadCloseoutTargets } from '../scripts/ci/run_batch_post_merge_closeout.mjs';
import {
	selectWorkflowRunsForValidation,
	WORKFLOW_RUN_SCOPE_MERGE_ONLY,
	WORKFLOW_RUN_SCOPE_MERGE_AND_HEAD,
} from '../scripts/ci/post_merge_validator.mjs';

describe('post-merge closeout batch', () => {
	it('loads closeout targets for merged PRs 1239 and 1243', () => {
		const { targets } = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets.json');
		expect(targets.map((target) => target.pr)).toEqual([1239, 1243]);
		expect(targets[0].body_file).toContain('pr-1239-body.md');
		expect(targets[1].body_file).toContain('pr-1243-body.md');
	});

	it('uses merge-commit workflow runs only during closeout validation', () => {
		const mergeRun = {
			workflowName: 'GATE — Quality Checks',
			conclusion: 'success',
			created_at: '2026-06-03T16:30:33Z',
			databaseId: 1,
		};
		const headRun = {
			workflowName: 'GATE — Reviewer Response Completion',
			conclusion: 'failure',
			created_at: '2026-06-03T15:36:13Z',
			databaseId: 2,
		};

		const mergeOnly = selectWorkflowRunsForValidation({
			mergeRuns: [mergeRun],
			headRuns: [headRun],
			scope: WORKFLOW_RUN_SCOPE_MERGE_ONLY,
		});
		const combined = selectWorkflowRunsForValidation({
			mergeRuns: [mergeRun],
			headRuns: [headRun],
			scope: WORKFLOW_RUN_SCOPE_MERGE_AND_HEAD,
		});

		expect(mergeOnly).toHaveLength(1);
		expect(mergeOnly[0].workflowName).toBe('GATE — Quality Checks');
		expect(combined).toHaveLength(2);
	});

	it('selects remediation issues for a merged PR number', () => {
		const issues = remediationIssuesForPr(
			[
				{
					number: 1246,
					title: 'Post-merge remediation required for PR #1239',
					body: '- PR: #1239\n- Merge SHA: abc\n- Source issue: #1196',
				},
				{
					number: 1245,
					title: 'Post-merge remediation required for PR #1243',
					body: '- PR: #1243\n- Merge SHA: def\n- Source issue: #1116',
				},
			],
			'1239',
		);

		expect(issues.map((issue) => issue.number)).toEqual([1246]);
		expect(remediationCloseComment({ prNumber: '1239', mergeSha: 'abc', sourceIssue: '1196' })).toContain(
			'Source issue: #1196',
		);
	});
});
