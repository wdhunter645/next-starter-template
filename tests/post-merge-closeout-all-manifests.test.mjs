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

	it('loads PR #1858 closeout rerun target after #1855 remediation merge closeout', () => {
		const { targets } = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json');
		expect(targets).toHaveLength(1);
		expect(targets[0]).toMatchObject({
			pr: 1858,
			body_file: 'scripts/ci/post-merge-closeout/pr-1858-body.md',
			merge_sha: '6f5952b4b92dcf99368e57bfa31d6a59d97ca63c',
			source_issue: 1855,
		});
	});

	it('loads cleared CI pending manifest when empty', () => {
		const { targets } = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ci-pending.json');
		expect(targets).toEqual([]);
	});

	it('loads Program #1847 remediation backlog targets after merged PR closeout replay registration', () => {
		const { targets } = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-remediation-backlog.json');
		expect(targets).toHaveLength(7);
		expect(targets.map((target) => target.pr)).toEqual([1860, 1887, 1892, 1888, 1890, 1889, 1891]);
		expect(targets.every((target) => target.body_file && target.merge_sha && target.source_issue)).toBe(
			true,
		);
		expect(targets[0]).toMatchObject({
			pr: 1860,
			body_file: 'scripts/ci/post-merge-closeout/pr-1860-body.md',
			merge_sha: '492f2cb8e88679c30e89e46914ded83385a0394b',
			source_issue: 1848,
		});
		expect(targets[1]).toMatchObject({
			pr: 1887,
			body_file: 'scripts/ci/post-merge-closeout/pr-1887-body.md',
			merge_sha: 'be5c9e38320bbbb587081cd066d384d2a63490aa',
			source_issue: 1849,
		});
		expect(targets[6]).toMatchObject({
			pr: 1891,
			body_file: 'scripts/ci/post-merge-closeout/pr-1891-body.md',
			merge_sha: 'db58bf229ef3a8a7d03cfca6d609e3a6df6b3756',
			source_issue: 1854,
		});
	});
});
