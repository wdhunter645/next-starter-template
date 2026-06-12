import { describe, expect, it, vi } from 'vitest';

import { linkedIssueNumber, sourceIssueAccounting } from '../scripts/ci/issue_accounting.mjs';
import {
	buildFailureCloseoutComment,
	buildSourceIssueCloseoutComment,
	isRemediationIssue,
	planActiveSourceIssueRelabel,
	planFailureSourceIssueRelabel,
	planTerminalLabelReconciliation,
	postMergeVerificationResult,
	shouldCloseSourceIssue,
	shouldKeepActiveSourceIssueOpen,
	STALE_SOURCE_ISSUE_LABELS,
} from '../scripts/ci/post_merge_source_issue_closeout.mjs';
import { buildResult } from '../scripts/ci/post_merge_validator.mjs';
import {
	duplicateCloseComment,
	groupRemediationIssues,
	planDuplicateClosures,
	parseRemediationIssue,
} from '../scripts/ci/close_duplicate_remediation_issues.mjs';

const baseBody = [
	'- **Issue:** #1196',
	'',
	'## CHANGE SUMMARY',
	'- change',
	'',
	'## BUILD / TEST / VERIFICATION',
	'- PASS',
	'',
	'## ACCEPTANCE CRITERIA',
	'- pass',
	'',
	'## REQUIRED PRE-REVIEW SELF-CHECK',
	'- done',
].join('\n');

function remediationIssue({ number, createdAt, pr = '1239', mergeSha = 'abc123', sourceIssue = '1196' }) {
	return {
		number,
		html_url: `https://github.test/repo/issues/${number}`,
		created_at: createdAt,
		title: `Post-merge remediation required for PR #${pr}`,
		body: [
			'Post-merge validation detected follow-up work.',
			'',
			`- PR: #${pr}`,
			`- Merge SHA: ${mergeSha}`,
			`- Source issue: #${sourceIssue}`,
			'- Validator status: fail',
			'- Remediation required: yes',
		].join('\n'),
	};
}

describe('issue accounting formats', () => {
	it('parses canonical and orchestrator source issue markers', () => {
		expect(linkedIssueNumber('- **Issue:** #1196')).toBe('1196');
		expect(linkedIssueNumber('Issue: https://github.com/org/repo/issues/1196')).toBe('1196');
		expect(linkedIssueNumber('<!-- orchestrator-source-issue: 1196 -->')).toBe('1196');
	});

	it('rejects ambiguous and external post-merge source issue accounting', () => {
		expect(sourceIssueAccounting('- **Issue:** #1196\n- Issue: #1197').failures).toContainEqual(
			expect.objectContaining({ code: 'multiple_source_issues' }),
		);
		expect(
			sourceIssueAccounting('- **Issue:** https://github.com/other/repo/issues/1196', {
				repository: 'owner/repo',
			}).failures,
		).toContainEqual(expect.objectContaining({ code: 'invalid_source_issue_reference' }));
	});
});

