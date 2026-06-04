#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { closeDuplicateRemediationIssues } from './close_duplicate_remediation_issues.mjs';
import { runPostMergeCloseout } from './run_post_merge_closeout.mjs';
import { WORKFLOW_RUN_SCOPE_MERGE_ONLY } from './post_merge_validator.mjs';

const DEFAULT_MANIFEST = 'scripts/ci/post-merge-closeout/targets.json';

export function loadCloseoutTargets(manifestPath = DEFAULT_MANIFEST) {
	const resolved = path.resolve(manifestPath);
	const raw = JSON.parse(fs.readFileSync(resolved, 'utf8'));
	const targets = Array.isArray(raw) ? raw : raw?.targets;
	if (!Array.isArray(targets) || targets.length === 0) {
		throw new Error(`Closeout manifest must include a non-empty targets array: ${resolved}`);
	}
	for (const target of targets) {
		if (!target?.pr || !target?.body_file) {
			throw new Error(`Each closeout target requires pr and body_file: ${JSON.stringify(target)}`);
		}
	}
	return { manifestPath: resolved, targets };
}

export async function runBatchPostMergeCloseout({
	token,
	repository,
	targets,
	runId = '',
	dryRun = false,
	runPostMergeCloseoutFn = runPostMergeCloseout,
	closeDuplicateRemediationIssuesFn = closeDuplicateRemediationIssues,
}) {
	const results = [];

	for (const target of targets) {
		const prNumber = String(target.pr);
		const bodyFile = path.resolve(target.body_file);
		if (!fs.existsSync(bodyFile)) {
			throw new Error(`Closeout body file not found for PR #${prNumber}: ${bodyFile}`);
		}

		if (dryRun) {
			results.push({ pr: prNumber, body_file: bodyFile, dry_run: true });
			continue;
		}

		try {
			const result = await runPostMergeCloseoutFn({
				token,
				repository,
				prNumber,
				bodyFile,
				sha: target.merge_sha || '',
				runId,
				skipBodyApply: false,
				workflowRunScope: WORKFLOW_RUN_SCOPE_MERGE_ONLY,
			});

			results.push({
				pr: prNumber,
				status: result.status,
				sync_action: result.sync_action,
				source_issue: result.source_issue,
				remediation_required: result.remediation_required,
			});
		} catch (error) {
			console.error(`Post-merge closeout failed for PR #${prNumber}:`, error);
			results.push({
				pr: prNumber,
				status: 'error',
				message: error instanceof Error ? error.message : String(error),
			});
		}
	}

	let duplicateClose = { closed: [] };
	if (!dryRun) {
		duplicateClose = await closeDuplicateRemediationIssuesFn({ token, repository, dryRun: false });
	}

	return { results, duplicateClose };
}

export async function main() {
	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
	const repository = process.env.GITHUB_REPOSITORY;
	const manifestPath = process.env.CLOSEOUT_MANIFEST || DEFAULT_MANIFEST;
	const dryRun = ['1', 'true', 'yes'].includes(String(process.env.DRY_RUN || '').toLowerCase());

	if (!token || !repository) {
		throw new Error('GITHUB_TOKEN/GH_TOKEN and GITHUB_REPOSITORY are required.');
	}

	const { targets } = loadCloseoutTargets(manifestPath);
	const outcome = await runBatchPostMergeCloseout({
		token,
		repository,
		targets,
		runId: process.env.GITHUB_RUN_ID || '',
		dryRun,
	});

	fs.writeFileSync('post-merge-batch-closeout.json', `${JSON.stringify(outcome, null, 2)}\n`);
	console.log(JSON.stringify(outcome, null, 2));

	const failed = outcome.results.filter((entry) => entry.status === 'fail' || entry.status === 'error');
	if (failed.length > 0) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((error) => {
		console.error(error);
		process.exit(1);
	});
}
