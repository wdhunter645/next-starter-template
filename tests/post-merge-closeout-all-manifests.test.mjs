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

	it('loads yesterday exception batch closeout rerun targets', () => {
		const { targets } = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json');
		expect(targets).toHaveLength(8);
		expect(targets.map((target) => target.pr)).toEqual([
			1811, 1814, 1809, 1828, 1825, 1834, 1832, 1844,
		]);
		expect(targets.every((target) => target.body_file && target.merge_sha && target.source_issue)).toBe(
			true,
		);
		expect(targets[0]).toMatchObject({
			body_file: 'scripts/ci/post-merge-closeout/pr-1811-body.md',
			merge_sha: '050853ec0d92d6f96ddbb9b44b6755db0dcaa5c4',
			source_issue: 1810,
		});
	});

	it('loads cleared CI pending manifest when empty', () => {
		const { targets } = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ci-pending.json');
		expect(targets).toEqual([]);
	});

	it('loads cleared remediation backlog manifest when empty', () => {
		const { targets } = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-remediation-backlog.json');
		expect(targets).toEqual([]);
	});
});