describe('source issue closeout decision', () => {
	it('closes only after successful post-merge validation without remediation', () => {
		const result = buildResult({ pr: { body: baseBody }, resolution: { pr: '1239' }, mergeSha: 'deadbeef' });

		expect(result).toMatchObject({ status: 'pass', sync_action: 'post_merge_success', remediation_required: false });
		expect(
			shouldCloseSourceIssue({
				action: 'post_merge_success',
				issueNumber: '1196',
				isMerged: true,
				postMergeResult: result,
				issueMeta: { title: 'CI task', labels: ['orchestrator', 'status:post-merge-verify'] },
			}),
		).toEqual({ close: true, reason: 'post_merge_validation_success' });
	});

	it('does not close on failed validation', () => {
		const result = buildResult({
			pr: { body: baseBody },
			resolution: { pr: '1239' },
			metadata: [{ code: 'missing_required_section', message: 'missing' }],
		});

		expect(result.sync_action).toBe('post_merge_failure');
		expect(
			shouldCloseSourceIssue({
				action: 'post_merge_failure',
				issueNumber: '1196',
				isMerged: true,
				postMergeResult: result,
			}),
		).toMatchObject({ close: false });
	});

	it('does not close when undispositioned reviewer findings remain', () => {
		expect(
			shouldCloseSourceIssue({
				action: 'post_merge_success',
				issueNumber: '1196',
				isMerged: true,
				postMergeResult: {
					status: 'pass',
					remediation_required: false,
					reviewer_disposition_failures: [{
						code: 'undispositioned_reviewer_comment',
						message: 'Trusted reviewer comment 9001 lacks required PR-body disposition.',
					}],
				},
			}),
		).toMatchObject({ close: false, reason: 'undispositioned_reviewer_findings' });
	});

	it('does not close when remediation remains required', () => {
		const result = buildResult({
			pr: { body: baseBody },
			resolution: { pr: '1239' },
			failures: [
				{
					workflow: 'GATE — Reviewer Response Completion',
					classification: 'optional-remediation-failure',
					required: true,
					conclusion: 'failure',
				},
			],
		});

		expect(result).toMatchObject({ status: 'fail', sync_action: 'post_merge_failure', remediation_required: true });
		expect(
			shouldCloseSourceIssue({
				action: 'post_merge_failure',
				issueNumber: '1196',
				isMerged: true,
				postMergeResult: result,
			}),
		).toMatchObject({ close: false, reason: 'action_post_merge_failure' });
	});

	it('does not close when the linked issue cannot be identified', () => {
		expect(
			shouldCloseSourceIssue({
				action: 'post_merge_success',
				issueNumber: '',
				isMerged: true,
				postMergeResult: { status: 'pass', remediation_required: false },
			}),
		).toMatchObject({ close: false, reason: 'missing_source_issue' });
	});

	it('keeps active child project issues open when disposition requires status:active', () => {
		const body = [
			baseBody,
			'',
			'## POST-MERGE ISSUE DISPOSITION',
			'- Source issue **#1258** remains **open** with `status:active`; remove only `status:post-merge-verify`; **do not close** #1258',
		].join('\n');

		expect(shouldKeepActiveSourceIssueOpen(body)).toBe(true);
		expect(
			shouldCloseSourceIssue({
				action: 'post_merge_success',
				issueNumber: '1258',
				isMerged: true,
				postMergeResult: { status: 'pass', remediation_required: false },
				issueMeta: {
					title: 'PROJECT: Website Operations Admin',
					labels: ['type:website', 'status:active', 'status:post-merge-verify', 'website'],
				},
				prBody: body,
			}),
		).toEqual({ close: false, reason: 'active_source_issue_remains_open' });
		expect(
			planActiveSourceIssueRelabel({
				issueLabels: ['type:website', 'status:active', 'status:post-merge-verify', 'website'],
			}),
		).toMatchObject({
			ok: true,
			removeLabels: ['status:post-merge-verify'],
			summary: expect.stringContaining('preserve status:active'),
		});
	});

	it('does not close remediation issues mis-linked as source issues', () => {
		expect(
			shouldCloseSourceIssue({
				action: 'post_merge_success',
				issueNumber: '1300',
				isMerged: true,
				postMergeResult: { status: 'pass', remediation_required: false },
				issueMeta: {
					title: 'Post-merge remediation required for PR #1239',
					labels: ['post-merge-failure'],
				},
			}),
		).toMatchObject({ close: false, reason: 'remediation_issue' });
		expect(isRemediationIssue({ title: 'Post-merge remediation required for PR #1', labels: [] })).toBe(true);
		expect(isRemediationIssue({ title: 'Post-merge closeout exception for PR #1 / source #2 / missing_source_issue', labels: [] })).toBe(true);
	});
});

