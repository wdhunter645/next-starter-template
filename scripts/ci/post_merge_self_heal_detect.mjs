#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { successfulCloseoutPrs } from './prune_closeout_manifest.mjs';
import { loadCloseoutTargets } from './run_batch_post_merge_closeout.mjs';
import { DEFAULT_MANIFESTS } from './run_post_merge_closeout_all_manifests.mjs';
import {
	classifyFindings,
	FINDING_TYPES,
	SAFETY_CATEGORIES,
	summarizeClassifications,
} from './post_merge_self_heal_classify.mjs';

export { DEFAULT_MANIFESTS };

export const RECOMMENDED_ACTIONS = Object.freeze({
	PRUNE_MANIFEST_ENTRY: 'prune_manifest_entry',
	CLOSE_DUPLICATE_ISSUE: 'close_duplicate_issue',
	CURSOR_REMEDIATION: 'cursor_remediation',
	OPERATOR_HOLD: 'operator_hold',
	PRESERVE_DEFER: 'preserve_defer',
	NO_ACTION: 'no_action',
});

function readJsonFile(filePath, { optional = false } = {}) {
	const resolved = path.resolve(filePath);
	if (!fs.existsSync(resolved)) {
		if (optional) return null;
		throw new Error(`Missing JSON file: ${resolved}`);
	}
	return JSON.parse(fs.readFileSync(resolved, 'utf8'));
}

export function loadManifestTargets(manifestPath, { rootDir = process.cwd() } = {}) {
	const resolved = path.resolve(rootDir, manifestPath);
	if (!fs.existsSync(resolved)) {
		return { manifestPath: resolved, targets: [], missing: true };
	}
	const { manifestPath: loadedPath, targets } = loadCloseoutTargets(resolved);
	return { manifestPath: loadedPath, targets, missing: false };
}

export function loadManifestSnapshots(manifestPaths = DEFAULT_MANIFESTS, { rootDir = process.cwd() } = {}) {
	return manifestPaths.map((manifestPath) => {
		const snapshot = loadManifestTargets(manifestPath, { rootDir });
		return {
			manifest_path: snapshot.manifestPath,
			targets: snapshot.targets,
			missing: snapshot.missing,
		};
	});
}

function collectSuccessfulCloseoutPrs(reports = []) {
	const successful = new Set();
	for (const report of reports || []) {
		if (!report) continue;
		for (const pr of successfulCloseoutPrs(report)) {
			successful.add(String(pr));
		}
		for (const result of report?.results || []) {
			if (
				result?.status === 'pass'
				&& result?.pr
				&& result?.sync_action === 'post_merge_success'
			) {
				successful.add(String(result.pr));
			}
		}
	}
	return successful;
}

export function detectStaleManifestEntries({ manifests = [], closeoutReports = [] } = {}) {
	const successfulPrs = collectSuccessfulCloseoutPrs(closeoutReports);
	const findings = [];

	for (const manifest of manifests) {
		if (!manifest) continue;
		for (const target of manifest.targets || []) {
			const prNumber = String(target?.pr ?? '').trim();
			if (!prNumber) continue;
			if (!successfulPrs.has(prNumber)) continue;

			findings.push({
				kind: FINDING_TYPES.STALE_MANIFEST_ENTRY,
				code: 'stale_manifest_entry',
				pr_number: Number(prNumber),
				source_issue: target?.source_issue ?? null,
				manifest_path: manifest.manifest_path,
				message: `PR #${prNumber} has a proven post-merge pass but remains in ${manifest.manifest_path}.`,
				evidence: [
					{ type: 'manifest_target', pr: Number(prNumber), source_issue: target?.source_issue ?? null },
					{ type: 'closeout_report', status: 'pass', pr: Number(prNumber) },
				],
				recommended_action: RECOMMENDED_ACTIONS.PRUNE_MANIFEST_ENTRY,
			});
		}
	}

	return findings;
}

