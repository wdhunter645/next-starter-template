import { describe, expect, it, vi } from 'vitest';

import { linkedIssueNumber, sourceIssueAccounting } from '../scripts/ci/issue_accounting.mjs';
import {
	buildSourceIssueCloseoutComment,
	isRemediationIssue,
	planTerminalLabelReconciliation,
	postMergeVerificationResult,
	shouldCloseSourceIssue,
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

	it('does not close when remediation remains required', () => {
		const result = buildResult({
			pr: { body: baseBody },
			resolution: { pr: '1239' },
			failures: [
				{
					workflow: 'Auto-Sync Documentation',
					classification: 'secret-access/configuration',
					required: false,
					conclusion: 'failure',
				},
			],
		});

		expect(result).toMatchObject({ status: 'pass', sync_action: 'post_merge_remediation', remediation_required: true });
		expect(
			shouldCloseSourceIssue({
				action: 'post_merge_remediation',
				issueNumber: '1196',
				isMerged: true,
				postMergeResult: result,
			}),
		).toMatchObject({ close: false, reason: 'action_post_merge_remediation' });
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

	it('does not close when post-merge validation failed', async () => {
		const syncPrState = await import('../scripts/orchestrator/sync-pr-state.mjs');
		const run = vi.fn();
		const setStatus = vi.fn();

		const result = syncPrState.syncPrState({
			prNumber: '1239',
			action: 'post_merge_failure',
			pr: { body: baseBody, mergedAt: '2026-06-02T17:21:10Z', state: 'MERGED', url: 'https://example.test/pr/1239' },
			setStatusFn: setStatus,
			run,
		});

		expect(result).toBe('exception');
		expect(setStatus).not.toHaveBeenCalled();
		expect(run).not.toHaveBeenCalled();
	});
});