describe('source issue closeout evidence', () => {
	it('renders closeout evidence with PR, merge SHA, validator status, and reason', () => {
		const comment = buildSourceIssueCloseoutComment({
			prNumber: '1239',
			mergeSha: 'abc123def456',
			sourceIssueNumber: '1196',
			validatorStatus: 'pass',
			verificationResult: postMergeVerificationResult({ status: 'pass', remediation_required: false }),
			closeoutReason: 'post_merge_validation_success',
			terminalLabelResult: 'remove status:post-merge-verify; add status:complete',
		});

		expect(comment).toContain('PR: #1239');
		expect(comment).toContain('Merge SHA: abc123def456');
		expect(comment).toContain('Source issue: #1196');
		expect(comment).toContain('Validator status: pass');
		expect(comment).toContain('Post-merge verification result: pass');
		expect(comment).toContain('Terminal label result: remove status:post-merge-verify; add status:complete');
		expect(comment).toContain('Closeout reason: post_merge_validation_success');
	});

	it('plans failure-path relabel without closing the source issue', () => {
		const plan = planFailureSourceIssueRelabel({
			issueLabels: ['orchestrator', 'status:post-merge-verify'],
			repoLabels: ['status:failed', 'status:complete'],
		});

		expect(plan).toMatchObject({
			ok: true,
			removeLabels: ['status:post-merge-verify'],
			addLabel: 'status:failed',
		});
	});

	it('preserves status:failed when already present on the source issue', () => {
		const plan = planFailureSourceIssueRelabel({
			issueLabels: ['orchestrator', 'status:post-merge-verify', 'status:failed'],
			repoLabels: ['status:failed', 'status:complete'],
		});

		expect(plan).toMatchObject({
			ok: true,
			removeLabels: ['status:post-merge-verify'],
			addLabel: '',
		});
	});

	it('halts failure-path relabel when status:failed is unavailable in the repository', () => {
		const plan = planFailureSourceIssueRelabel({
			issueLabels: ['orchestrator', 'status:post-merge-verify'],
			repoLabels: ['status:complete'],
		});

		expect(plan).toMatchObject({
			ok: false,
			reason: 'failure_label_unavailable',
			removeLabels: [],
			addLabel: '',
		});
	});

	it('renders failure closeout evidence without claiming success', () => {
		const comment = buildFailureCloseoutComment({
			prNumber: '1567',
			mergeSha: '314c236c986c',
			sourceIssueNumber: '1545',
			syncAction: 'post_merge_failure',
			validatorStatus: 'fail',
			verificationResult: 'fail',
			validationSummary: 'implementation=1; reviewer_disposition=1',
			terminalLabelResult: 'remove status:post-merge-verify; add status:failed',
			remediationIssueUrl: 'https://github.test/repo/issues/1575',
		});

		expect(comment).toContain('did not complete');
		expect(comment).toContain('PR: #1567');
		expect(comment).toContain('Source issue: #1545');
		expect(comment).toContain('Sync action: post_merge_failure');
		expect(comment).toContain('Remediation issue: https://github.test/repo/issues/1575');
	});

	it('lists stale active-state labels cleared on successful closeout', () => {
		expect(STALE_SOURCE_ISSUE_LABELS).toEqual([
			'status:blocked',
			'status:queued',
			'status:assigned',
			'status:failed',
			'status:post-merge-verify',
			'status:pr-draft',
			'status:review',
			'status:implementation',
		]);
	});

	it('plans terminal label reconciliation including stale failure labels', () => {
		const plan = planTerminalLabelReconciliation({
			issueLabels: ['orchestrator', 'status:post-merge-verify', 'post-merge-failure'],
			repoLabels: ['status:complete'],
		});

		expect(plan).toMatchObject({
			ok: true,
			removeLabels: ['status:post-merge-verify', 'post-merge-failure'],
			addLabel: 'status:complete',
			terminalLabels: ['orchestrator', 'status:complete'],
		});
	});

	it('accepts Set inputs when planning terminal label reconciliation', () => {
		const plan = planTerminalLabelReconciliation({
			issueLabels: new Set(['status:post-merge-verify']),
			repoLabels: new Set(['status:complete']),
		});

		expect(plan).toMatchObject({
			ok: true,
			removeLabels: ['status:post-merge-verify'],
			addLabel: 'status:complete',
		});
	});
});

describe('duplicate remediation issue governance', () => {
	it('still closes only duplicate remediation issues and protects linked source issues', () => {
		const issues = [
			remediationIssue({ number: 1300, createdAt: '2026-06-01T10:00:00Z' }),
			remediationIssue({ number: 1301, createdAt: '2026-06-01T11:00:00Z' }),
		];
		const actions = planDuplicateClosures(groupRemediationIssues(issues));

		expect(actions).toHaveLength(1);
		expect(actions[0].canonical.number).toBe(1300);
		expect(duplicateCloseComment(actions[0])).toContain('Canonical remediation issue: #1300');
	});
});

