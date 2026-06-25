import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import {
	appendCloseoutRerunTargets,
	mergeRerunTargets,
	normalizeCloseoutTarget,
	readRerunManifest,
} from '../scripts/ci/append_closeout_rerun_targets.mjs';
import { GitHubRateLimitError } from '../scripts/ci/github_issue_api.mjs';
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

	it('normalizes source_issue values and rejects invalid numbers', () => {
		expect(
			normalizeCloseoutTarget({
				pr: 1,
				body_file: 'scripts/ci/post-merge-closeout/pr-1-body.md',
				source_issue: '#1965',
			}),
		).toEqual({
			pr: 1,
			body_file: 'scripts/ci/post-merge-closeout/pr-1-body.md',
			source_issue: 1965,
		});

		expect(() =>
			normalizeCloseoutTarget({
				pr: 1,
				body_file: 'scripts/ci/post-merge-closeout/pr-1-body.md',
				source_issue: 'not-a-number',
			}),
		).toThrow(/numeric source_issue/);
	});

	it('treats an empty rerun manifest file as an empty target list', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'closeout-rerun-empty-'));
		const manifestPath = path.join(dir, 'targets-ci-pending-rerun.json');
		fs.writeFileSync(manifestPath, '');

		expect(readRerunManifest(manifestPath, dir)).toEqual({
			manifestPath,
			payload: { targets: [] },
			targets: [],
		});
	});

	it('merges rerun targets idempotently by PR number', () => {
		const merged = mergeRerunTargets(
			[{ pr: 10, body_file: 'scripts/ci/post-merge-closeout/pr-10-body.md', merge_sha: 'abc' }],
			[
				{ pr: 10, body_file: 'scripts/ci/post-merge-closeout/pr-10-body.md', merge_sha: 'def' },
				{ pr: 11, body_file: 'scripts/ci/post-merge-closeout/pr-11-body.md' },
			],
		);

		expect(merged).toEqual([
			{ pr: 10, body_file: 'scripts/ci/post-merge-closeout/pr-10-body.md', merge_sha: 'def' },
			{ pr: 11, body_file: 'scripts/ci/post-merge-closeout/pr-11-body.md' },
		]);
	});

	it('appends rate-limited batch targets to the rerun manifest without duplicating PRs', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'closeout-rerun-'));
		const manifestPath = path.join(dir, 'targets-ci-pending-rerun.json');
		fs.writeFileSync(
			manifestPath,
			`${JSON.stringify(
				{
					triggered_at: '2026-06-01T00:00:00Z',
					targets: [{ pr: 10, body_file: 'scripts/ci/post-merge-closeout/pr-10-body.md' }],
				},
				null,
				2,
			)}\n`,
		);

		const first = appendCloseoutRerunTargets({
			manifestPath,
			targets: [
				{ pr: 10, body_file: 'scripts/ci/post-merge-closeout/pr-10-body.md', merge_sha: 'new-sha' },
				{ pr: 11, body_file: 'scripts/ci/post-merge-closeout/pr-11-body.md' },
			],
			triggeredAt: '2026-06-25T00:00:00Z',
		});
		const second = appendCloseoutRerunTargets({
			manifestPath,
			targets: [{ pr: 11, body_file: 'scripts/ci/post-merge-closeout/pr-11-body.md' }],
			triggeredAt: '2026-06-25T00:01:00Z',
		});

		expect(first.added).toEqual(['11']);
		expect(first.targets.map((target) => target.pr)).toEqual([10, 11]);
		expect(second.added).toEqual([]);
		expect(second.targets).toHaveLength(2);
	});

	it('queues remaining batch targets when closeout hits a GitHub rate limit', async () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'closeout-batch-rate-limit-'));
		const manifestPath = path.join(dir, 'targets-ci-pending-rerun.json');
		const bodyOne = path.join(dir, 'one.md');
		const bodyTwo = path.join(dir, 'two.md');
		const bodyThree = path.join(dir, 'three.md');
		for (const bodyPath of [bodyOne, bodyTwo, bodyThree]) {
			fs.writeFileSync(
				bodyPath,
				'- **Issue:** #1\n\n## CHANGE SUMMARY\nx\n\n## BUILD / TEST / VERIFICATION\nx\n\n## ACCEPTANCE CRITERIA\nx\n',
			);
		}

		const runPostMergeCloseout = vi
			.fn()
			.mockResolvedValueOnce({
				status: 'pass',
				sync_action: 'post_merge_success',
				source_issue: '1',
				remediation_required: false,
			})
			.mockRejectedValueOnce(new GitHubRateLimitError('GET', '/pulls/2', 403, 'rate limit'));

		const outcome = await runBatchPostMergeCloseout({
			token: 'token',
			repository: 'owner/repo',
			targets: [
				{ pr: 1, body_file: bodyOne },
				{ pr: 2, body_file: bodyTwo },
				{ pr: 3, body_file: bodyThree },
			],
			closeDuplicateRemediationIssuesFn: vi.fn().mockResolvedValue({ closed: [] }),
			runPostMergeCloseoutFn: runPostMergeCloseout,
			appendCloseoutRerunTargetsFn: (options) =>
				appendCloseoutRerunTargets({ ...options, manifestPath }),
		});

		expect(runPostMergeCloseout).toHaveBeenCalledTimes(2);
		expect(outcome.rerunAppend?.targets.map((target) => target.pr)).toEqual([2, 3]);
		expect(outcome.results).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ pr: '2', status: 'error', phase: 'rate_limit' }),
				expect.objectContaining({ pr: '3', status: 'queued', phase: 'rate_limit_rerun' }),
			]),
		);
	});

	it('prunes passing targets from the manifest after a partial_failure batch', async () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'closeout-batch-partial-prune-'));
		const manifestPath = path.join(dir, 'targets.json');
		const bodyPass = path.join(dir, 'pass.md');
		const bodyFail = path.join(dir, 'fail.md');
		for (const bodyPath of [bodyPass, bodyFail]) {
			fs.writeFileSync(
				bodyPath,
				'- **Issue:** #1\n\n## CHANGE SUMMARY\nx\n\n## BUILD / TEST / VERIFICATION\nx\n\n## ACCEPTANCE CRITERIA\nx\n',
			);
		}
		fs.writeFileSync(
			manifestPath,
			`${JSON.stringify(
				{
					targets: [
						{ pr: 1, body_file: bodyPass },
						{ pr: 2, body_file: bodyFail },
					],
				},
				null,
				2,
			)}\n`,
		);

		const runPostMergeCloseout = vi
			.fn()
			.mockResolvedValueOnce({
				status: 'pass',
				sync_action: 'post_merge_success',
				source_issue: '1',
				remediation_required: false,
			})
			.mockResolvedValueOnce({
				status: 'fail',
				sync_action: 'post_merge_failure',
				source_issue: '2',
				remediation_required: true,
			});

		const outcome = await runBatchPostMergeCloseout({
			token: 'token',
			repository: 'owner/repo',
			manifestPath,
			targets: [
				{ pr: 1, body_file: bodyPass },
				{ pr: 2, body_file: bodyFail },
			],
			runPostMergeCloseoutFn: runPostMergeCloseout,
			closeDuplicateRemediationIssuesFn: vi.fn().mockResolvedValue({ closed: [] }),
		});

		expect(outcome.status).toBe('partial_failure');
		expect(outcome.manifestPrune).toMatchObject({ pruned: 1, remaining: 1 });
		expect(JSON.parse(fs.readFileSync(manifestPath, 'utf8')).targets).toEqual([
			{ pr: 2, body_file: bodyFail },
		]);
	});
});
