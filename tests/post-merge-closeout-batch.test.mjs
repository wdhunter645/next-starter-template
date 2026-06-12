import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import {
	closeRemediationIssuesForPr,
	remediationCloseComment,
	remediationIssuesForPr,
	searchOpenRemediationIssues,
} from '../scripts/ci/close_remediation_issues_for_pr.mjs';
import {
	loadCloseoutTargets,
	runBatchPostMergeCloseout,
} from '../scripts/ci/run_batch_post_merge_closeout.mjs';
import {
	selectWorkflowRunsForValidation,
	WORKFLOW_RUN_SCOPE_MERGE_ONLY,
	WORKFLOW_RUN_SCOPE_MERGE_AND_HEAD,
} from '../scripts/ci/post_merge_validator.mjs';

describe('post-merge closeout batch', () => {
	it('loads legacy completed closeout targets for merged PRs 1239 and 1243', () => {
		const { targets } = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets.json');
		expect(targets.map((target) => target.pr)).toEqual([1239, 1243]);
		expect(targets[0].body_file).toContain('pr-1239-body.md');
		expect(targets[1].body_file).toContain('pr-1243-body.md');
	});

	it('rejects null targets in the manifest without throwing parse errors', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'closeout-manifest-'));
		const manifestPath = path.join(dir, 'targets.json');
		fs.writeFileSync(manifestPath, JSON.stringify({ targets: null }));

		expect(() => loadCloseoutTargets(manifestPath)).toThrow(/targets array/);
	});

	it('allows an empty targets array for cleared backlog manifests', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'closeout-manifest-'));
		const manifestPath = path.join(dir, 'targets.json');
		fs.writeFileSync(manifestPath, JSON.stringify({ targets: [] }));

		const { targets } = loadCloseoutTargets(manifestPath);
		expect(targets).toEqual([]);
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

	it('searches remediation issues by title without paginating all open issues', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				items: [
					{
						number: 1601,
						title: 'Post-merge closeout exception for PR #1583 / source #1578 / late_undispositioned_reviewer_comment',
						body: '- PR: #1583',
						labels: [{ name: 'status:complete' }],
					},
				],
			}),
		});

		const issues = await searchOpenRemediationIssues({
			token: 'token',
			repository: 'owner/repo',
			fetchFn: fetchMock,
		});

		expect(issues.map((issue) => issue.number)).toEqual([1601]);
		expect(fetchMock).toHaveBeenCalled();
	});

	it('closes relabeled remediation exceptions that lost post-merge-failure label (#1601)', async () => {
		const request = vi.fn().mockResolvedValue(null);
		const issues = [
			{
				number: 1601,
				title: 'Post-merge closeout exception for PR #1583 / source #1578 / late_undispositioned_reviewer_comment',
				body: '- PR: #1583\n- Merge SHA: a1ca83d4e77efb6b0b73266c02d5dd7219bfbb1d\n- Source issue: #1578',
				labels: [{ name: 'status:complete' }, { name: 'status:post-merge-verify' }],
			},
		];

		const outcome = await closeRemediationIssuesForPr({
			token: 'token',
			repository: 'owner/repo',
			prNumber: '1583',
			mergeSha: 'a1ca83d4e77efb6b0b73266c02d5dd7219bfbb1d',
			sourceIssue: '1578',
			listOpenIssues: async () => issues,
			requestFn: request,
		});

		expect(outcome.closed).toEqual([{ number: 1601 }]);
		expect(request).toHaveBeenCalledTimes(2);
	});

	it('closes a linked remediation source issue when it is not already matched by PR number', async () => {
		const request = vi.fn().mockResolvedValue(null);
		const issues = [
			{
				number: 1576,
				title: 'Post-merge closeout exception for PR #1572 / source #1558 / workflow_failure',
				body: '- PR: #1572\n- Merge SHA: abc\n- Source issue: #1558',
				labels: [{ name: 'post-merge-failure' }],
			},
			{
				number: 1590,
				title: 'Post-merge closeout exception for PR #1586 / source #1576 / source_issue_closeout_skipped',
				body: '- PR: #1586\n- Merge SHA: def\n- Source issue: #1576',
				labels: [{ name: 'post-merge-failure' }],
			},
		];

		const outcome = await closeRemediationIssuesForPr({
			token: 'token',
			repository: 'owner/repo',
			prNumber: '1586',
			sourceIssue: '1576',
			listOpenIssues: async () => issues,
			requestFn: request,
		});

		expect(outcome.closed.map((entry) => entry.number).sort((a, b) => a - b)).toEqual([1576, 1590]);
		expect(request).toHaveBeenCalledTimes(4);
	});

	it('continues closing other remediation issues when one closure fails', async () => {
		const request = vi
			.fn()
			.mockRejectedValueOnce(new Error('rate limited'))
			.mockResolvedValue(null);

		const issues = [
			{
				number: 1246,
				title: 'Post-merge remediation required for PR #1239',
				body: '- PR: #1239\n- Merge SHA: abc\n- Source issue: #1196',
			},
			{
				number: 1300,
				title: 'Post-merge remediation required for PR #1239',
				body: '- PR: #1239\n- Merge SHA: abc\n- Source issue: #1196',
			},
		];

		const outcome = await closeRemediationIssuesForPr({
			token: 'token',
			repository: 'owner/repo',
			prNumber: '1239',
			listOpenIssues: async () => issues,
			requestFn: request,
		});

		expect(outcome.closed).toHaveLength(1);
		expect(outcome.failed).toEqual([{ number: 1246, message: 'rate limited' }]);
		expect(request).toHaveBeenCalledTimes(3);
	});

	it('continues batch closeout when one PR fails', async () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'closeout-batch-'));
		const bodyOne = path.join(dir, 'one.md');
		const bodyTwo = path.join(dir, 'two.md');
		fs.writeFileSync(bodyOne, '- **Issue:** #1\n\n## CHANGE SUMMARY\nx\n\n## BUILD / TEST / VERIFICATION\nx\n\n## ACCEPTANCE CRITERIA\nx\n');
		fs.writeFileSync(bodyTwo, '- **Issue:** #2\n\n## CHANGE SUMMARY\nx\n\n## BUILD / TEST / VERIFICATION\nx\n\n## ACCEPTANCE CRITERIA\nx\n');

		const runPostMergeCloseout = vi
			.fn()
			.mockRejectedValueOnce(new Error('PR #1 closeout failed'))
			.mockResolvedValueOnce({
				status: 'pass',
				sync_action: 'post_merge_success',
				source_issue: '2',
				remediation_required: false,
			});

		const outcome = await runBatchPostMergeCloseout({
			token: 'token',
			repository: 'owner/repo',
			targets: [
				{ pr: 1, body_file: bodyOne },
				{ pr: 2, body_file: bodyTwo },
			],
			runPostMergeCloseoutFn: runPostMergeCloseout,
			closeDuplicateRemediationIssuesFn: vi.fn().mockResolvedValue({ closed: [] }),
		});

		expect(outcome.results[0]).toMatchObject({
			pr: '1',
			status: 'error',
			phase: 'closeout',
			failure_reason: 'PR #1 closeout failed',
		});
		expect(outcome.results[1]).toMatchObject({
			pr: '2',
			status: 'pass',
			sync_action: 'post_merge_success',
			source_issue: '2',
			remediation_required: false,
		});
	});
});