export function detectEmptyCleanState({ manifests = [], closeoutReports = [], exceptionIssues = [] } = {}) {
	const allEmpty = manifests.every((manifest) => (manifest?.targets || []).length === 0);
	const openExceptions = (exceptionIssues || []).filter(
		(issue) => issue && String(issue?.state || '').toLowerCase() === 'open',
	);
	const failedReports = (closeoutReports || []).filter((report) => {
		if (!report) return false;
		const status = String(report.status || '').toLowerCase();
		return status === 'failure' || status === 'partial_failure' || status === 'fail';
	});

	if (!allEmpty || openExceptions.length > 0 || failedReports.length > 0) {
		return [];
	}

	return [{
		kind: FINDING_TYPES.CLEAN_STATE,
		code: 'clean_state',
		message: 'All closeout manifests are empty and no open exception issues were supplied.',
		evidence: manifests.filter(Boolean).map((manifest) => ({
			type: 'manifest',
			path: manifest.manifest_path,
			target_count: (manifest.targets || []).length,
		})),
		recommended_action: RECOMMENDED_ACTIONS.NO_ACTION,
	}];
}

export function issuePrNumber(issue = {}) {
	const pr = issue?.linked_pr ?? issue?.pr_number ?? issue?.pr ?? issue?.metadata?.pr ?? null;
	if (pr === null || pr === undefined || pr === '') {
		return null;
	}
	return String(pr).trim();
}

function issueReferenceKey(issue = {}) {
	const pr = issuePrNumber(issue);
	const source = String(issue?.linked_source_issue ?? issue?.source_issue ?? issue?.metadata?.source_issue ?? '').trim();
	const code = String(issue?.failure_code ?? issue?.code ?? '').trim();
	if (!pr || !source || !code) {
		return null;
	}
	return `${pr}:${source}:${code}`.toLowerCase();
}

function issueHasDeferredLabel(issue = {}) {
	if (issue?.deferred === true) {
		return true;
	}
	return (issue?.labels || []).some((label) => {
		const name = typeof label === 'string' ? label : label?.name;
		return String(name || '').trim() === 'intentionally-deferred';
	});
}

export function detectDuplicateRemediationIssues({ issues = [] } = {}) {
	const groups = new Map();
	const findings = [];
	for (const issue of issues || []) {
		if (!issue) continue;
		if (String(issue.state || '').toLowerCase() !== 'open') continue;
		const key = issueReferenceKey(issue);
		if (!key) {
			findings.push({
				kind: FINDING_TYPES.INCOMPLETE_REPORT_PAYLOAD,
				code: 'incomplete_remediation_metadata',
				issue_number: issue.number,
				message: `Issue #${issue.number} lacks complete PR/source/failure metadata for duplicate detection.`,
				evidence: [{ type: 'issue', number: issue.number, incomplete_metadata: true }],
				recommended_action: RECOMMENDED_ACTIONS.CURSOR_REMEDIATION,
			});
			continue;
		}
		if (!groups.has(key)) groups.set(key, []);
		groups.get(key).push(issue);
	}

	for (const grouped of groups.values()) {
		if (grouped.length < 2) continue;
		const explicitCanonical = grouped.find((issue) => issue?.canonical === true);
		if (!explicitCanonical) {
			for (const issue of grouped) {
				findings.push({
					kind: FINDING_TYPES.INCOMPLETE_REPORT_PAYLOAD,
					code: 'ambiguous_duplicate_remediation_metadata',
					issue_number: issue.number,
					message: `Issue #${issue.number} is part of a duplicate remediation group without explicit canonical evidence.`,
					evidence: [{ type: 'issue', number: issue.number, ambiguous_duplicate: true }],
					recommended_action: RECOMMENDED_ACTIONS.CURSOR_REMEDIATION,
				});
			}
			continue;
		}
		const canonical = explicitCanonical;
		for (const duplicate of grouped) {
			if (duplicate === canonical) continue;
			findings.push({
				kind: FINDING_TYPES.DUPLICATE_REMEDIATION_ISSUE,
				code: 'duplicate_remediation_issue',
				issue_number: duplicate.number,
				source_issue: duplicate.source_issue ?? duplicate.linked_source_issue ?? null,
				pr_number: issuePrNumber(duplicate),
				message: `Issue #${duplicate.number} duplicates canonical remediation issue #${canonical.number}.`,
				evidence: [
					{
						type: 'duplicate_issue',
						issue: duplicate.number,
						canonical_issue: canonical.number,
						canonical: true,
					},
				],
				recommended_action: RECOMMENDED_ACTIONS.CLOSE_DUPLICATE_ISSUE,
			});
		}
	}

	return findings;
}

