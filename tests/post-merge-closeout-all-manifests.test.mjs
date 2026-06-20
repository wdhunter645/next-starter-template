import { describe, expect, it } from 'vitest';

import { DEFAULT_MANIFESTS } from '../scripts/ci/run_post_merge_closeout_all_manifests.mjs';
import { loadCloseoutTargets } from '../scripts/ci/run_batch_post_merge_closeout.mjs';

describe('post-merge closeout all manifests', () => {
	it('defines rerun, CI pending, and remediation backlog manifests', () => {
		expect(DEFAULT_MANIFESTS).toEqual([
			'scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json',
			'scripts/ci/post-merge-closeout/targets-ci-pending.json',
			'scripts/ci/post-merge-closeout/targets-remediation-backlog.json',
		]);
	});

	it('loads final residual closeout rerun target after #1807 disposition remediation', () => {
		const { targets } = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json');
		expect(targets).toHaveLength(1);
		expect(targets.map((target) => target.pr)).toEqual([1807]);
		expect(targets.every((target) => target.body_file && target.merge_sha && target.source_issue)).toBe(
			true,
		);
		expect(targets[0]).toMatchObject({
			body_file: 'scripts/ci/post-merge-closeout/pr-1807-body.md',
			merge_sha: 'e1a2540019abce87eaa70209fd9602f8a6176932',
			source_issue: 1725,
		});
	});

	it('loads CI pending manifest targets when closeout backlog items remain', () => {
		const { targets } = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ci-pending.json');
		expect(targets.map((target) => target.pr)).toEqual([1572, 1577, 1582, 1583, 1586, 1594, 1596]);
		expect(targets.every((target) => target.body_file && target.merge_sha && target.source_issue)).toBe(
			true,
		);
	});

	it('loads remediation backlog targets', () => {
		const { targets } = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-remediation-backlog.json');
		expect(targets.map((target) => target.pr)).toEqual([1221, 1230, 1233, 1248]);
	});
});
