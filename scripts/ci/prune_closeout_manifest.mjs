#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function normalizeCloseoutPr(value) {
	return String(value ?? '').trim();
}

export function successfulCloseoutPrs(report = {}) {
	const results = Array.isArray(report?.results) ? report.results : [];
	return new Set(
		results
			.filter((entry) => entry?.status === 'pass' && entry?.sync_action === 'post_merge_success')
			.map((entry) => normalizeCloseoutPr(entry.pr))
			.filter(Boolean),
	);
}

export function pruneCloseoutManifestContent(content, successfulPrs = new Set()) {
	const manifest = JSON.parse(content);
	const targets = Array.isArray(manifest) ? manifest : manifest?.targets;
	if (!Array.isArray(targets)) {
		throw new Error('Closeout manifest must include a targets array.');
	}

	const nextTargets = targets.filter((target) => !successfulPrs.has(normalizeCloseoutPr(target?.pr)));
	const pruned = targets.length - nextTargets.length;
	const nextManifest = Array.isArray(manifest) ? nextTargets : { ...manifest, targets: nextTargets };

	return {
		content: `${JSON.stringify(nextManifest, null, 2)}\n`,
		pruned,
		remaining: nextTargets.length,
	};
}

export function pruneCloseoutManifest(manifestPath, successfulPrs = new Set(), { dryRun = false } = {}) {
	const resolved = path.resolve(manifestPath);
	const current = fs.readFileSync(resolved, 'utf8');
	const result = pruneCloseoutManifestContent(current, successfulPrs);
	if (!dryRun && result.pruned > 0) {
		fs.writeFileSync(resolved, result.content);
	}
	return { manifestPath: resolved, ...result };
}

export function isPruneEligibleReportStatus(status = '') {
	return status === 'success' || status === 'partial_failure';
}

export function pruneCloseoutManifestFromReport({ manifestPath, report, dryRun = false } = {}) {
	const resolved = path.resolve(manifestPath);
	if (!isPruneEligibleReportStatus(report?.status)) {
		return { manifestPath: resolved, pruned: 0, remaining: null, skipped: 'report_not_prune_eligible' };
	}
	const successfulPrs = successfulCloseoutPrs(report);
	if (successfulPrs.size === 0) {
		return { manifestPath: resolved, pruned: 0, remaining: null, skipped: 'no_successful_closeouts' };
	}
	return pruneCloseoutManifest(resolved, successfulPrs, { dryRun });
}

export async function main() {
	const manifestPath = process.env.CLOSEOUT_MANIFEST;
	const reportPath = process.env.CLOSEOUT_REPORT || 'post-merge-batch-closeout.json';
	const dryRun = ['1', 'true', 'yes'].includes(String(process.env.DRY_RUN || '').toLowerCase());

	if (!manifestPath) {
		throw new Error('CLOSEOUT_MANIFEST is required.');
	}

	const report = JSON.parse(fs.readFileSync(path.resolve(reportPath), 'utf8'));
	const result = pruneCloseoutManifestFromReport({ manifestPath, report, dryRun });
	console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((error) => {
		console.error(error);
		process.exitCode = 1;
	});
}
