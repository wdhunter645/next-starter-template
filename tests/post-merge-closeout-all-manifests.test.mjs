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

	it('loads residual closeout rerun targets after batch #1791 prune (#1812) including PR #1795', () => {
		const { targets } = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json');
		expect(targets).toHaveLength(7);
		expect(targets.map((target) => target.pr)).toEqual([1699, 1778, 1681, 1765, 1786, 1772, 1795]);
		expect(targets.every((target) => target.body_file && target.merge_sha && target.source_issue)).toBe(
			true,
		);
		expect(targets[0]).toMatchObject({
			body_file: 'scripts/ci/post-merge-closeout/pr-1699-body.md',
			merge_sha: '58508f6b01a2e8a91e9997f1c1c7e8b82735fd81',
			source_issue: 1255,
		});
		expect(targets[1]).toMatchObject({
			body_file: 'scripts/ci/post-merge-closeout/pr-1778-body.md',
			merge_sha: '17a85b2f3fbb624e38cc19b887900742a66667e8',
			source_issue: 1255,
		});
		expect(targets[2]).toMatchObject({
			body_file: 'scripts/ci/post-merge-closeout/pr-1681-body.md',
			merge_sha: '11b2027d610a02e517212691a753134ab9691312',
			source_issue: 1259,
		});
		expect(targets[3]).toMatchObject({
			body_file: 'scripts/ci/post-merge-closeout/pr-1765-body.md',
			merge_sha: '9d6530b87abfb5a2615f70045d2530f6bd124bcc',
			source_issue: 1754,
		});
		expect(targets[4]).toMatchObject({
			body_file: 'scripts/ci/post-merge-closeout/pr-1786-body.md',
			merge_sha: '98b426d25259029dd08178cc3ac4c88589830b3a',
			source_issue: 1777,
		});
		expect(targets[5]).toMatchObject({
			body_file: 'scripts/ci/post-merge-closeout/pr-1772-body.md',
			merge_sha: '2c5e8ebdf957e03510a89fd544c1222ea67c1039',
			source_issue: 1754,
		});
		expect(targets[6]).toMatchObject({
			body_file: 'scripts/ci/post-merge-closeout/pr-1795-body.md',
			merge_sha: '87f60099cb3aff4de93b9b90a12138728f173fe2',
			source_issue: 1794,
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
