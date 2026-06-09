#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { closeDuplicateRemediationIssues } from './close_duplicate_remediation_issues.mjs';
import { runPostMergeCloseout } from './run_post_merge_closeout.mjs';
import { WORKFLOW_RUN_SCOPE_MERGE_ONLY } from './post_merge_validator.mjs';

export const BATCH_CLOSEOUT_REPORT_PATH = 'post-merge-batch-closeout.json';
const DEFAULT_MANIFEST = 'scripts/ci/post-merge-closeout/targets.json';
const POST_MERGE_RESULT_PATH = 'post-merge-result.json';

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

export function buildFailureReason(detail = {}) {
	const buckets = [
		['metadata', detail.metadata_failures],
		['implementation', detail.implementation_failures],
		['diataxis', detail.diataxis_failures],
		['reviewer', detail.reviewer_findings],
		['workflow', detail.workflow_failures],
	];
	const parts = [];
	for (const [label, failures] of buckets) {
		for (const failure of failures || []) {
			const code =
				label === 'workflow'
					? failure?.workflow || failure?.code || 'unknown'
					: failure?.code || failure?.reviewer || 'unknown';
			parts.push(`${label}:${code}`);
		}
	}
	if (parts.length === 0 && detail.status === 'fail') {
		return 'post_merge_validation_failed';
	}
	return parts.join('; ') || null;
}

export function summarizeTargetResult({ prNumber, result = {}, detail = {}, phase = 'closeout', error = null } = {}) {
	if (error) {
		return {
			pr: prNumber,
			status: 'error',
			phase,
			failure_reason: error instanceof Error ? error.message : String(error),
		};
	}

	const failureReason = result.status === 'fail' ? buildFailureReason(detail) : null;

	return {
		pr: prNumber,
		status: result.status,
		phase: result.status === 'fail' ? 'validation' : phase,
		failure_reason: failureReason,
		sync_action: result.sync_action,
		source_issue: result.source_issue,
		remediation_required: result.remediation_required,
		metadata_failures: detail.metadata_failures || [],
		implementation_failures: detail.implementation_failures || [],
		diataxis_failures: detail.diataxis_failures || [],
		reviewer_findings: detail.reviewer_findings || [],
		workflow_failures: detail.workflow_failures || [],
	};
}

export function buildBatchCloseoutReport({
	manifestPath = DEFAULT_MANIFEST,
	targets = [],
	results = [],
	duplicateClose = {},
	dryRun = false,
	error = null,
	failedPhase = null,
} = {}) {
	const failed = results.filter((entry) => entry.status === 'fail' || entry.status === 'error');
	let status = 'success';
	if (error) status = 'failure';
	else if (failed.length > 0) status = failed.length === results.length ? 'failure' : 'partial_failure';

	return {
		status,
		generated_at: new Date().toISOString(),
		manifest_path: manifestPath,
		dry_run: dryRun,
		failed_phase: failedPhase,
		error: error
			? {
					phase: failedPhase,
					message: error instanceof Error ? error.message : String(error),
				}
			: null,
		target_count: targets.length,
		results,
		duplicateClose,
	};
}

export function writeBatchCloseoutReport(report, reportPath = BATCH_CLOSEOUT_REPORT_PATH) {
	fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

function readPostMergeResultDetail() {
	if (!fs.existsSync(POST_MERGE_RESULT_PATH)) return {};
	try {
		return JSON.parse(fs.readFileSync(POST_MERGE_RESULT_PATH, 'utf8'));
	} catch {
		return {};
	}
}

export async function runBatchPostMergeCloseout({
	token,
	repository,
	targets,
	manifestPath = DEFAULT_MANIFEST,
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
			results.push(
				summarizeTargetResult({
					prNumber,
					phase: 'preflight',
					error: new Error(`Closeout body file not found: ${bodyFile}`),
				}),
			);
			continue;
		}

		if (dryRun) {
			results.push({
				pr: prNumber,
				body_file: bodyFile,
				phase: 'dry_run',
				status: 'dry_run',
				failure_reason: null,
			});
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
				skipBodyApply: target.skip_body_apply === true,
				workflowRunScope: WORKFLOW_RUN_SCOPE_MERGE_ONLY,
			});
			const detail = readPostMergeResultDetail();
			results.push(
				summarizeTargetResult({
					prNumber,
					result,
					detail,
					phase: 'closeout',
				}),
			);
		} catch (error) {
			console.error(`Post-merge closeout failed for PR #${prNumber}:`, error);
			results.push(
				summarizeTargetResult({
					prNumber,
					phase: 'closeout',
					error,
				}),
			);
		}
	}

	let duplicateClose = { closed: [] };
	if (!dryRun) {
		duplicateClose = await closeDuplicateRemediationIssuesFn({ token, repository, dryRun: false });
	}

	return buildBatchCloseoutReport({
		manifestPath,
		targets,
		results,
		duplicateClose,
		dryRun,
	});
}

export async function main() {
	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
	const repository = process.env.GITHUB_REPOSITORY;
	const manifestPath = process.env.CLOSEOUT_MANIFEST || DEFAULT_MANIFEST;
	const dryRun = ['1', 'true', 'yes'].includes(String(process.env.DRY_RUN || '').toLowerCase());

	let report = buildBatchCloseoutReport({ manifestPath, dryRun });

	try {
		if (!token || !repository) {
			throw new Error('GITHUB_TOKEN/GH_TOKEN and GITHUB_REPOSITORY are required.');
		}

		const { manifestPath: resolvedManifest, targets } = loadCloseoutTargets(manifestPath);
		report = await runBatchPostMergeCloseout({
			token,
			repository,
			targets,
			manifestPath: resolvedManifest,
			runId: process.env.GITHUB_RUN_ID || '',
			dryRun,
		});
	} catch (error) {
		console.error(error);
		report = buildBatchCloseoutReport({
			manifestPath,
			error,
			failedPhase: 'setup',
		});
		process.exitCode = 1;
	} finally {
		writeBatchCloseoutReport(report);
		console.log(JSON.stringify(report, null, 2));
	}

	const failed = report.results?.filter((entry) => entry.status === 'fail' || entry.status === 'error') || [];
	if (report.status !== 'success' || failed.length > 0) {
		process.exitCode = 1;
	}
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main();
}
