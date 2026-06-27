import { describe, expect, it } from 'vitest';

import {
	ACTIVE_MANIFEST_REGISTRY,
	DEFAULT_MANIFESTS,
	loadActiveManifestRegistry,
} from '../scripts/ci/run_post_merge_closeout_all_manifests.mjs';
import { loadCloseoutTargets } from '../scripts/ci/run_batch_post_merge_closeout.mjs';

const COMPLETED_WAVE_MANIFESTS = [
	'scripts/ci/post-merge-closeout/targets-ops-burn-down-wave1.json',
	'scripts/ci/post-merge-closeout/targets-ops-burn-down-wave2.json',
	'scripts/ci/post-merge-closeout/targets-ops-burn-down-wave3a.json',
	'scripts/ci/post-merge-closeout/targets-ops-burn-down-wave3a-remediation.json',
];

describe('post-merge closeout all manifests', () => {
	it('loads DEFAULT_MANIFESTS from the active registry without completed waves', () => {
		const { manifests, archivedManifests } = loadActiveManifestRegistry();
		expect(manifests).toEqual(DEFAULT_MANIFESTS);
		expect(manifests).toEqual([
			'scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json',
			'scripts/ci/post-merge-closeout/targets-ci-pending.json',
			'scripts/ci/post-merge-closeout/targets-remediation-backlog.json',
			'scripts/ci/post-merge-closeout/targets-ops-burn-down-wave3b.json',
			'scripts/ci/post-merge-closeout/targets-website-completion-1685-closeout.json',
		]);
		for (const manifestPath of COMPLETED_WAVE_MANIFESTS) {
			expect(manifests).not.toContain(manifestPath);
		}
		expect(archivedManifests).toEqual(COMPLETED_WAVE_MANIFESTS);
		expect(ACTIVE_MANIFEST_REGISTRY).toBe('scripts/ci/post-merge-closeout/targets-active.json');
	});

	it('loads PR #1858 closeout rerun target after #1855 remediation merge closeout', () => {
		const { targets } = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json');
		expect(targets).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					pr: 1858,
					body_file: 'scripts/ci/post-merge-closeout/pr-1858-body.md',
					merge_sha: '6f5952b4b92dcf99368e57bfa31d6a59d97ca63c',
					source_issue: 1855,
				}),
			]),
		);
	});

	it('loads PR #1926 closeout rerun target after #1687 remediation registration', () => {
		const { targets } = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json');
		expect(targets).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					pr: 1926,
					body_file: 'scripts/ci/post-merge-closeout/pr-1926-body.md',
					merge_sha: '06889653a627976fd3ebf5c96cf5179e8a8e501b',
					source_issue: 1687,
				}),
			]),
		);
	});

	it('loads yesterday exception batch closeout rerun targets after #1813 remediation', () => {
		const { targets } = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json');
		expect(targets).toHaveLength(11);
		expect(targets.map((target) => target.pr)).toEqual([
			1926, 1858, 1811, 1814, 1809, 1828, 1825, 1834, 1832, 1844, 1981,
		]);
		expect(targets.every((target) => target.body_file && target.merge_sha && target.source_issue)).toBe(
			true,
		);
		expect(targets[2]).toMatchObject({
			body_file: 'scripts/ci/post-merge-closeout/pr-1811-body.md',
			merge_sha: '050853ec0d92d6f96ddbb9b44b6755db0dcaa5c4',
			source_issue: 1810,
		});
	});

	it('loads cleared CI pending manifest when empty', () => {
		const { targets } = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ci-pending.json');
		expect(targets).toEqual([]);
	});

	it('loads Program #1847 remediation backlog targets after merged PR closeout replay registration', () => {
		const { targets } = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-remediation-backlog.json');
		expect(targets).toHaveLength(4);
		expect(targets.map((target) => target.pr)).toEqual([1887, 1892, 1888, 1890]);
		expect(targets.every((target) => target.body_file && target.merge_sha && target.source_issue)).toBe(
			true,
		);
		expect(targets[0]).toMatchObject({
			pr: 1887,
			body_file: 'scripts/ci/post-merge-closeout/pr-1887-body.md',
			merge_sha: 'be5c9e38320bbbb587081cd066d384d2a63490aa',
			source_issue: 1849,
		});
	});

	it('does not duplicate PR targets across remediation backlog and Wave 1 manifest', () => {
		const remediation = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-remediation-backlog.json').targets;
		const wave1 = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ops-burn-down-wave1.json').targets;
		const remediationPrs = new Set(remediation.map((target) => target.pr));
		const overlap = wave1.filter((target) => remediationPrs.has(target.pr));
		expect(overlap).toEqual([]);
	});

	it('does not duplicate PR targets across prior manifests and Wave 2 manifest', () => {
		const prior = [
			...loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-remediation-backlog.json').targets,
			...loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ops-burn-down-wave1.json').targets,
		];
		const wave2 = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ops-burn-down-wave2.json').targets;
		const priorPrs = new Set(prior.map((target) => target.pr));
		const overlap = wave2.filter((target) => priorPrs.has(target.pr));
		expect(overlap).toEqual([]);
	});

	it('does not duplicate PR targets across ci-pending-rerun and Wave 2 manifest', () => {
		const rerun = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json').targets;
		const wave2 = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ops-burn-down-wave2.json').targets;
		const rerunPrs = new Set(rerun.map((target) => target.pr));
		const overlap = wave2.filter((target) => rerunPrs.has(target.pr));
		expect(overlap).toEqual([]);
	});

	it('does not duplicate PR targets across prior manifests and Wave 3a manifest', () => {
		const prior = [
			...loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-remediation-backlog.json').targets,
			...loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ops-burn-down-wave1.json').targets,
			...loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ops-burn-down-wave2.json').targets,
			...loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json').targets,
		];
		const wave3a = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ops-burn-down-wave3a.json').targets;
		const priorPrs = new Set(prior.map((target) => target.pr));
		const overlap = wave3a.filter((target) => priorPrs.has(target.pr));
		expect(overlap).toEqual([]);
	});

	it('does not duplicate PR targets across prior manifests and Wave 3b manifest', () => {
		const prior = [
			...loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-remediation-backlog.json').targets,
			...loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ops-burn-down-wave1.json').targets,
			...loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ops-burn-down-wave2.json').targets,
			...loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json').targets,
			...loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ops-burn-down-wave3a.json').targets,
			...loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ops-burn-down-wave3a-remediation.json').targets,
		];
		const wave3b = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets-ops-burn-down-wave3b.json').targets;
		const priorPrs = new Set(prior.map((target) => target.pr));
		const overlap = wave3b.filter((target) => priorPrs.has(target.pr));
		expect(overlap).toEqual([]);
	});

	it('limits Wave 3a remediation manifest to failed replay targets only', () => {
		const { targets } = loadCloseoutTargets(
			'scripts/ci/post-merge-closeout/targets-ops-burn-down-wave3a-remediation.json',
		);
		expect(targets).toHaveLength(7);
		expect(targets.map((target) => target.pr)).toEqual([1269, 1271, 1278, 1284, 1295, 1298, 1315]);
	});
});
