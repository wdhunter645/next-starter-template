#!/usr/bin/env node

import { pathToFileURL } from 'node:url';

import {
	BATCH_CLOSEOUT_REPORT_PATH,
	loadCloseoutTargets,
	runBatchPostMergeCloseout,
	writeBatchCloseoutReport,
	buildBatchCloseoutReport,
} from './run_batch_post_merge_closeout.mjs';

export const DEFAULT_MANIFESTS = [
	'scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json',
	'scripts/ci/post-merge-closeout/targets-ci-pending.json',
	'scripts/ci/post-merge-closeout/targets-remediation-backlog.json',
	'scripts/ci/post-merge-closeout/targets-ops-burn-down-wave1.json',
	'scripts/ci/post-merge-closeout/targets-ops-burn-down-wave2.json',
	'scripts/ci/post-merge-closeout/targets-ops-burn-down-wave3a-remediation.json',
	'scripts/ci/post-merge-closeout/targets-ops-burn-down-wave3b.json',
	'scripts/ci/post-merge-closeout/targets-website-completion-1685-closeout.json',
];

export async function runAllPostMergeCloseoutManifests({
	token,
	repository,
	manifestPaths = DEFAULT_MANIFESTS,
	runId = '',
	dryRun = false,
}) {
	const reports = [];

	for (const manifestPath of manifestPaths) {
		const { manifestPath: resolved, targets } = loadCloseoutTargets(manifestPath);
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
		const report = await runBatchPostMergeCloseout({
			token,
			repository,
			targets,
			manifestPath: resolved,
			runId,
			dryRun,
		});
		reports.push(report);
	}

	const combinedResults = reports.flatMap((report) => report.results || []);
	const failed = combinedResults.filter((entry) => entry.status === 'fail' || entry.status === 'error');
	const status = failed.length === 0 ? 'success' : failed.length === combinedResults.length ? 'failure' : 'partial_failure';

	return {
		status,
		manifest_count: manifestPaths.length,
		reports,
		results: combinedResults,
	};
}

export async function main() {
	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
	const repository = process.env.GITHUB_REPOSITORY;
	const dryRun = ['1', 'true', 'yes'].includes(String(process.env.DRY_RUN || '').toLowerCase());
	const manifestList = (process.env.CLOSEOUT_MANIFESTS || '')
		.split(',')
		.map((entry) => entry.trim())
		.filter(Boolean);
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

	if (combined.status !== 'success') {
		process.exitCode = 1;
	}
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main();
}
