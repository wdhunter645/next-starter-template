#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { loadCloseoutTargets } from './run_batch_post_merge_closeout.mjs';
import { RERUN_MANIFEST } from './resolve_closeout_manifests_from_push.mjs';

export { RERUN_MANIFEST };

export function normalizeCloseoutTarget(target = {}) {
	const pr = Number(target.pr);
	if (!Number.isFinite(pr) || pr <= 0) {
		throw new Error(`Closeout rerun target requires a numeric pr: ${JSON.stringify(target)}`);
	}
	if (!target.body_file) {
		throw new Error(`Closeout rerun target requires body_file: ${JSON.stringify(target)}`);
	}

	const bodyFile = String(target.body_file).replace(/\\/g, '/').replace(/^\.\//, '');
	const normalized = {
		pr,
		body_file: bodyFile,
	};
	if (target.merge_sha) normalized.merge_sha = String(target.merge_sha);
	if (target.source_issue) normalized.source_issue = Number(target.source_issue);
	if (target.skip_body_apply === true) normalized.skip_body_apply = true;
	return normalized;
}

export function targetIdentity(target = {}) {
	return String(normalizeCloseoutTarget(target).pr);
}

export function mergeRerunTargets(existingTargets = [], incomingTargets = []) {
	const merged = new Map();
	for (const target of existingTargets) {
		const normalized = normalizeCloseoutTarget(target);
		merged.set(targetIdentity(normalized), normalized);
	}
	for (const target of incomingTargets) {
		const normalized = normalizeCloseoutTarget(target);
		const key = targetIdentity(normalized);
		merged.set(key, { ...merged.get(key), ...normalized });
	}
	return [...merged.values()].sort((left, right) => left.pr - right.pr);
}

export function readRerunManifest(manifestPath = RERUN_MANIFEST, workspace = process.cwd()) {
	const resolved = path.resolve(workspace, manifestPath);
	if (!fs.existsSync(resolved)) {
		return { manifestPath: resolved, payload: { targets: [] }, targets: [] };
	}

	const payload = JSON.parse(fs.readFileSync(resolved, 'utf8'));
	const targets = Array.isArray(payload) ? payload : payload?.targets;
	if (!Array.isArray(targets)) {
		throw new Error(`Closeout rerun manifest must include a targets array: ${resolved}`);
	}
	return { manifestPath: resolved, payload: Array.isArray(payload) ? { targets } : payload, targets };
}

export function buildRerunManifestPayload({
	existingPayload = {},
	targets = [],
	description = '',
	triggeredAt = new Date().toISOString(),
} = {}) {
	return {
		...existingPayload,
		triggered_at: triggeredAt,
		...(description ? { description } : {}),
		targets,
	};
}

export function appendCloseoutRerunTargets({
	manifestPath = RERUN_MANIFEST,
	targets = [],
	workspace = process.cwd(),
	description = 'Rate-limited closeout targets queued for rerun.',
	triggeredAt = new Date().toISOString(),
	dryRun = false,
} = {}) {
	if (!targets.length) {
		return { manifestPath: path.resolve(workspace, manifestPath), added: [], targets: [], changed: false };
	}

	const { manifestPath: resolved, payload, targets: existingTargets } = readRerunManifest(manifestPath, workspace);
	const mergedTargets = mergeRerunTargets(existingTargets, targets);
	const added = targets
		.map((target) => targetIdentity(target))
		.filter((identity, index, identities) => identities.indexOf(identity) === index)
		.filter((identity) => !existingTargets.some((entry) => targetIdentity(entry) === identity));

	const nextPayload = buildRerunManifestPayload({
		existingPayload: payload,
		targets: mergedTargets,
		description,
		triggeredAt,
	});

	if (!dryRun) {
		fs.mkdirSync(path.dirname(resolved), { recursive: true });
		fs.writeFileSync(resolved, `${JSON.stringify(nextPayload, null, 2)}\n`);
	}

	return {
		manifestPath: resolved,
		added,
		targets: mergedTargets,
		changed: mergedTargets.length !== existingTargets.length || added.length > 0,
	};
}

export function toRerunTargetFromBatchTarget(target = {}, repositoryRoot = process.cwd()) {
	const bodyFile = path.isAbsolute(target.body_file)
		? path.relative(repositoryRoot, target.body_file).replace(/\\/g, '/')
		: String(target.body_file).replace(/\\/g, '/').replace(/^\.\//, '');

	return normalizeCloseoutTarget({
		pr: target.pr,
		body_file: bodyFile,
		merge_sha: target.merge_sha,
		source_issue: target.source_issue,
		skip_body_apply: target.skip_body_apply,
	});
}

async function main() {
	const args = process.argv.slice(2);
	const manifestIndex = args.indexOf('--manifest');
	const manifestPath = manifestIndex >= 0 ? args[manifestIndex + 1] : RERUN_MANIFEST;
	const stdinMode = args.includes('--stdin-targets');
	const dryRun = args.includes('--dry-run');

	let targets = [];
	if (stdinMode) {
		const input = fs.readFileSync(0, 'utf8').trim();
		targets = input ? JSON.parse(input) : [];
	} else {
		const pathsIndex = args.indexOf('--targets');
		if (pathsIndex < 0) {
			throw new Error('Provide --stdin-targets or --targets <json>');
		}
		targets = JSON.parse(args[pathsIndex + 1] || '[]');
	}

	const result = appendCloseoutRerunTargets({
		manifestPath,
		targets,
		dryRun,
	});
	console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((error) => {
		console.error(error.message);
		process.exitCode = 1;
	});
}