export function detectDeferredFindings({ issues = [] } = {}) {
	return (issues || [])
		.filter((issue) => issueHasDeferredLabel(issue))
		.map((issue) => ({
			kind: FINDING_TYPES.INTENTIONALLY_DEFERRED,
			code: 'intentionally_deferred',
			issue_number: issue.number,
			source_issue: issue.source_issue ?? issue.number,
			message: `Issue #${issue.number} is explicitly deferred; preserve existing defer record.`,
			evidence: [{ type: 'issue', number: issue.number, deferred: true }],
			deferred: true,
			recommended_action: RECOMMENDED_ACTIONS.PRESERVE_DEFER,
		}));
}

function flattenValidationFailures(result = {}) {
	const buckets = [
		['metadata', result.metadata_failures],
		['implementation', result.implementation_failures],
		['diataxis', result.diataxis_failures],
		['reviewer', result.reviewer_findings],
		['reviewer_disposition', result.reviewer_disposition_failures],
		['workflow', result.workflow_failures],
	];
	const flattened = [];
	for (const [bucket, failures] of buckets) {
		for (const failure of failures || []) {
			flattened.push({ bucket, ...failure });
		}
	}
	return flattened;
}

export function detectFailedCloseoutReports({ closeoutReports = [] } = {}) {
	const findings = [];

	for (const report of closeoutReports || []) {
		const status = String(report?.status || '').toLowerCase();
		const results = Array.isArray(report?.results) ? report.results : [];
		if (!['failure', 'partial_failure', 'fail'].includes(status)) continue;
		if (results.length > 0) continue;

		findings.push({
			kind: FINDING_TYPES.INCOMPLETE_REPORT_PAYLOAD,
			code: 'incomplete_report_payload',
			message: report?.error || `Closeout report status is ${status} with no result entries.`,
			evidence: [{ type: 'closeout_report', status, error: report?.error || null }],
			recommended_action: RECOMMENDED_ACTIONS.CURSOR_REMEDIATION,
		});
	}

	return findings;
}

export function detectCloseoutReportFindings({ closeoutReports = [] } = {}) {
	const findings = [];

	for (const report of closeoutReports || []) {
		if (!report) continue;
		for (const result of report?.results || []) {
			if (!result) continue;
			for (const failure of flattenValidationFailures(result)) {
				const code = failure.classification || failure.code || failure.workflow || `${failure.bucket}_failure`;
				const workflowClassification = String(failure.classification || failure.failure_type || '').trim();
				const terminalLabelCodes = new Set([
					'stale_terminal_source_issue_labels',
					'missing_terminal_complete_label',
				]);
				findings.push({
					kind: terminalLabelCodes.has(code)
						? FINDING_TYPES.STALE_TERMINAL_SOURCE_ISSUE_LABELS
						: null,
					code,
					pr_number: result.pr ?? null,
					source_issue: result.source_issue ?? null,
					message: failure.message || `Post-merge ${failure.bucket} failure for PR #${result.pr}.`,
					evidence: [{ type: 'closeout_result', pr: result.pr, bucket: failure.bucket, code, workflow_classification: workflowClassification || null }],
					recommended_action: null,
					...(workflowClassification ? { metadata: { workflow_classification: workflowClassification } } : {}),
				});
			}

			if (result?.status === 'fail' && flattenValidationFailures(result).length === 0) {
				findings.push({
					kind: FINDING_TYPES.UNRECOGNIZED_FAILURE,
					code: 'post_merge_validation_failed',
					pr_number: result.pr ?? null,
					source_issue: result.source_issue ?? null,
					message: result.failure_reason || `Post-merge validation failed for PR #${result.pr}.`,
					evidence: [{ type: 'closeout_result', pr: result.pr, status: 'fail' }],
					recommended_action: RECOMMENDED_ACTIONS.CURSOR_REMEDIATION,
				});
			}
		}
	}

	return findings;
}

function loadManifestSnapshotsSafely(manifestPaths, { rootDir = process.cwd(), errors = [] } = {}) {
	try {
		return loadManifestSnapshots(manifestPaths, { rootDir });
	} catch (error) {
		errors.push(error instanceof Error ? error.message : String(error));
		return [];
	}
}

