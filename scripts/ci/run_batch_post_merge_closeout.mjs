#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { closeDuplicateRemediationIssues } from './close_duplicate_remediation_issues.mjs';
import { runPostMergeCloseout } from './run_post_merge_closeout.mjs';
import { WORKFLOW_RUN_SCOPE_MERGE_ONLY } from './post_merge_validator.mjs';
import { pruneCloseoutManifestFromReport, isPruneEligibleReportStatus } from './prune_closeout_manifest.mjs';
import { isGitHubRateLimitError } from './github_issue_api.mjs';
import {
	BatchCircuitBreakerState,
	batchCircuitBreakerDedupeKey,
	buildRuntimeFailureSignature,
	extractCloseoutRuntimeFailure,
	runtimeFailureSignatureFromObservation,
	upsertCircuitBreakerIncident,
} from './post_merge_remediation_issue.mjs';
import {
	appendCloseoutRerunTargets,
	toRerunTargetFromBatchTarget,
} from './append_closeout_rerun_targets.mjs';

export const BATCH_CLOSEOUT_REPORT_PATH = 'post-merge-batch-closeout.json';
const DEFAULT_MANIFEST = 'scripts/ci/post-merge-closeout/targets.json';
const POST_MERGE_RESULT_PATH = 'post-merge-result.json';

export function shouldPruneBatchManifest(manifestPath = DEFAULT_MANIFEST, dryRun = false) {
	if (dryRun) return false;
	if (process.env.VITEST === 'true' && path.resolve(manifestPath) === path.resolve(DEFAULT_MANIFEST)) {
		return false;
	}
	return true;
}

export function loadCloseoutTargets(manifestPath = DEFAULT_MANIFEST) {
	const resolved = path.resolve(manifestPath);
	const raw = JSON.parse(fs.readFileSync(resolved, 'utf8'));
	const targets = Array.isArray(raw) ? raw : raw?.targets;
	if (!Array.isArray(targets)) {
		throw new Error(`Closeout manifest must include a targets array: ${resolved}`);
	}
	if (targets.length === 0) {
		return { manifestPath: resolved, targets: [] };
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

export function rollupFailureCodesByCode(results = []) {
	const byCode = {};
	const bump = (code) => {
		const key = String(code || 'unknown').trim() || 'unknown';
		byCode[key] = (byCode[key] || 0) + 1;
	};

	for (const entry of results) {
		if (entry.status === 'pass') continue;
		if (entry.phase === 'rate_limit_rerun' || entry.status === 'queued') {
			bump('rate_limit_queue');
			continue;
		}
		if (entry.phase === 'circuit_breaker' || entry.status === 'skipped') {
			bump('circuit_breaker_skipped');
			continue;
		}

		const failureBuckets = [
			...(entry.metadata_failures || []),
			...(entry.implementation_failures || []),
			...(entry.diataxis_failures || []),
			...(entry.reviewer_findings || []),
			...(entry.reviewer_disposition_failures || []),
			...(entry.workflow_failures || []).map((failure) => ({
				code: failure?.code || failure?.workflow || 'workflow_failure',
			})),
		];

		if (failureBuckets.length > 0) {
			for (const failure of failureBuckets) bump(failure?.code);
			continue;
		}

		if (entry.failure_reason) {
			for (const part of String(entry.failure_reason).split(';').map((value) => value.trim()).filter(Boolean)) {
				bump(part.includes(':') ? part.split(':').slice(1).join(':') : part);
			}
			continue;
		}

		if (entry.phase === 'rate_limit') bump('rate_limit');
		else if (entry.status === 'error') bump('closeout_runtime_error');
		else if (entry.status === 'fail') bump('post_merge_validation_failed');
	}

	return byCode;
}

export function buildBatchSummary(results = []) {
	const failed = results.filter((entry) => entry.status === 'fail' || entry.status === 'error');
	return {
		target_count: results.length,
		pass_count: results.filter((entry) => entry.status === 'pass').length,
		fail_count: failed.length,
		queued_count: results.filter((entry) => entry.status === 'queued').length,
		by_code: rollupFailureCodesByCode(results),
	};
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
		reviewer_disposition_failures: detail.reviewer_disposition_failures || [],
		workflow_failures: detail.workflow_failures || [],
	};
}

export function buildBatchCloseoutReport({
	manifestPath = DEFAULT_MANIFEST,
	targets = [],
	results = [],
	duplicateClose = {},
	manifestPrune = null,
	rerunAppend = null,
	circuitBreakerTripped = null,
	dryRun = false,
	error = null,
	failedPhase = null,
} = {}) {
	const failed = results.filter((entry) => entry.status === 'fail' || entry.status === 'error');
	let status = 'success';
	if (error) status = 'failure';
	else if (circuitBreakerTripped?.tripped) status = 'partial_failure';
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
		manifestPrune,
		rerunAppend,
		circuit_breaker_tripped: circuitBreakerTripped,
		summary: buildBatchSummary(results),
	};
}

