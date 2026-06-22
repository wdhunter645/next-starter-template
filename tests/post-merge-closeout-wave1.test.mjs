import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

import { loadCloseoutTargets } from '../scripts/ci/run_batch_post_merge_closeout.mjs';
import {
	isPermittedClosedSourceIssueFollowup,
	metadataFailures,
	reviewerDispositionFailures,
} from '../scripts/ci/post_merge_validator.mjs';

const WAVE1_MANIFEST = 'scripts/ci/post-merge-closeout/targets-ops-burn-down-wave1.json';

function mergedPr(body) {
	return {
		body,
		isDraft: false,
		mergedAt: '2026-06-20T00:00:00Z',
		baseRefName: 'main',
		files: [],
	};
}

function closedCompletedIssue(number) {
	return {
		number,
		state: 'closed',
		state_reason: 'completed',
		labels: [{ name: 'status:complete' }],
	};
}

describe('ops burn-down wave 1 closeout bodies', () => {
	it('loads Wave 1 manifest with duplicate-cluster and source_issue_not_open targets', () => {
		const { targets } = loadCloseoutTargets(WAVE1_MANIFEST);
		expect(targets).toHaveLength(3);
		expect(targets.map((target) => target.pr)).toEqual([1889, 1891, 1239]);
		expect(targets.every((target) => target.body_file && target.merge_sha && target.source_issue)).toBe(
			true,
		);
	});

	it('permits closed-source follow-up closeout for remediated PR #1239 body', () => {
		const body = fs.readFileSync('scripts/ci/post-merge-closeout/pr-1239-body.md', 'utf8');
		const sourceIssue = closedCompletedIssue(1196);

		expect(isPermittedClosedSourceIssueFollowup({ body, sourceIssue })).toBe(true);
		expect(
			metadataFailures(mergedPr(body), () => true, {
				sourceIssue,
				repoLabels: [{ name: 'status:complete' }],
			}),
		).not.toContainEqual(expect.objectContaining({ code: 'source_issue_not_open' }));
	});

	it('records reviewer dispositions for remediated PR #1889 body', () => {
		const body = fs.readFileSync('scripts/ci/post-merge-closeout/pr-1889-body.md', 'utf8');
		const reviewComments = [
			{ id: 3447589045, body: 'high', user: { login: 'gemini-code-assist[bot]' }, created_at: '2026-06-20T00:00:00Z' },
			{ id: 3447589051, body: 'high', user: { login: 'gemini-code-assist[bot]' }, created_at: '2026-06-20T00:00:00Z' },
			{ id: 3447589054, body: 'medium', user: { login: 'gemini-code-assist[bot]' }, created_at: '2026-06-20T00:00:00Z' },
			{ id: 3447589057, body: 'medium', user: { login: 'gemini-code-assist[bot]' }, created_at: '2026-06-20T00:00:00Z' },
			{ id: 3447589066, body: 'medium', user: { login: 'gemini-code-assist[bot]' }, created_at: '2026-06-20T00:00:00Z' },
		];

		expect(
			reviewerDispositionFailures({
				body,
				reviewComments,
				issueComments: [],
				reviews: [],
				mergedAt: '2026-06-20T00:00:00Z',
			}),
		).toEqual([]);
	});

	it('records reviewer dispositions for remediated PR #1891 body', () => {
		const body = fs.readFileSync('scripts/ci/post-merge-closeout/pr-1891-body.md', 'utf8');
		const reviewComments = [
			{ id: 3447589332, body: 'high', user: { login: 'gemini-code-assist[bot]' }, created_at: '2026-06-20T00:00:00Z' },
			{ id: 3447589336, body: 'high', user: { login: 'gemini-code-assist[bot]' }, created_at: '2026-06-20T00:00:00Z' },
			{ id: 3447589337, body: 'medium', user: { login: 'gemini-code-assist[bot]' }, created_at: '2026-06-20T00:00:00Z' },
			{ id: 3447589338, body: 'medium', user: { login: 'gemini-code-assist[bot]' }, created_at: '2026-06-20T00:00:00Z' },
			{ id: 3447589339, body: 'medium', user: { login: 'gemini-code-assist[bot]' }, created_at: '2026-06-20T00:00:00Z' },
		];
		const reviews = [
			{ id: 4538902245, body: 'Code Review', user: { login: 'gemini-code-assist[bot]' }, submitted_at: '2026-06-20T00:00:00Z' },
		];

		expect(
			reviewerDispositionFailures({
				body,
				reviewComments,
				issueComments: [],
				reviews,
				mergedAt: '2026-06-20T00:00:00Z',
			}),
		).toEqual([]);
	});
});
