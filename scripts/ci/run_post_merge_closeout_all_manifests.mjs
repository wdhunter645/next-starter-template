#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
	BATCH_CLOSEOUT_REPORT_PATH,
	loadCloseoutTargets,
	runBatchPostMergeCloseout,
	writeBatchCloseoutReport,
	buildBatchCloseoutReport,
	buildCircuitBreakerSkippedResult,
} from './run_batch_post_merge_closeout.mjs';
import { appendCloseoutRerunTargets } from './append_closeout_rerun_targets.mjs';
import { BatchCircuitBreakerState } from './post_merge_remediation_issue.mjs';

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const ACTIVE_MANIFEST_REGISTRY = 'scripts/ci/post-merge-closeout/targets-active.json';

export function loadActiveManifestRegistry(
	registryPath = ACTIVE_MANIFEST_REGISTRY,
	workspace = REPOSITORY_ROOT,
) {
	const resolved = path.resolve(workspace, registryPath);
	const payload = JSON.parse(fs.readFileSync(resolved, 'utf8'));
	const manifests = Array.isArray(payload) ? payload : payload?.manifests;
	if (!Array.isArray(manifests)) {
		throw new Error(`Active manifest registry must include a manifests array: ${resolved}`);
	}

	return {
		registryPath: resolved,
		manifests: manifests.map((entry) => String(entry).replace(/\\/g, '/').replace(/^\.\//, '')),
		archivedManifests: Array.isArray(payload?.archived_manifests)
			? payload.archived_manifests.map((entry) => String(entry).replace(/\\/g, '/').replace(/^\.\//, ''))
			: [],
	};
}

export const DEFAULT_MANIFESTS = loadActiveManifestRegistry().manifests;

export function aggregateManifestReports(reports = []) {
	const combinedResults = reports.flatMap((report) => report.results || []);
	const reportStatuses = reports.map((report) => report.status || 'success');
	let status = 'success';

	if (reportStatuses.includes('partial_failure')) {
		status = 'partial_failure';
	} else if (reportStatuses.includes('failure')) {
		status = reportStatuses.includes('success') ? 'partial_failure' : 'failure';
	} else {
		const failed = combinedResults.filter((entry) => entry.status === 'fail' || entry.status === 'error');
		if (failed.length > 0) {
			status = failed.length === combinedResults.length ? 'failure' : 'partial_failure';
		}
	}

	const firstErrorReport = reports.find((report) => report.error || report.failed_phase);

	return {
		status,
		manifest_count: reports.length,
		reports,
		results: combinedResults,
		error: firstErrorReport?.error || null,
		failed_phase: firstErrorReport?.failed_phase || null,
	};
}

export function collectShardRerunTargets(reports = []) {
	const targets = [];
	for (const report of reports) {
		const append = report.rerunAppend;
		if (!append?.targets?.length) continue;
		const hasRateLimitSignal = (report.results || []).some((entry) =>
			entry.phase === 'rate_limit'
			|| entry.phase === 'rate_limit_rerun'
			|| entry.status === 'queued',
		);
		if (!hasRateLimitSignal) continue;
		if (Array.isArray(append.added) && append.added.length > 0) {
			const added = new Set(append.added.map(String));
			targets.push(...append.targets.filter((target) => added.has(String(target.pr))));
			continue;
		}
		targets.push(...append.targets);
	}
	return targets;
}

export function persistAggregateRerunTargets(reports = [], {
	workspace = REPOSITORY_ROOT,
	dryRun = false,
} = {}) {
	const incoming = collectShardRerunTargets(reports);
	if (!incoming.length) {
		return { persisted: true, changed: false, targets: [], added: [] };
	}
	const result = appendCloseoutRerunTargets({ targets: incoming, workspace, dryRun });
	return {
		persisted: true,
		changed: Boolean(result.changed),
		targets: result.targets,
		added: result.added,
		manifest_path: result.manifestPath,
	};
}

export function isResumablePartialFailure(combined = {}) {
	if (combined.status !== 'partial_failure') return false;
	if (combined.error || combined.failed_phase === 'setup' || combined.failed_phase === 'shard') return false;
	const reportList = combined.reports || [];
	if (reportList.some((report) => report.circuit_breaker_tripped?.tripped)) return false;
	if (reportList.some((report) => report.status === 'failure')) return false;
	const needsRerunPersist = collectShardRerunTargets(reportList).length > 0;
	if (needsRerunPersist && combined.rerun_persisted !== true) return false;
	if (!reportList.some((report) => (report.rerunAppend?.targets || []).length > 0)) return false;

	const nonRateLimitFailures = (combined.results || []).filter((entry) =>
		(entry.status === 'fail' || entry.status === 'error')
		&& !['rate_limit', 'rate_limit_rerun'].includes(entry.phase),
	);
	return nonRateLimitFailures.length === 0;
}

export function resolveCloseoutWorkflowExitCode(combined = {}) {
	if (combined.status === 'success') return 0;
	if (isResumablePartialFailure(combined)) return 0;
	return 1;
}

export function loadAggregateShardReports(directory, workspace = REPOSITORY_ROOT) {
	if (!directory) return [];
	const resolved = path.resolve(workspace, directory);
	if (!fs.existsSync(resolved)) return [];
	return fs.readdirSync(resolved)
		.filter((name) => name.endsWith('.json'))
		.sort()
		.map((name) => {
			const filePath = path.join(resolved, name);
			try {
				const content = fs.readFileSync(filePath, 'utf8').trim();
				if (!content) {
					return {
						status: 'failure',
						failed_phase: 'shard',
						results: [],
						error: { phase: 'shard', message: `empty shard report: ${name}` },
					};
				}
				return JSON.parse(content);
			} catch (error) {
				return {
					status: 'failure',
					failed_phase: 'shard',
					results: [],
					error: {
						phase: 'shard',
						message: error instanceof Error ? error.message : String(error),
					},
				};
			}
		});
}

export function parseManifestList(value = '') {
	return String(value || '')
		.split(',')
		.map((entry) => entry.trim())
		.filter(Boolean);
}

export async function runAllPostMergeCloseoutManifests({
	token,
	repository,
	manifestPaths = DEFAULT_MANIFESTS,
	runId = '',
	dryRun = false,
	batchCircuitBreaker = new BatchCircuitBreakerState(),
	runBatchPostMergeCloseoutFn = runBatchPostMergeCloseout,
} = {}) {
	const reports = [];

	for (const manifestPath of manifestPaths) {
		const { manifestPath: resolved, targets } = loadCloseoutTargets(manifestPath);
		if (batchCircuitBreaker.tripped) {
			reports.push(
				buildBatchCloseoutReport({
					manifestPath: resolved,
					targets,
					results: targets.map((target) => buildCircuitBreakerSkippedResult({
						prNumber: target.pr,
						signature: batchCircuitBreaker.tripDetails?.signature,
					})),
					circuitBreakerTripped: {
						tripped: true,
						signature: batchCircuitBreaker.tripDetails?.signature,
						suppressed_targets: targets.map((target) => String(target.pr)),
					},
					dryRun,
				}),
			);
			continue;
		}
		if (targets.length === 0) {
			reports.push(
				buildBatchCloseoutReport({
					manifestPath: resolved,
					targets: [],
					results: [],
					dryRun,
				}),
			);
			continue;
		}
		const report = await runBatchPostMergeCloseoutFn({
			token,
			repository,
			targets,
			manifestPath: resolved,
			runId,
			dryRun,
			batchCircuitBreaker,
		});
		reports.push(report);
	}

	return aggregateManifestReports(reports);
}

export async function main() {
	const aggregateDir = process.env.CLOSEOUT_AGGREGATE_DIR || '';
	if (aggregateDir) {
		const dryRun = ['1', 'true', 'yes'].includes(String(process.env.DRY_RUN || '').toLowerCase());
		const reports = loadAggregateShardReports(aggregateDir);
		const rerunPersist = persistAggregateRerunTargets(reports, { dryRun });
		const combined = {
			...aggregateManifestReports(reports),
			rerun_persisted: rerunPersist.persisted,
			rerun_manifest_changed: rerunPersist.changed,
			rerun_persist: rerunPersist,
		};
		writeBatchCloseoutReport(combined, BATCH_CLOSEOUT_REPORT_PATH);
		console.log(JSON.stringify(combined, null, 2));
		if (process.env.GITHUB_OUTPUT && rerunPersist.changed) {
			fs.appendFileSync(process.env.GITHUB_OUTPUT, 'rerun_manifest_changed=true\n');
		}
		process.exitCode = resolveCloseoutWorkflowExitCode(combined);
		return;
	}

	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
	const repository = process.env.GITHUB_REPOSITORY;
	const dryRun = ['1', 'true', 'yes'].includes(String(process.env.DRY_RUN || '').toLowerCase());
	const manifestList = parseManifestList(process.env.CLOSEOUT_MANIFESTS || '');
	const manifestPaths = manifestList.length > 0 ? manifestList : DEFAULT_MANIFESTS;

	let combined = buildBatchCloseoutReport({ manifestPath: manifestPaths.join(','), dryRun });

	try {
		if (!token || !repository) {
			throw new Error('GITHUB_TOKEN/GH_TOKEN and GITHUB_REPOSITORY are required.');
		}

		combined = await runAllPostMergeCloseoutManifests({
			token,
			repository,
			manifestPaths,
			runId: process.env.GITHUB_RUN_ID || '',
			dryRun,
		});
	} catch (error) {
		console.error(error);
		combined = buildBatchCloseoutReport({
			manifestPath: manifestPaths.join(','),
			error,
			failedPhase: 'setup',
		});
		process.exitCode = 1;
	} finally {
		writeBatchCloseoutReport(combined, BATCH_CLOSEOUT_REPORT_PATH);
		console.log(JSON.stringify(combined, null, 2));
	}

	process.exitCode = resolveCloseoutWorkflowExitCode(combined);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main();
}