export function buildCircuitBreakerSkippedResult({ prNumber, signature }) {
	return {
		pr: String(prNumber),
		status: 'skipped',
		phase: 'circuit_breaker',
		failure_reason: signature ? `circuit_breaker_open:${signature}` : 'circuit_breaker_open',
	};
}

export function trackAffectedRuntimePr({
	batchCircuitBreaker,
	affectedRuntimePrs,
	prNumber,
	signature,
}) {
	if (!signature) return;
	if (batchCircuitBreaker.signature && batchCircuitBreaker.signature !== signature) {
		affectedRuntimePrs.length = 0;
	}
	affectedRuntimePrs.push(prNumber);
}

export async function maybeTripBatchCircuitBreaker({
	batchCircuitBreaker,
	token,
	repository,
	manifestPath,
	runId,
	affectedPrs = [],
	observation = {},
	upsertCircuitBreakerIncidentFn = upsertCircuitBreakerIncident,
} = {}) {
	const signature = runtimeFailureSignatureFromObservation(observation);
	if (!signature) {
		if (observation.result?.status === 'pass') {
			batchCircuitBreaker.onSuccess();
		}
		return null;
	}

	const trip = batchCircuitBreaker.record(signature);
	if (!trip.tripped) return null;

	const runtimeFailure = extractCloseoutRuntimeFailure(observation);
	let incident = {
		action: 'failed',
		issue: null,
		dedupe_key: batchCircuitBreakerDedupeKey(signature),
	};
	try {
		incident = await upsertCircuitBreakerIncidentFn({
			token,
			repository,
			signature,
			failureCode: runtimeFailure?.failureCode,
			message: runtimeFailure?.message,
			manifestPath,
			runId,
			affectedPrs,
			consecutiveCount: trip.count,
		});
	} catch (error) {
		console.error('Circuit breaker incident upsert failed:', error);
		incident = {
			...incident,
			error: error instanceof Error ? error.message : String(error),
		};
	}

	return {
		tripped: true,
		signature,
		consecutive_count: trip.count,
		failure_code: runtimeFailure?.failureCode,
		message: runtimeFailure?.message,
		incident_issue: incident.issue,
		incident_action: incident.action,
		dedupe_key: incident.dedupe_key,
		suppressed_targets: [],
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
	pruneCloseoutManifestFromReportFn = pruneCloseoutManifestFromReport,
	appendCloseoutRerunTargetsFn = appendCloseoutRerunTargets,
	upsertCircuitBreakerIncidentFn = upsertCircuitBreakerIncident,
	batchCircuitBreaker = null,
} = {}) {
	const results = [];
	let rerunAppend = null;
	const sharedBatchCircuitBreaker = batchCircuitBreaker || new BatchCircuitBreakerState();
	let circuitBreakerTripped = sharedBatchCircuitBreaker.tripped
		? {
			tripped: true,
			signature: sharedBatchCircuitBreaker.tripDetails?.signature,
			consecutive_count: sharedBatchCircuitBreaker.tripDetails?.consecutive_count,
			suppressed_targets: [],
		}
		: null;
	const affectedRuntimePrs = [];

	for (let index = 0; index < targets.length; index += 1) {
		const target = targets[index];
		const prNumber = String(target.pr);

		if (sharedBatchCircuitBreaker.tripped || circuitBreakerTripped?.tripped) {
			results.push(buildCircuitBreakerSkippedResult({
				prNumber,
				signature: circuitBreakerTripped?.signature,
			}));
			circuitBreakerTripped.suppressed_targets.push(prNumber);
			continue;
		}

		const bodyFile = path.resolve(target.body_file);

		if (!fs.existsSync(bodyFile)) {
			sharedBatchCircuitBreaker.onSuccess();
			affectedRuntimePrs.length = 0;
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
				batchCircuitBreaker: sharedBatchCircuitBreaker,
			});
			const detail = readPostMergeResultDetail();
			const summarized = summarizeTargetResult({
				prNumber,
				result,
				detail,
				phase: 'closeout',
			});
			results.push(summarized);

			if (result.status === 'pass') {
				sharedBatchCircuitBreaker.onSuccess();
				affectedRuntimePrs.length = 0;
			} else {
				const runtimeFailure = extractCloseoutRuntimeFailure({ result, detail });
				if (runtimeFailure) {
					const signature = buildRuntimeFailureSignature(runtimeFailure);
					trackAffectedRuntimePr({
						batchCircuitBreaker: sharedBatchCircuitBreaker,
						affectedRuntimePrs,
						prNumber,
						signature,
					});
					const tripReport = await maybeTripBatchCircuitBreaker({
						batchCircuitBreaker: sharedBatchCircuitBreaker,
						token,
						repository,
						manifestPath,
						runId,
						affectedPrs: affectedRuntimePrs,
						observation: { result, detail },
						upsertCircuitBreakerIncidentFn,
					});
					if (tripReport) {
						circuitBreakerTripped = tripReport;
						for (let skipIndex = index + 1; skipIndex < targets.length; skipIndex += 1) {
							const skippedPr = String(targets[skipIndex].pr);
							results.push(buildCircuitBreakerSkippedResult({
								prNumber: skippedPr,
								signature: tripReport.signature,
							}));
							circuitBreakerTripped.suppressed_targets.push(skippedPr);
						}
						break;
					}
				} else {
					sharedBatchCircuitBreaker.onSuccess();
					affectedRuntimePrs.length = 0;
				}
			}
		} catch (error) {
			console.error(`Post-merge closeout failed for PR #${prNumber}:`, error);
			const summarized = summarizeTargetResult({
				prNumber,
				phase: isGitHubRateLimitError(error) ? 'rate_limit' : 'closeout',
				error,
			});
			results.push(summarized);

			if (isGitHubRateLimitError(error)) {
				const remainingTargets = targets.slice(index).map((entry) =>
					toRerunTargetFromBatchTarget(entry, process.cwd()),
				);
				rerunAppend = appendCloseoutRerunTargetsFn({
					targets: remainingTargets,
					description: `Rate-limited closeout targets queued from ${manifestPath}.`,
				});
				for (const queuedTarget of remainingTargets.slice(1)) {
					results.push({
						pr: String(queuedTarget.pr),
						status: 'queued',
						phase: 'rate_limit_rerun',
						failure_reason: 'rate_limit_queue',
						body_file: queuedTarget.body_file,
					});
				}
				break;
			}

			const runtimeFailure = extractCloseoutRuntimeFailure({ error });
			if (runtimeFailure) {
				const signature = buildRuntimeFailureSignature(runtimeFailure);
				trackAffectedRuntimePr({
					batchCircuitBreaker: sharedBatchCircuitBreaker,
					affectedRuntimePrs,
					prNumber,
					signature,
				});
			}
			const tripReport = await maybeTripBatchCircuitBreaker({
				batchCircuitBreaker: sharedBatchCircuitBreaker,
				token,
				repository,
				manifestPath,
				runId,
				affectedPrs: affectedRuntimePrs,
				observation: { error },
				upsertCircuitBreakerIncidentFn,
			});
			if (tripReport) {
				circuitBreakerTripped = tripReport;
				for (let skipIndex = index + 1; skipIndex < targets.length; skipIndex += 1) {
					const skippedPr = String(targets[skipIndex].pr);
					results.push(buildCircuitBreakerSkippedResult({
						prNumber: skippedPr,
						signature: tripReport.signature,
					}));
					circuitBreakerTripped.suppressed_targets.push(skippedPr);
				}
				break;
			}
		}
	}

	let duplicateClose = { closed: [] };
	if (!dryRun) {
		duplicateClose = await closeDuplicateRemediationIssuesFn({ token, repository, dryRun: false });
	}

	let report = buildBatchCloseoutReport({
		manifestPath,
		targets,
		results,
		duplicateClose,
		rerunAppend,
		circuitBreakerTripped,
		dryRun,
	});

	let manifestPrune = null;
	if (
		shouldPruneBatchManifest(manifestPath, dryRun)
		&& isPruneEligibleReportStatus(report.status)
		&& !circuitBreakerTripped?.tripped
	) {
		manifestPrune = pruneCloseoutManifestFromReportFn({ manifestPath, report, dryRun: false });
		report = { ...report, manifestPrune };
	}

	return report;
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
