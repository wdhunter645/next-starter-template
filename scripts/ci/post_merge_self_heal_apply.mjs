#!/usr/bin/env node

/**
 * Safe auto-fix executor for post-merge self-healing CI.
 * Applies bounded repo-hygiene repairs for findings classified safe_auto_fix only.
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
	duplicateCloseComment,
	groupRemediationIssues,
	planDuplicateClosures,
} from './close_duplicate_remediation_issues.mjs';
import {
	FINDING_TYPES,
	SAFETY_CATEGORIES,
} from './post_merge_self_heal_classify.mjs';
import {
	applyTerminalLabelReconciliation,
	planActiveSourceIssueRelabel,
	planTerminalLabelReconciliation,
} from './post_merge_source_issue_closeout.mjs';
import { loadManifestSnapshots, DEFAULT_MANIFESTS } from './post_merge_self_heal_detect.mjs';
import {
	normalizeCloseoutPr,
	pruneCloseoutManifest,
	pruneCloseoutManifestContent,
	successfulCloseoutPrs,
} from './prune_closeout_manifest.mjs';

export const APPLY_ACTIONS = Object.freeze({
	PRUNE_MANIFEST: 'prune_manifest',
	PLAN_DUPLICATE_CLOSURE: 'plan_duplicate_closure',
	STALE_ISSUE_CLOSEOUT_CANDIDATE: 'stale_issue_closeout_candidate',
	REPAIR_TERMINAL_SOURCE_LABELS: 'repair_terminal_source_labels',
	SKIPPED_UNSAFE: 'skipped_unsafe',
	SKIPPED_NO_ACTION: 'skipped_no_action',
});

export function filterSafeAutoFixFindings(findings = []) {
	return (Array.isArray(findings) ? findings : []).filter(
		(finding) => finding?.classification === SAFETY_CATEGORIES.SAFE_AUTO_FIX,
	);
}

export function collectSuccessfulPrsFromReports(closeoutReports = []) {
	const successful = new Set();
	for (const report of closeoutReports || []) {
		for (const pr of successfulCloseoutPrs(report)) {
			successful.add(normalizeCloseoutPr(pr));
		}
		for (const result of report?.results || []) {
			if (result?.status === 'pass' && result?.sync_action === 'post_merge_success' && result?.pr) {
				successful.add(normalizeCloseoutPr(result.pr));
			}
		}
	}
	return successful;
}

export function buildManifestPathIndex(manifests = []) {
	const index = new Map();
	for (const manifest of manifests || []) {
		for (const target of manifest.targets || []) {
			const pr = normalizeCloseoutPr(target?.pr);
			if (pr) {
				index.set(pr, manifest.manifest_path);
			}
		}
	}
	return index;
}

export function manifestPathForFinding(finding = {}, manifestIndex = new Map()) {
	if (finding.manifest_path) {
		return finding.manifest_path;
	}
	const pr = normalizeCloseoutPr(finding.pr_number);
	return pr ? manifestIndex.get(pr) || null : null;
}

export function planManifestPruneActions(findings = [], { closeoutReports = [], manifests = [] } = {}) {
	const successfulPrs = collectSuccessfulPrsFromReports(closeoutReports);
	const manifestIndex = buildManifestPathIndex(manifests);
	const actions = [];
	const seen = new Set();

	for (const finding of findings) {
		if (finding.kind !== FINDING_TYPES.STALE_MANIFEST_ENTRY) continue;
		const manifestPath = manifestPathForFinding(finding, manifestIndex);
		const prNumber = normalizeCloseoutPr(finding.pr_number);
		if (!manifestPath || !prNumber) continue;

		const key = `${manifestPath}|${prNumber}`;
		if (seen.has(key)) continue;
		seen.add(key);

		actions.push({
			action: APPLY_ACTIONS.PRUNE_MANIFEST,
			finding,
			manifest_path: manifestPath,
			pr_number: Number(prNumber),
			successful_prs: [...successfulPrs],
			applies_changes: true,
		});
	}

	return actions;
}

export function planDuplicateIssueActions(findings = [], { remediationIssues = [] } = {}) {
	const actions = [];

	for (const finding of findings) {
		if (finding.kind !== FINDING_TYPES.DUPLICATE_REMEDIATION_ISSUE) continue;
		actions.push({
			action: APPLY_ACTIONS.PLAN_DUPLICATE_CLOSURE,
			finding,
			issue_number: finding.issue_number ?? null,
			canonical_issue: finding.evidence?.find((entry) => entry.type === 'duplicate_issue')?.canonical_issue ?? null,
			applies_changes: false,
			dry_run_only: true,
		});
	}

	if (remediationIssues.length > 0) {
		const groups = groupRemediationIssues(remediationIssues);
		for (const planned of planDuplicateClosures(groups)) {
			actions.push({
				action: APPLY_ACTIONS.PLAN_DUPLICATE_CLOSURE,
				issue_number: planned.duplicate.number,
				canonical_issue: planned.canonical.number,
				comment_preview: duplicateCloseComment(planned),
				applies_changes: false,
				dry_run_only: true,
				source: 'remediation_issue_scan',
			});
		}
	}

	return actions;
}

export function hasProvenCloseoutPass(evidence = {}) {
	return Boolean(evidence.pr_passed_closeout)
		|| Boolean(evidence.closeout_status === 'pass')
		|| Boolean(evidence.merged_pr_passed);
}

export function hasClosedSourceIssue(evidence = {}) {
	const state = String(evidence.source_issue_state || '').toLowerCase();
	const reason = String(evidence.source_issue_state_reason || '').toLowerCase();
	return state === 'closed' && (reason === 'completed' || reason === 'not_planned' || reason === '');
}

export function hasOpenRequiredBlocker(evidence = {}) {
	if (evidence.open_required_blocker === true) return true;
	if (Array.isArray(evidence.open_blockers) && evidence.open_blockers.length > 0) return true;
	return false;
}

export function planStaleIssueCloseoutCandidates(findings = [], { issueEvidenceByNumber = {} } = {}) {
	const actions = [];

	for (const finding of findings) {
		if (finding.kind !== FINDING_TYPES.STALE_EXCEPTION_ISSUE) continue;

		const issueNumber = finding.issue_number ?? finding.source_issue ?? null;
		const evidence = {
			...(finding.evidence?.[0] && typeof finding.evidence[0] === 'object' ? finding.evidence[0] : {}),
			...(issueEvidenceByNumber[issueNumber] || {}),
		};

		const eligible =
			hasProvenCloseoutPass(evidence)
			&& hasClosedSourceIssue(evidence)
			&& !hasOpenRequiredBlocker(evidence);

		actions.push({
			action: APPLY_ACTIONS.STALE_ISSUE_CLOSEOUT_CANDIDATE,
			finding,
			issue_number: issueNumber,
			eligible,
			reason: eligible
				? 'Evidence proves merged PR passed closeout and source issue is closed with no open blocker.'
				: 'Ambiguous or incomplete evidence; closeout candidate remains dry-run only.',
			applies_changes: false,
			dry_run_only: true,
		});
	}

	return actions;
}

export function planSkippedFindings(findings = []) {
	return (Array.isArray(findings) ? findings : [])
		.filter((finding) => finding?.classification !== SAFETY_CATEGORIES.SAFE_AUTO_FIX)
		.map((finding) => ({
			action: finding?.classification === SAFETY_CATEGORIES.NO_ACTION
				? APPLY_ACTIONS.SKIPPED_NO_ACTION
				: APPLY_ACTIONS.SKIPPED_UNSAFE,
			finding,
			classification: finding?.classification,
			applies_changes: false,
		}));
}

export function planTerminalLabelRepairActions(findings = [], { closeoutReports = [] } = {}) {
	const actions = [];
	const seen = new Set();

	for (const finding of findings) {
		if (finding.kind !== FINDING_TYPES.STALE_TERMINAL_SOURCE_ISSUE_LABELS) continue;
		const sourceIssue = finding.source_issue ?? finding.metadata?.source_issue ?? null;
		if (!sourceIssue || seen.has(String(sourceIssue))) continue;
		seen.add(String(sourceIssue));

		const closeoutResult = (closeoutReports || [])
			.flatMap((report) => report?.results || [])
			.find((result) => String(result?.source_issue || '') === String(sourceIssue));

		const preserveOpen = closeoutResult?.source_issue_closeout_mode === 'source_issue_preserved_open'
			|| closeoutResult?.terminal_label_integrity?.closeout_mode === 'preserve_open';

		actions.push({
			action: APPLY_ACTIONS.REPAIR_TERMINAL_SOURCE_LABELS,
			finding,
			source_issue: Number(sourceIssue),
			preserve_open: preserveOpen,
			applies_changes: true,
		});
	}

	return actions;
}

export function planSafeAutoFixActions(report = {}, options = {}) {
	const findings = Array.isArray(report.findings) ? report.findings : [];
	const safeFindings = filterSafeAutoFixFindings(findings);

	return {
		safe_findings: safeFindings.length,
		actions: [
			...planManifestPruneActions(safeFindings, options),
			...planDuplicateIssueActions(safeFindings, options),
			...planStaleIssueCloseoutCandidates(safeFindings, options),
			...planTerminalLabelRepairActions(safeFindings, options),
		],
		skipped: planSkippedFindings(findings),
	};
}

export async function applyTerminalLabelRepairAction(action, {
	dryRun = true,
	token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN,
	repository = process.env.GITHUB_REPOSITORY,
	fetchIssueFn,
	fetchLabelsFn,
} = {}) {
	if (!action?.source_issue) {
		return { ...action, status: 'skipped', reason: 'missing_source_issue', dry_run: dryRun };
	}

	const fetchIssue = fetchIssueFn || (async () => {
		const { githubRepoRequest } = await import('./github_issue_api.mjs');
		return githubRepoRequest({
			token,
			repository,
			path: `/issues/${action.source_issue}`,
			userAgent: 'lgfc-post-merge-self-heal-apply',
		});
	});
	const fetchLabels = fetchLabelsFn || (async () => {
		const { githubRepoRequest } = await import('./github_issue_api.mjs');
		const labels = [];
		let page = 1;
		while (true) {
			const batch = await githubRepoRequest({
				token,
				repository,
				path: `/labels?per_page=100&page=${page}`,
				userAgent: 'lgfc-post-merge-self-heal-apply',
			});
			if (!Array.isArray(batch) || batch.length === 0) break;
			labels.push(...batch);
			if (batch.length < 100) break;
			page += 1;
		}
		return labels;
	});

	const issueMeta = await fetchIssue();
	const repoLabels = await fetchLabels();
	const plan = action.preserve_open
		? planActiveSourceIssueRelabel({ issueLabels: issueMeta.labels || [] })
		: planTerminalLabelReconciliation({ issueLabels: issueMeta.labels || [], repoLabels });

	if (!plan.ok) {
		return { ...action, status: 'skipped', reason: plan.reason || 'terminal_label_plan_failed', dry_run: dryRun };
	}

	if (dryRun) {
		return { ...action, status: 'planned', plan, dry_run: true };
	}

	await applyTerminalLabelReconciliation({
		token,
		repository,
		issueNumber: action.source_issue,
		plan,
	});

	return { ...action, status: 'applied', plan, dry_run: false };
}

export function applyManifestPruneAction(action, { dryRun = true, rootDir = process.cwd() } = {}) {
	const manifestPath = path.resolve(rootDir, action.manifest_path);
	if (!fs.existsSync(manifestPath)) {
		return {
			...action,
			status: 'skipped',
			reason: 'manifest_missing',
			pruned: 0,
			dry_run: dryRun,
		};
	}

	const successfulPrs = new Set(
		(action.successful_prs || []).map((entry) => normalizeCloseoutPr(entry)).filter(Boolean),
	);
	if (action.pr_number) {
		successfulPrs.add(normalizeCloseoutPr(action.pr_number));
	}

	const result = pruneCloseoutManifest(manifestPath, successfulPrs, { dryRun });
	return {
		...action,
		status: result.pruned > 0 ? 'applied' : 'no_change',
		pruned: result.pruned,
		remaining: result.remaining,
		dry_run: dryRun,
	};
}

export async function applySafeAutoFixActions(plan = {}, { dryRun = true, rootDir = process.cwd() } = {}) {
	const applied = [];
	const planned = [];

	for (const action of plan.actions || []) {
		if (action.action === APPLY_ACTIONS.PRUNE_MANIFEST) {
			const outcome = applyManifestPruneAction(action, { dryRun, rootDir });
			if (dryRun) {
				planned.push(
					outcome.status === 'skipped' || outcome.status === 'no_change'
						? outcome
						: { ...outcome, status: 'planned' },
				);
			} else {
				applied.push(outcome);
			}
			continue;
		}

		if (action.action === APPLY_ACTIONS.REPAIR_TERMINAL_SOURCE_LABELS) {
			const outcome = await applyTerminalLabelRepairAction(action, { dryRun });
			if (dryRun) {
				planned.push(outcome);
			} else {
				applied.push(outcome);
			}
			continue;
		}

		planned.push({
			...action,
			status: 'planned',
			dry_run: true,
		});
	}

	const manifestPruned = [...applied, ...planned]
		.filter((entry) => entry.action === APPLY_ACTIONS.PRUNE_MANIFEST)
		.reduce((sum, entry) => sum + (entry.pruned || 0), 0);
	const terminalLabelRepairs = [...applied, ...planned]
		.filter((entry) => entry.action === APPLY_ACTIONS.REPAIR_TERMINAL_SOURCE_LABELS);

	return {
		dry_run: dryRun,
		applied,
		planned,
		skipped: plan.skipped || [],
		summary: {
			safe_findings: plan.safe_findings || 0,
			manifest_prunes_applied: dryRun ? 0 : manifestPruned,
			manifest_prunes_planned: dryRun ? manifestPruned : 0,
			duplicate_plans: planned.filter((entry) => entry.action === APPLY_ACTIONS.PLAN_DUPLICATE_CLOSURE).length,
			stale_closeout_candidates: planned.filter((entry) => entry.action === APPLY_ACTIONS.STALE_ISSUE_CLOSEOUT_CANDIDATE).length,
			terminal_label_repairs_applied: dryRun
				? 0
				: terminalLabelRepairs.filter((entry) => entry.status === 'applied').length,
			terminal_label_repairs_planned: dryRun
				? terminalLabelRepairs.filter((entry) => entry.status === 'planned').length
				: 0,
			skipped_unsafe: (plan.skipped || []).filter((entry) => entry.action === APPLY_ACTIONS.SKIPPED_UNSAFE).length,
		},
	};
}

export async function applyFromDetectionReport(report = {}, options = {}) {
	const dryRun = options.dryRun !== false;
	const plan = planSafeAutoFixActions(report, {
		...options,
		closeoutReports: options.closeoutReports ?? report.closeoutReports ?? [],
		manifests: options.manifests
			?? report.manifests
			?? loadManifestSnapshots(options.manifestPaths ?? DEFAULT_MANIFESTS, { rootDir: options.rootDir }),
		remediationIssues: options.remediationIssues ?? report.remediationIssues ?? [],
		issueEvidenceByNumber: options.issueEvidenceByNumber ?? report.issueEvidenceByNumber ?? {},
	});
	const outcome = await applySafeAutoFixActions(plan, { dryRun, rootDir: options.rootDir });
	return {
		status: outcome.summary.skipped_unsafe > 0 && outcome.summary.safe_findings === 0
			? 'skipped_unsafe_only'
			: outcome.dry_run
				? 'dry_run'
				: 'applied',
		...outcome,
	};
}

export function previewManifestPrune(manifestContent, successfulPrs = new Set()) {
	return pruneCloseoutManifestContent(manifestContent, successfulPrs);
}

function parseArgs(argv = []) {
	const options = {
		detectionReportPath: null,
		outputPath: null,
		dryRun: true,
		rootDir: process.cwd(),
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === '--report' && argv[index + 1]) {
			options.detectionReportPath = argv[index + 1];
			index += 1;
		} else if (arg === '--output' && argv[index + 1]) {
			options.outputPath = argv[index + 1];
			index += 1;
		} else if (arg === '--root' && argv[index + 1]) {
			options.rootDir = argv[index + 1];
			index += 1;
		} else if (arg === '--apply') {
			options.dryRun = false;
		}
	}

	return options;
}

export async function main(argv = process.argv.slice(2)) {
	const options = parseArgs(argv);
	if (!options.detectionReportPath) {
		throw new Error('--report is required.');
	}

	const report = JSON.parse(fs.readFileSync(path.resolve(options.detectionReportPath), 'utf8'));
	const outcome = await applyFromDetectionReport(report, {
		dryRun: options.dryRun,
		rootDir: options.rootDir,
		closeoutReports: report.closeoutReports || [],
		remediationIssues: report.remediationIssues || [],
		issueEvidenceByNumber: report.issueEvidenceByNumber || {},
	});
	const serialized = `${JSON.stringify(outcome, null, 2)}\n`;

	if (options.outputPath) {
		fs.writeFileSync(path.resolve(options.outputPath), serialized);
	} else {
		process.stdout.write(serialized);
	}
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((error) => {
		console.error(error);
		process.exitCode = 1;
	});
}
