import { describe, expect, it, vi } from 'vitest';

import {
	closeoutEvidenceIntegrityFailures,
	resolveCanonicalMergeSha,
} from '../scripts/ci/post_merge_validator.mjs';
import {
	applyTerminalLabelReconciliation,
	canDeterministicallyRepairTerminalLabels,
	planTerminalLabelReconciliation,
	terminalSourceIssueCloseoutModeFromSync,
	terminalSourceIssueLabelIntegrityFailures,
} from '../scripts/ci/post_merge_source_issue_closeout.mjs';
import {
	verifyTerminalLabelIntegrityAfterCloseout,
} from '../scripts/ci/run_post_merge_closeout.mjs';
import {
	planTerminalLabelRepairActions,
	applyTerminalLabelRepairAction,
} from '../scripts/ci/post_merge_self_heal_apply.mjs';
import { SAFETY_CATEGORIES } from '../scripts/ci/post_merge_self_heal_classify.mjs';
import { buildDetectionReport } from '../scripts/ci/post_merge_self_heal_detect.mjs';

describe('closeout evidence merge SHA integrity', () => {
	it('fails when closeout evidence merge SHA is stale relative to the merged PR', () => {
		const failures = closeoutEvidenceIntegrityFailures({
			prNumber: '1915',
			prMergeCommitSha: '0b749f82deadbeef',
			evidenceMergeSha: 'a5e1ecd94a0f023de1558763fb37eb1ee56d1756',
		});

		expect(failures).toContainEqual(expect.objectContaining({
			code: 'stale_closeout_evidence_merge_sha',
		}));
	});

	it('passes when closeout evidence merge SHA matches the merged PR', () => {
		expect(closeoutEvidenceIntegrityFailures({
			prNumber: '1915',
			prMergeCommitSha: '0b749f82deadbeef',
			evidenceMergeSha: '0b749f82deadbeef',
		})).toEqual([]);
	});

	it('fails when evidence merge SHA belongs to another merged PR', () => {
		const failures = closeoutEvidenceIntegrityFailures({
			prNumber: '1915',
			prMergeCommitSha: '0b749f82deadbeef',
			evidenceMergeSha: 'a5e1ecd94a0f023de1558763fb37eb1ee56d1756',
			evidenceShaAssociatedPr: { number: 1909, merged_at: '2026-06-20T00:00:00Z' },
		});

		expect(failures).toContainEqual(expect.objectContaining({
			code: 'merge_sha_belongs_to_other_pr',
		}));
	});

	it('prefers the merged PR merge_commit_sha as canonical evidence', () => {
		expect(resolveCanonicalMergeSha({
			prMergeCommitSha: '0b749f82deadbeef',
			evidenceMergeSha: 'a5e1ecd94a0f023de1558763fb37eb1ee56d1756',
		})).toBe('0b749f82deadbeef');
	});
});

