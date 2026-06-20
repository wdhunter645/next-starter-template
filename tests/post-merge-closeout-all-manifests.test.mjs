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

	it('loads cleared rerun manifest when empty', () => {
		const { targets } = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json');
		expect(targets).toEqual([]);
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
