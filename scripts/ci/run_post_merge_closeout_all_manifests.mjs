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
} from './run_batch_post_merge_closeout.mjs';

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
