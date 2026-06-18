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

	it('loads bounded closeout remediation batch #1791 plus pending rerun targets', () => {
		const { targets } = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json');
		expect(targets).toHaveLength(24);
		expect(targets.map((target) => target.pr)).toEqual([
			1699, 1778, 1531, 1534, 1536, 1538, 1540, 1551, 1556, 1582, 1619,
			1669, 1677, 1681, 1728, 1729, 1734, 1737, 1749, 1751, 1753, 1762,
			1765, 1780,
		]);
		expect(targets.every((target) => target.body_file && target.merge_sha && target.source_issue)).toBe(
			true,
		);
		expect(targets[0]).toMatchObject({
			body_file: 'scripts/ci/post-merge-closeout/pr-1699-body.md',
			merge_sha: '58508f6b01a2e8a91e9997f1c1c7e8b82735fd81',
			source_issue: 1255,
		});
		expect(targets[22]).toMatchObject({
			body_file: 'scripts/ci/post-merge-closeout/pr-1765-body.md',
			merge_sha: '9d6530b87abfb5a2615f70045d2530f6bd124bcc',
			source_issue: 1754,
		});
		expect(targets[23]).toMatchObject({
			body_file: 'scripts/ci/post-merge-closeout/pr-1780-body.md',
			merge_sha: 'd3019beee16bc9099e3dcc48cc8f18a35325d829',
			source_issue: 1738,
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
