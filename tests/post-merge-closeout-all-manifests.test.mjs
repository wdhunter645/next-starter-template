import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import {
	ACTIVE_MANIFEST_REGISTRY,
	DEFAULT_MANIFESTS,
	aggregateManifestReports,
	collectShardRerunTargets,
	isResumablePartialFailure,
	loadActiveManifestRegistry,
	persistAggregateRerunTargets,
	resolveCloseoutWorkflowExitCode,
	runAllPostMergeCloseoutManifests,
} from '../scripts/ci/run_post_merge_closeout_all_manifests.mjs';
import { loadCloseoutTargets } from '../scripts/ci/run_batch_post_merge_closeout.mjs';
import { buildRuntimeFailureSignature } from '../scripts/ci/post_merge_remediation_issue.mjs';

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
			'scripts/ci/post-merge-closeout/targets-2039-public-launch-closeout.json',
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

	it('loads Program #1685 audit PR #1981 closeout replay target with remediation exception #2031', () => {
		const { targets } = loadCloseoutTargets(
			'scripts/ci/post-merge-closeout/targets-website-completion-1685-closeout.json',
		);
		expect(targets).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					pr: 1981,
					body_file: 'scripts/ci/post-merge-closeout/pr-1981-body.md',
					merge_sha: '4589576566653f2d9a8ba5d8da6bd3a74c631c06',
					source_issue: 1962,
					remediation_exception: 2031,
				}),
			]),
		);
	});

	it('limits Wave 3a remediation manifest to failed replay targets only', () => {
		const { targets } = loadCloseoutTargets(
			'scripts/ci/post-merge-closeout/targets-ops-burn-down-wave3a-remediation.json',
		);
		expect(targets).toHaveLength(7);
		expect(targets.map((target) => target.pr)).toEqual([1269, 1271, 1278, 1284, 1295, 1298, 1315]);
	});

	it('shares the batch circuit breaker across active manifests', async () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'closeout-all-manifests-breaker-'));
		const bodyFile = path.join(dir, 'body.md');
		fs.writeFileSync(bodyFile, '- **Issue:** #1\n\n## CHANGE SUMMARY\nx\n');
		const manifestA = path.join(dir, 'manifest-a.json');
		const manifestB = path.join(dir, 'manifest-b.json');
		fs.writeFileSync(manifestA, JSON.stringify({ targets: [{ pr: 1, body_file: bodyFile }] }));
		fs.writeFileSync(manifestB, JSON.stringify({ targets: [{ pr: 2, body_file: bodyFile }] }));

		const runtimeSignature = buildRuntimeFailureSignature({
			failureCode: 'closeout_runtime_error',
			message: 'Unknown JSON field: "stateReason"',
		});
		let callCount = 0;
		const runBatchPostMergeCloseout = vi.fn(async ({ batchCircuitBreaker }) => {
			callCount += 1;
			batchCircuitBreaker.record(runtimeSignature);
			batchCircuitBreaker.record(runtimeSignature);
			batchCircuitBreaker.record(runtimeSignature);
			return {
				status: 'partial_failure',
				results: [{ pr: '1', status: 'fail' }],
				circuit_breaker_tripped: {
					tripped: true,
					signature: runtimeSignature,
					suppressed_targets: [],
				},
			};
		});

		const outcome = await runAllPostMergeCloseoutManifests({
			token: 'token',
			repository: 'owner/repo',
			manifestPaths: [manifestA, manifestB],
			runBatchPostMergeCloseoutFn: runBatchPostMergeCloseout,
		});

		expect(callCount).toBe(1);
		expect(outcome.reports).toHaveLength(2);
		expect(outcome.reports[1].results).toEqual([
			expect.objectContaining({ pr: '2', phase: 'circuit_breaker', status: 'skipped' }),
		]);

		fs.rmSync(dir, { recursive: true, force: true });
	});

	it('aggregates shard reports into combined status', () => {
		const combined = aggregateManifestReports([
			{ status: 'success', results: [{ pr: '1', status: 'pass' }] },
			{ status: 'partial_failure', results: [{ pr: '2', status: 'fail' }, { pr: '3', status: 'pass' }] },
		]);
		expect(combined).toMatchObject({
			status: 'partial_failure',
			manifest_count: 2,
			results: expect.arrayContaining([
				expect.objectContaining({ pr: '1', status: 'pass' }),
				expect.objectContaining({ pr: '2', status: 'fail' }),
			]),
		});
	});

	it('treats rate-limit partial_failure with rerun queue as workflow-success', () => {
		const reports = [
			{
				status: 'partial_failure',
				results: [{ pr: '1', status: 'fail', phase: 'rate_limit' }, { pr: '2', status: 'queued', phase: 'rate_limit_rerun' }],
				rerunAppend: { targets: [{ pr: 2, body_file: 'scripts/ci/post-merge-closeout/pr-2-body.md' }] },
			},
		];
		const combined = {
			...aggregateManifestReports(reports),
			rerun_persisted: true,
		};
		expect(isResumablePartialFailure(combined)).toBe(true);
		expect(resolveCloseoutWorkflowExitCode(combined)).toBe(0);
	});

	it('fails resumable partial_failure when rerun queue was not persisted', () => {
		const combined = {
			...aggregateManifestReports([
				{
					status: 'partial_failure',
					results: [{ pr: '1', status: 'fail', phase: 'rate_limit' }],
					rerunAppend: { targets: [{ pr: 1, body_file: 'scripts/ci/post-merge-closeout/pr-1-body.md' }] },
				},
			]),
			rerun_persisted: false,
		};
		expect(isResumablePartialFailure(combined)).toBe(false);
		expect(resolveCloseoutWorkflowExitCode(combined)).toBe(1);
	});

	it('keeps validator partial_failure and circuit breaker trips as workflow-failure', () => {
		const validatorPartial = aggregateManifestReports([
			{ status: 'partial_failure', results: [{ pr: '1', status: 'fail' }, { pr: '2', status: 'pass' }] },
		]);
		expect(isResumablePartialFailure(validatorPartial)).toBe(false);
		expect(resolveCloseoutWorkflowExitCode(validatorPartial)).toBe(1);

		const breakerPartial = aggregateManifestReports([
			{
				status: 'partial_failure',
				results: [{ pr: '1', status: 'fail' }],
				circuit_breaker_tripped: { tripped: true, signature: 'runtime' },
			},
		]);
		expect(resolveCloseoutWorkflowExitCode(breakerPartial)).toBe(1);
	});

	it('fails aggregation when a shard report fails without per-target results', () => {
		const combined = aggregateManifestReports([
			{ status: 'success', results: [{ pr: '1', status: 'pass' }] },
			{
				status: 'failure',
				failed_phase: 'shard',
				results: [],
				error: { phase: 'shard', message: 'missing shard report' },
			},
		]);
		expect(combined).toMatchObject({
			status: 'partial_failure',
			failed_phase: 'shard',
			error: { phase: 'shard', message: 'missing shard report' },
		});
		expect(resolveCloseoutWorkflowExitCode(combined)).toBe(1);
	});

	it('persists aggregate rerun targets into the rerun manifest', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'closeout-aggregate-rerun-'));
		const manifestPath = path.join(dir, 'scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json');
		fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
		fs.writeFileSync(manifestPath, JSON.stringify({ targets: [] }, null, 2));

		const result = persistAggregateRerunTargets([
			{
				status: 'partial_failure',
				results: [{ pr: '42', status: 'fail', phase: 'rate_limit' }],
				rerunAppend: {
					targets: [{
						pr: 42,
						body_file: 'scripts/ci/post-merge-closeout/pr-42-body.md',
						merge_sha: 'abc',
						source_issue: 41,
					}],
				},
			},
		], { workspace: dir });

		expect(result.changed).toBe(true);
		expect(collectShardRerunTargets([
			{
				results: [{ pr: '42', status: 'fail', phase: 'rate_limit' }],
				rerunAppend: { targets: [{ pr: 42, body_file: 'scripts/ci/post-merge-closeout/pr-42-body.md' }] },
			},
		])).toHaveLength(1);
		const persisted = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
		expect(persisted.targets).toEqual(
			expect.arrayContaining([expect.objectContaining({ pr: 42 })]),
		);

		fs.rmSync(dir, { recursive: true, force: true });
	});

	it('does not treat mixed rate-limit and validator partial_failure as resumable', () => {
		const combined = {
			...aggregateManifestReports([
				{
					status: 'partial_failure',
					results: [{ pr: '1', status: 'fail', phase: 'rate_limit' }, { pr: '2', status: 'queued', phase: 'rate_limit_rerun' }],
					rerunAppend: { targets: [{ pr: 2, body_file: 'scripts/ci/post-merge-closeout/pr-2-body.md' }] },
				},
				{
					status: 'partial_failure',
					results: [{ pr: '3', status: 'fail', phase: 'validation' }, { pr: '4', status: 'pass' }],
				},
			]),
			rerun_persisted: true,
		};
		expect(isResumablePartialFailure(combined)).toBe(false);
		expect(resolveCloseoutWorkflowExitCode(combined)).toBe(1);
	});
});
