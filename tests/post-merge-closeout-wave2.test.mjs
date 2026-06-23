import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

import { loadCloseoutTargets } from '../scripts/ci/run_batch_post_merge_closeout.mjs';
import {
	alternateProgramLaneFailures,
	isPermittedClosedSourceIssueFollowup,
	metadataFailures,
} from '../scripts/ci/post_merge_validator.mjs';

const WAVE2_MANIFEST = 'scripts/ci/post-merge-closeout/targets-ops-burn-down-wave2.json';

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

describe('ops burn-down wave 2 closeout bodies', () => {
	it('loads Wave 2 manifest with ready backlog PR targets', () => {
		const { targets } = loadCloseoutTargets(WAVE2_MANIFEST);
		expect(targets).toHaveLength(8);
		expect(targets.map((target) => target.pr)).toEqual([
			1229, 1240, 1242, 1361, 1458, 1473, 1635, 1860,
		]);
		expect(targets.every((target) => target.body_file && target.merge_sha && target.source_issue)).toBe(
			true,
		);
	});

	it('permits closed-source follow-up closeout for remediated PR #1860 body', () => {
		const body = fs.readFileSync('scripts/ci/post-merge-closeout/pr-1860-body.md', 'utf8');
		const sourceIssue = closedCompletedIssue(1848);

		expect(isPermittedClosedSourceIssueFollowup({ body, sourceIssue })).toBe(true);
		expect(
			metadataFailures(mergedPr(body), () => true, {
				sourceIssue,
				repoLabels: [{ name: 'status:complete' }],
			}),
		).not.toContainEqual(expect.objectContaining({ code: 'source_issue_not_open' }));
	});

	it('includes duplicate-cluster PRs in Wave 2 manifest', () => {
		const { targets } = loadCloseoutTargets(WAVE2_MANIFEST);
		expect(targets.map((target) => target.pr)).toEqual(
			expect.arrayContaining([1458, 1635, 1860]),
		);
	});

	it('does not contain targets with active alternate program lane issues', () => {
		const { targets } = loadCloseoutTargets(WAVE2_MANIFEST);
		for (const target of targets) {
			const failures = alternateProgramLaneFailures({ issueNumbers: [target.source_issue] });
			expect(failures).toEqual([]);
		}
	});
});
