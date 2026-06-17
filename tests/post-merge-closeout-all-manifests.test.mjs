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

	it('loads rerun targets for PR #1536 (#1258 reopen), PR #1639 (#1638 closeout), and PR #1747 (#1736 closeout)', () => {
		const { targets } = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json');
		expect(targets.map((target) => target.pr)).toEqual([1536, 1639, 1747]);
		expect(targets[0]).toMatchObject({
			body_file: 'scripts/ci/post-merge-closeout/pr-1536-body.md',
			merge_sha: '62ca227c5939f9a852bd8268d2bcdf406a35d1ba',
			source_issue: 1258,
		});
		expect(targets[1]).toMatchObject({
			body_file: 'scripts/ci/post-merge-closeout/pr-1639-body.md',
			merge_sha: '64cb85794b4943a2a4dd2804061a278a5380faee',
			source_issue: 1638,
		});
		expect(targets[2]).toMatchObject({
			body_file: 'scripts/ci/post-merge-closeout/pr-1747-body.md',
			merge_sha: '86d98c6bc746a762a646c35f118d762f4fbfad51',
			source_issue: 1736,
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