describe('sync-pr-state successful closeout', () => {
	it('closes the linked source issue with evidence comment and clears stale labels', async () => {
		process.env.GITHUB_REPOSITORY = 'owner/repo';
		const syncPrState = await import('../scripts/orchestrator/sync-pr-state.mjs');
		const run = vi.fn();
		const reconciliations = [];

		const result = syncPrState.syncPrState({
			prNumber: '1239',
			action: 'post_merge_success',
			pr: {
				body: baseBody,
				mergedAt: '2026-06-02T17:21:10Z',
				state: 'MERGED',
				url: 'https://example.test/pr/1239',
				mergeCommit: { oid: 'abc123def456' },
			},
			postMergeResult: {
				status: 'pass',
				remediation_required: false,
				merge_sha: 'abc123def456',
				pr: 1239,
				source_issue: '1196',
				terminal_label_result: {
					ok: true,
					removeLabels: ['status:post-merge-verify', 'post-merge-failure'],
					addLabel: 'status:complete',
					summary: 'remove status:post-merge-verify, post-merge-failure; add status:complete',
				},
			},
			getIssueMeta: () => ({ title: 'CI corrective task', labels: ['orchestrator', 'status:post-merge-verify'], state: 'OPEN' }),
			reconcileTerminalLabelsFn: (...args) => reconciliations.push(args),
			run,
		});

		expect(result).toBe('complete');
		expect(reconciliations).toEqual([[
			'1196',
			expect.objectContaining({
				removeLabels: ['status:post-merge-verify', 'post-merge-failure'],
				addLabel: 'status:complete',
			}),
		]]);
		expect(run).toHaveBeenCalledWith(
			expect.arrayContaining(['issue', 'comment', '1196', '--repo', 'owner/repo', '--body', expect.stringContaining('PR: #1239')]),
		);
		expect(run).toHaveBeenCalledWith(
			expect.arrayContaining(['issue', 'close', '1196', '--repo', 'owner/repo', '--reason', 'completed']),
		);
	});

	it('allows closed-source reconciliation when PR body matches follow-up language even without closeout mode metadata', () => {
		expect(
			shouldCloseSourceIssue({
				action: 'post_merge_success',
				issueNumber: '1411',
				isMerged: true,
				prBody: 'Post-merge closeout reconciliation follow-up for prior PR #1472.',
				postMergeResult: { status: 'pass', remediation_required: false },
				issueMeta: {
					title: 'PMO task',
					labels: ['status:post-merge-verify'],
					state: 'CLOSED',
					state_reason: 'COMPLETED',
				},
				terminalLabelResult: {
					ok: true,
					removeLabels: ['status:post-merge-verify'],
					addLabel: 'status:complete',
				},
			}),
		).toEqual({ close: true, reason: 'post_merge_validation_success' });
	});

	it('reconciles permitted already-closed remediation follow-ups without closing again', async () => {
		process.env.GITHUB_REPOSITORY = 'owner/repo';
		const syncPrState = await import('../scripts/orchestrator/sync-pr-state.mjs');
		const run = vi.fn();
		const reconciliations = [];

		const result = syncPrState.syncPrState({
			prNumber: '1413',
			action: 'post_merge_success',
			pr: {
				body: '- **Issue:** #1410\n\nRemediation follow-up for PR #1412.',
				mergedAt: '2026-06-07T17:21:10Z',
				state: 'MERGED',
				url: 'https://example.test/pr/1413',
			},
			postMergeResult: {
				status: 'pass',
				remediation_required: false,
				source_issue_closeout_mode: 'closed_remediation_followup',
				terminal_label_result: {
					ok: true,
					removeLabels: ['status:post-merge-verify', 'post-merge-failure'],
					addLabel: 'status:complete',
					summary: 'remove status:post-merge-verify, post-merge-failure; add status:complete',
				},
			},
			getIssueMeta: () => ({ title: 'Remediation source', labels: ['status:post-merge-verify', 'post-merge-failure'], state: 'CLOSED' }),
			reconcileTerminalLabelsFn: (...args) => reconciliations.push(args),
			run,
		});

		expect(result).toBe('complete');
		expect(reconciliations).toHaveLength(1);
		expect(run).toHaveBeenCalledWith(
			expect.arrayContaining(['issue', 'comment', '1410', '--repo', 'owner/repo', '--body', expect.stringContaining('closed_remediation_followup')]),
		);
		expect(run).not.toHaveBeenCalledWith(expect.arrayContaining(['issue', 'close', '1410']));
	});

	it('reconciles terminal labels without closing open remediation source issues on success', async () => {
		process.env.GITHUB_REPOSITORY = 'owner/repo';
		const syncPrState = await import('../scripts/orchestrator/sync-pr-state.mjs');
		const run = vi.fn();
		const reconciliations = [];

		const result = syncPrState.syncPrState({
			prNumber: '1586',
			action: 'post_merge_success',
			pr: {
				body: '- **Issue:** #1576\n\nRemediation follow-up for PR #1572.',
				mergedAt: '2026-06-11T17:21:10Z',
				state: 'MERGED',
				url: 'https://example.test/pr/1586',
			},
			postMergeResult: {
				status: 'pass',
				remediation_required: false,
				source_issue_closeout_mode: 'open_source_issue',
				terminal_label_result: {
					ok: true,
					removeLabels: ['status:post-merge-verify', 'post-merge-failure', 'status:failed'],
					addLabel: 'status:complete',
					summary: 'remove stale labels; add status:complete',
				},
			},
			getIssueMeta: () => ({
				title: 'Post-merge closeout exception for PR #1572 / source #1558 / workflow_failure',
				labels: ['post-merge-failure', 'status:post-merge-verify', 'status:failed'],
				state: 'OPEN',
			}),
			reconcileTerminalLabelsFn: (...args) => reconciliations.push(args),
			run,
		});

		expect(result).toBe('remediation_issue');
		expect(reconciliations).toHaveLength(1);
		expect(run).toHaveBeenCalledWith(
			expect.arrayContaining(['issue', 'comment', '1576', '--repo', 'owner/repo', '--body', expect.stringContaining('remediation_issue')]),
		);
		expect(run).not.toHaveBeenCalledWith(expect.arrayContaining(['issue', 'close', '1576']));
	});

	it('relabels without closing when post-merge validation failed', async () => {
		const syncPrState = await import('../scripts/orchestrator/sync-pr-state.mjs');
		const run = vi.fn();
		const reconciliations = [];

		const result = syncPrState.syncPrState({
			prNumber: '1239',
			action: 'post_merge_failure',
			pr: { body: baseBody, mergedAt: '2026-06-02T17:21:10Z', state: 'MERGED', url: 'https://example.test/pr/1239' },
			reconcileTerminalLabelsFn: (...args) => reconciliations.push(args),
			getIssueMeta: () => ({ labels: ['status:post-merge-verify'], state: 'OPEN' }),
			getRepoLabels: () => ['status:failed', 'status:complete'],
			run,
		});

		expect(result).toBe('failure_relabeled');
		expect(reconciliations[0][1]).toMatchObject({
			removeLabels: ['status:post-merge-verify'],
			addLabel: 'status:failed',
		});
		expect(run).toHaveBeenCalledWith(expect.arrayContaining(['issue', 'comment', '1196']));
	});

	it('halts failure-path sync when status:failed is unavailable in the repository', async () => {
		const syncPrState = await import('../scripts/orchestrator/sync-pr-state.mjs');
		const run = vi.fn();
		const reconciliations = [];

		const result = syncPrState.syncPrState({
			prNumber: '1583',
			action: 'post_merge_remediation',
			pr: { body: baseBody, mergedAt: '2026-06-12T14:00:00Z', state: 'MERGED', url: 'https://example.test/pr/1583' },
			reconcileTerminalLabelsFn: (...args) => reconciliations.push(args),
			getIssueMeta: () => ({ labels: ['status:post-merge-verify'], state: 'OPEN' }),
			getRepoLabels: () => ['status:complete'],
			run,
		});

		expect(result).toBe('failure_relabel_halted');
		expect(reconciliations).toHaveLength(0);
		expect(run).not.toHaveBeenCalled();
	});
});