export function detectPostMergeFindings(input = {}) {
	const errors = [...(input.errors || [])];
	const manifests = input.manifests
		?? loadManifestSnapshotsSafely(input.manifestPaths, { rootDir: input.rootDir, errors });
	const closeoutReports = input.closeoutReports ?? [];
	const exceptionIssues = input.exceptionIssues ?? [];
	const remediationIssues = input.remediationIssues ?? [];
	const deferredIssues = input.deferredIssues ?? [];

	const rawFindings = [
		...detectEmptyCleanState({ manifests, closeoutReports, exceptionIssues }),
		...detectFailedCloseoutReports({ closeoutReports }),
		...detectStaleManifestEntries({ manifests, closeoutReports }),
		...detectDuplicateRemediationIssues({ issues: [...exceptionIssues, ...remediationIssues] }),
		...detectDeferredFindings({ issues: deferredIssues }),
		...detectCloseoutReportFindings({ closeoutReports }),
	];

	const classified = classifyFindings(rawFindings, input.context || {});
	const actionable = classified.filter((finding) => finding.classification !== SAFETY_CATEGORIES.NO_ACTION);

	let status = 'success';
	if (errors.length) {
		status = 'partial_failure';
	} else if (actionable.length > 0) {
		status = 'findings';
	}

	return {
		status,
		findings: classified,
		summary: summarizeClassifications(classified),
		errors,
	};
}

export function buildDetectionReport(input = {}) {
	return detectPostMergeFindings(input);
}

export function detectFromPaths({
	manifestPaths = DEFAULT_MANIFESTS,
	closeoutReportPaths = [],
	singleResultPaths = [],
	issueMetadataPath = null,
	rootDir = process.cwd(),
} = {}) {
	const errors = [];
	const closeoutReports = [];

	for (const reportPath of closeoutReportPaths) {
		try {
			closeoutReports.push(readJsonFile(path.resolve(rootDir, reportPath)));
		} catch (error) {
			errors.push(error instanceof Error ? error.message : String(error));
		}
	}

	for (const resultPath of singleResultPaths) {
		try {
			const result = readJsonFile(path.resolve(rootDir, resultPath), { optional: true });
			if (result) {
				closeoutReports.push({ status: result.status, results: [result] });
			}
		} catch (error) {
			errors.push(error instanceof Error ? error.message : String(error));
		}
	}

	let issueMetadata = {};
	if (issueMetadataPath) {
		try {
			issueMetadata = readJsonFile(path.resolve(rootDir, issueMetadataPath), { optional: true }) || {};
		} catch (error) {
			errors.push(error instanceof Error ? error.message : String(error));
		}
	}

	return detectPostMergeFindings({
		rootDir,
		manifestPaths,
		closeoutReports,
		exceptionIssues: issueMetadata.exceptionIssues || [],
		remediationIssues: issueMetadata.remediationIssues || [],
		deferredIssues: issueMetadata.deferredIssues || [],
		errors,
	});
}

function parseArgs(argv = []) {
	const options = {
		manifestPaths: [],
		closeoutReportPaths: [],
		singleResultPaths: [],
		issueMetadataPath: null,
		outputPath: null,
		rootDir: process.cwd(),
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === '--manifest' && argv[index + 1]) {
			options.manifestPaths.push(argv[index + 1]);
			index += 1;
		} else if (arg === '--batch-report' && argv[index + 1]) {
			options.closeoutReportPaths.push(argv[index + 1]);
			index += 1;
		} else if (arg === '--result' && argv[index + 1]) {
			options.singleResultPaths.push(argv[index + 1]);
			index += 1;
		} else if (arg === '--issues' && argv[index + 1]) {
			options.issueMetadataPath = argv[index + 1];
			index += 1;
		} else if (arg === '--output' && argv[index + 1]) {
			options.outputPath = argv[index + 1];
			index += 1;
		} else if (arg === '--root' && argv[index + 1]) {
			options.rootDir = argv[index + 1];
			index += 1;
		}
	}

	return options;
}

export async function main(argv = process.argv.slice(2)) {
	const options = parseArgs(argv);
	if (options.manifestPaths.length === 0) {
		options.manifestPaths = [...DEFAULT_MANIFESTS];
	}
	const report = detectFromPaths(options);
	const serialized = `${JSON.stringify(report, null, 2)}\n`;

	if (options.outputPath) {
		fs.writeFileSync(path.resolve(options.outputPath), serialized);
	} else {
		process.stdout.write(serialized);
	}

	if (report.status === 'partial_failure') {
		process.exitCode = 2;
	}
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((error) => {
		console.error(error);
		process.exitCode = 1;
	});
}
