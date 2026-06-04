import { describe, expect, it, vi } from 'vitest';

import {
	isManualBatchCloseout,
	isManualSingleCloseout,
	shouldRunAutomaticCloseout,
	shouldRunCloseoutJob,
} from '../scripts/ci/post_merge_closeout_trigger.mjs';
import {
	buildCloseoutErrorResult,
	resolveCloseoutEventContext,
} from '../scripts/ci/run_post_merge_closeout.mjs';
import { shouldUpsertRemediationIssue } from '../scripts/ci/post_merge_remediation_issue.mjs';
import { resolvePrNumber } from '../scripts/ci/post_merge_validator.mjs';

describe('automatic post-merge closeout triggers', () => {
	it('runs automatic closeout only for merged PRs into main', () => {
		expect(
			shouldRunAutomaticCloseout({
				eventName: 'pull_request_target',
				merged: true,
				baseRef: 'main',
			}),
		).toBe(true);
	});

	it('does not run automatic closeout for closed but unmerged PRs', () => {
		expect(
			shouldRunAutomaticCloseout({
				eventName: 'pull_request_target',
				merged: false,
				baseRef: 'main',
			}),
		).toBe(false);
	});

	it('does not run automatic closeout for merged PRs outside main', () => {
		expect(
			shouldRunAutomaticCloseout({
				eventName: 'pull_request_target',
				merged: true,
				baseRef: 'develop',
			}),
		).toBe(false);
	});

	it('keeps manual batch mode explicit to workflow_dispatch', () => {
		expect(isManualBatchCloseout({ eventName: 'workflow_dispatch', runBatch: true })).toBe(true);
		expect(isManualBatchCloseout({ eventName: 'pull_request_target', runBatch: true })).toBe(false);
	});

	it('keeps manual single-PR mode on workflow_dispatch when batch is false', () => {
		expect(isManualSingleCloseout({ eventName: 'workflow_dispatch', runBatch: false })).toBe(true);
		expect(isManualSingleCloseout({ eventName: 'workflow_dispatch', runBatch: true })).toBe(false);
	});

	it('allows workflow_dispatch jobs regardless of merge state', () => {
		expect(shouldRunCloseoutJob({ eventName: 'workflow_dispatch', merged: false, baseRef: 'main' })).toBe(
			true,
		);
	});
});

describe('automatic closeout runtime context', () => {
	it('uses merged PR number and skips body apply on pull_request_target', () => {
		const context = resolveCloseoutEventContext({
			eventName: 'pull_request_target',
			inputPrNumber: '1188',
			eventPrNumber: '1188',
			eventPrMerged: 'true',
			eventPrBaseRef: 'main',
			bodyFile: 'scripts/ci/post-merge-closeout/pr-1239-body.md',
			skipBodyApply: 'false',
		});

		expect(context).toMatchObject({
			automatic: true,
			prNumber: '1188',
			skipBodyApply: true,
			bodyFile: '',
		});
	});

	it('requires body file for manual single-PR closeout unless skip is set', () => {
		const context = resolveCloseoutEventContext({
			eventName: 'workflow_dispatch',
			inputPrNumber: '1239',
			bodyFile: 'scripts/ci/post-merge-closeout/pr-1239-body.md',
			skipBodyApply: 'false',
		});

		expect(context).toMatchObject({
			automatic: false,
			skipBodyApply: false,
			bodyFile: 'scripts/ci/post-merge-closeout/pr-1239-body.md',
		});
	});

	it('resolves pull_request_target PR numbers through the validator', () => {
		expect(
			resolvePrNumber({
				eventName: 'pull_request_target',
				eventPrNumber: '1239',
				eventPrMerged: 'true',
				eventPrBaseRef: 'main',
			}),
		).toEqual({ pr: '1239', method: 'pull_request_target', skip_reason: 'none' });

		expect(
			resolvePrNumber({
				eventName: 'pull_request_target',
				eventPrNumber: '1239',
				eventPrMerged: 'false',
				eventPrBaseRef: 'main',
			}),
		).toMatchObject({ pr: '', skip_reason: 'closed PR was not merged into main' });
	});
});

describe('closeout fail-safe remediation evidence', () => {
	it('upserts remediation issues for failed closeout and remediation-required passes', () => {
		expect(shouldUpsertRemediationIssue({ status: 'fail', remediation_required: true })).toBe(true);
		expect(shouldUpsertRemediationIssue({ status: 'pass', remediation_required: true })).toBe(true);
		expect(shouldUpsertRemediationIssue({ status: 'pass', remediation_required: false })).toBe(false);
	});

	it('builds a fail-closeout result with remediation_required set', () => {
		const result = buildCloseoutErrorResult({
			prNumber: '1239',
			mergeSha: 'abc123',
			message: 'network failure',
		});

		expect(result).toMatchObject({
			status: 'fail',
			pr: 1239,
			remediation_required: true,
			sync_action: 'post_merge_failure',
		});
	});
});
