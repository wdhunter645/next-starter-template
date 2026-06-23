#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { DEFAULT_MANIFESTS } from './run_post_merge_closeout_all_manifests.mjs';
import { loadCloseoutTargets } from './run_batch_post_merge_closeout.mjs';

export const RERUN_MANIFEST = 'scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json';

export function normalizeRepoPath(entry = '') {
	return String(entry || '').replace(/\\/g, '/').replace(/^\.\//, '').trim();
}

export function manifestHasTargets(manifestPath, workspace = process.cwd()) {
	const resolved = path.resolve(workspace, manifestPath);
	if (!fs.existsSync(resolved)) {
		return false;
	}
	const { targets } = loadCloseoutTargets(resolved);
	return targets.length > 0;
}

/**
 * Resolve which closeout manifests to replay for a push that touched manifest files.
 * Replays only changed manifests plus the rerun manifest when it has pending targets.
 */
export function resolveCloseoutManifestsFromPush({
	changedPaths = [],
	knownManifests = DEFAULT_MANIFESTS,
	workspace = process.cwd(),
	includeRerunWhenPopulated = true,
} = {}) {
	const changed = new Set(changedPaths.map(normalizeRepoPath));
	const resolved = [];
	const normalizedRerun = normalizeRepoPath(RERUN_MANIFEST);

	for (const manifestPath of knownManifests) {
		if (changed.has(normalizeRepoPath(manifestPath))) {
			resolved.push(manifestPath);
		}
	}

	if (
		includeRerunWhenPopulated &&
		!resolved.some((entry) => normalizeRepoPath(entry) === normalizedRerun) &&
		manifestHasTargets(RERUN_MANIFEST, workspace)
	) {
		resolved.unshift(RERUN_MANIFEST);
	}

	return resolved;
}

export function formatManifestList(manifestPaths = []) {
	return manifestPaths.join(',');
}

export function parseManifestList(value = '') {
	return String(value || '')
		.split(',')
		.map((entry) => entry.trim())
		.filter(Boolean);
}

export async function main() {
	const args = process.argv.slice(2);
	let changedPaths = [];

	if (args.includes('--stdin-paths')) {
		const input = fs.readFileSync(0, 'utf8');
		changedPaths = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
	} else if (args.includes('--paths')) {
		const index = args.indexOf('--paths');
		changedPaths = parseManifestList(args[index + 1] || '');
	} else {
		const envPaths = process.env.CHANGED_PATHS || '';
		changedPaths = envPaths.includes('\n')
			? envPaths.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
			: parseManifestList(envPaths);
	}

	const resolved = resolveCloseoutManifestsFromPush({ changedPaths });
	if (resolved.length === 0) {
		console.error('No closeout manifests resolved from changed paths:', changedPaths.join(', ') || '(none)');
		process.exitCode = 1;
		return;
	}

	const formatted = formatManifestList(resolved);
	if (process.env.GITHUB_OUTPUT) {
		fs.appendFileSync(process.env.GITHUB_OUTPUT, `closeout_manifests=${formatted}\n`);
	}
	console.log(formatted);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main();
}
