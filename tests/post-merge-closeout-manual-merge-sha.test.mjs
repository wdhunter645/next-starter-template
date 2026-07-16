import { describe, expect, it } from 'vitest';

import {
	assertProductionCloseoutPr,
	resolveCloseoutEvidenceMergeSha,
	runPostMergeCloseout,
} from '../scripts/ci/run_post_merge_closeout.mjs';

const PR_2542_MERGE_SHA = 'a184c76bf1f8d821c77621ed1a91512f292eddca';
const PR_2543_MAIN_TIP = '9f87b4bcb514bf8feeaee22b688cde704e8eb21b';

function mergedMainPr({
	number = 2542,
	mergeCommitSha = PR_2542_MERGE_SHA,
	baseRef = 'main',
} = {}) {
	return {
		number,
		merged_at: '2026-07-16T11:28:25Z',
		merge_commit_sha: mergeCommitSha,
		base: { ref: baseRef },
		head: { ref: 'cursor/example' },
		body: '- **Issue:** #2516\n',
		title: 'fix(#2516): example',
		html_url: `https://github.com/wdhunter645/next-starter-template/pull/${number}`,
	};
}

describe('manual closeout evidence merge SHA resolution (#2247)', () => {
	it('uses the target PR merge_commit_sha for workflow_dispatch even when GITHUB_SHA is a later main tip', () => {
		const mergeSha = resolveCloseoutEvidenceMergeSha({
			eventName: 'workflow_dispatch',
			suppliedSha: PR_2543_MAIN_TIP,
			pr: mergedMainPr(),
		});

		expect(mergeSha).toBe(PR_2542_MERGE_SHA);
		expect(mergeSha).not.toBe(PR_2543_MAIN_TIP);
	});

	it('reproduces the PR #2542 / PR #2543 mismatch and resolves to the #2542 merge commit', () => {
		expect(
			resolveCloseoutEvidenceMergeSha({
				eventName: 'workflow_dispatch',
				suppliedSha: PR_2543_MAIN_TIP,
				pr: mergedMainPr({ number: 2542, mergeCommitSha: PR_2542_MERGE_SHA }),
			}),
		).toBe('a184c76bf1f8d821c77621ed1a91512f292eddca');
	});

	it('preserves automatic closeout preference for a supplied merge SHA', () => {
		expect(
			resolveCloseoutEvidenceMergeSha({
				eventName: 'pull_request_target',
				suppliedSha: PR_2542_MERGE_SHA,
				pr: mergedMainPr({ mergeCommitSha: PR_2542_MERGE_SHA }),
			}),
		).toBe(PR_2542_MERGE_SHA);
	});

	it('falls back to merge_commit_sha for automatic closeout when supplied SHA is empty', () => {
		expect(
			resolveCloseoutEvidenceMergeSha({
				eventName: 'pull_request_target',
				suppliedSha: '',
				pr: mergedMainPr({ mergeCommitSha: PR_2542_MERGE_SHA }),
			}),
		).toBe(PR_2542_MERGE_SHA);
	});

	it('refuses unmerged PRs', () => {
		expect(() =>
			assertProductionCloseoutPr({
				prNumber: '9999',
				pr: {
					number: 9999,
					merged_at: null,
					base: { ref: 'main' },
					merge_commit_sha: '',
				},
			}),
		).toThrow(/is not merged/);
	});

	it('refuses PRs not merged to main', () => {
		expect(() =>
			assertProductionCloseoutPr({
				prNumber: '9998',
				pr: {
					number: 9998,
					merged_at: '2026-07-16T00:00:00Z',
					base: { ref: 'develop' },
					merge_commit_sha: 'abc123',
				},
			}),
		).toThrow(/not main/);
	});

	it('runPostMergeCloseout refuses unmerged PRs before validation', async () => {
		await expect(
			runPostMergeCloseout({
				token: 'token',
				repository: 'wdhunter645/next-starter-template',
				prNumber: '9999',
				sha: PR_2543_MAIN_TIP,
				eventName: 'workflow_dispatch',
				skipBodyApply: true,
				suppressRemediationIssues: true,
				fetchMergedPrFn: async () => ({
					number: 9999,
					merged_at: null,
					base: { ref: 'main' },
					merge_commit_sha: '',
				}),
			}),
		).rejects.toThrow(/is not merged/);
	});

	it('runPostMergeCloseout refuses non-main base before validation', async () => {
		await expect(
			runPostMergeCloseout({
				token: 'token',
				repository: 'wdhunter645/next-starter-template',
				prNumber: '9998',
				sha: PR_2543_MAIN_TIP,
				eventName: 'workflow_dispatch',
				skipBodyApply: true,
				suppressRemediationIssues: true,
				fetchMergedPrFn: async () => ({
					number: 9998,
					merged_at: '2026-07-16T00:00:00Z',
					base: { ref: 'release' },
					merge_commit_sha: 'deadbeef',
				}),
			}),
		).rejects.toThrow(/not main/);
	});
});