describe('terminal source issue label integrity', () => {
	it('fails when a closed source issue retains status:post-merge-verify', () => {
		const failures = terminalSourceIssueLabelIntegrityFailures({
			issueMeta: {
				state: 'closed',
				state_reason: 'completed',
				labels: [{ name: 'status:complete' }, { name: 'status:post-merge-verify' }],
			},
			closeoutMode: 'terminal_close',
		});

		expect(failures).toContainEqual(expect.objectContaining({
			code: 'stale_terminal_source_issue_labels',
		}));
	});

	it('passes when a closed source issue has only valid terminal labels', () => {
		expect(terminalSourceIssueLabelIntegrityFailures({
			issueMeta: {
				state: 'closed',
				state_reason: 'completed',
				labels: [{ name: 'status:complete' }, { name: 'orchestrator' }],
			},
			closeoutMode: 'terminal_close',
		})).toEqual([]);
	});

	it('repairs stale terminal labels deterministically once during closeout verification', async () => {
		const issueStates = [
			{
				state: 'closed',
				state_reason: 'completed',
				labels: [{ name: 'status:complete' }, { name: 'status:post-merge-verify' }],
			},
			{
				state: 'closed',
				state_reason: 'completed',
				labels: [{ name: 'status:complete' }, { name: 'orchestrator' }],
			},
		];
		const applyRepairFn = vi.fn(async () => ({ ok: true }));

		const outcome = await verifyTerminalLabelIntegrityAfterCloseout({
			token: 'token',
			repository: 'owner/repo',
			sourceIssueNumber: 1914,
			syncResult: 'complete',
			fetchIssueFn: async () => issueStates.shift(),
			fetchLabelsFn: async () => [{ name: 'status:complete' }],
			applyRepairFn,
		});

		expect(applyRepairFn).toHaveBeenCalledTimes(1);
		expect(outcome).toMatchObject({ ok: true, repaired: true, closeout_mode: 'terminal_close' });
	});

	it('fails cleanly when source issue metadata is unreadable without throwing TypeError', async () => {
		const fetchLabelsFn = vi.fn(async () => [{ name: 'status:complete' }]);

		const outcome = await verifyTerminalLabelIntegrityAfterCloseout({
			token: 'token',
			repository: 'owner/repo',
			sourceIssueNumber: 1914,
			syncResult: 'complete',
			fetchIssueFn: async () => null,
			fetchLabelsFn,
		});

		expect(fetchLabelsFn).not.toHaveBeenCalled();
		expect(outcome).toMatchObject({
			ok: false,
			closeout_mode: 'terminal_close',
			terminal_label_plan: { ok: false, reason: 'source_issue_unreadable' },
		});
		expect(outcome.failures).toContainEqual(expect.objectContaining({
			code: 'source_issue_unreadable',
		}));
	});

	it('fails post-merge validation when terminal labels remain after one repair retry', async () => {
		const staleIssue = {
			state: 'closed',
			state_reason: 'completed',
			labels: [{ name: 'status:post-merge-verify' }],
		};

		const outcome = await verifyTerminalLabelIntegrityAfterCloseout({
			token: 'token',
			repository: 'owner/repo',
			sourceIssueNumber: 1914,
			syncResult: 'complete',
			fetchIssueFn: async () => staleIssue,
			fetchLabelsFn: async () => [{ name: 'status:complete' }],
			applyRepairFn: async () => ({ ok: true }),
		});

		expect(outcome.ok).toBe(false);
		expect(outcome.failures).toContainEqual(expect.objectContaining({
			code: 'missing_terminal_complete_label',
		}));
		expect(canDeterministicallyRepairTerminalLabels({
			failures: outcome.failures,
			plan: outcome.terminal_label_plan,
		})).toBe(true);
	});

	it('maps active relabel closeout mode from sync results', () => {
		expect(terminalSourceIssueCloseoutModeFromSync('complete')).toBe('terminal_close');
		expect(terminalSourceIssueCloseoutModeFromSync('active_relabeled')).toBe('preserve_open');
	});
});

