#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
	resolveMaterializerAuthorization,
	resolveWorkflowManifestSelection,
} from './lib/workflow-policy.mjs';

function parseNameStatus(raw = '') {
	const changes = [];
	for (const line of String(raw).split(/\r?\n/)) {
		if (!line.trim()) continue;
		const fields = line.split('\t');
		const status = fields[0] || '';
		if (status.startsWith('R') || status.startsWith('C')) {
			if (fields[1]) changes.push({ status: 'D', path: fields[1] });
			if (fields[2]) changes.push({ status: 'A', path: fields[2] });
			continue;
		}
		if (fields[1]) changes.push({ status, path: fields[1] });
	}
	return changes;
}

function gitChangedFiles({ eventName, beforeSha, baseSha, headSha }) {
	if (eventName === 'workflow_dispatch') return [];
	if (eventName === 'push' && /^0{40}$/.test(beforeSha || '')) return [];

	const base = eventName === 'push' ? beforeSha : baseSha;
	const head = headSha;
	if (!base || !head) {
		throw new Error(`Missing git comparison SHA for ${eventName}`);
	}

	const raw = execFileSync(
		'git',
		[
			'diff',
			'--name-status',
			'--find-renames',
			base,
			head,
			'--',
			'docs/ops/implementation-plans',
		],
		{ encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 },
	);
	return parseNameStatus(raw);
}

function appendOutput(name, value) {
	const outputPath = process.env.GITHUB_OUTPUT;
	if (!outputPath) return;
	fs.appendFileSync(outputPath, `${name}=${value}\n`);
}

function main() {
	const eventName = process.env.EVENT_NAME || '';
	const mode = process.env.INPUT_MODE || 'dry-run';
	const explicitApplyAuthorized =
		String(process.env.AUTHORIZE_APPLY || '').toLowerCase() === 'true';
	const isFork = String(process.env.IS_FORK || '').toLowerCase() === 'true';

	const authorization = resolveMaterializerAuthorization({
		eventName,
		mode,
		repository: process.env.REPOSITORY,
		headRepository: process.env.HEAD_REPOSITORY,
		pullRequest: { head: { repo: { fork: isFork } } },
		explicitApplyAuthorized,
	});

	if (mode === 'apply' && !authorization.allowed) {
		throw new Error(`Apply mode refused: ${authorization.reason}`);
	}

	const changedFiles = gitChangedFiles({
		eventName,
		beforeSha: process.env.BEFORE_SHA || '',
		baseSha: process.env.BASE_SHA || '',
		headSha: process.env.HEAD_SHA || '',
	});

	const selection = resolveWorkflowManifestSelection({
		eventName,
		explicitManifestPath: process.env.MANIFEST_PATH_INPUT || '',
		changedFiles,
		beforeSha: process.env.BEFORE_SHA || '',
	});

	const report = {
		eventName,
		requestedMode: mode,
		effectiveMode: authorization.effectiveMode,
		authorizationReason: authorization.reason,
		selection,
		changedFiles,
	};

	process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

	appendOutput('effective_mode', authorization.effectiveMode);
	appendOutput('auth_reason', authorization.reason);
	appendOutput('allowed', String(authorization.allowed));
	appendOutput('selection_reason', selection.reason);
	appendOutput('skip', String(selection.skip));
	appendOutput('manifest_count', String(selection.paths.length));
	appendOutput('manifest_paths_json', JSON.stringify(selection.paths));
	appendOutput('deleted_paths_json', JSON.stringify(selection.deletedPaths));

	if (!selection.ok) process.exit(1);
}

const isDirect =
	process.argv[1] &&
	import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirect) {
	try {
		main();
	} catch (error) {
		process.stderr.write(`${error.stack || error.message}\n`);
		process.exit(1);
	}
}

export { gitChangedFiles, main, parseNameStatus };