describe('post-merge self-healing closeout routing', () => {
	it('classifies stale terminal label residue as safe auto-fix from closeout artifacts', () => {
		const report = buildDetectionReport({
			manifests: [{ manifest_path: 'targets.json', targets: [], missing: false }],
			closeoutReports: [{
				status: 'fail',
				results: [{
					status: 'fail',
					pr: 1915,
					source_issue: 1914,
					metadata_failures: [{
						code: 'stale_terminal_source_issue_labels',
						message: 'Source issue retains stale workflow labels after closeout: status:post-merge-verify.',
					}],
				}],
			}],
			exceptionIssues: [],
		});

		expect(report.findings.some((finding) =>
			finding.classification === SAFETY_CATEGORIES.SAFE_AUTO_FIX
			&& finding.kind === 'stale_terminal_source_issue_labels',
		)).toBe(true);
	});

	it('plans terminal label repair actions without opening a new issue', () => {
		const actions = planTerminalLabelRepairActions([
			{
				kind: 'stale_terminal_source_issue_labels',
				classification: SAFETY_CATEGORIES.SAFE_AUTO_FIX,
				source_issue: 1914,
			},
		], {
			closeoutReports: [{
				results: [{ source_issue: 1914, source_issue_closeout_mode: 'source_issue_open_at_validation' }],
			}],
		});

		expect(actions).toHaveLength(1);
		expect(actions[0]).toMatchObject({
			action: 'repair_terminal_source_labels',
			source_issue: 1914,
			applies_changes: true,
		});
	});

	it('applies terminal label reconciliation through the GitHub issues API', async () => {
		const requests = [];
		const requestFn = async ({ method, path, body }) => {
			requests.push({ method, path, body });
			if (method === 'GET' && path === '/issues/1914') {
				return {
					labels: [{ name: 'status:post-merge-verify' }],
				};
			}
			return null;
		};

		await applyTerminalLabelReconciliation({
			token: 'token',
			repository: 'owner/repo',
			issueNumber: 1914,
			plan: planTerminalLabelReconciliation({
				issueLabels: ['status:post-merge-verify'],
				repoLabels: [{ name: 'status:complete' }],
			}),
			requestFn,
		});

		expect(requests).toContainEqual(expect.objectContaining({
			method: 'PATCH',
			path: '/issues/1914',
			body: { labels: ['status:complete'] },
		}));
	});

	it('returns structured failed result when terminal-label repair API calls fail', async () => {
		const outcome = await applyTerminalLabelRepairAction({
			action: 'repair_terminal_source_labels',
			source_issue: 1914,
			preserve_open: false,
		}, {
			dryRun: false,
			token: 'token',
			repository: 'owner/repo',
			fetchIssueFn: async () => {
				throw new Error('rate limit exceeded');
			},
		});

		expect(outcome).toMatchObject({
			status: 'failed',
			reason: 'api_error',
			error: 'rate limit exceeded',
		});
	});

	it('passes explicit args objects to fetchIssueFn and fetchLabelsFn overrides', async () => {
		const fetchIssueFn = vi.fn(async () => ({
			labels: [{ name: 'status:post-merge-verify' }],
		}));
		const fetchLabelsFn = vi.fn(async () => [{ name: 'status:complete' }]);

		await applyTerminalLabelRepairAction({
			action: 'repair_terminal_source_labels',
			source_issue: 1914,
			preserve_open: false,
		}, {
			dryRun: true,
			token: 'token',
			repository: 'owner/repo',
			fetchIssueFn,
			fetchLabelsFn,
		});

		expect(fetchIssueFn).toHaveBeenCalledWith({
			token: 'token',
			repository: 'owner/repo',
			issueNumber: 1914,
		});
		expect(fetchLabelsFn).toHaveBeenCalledWith({
			token: 'token',
			repository: 'owner/repo',
		});
	});

	it('continues processing when one terminal-label repair action fails', async () => {
		const [failed, planned] = await Promise.all([
			applyTerminalLabelRepairAction({
				action: 'repair_terminal_source_labels',
				source_issue: 1914,
				preserve_open: false,
			}, {
				dryRun: false,
				token: 'token',
				repository: 'owner/repo',
				fetchIssueFn: async () => {
					throw new Error('rate limit exceeded');
				},
			}),
			applyTerminalLabelRepairAction({
				action: 'repair_terminal_source_labels',
				source_issue: 1915,
				preserve_open: false,
			}, {
				dryRun: true,
				token: 'token',
				repository: 'owner/repo',
				fetchIssueFn: async () => ({ labels: [{ name: 'status:post-merge-verify' }] }),
				fetchLabelsFn: async () => [{ name: 'status:complete' }],
			}),
		]);

		expect(failed).toMatchObject({ status: 'failed', reason: 'api_error' });
		expect(planned).toMatchObject({ status: 'planned' });
	});
});
