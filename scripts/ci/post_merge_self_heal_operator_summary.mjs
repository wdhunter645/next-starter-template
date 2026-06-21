#!/usr/bin/env node

/**
 * Operator-visible markdown summary for post-merge self-healing runs.
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { SAFETY_CATEGORIES } from './post_merge_self_heal_classify.mjs';

export const ACTIVATION_MODEL = Object.freeze({
	AUTOMATIC_VISIBLE_ESCALATION: 'A',
	MANUAL_LIVE_FIXES: 'B',
});

export function activationModelDescription() {
	return [
		`**Activation model:** ${ACTIVATION_MODEL.AUTOMATIC_VISIBLE_ESCALATION} — automatic scheduled/workflow_run runs open or update deduped escalation issues for \`cursor_remediation_required\` findings only.`,
		`**Activation model:** ${ACTIVATION_MODEL.MANUAL_LIVE_FIXES} — manifest pruning and operator-authorization escalations remain manual via \`workflow_dispatch\` with \`dry_run=false\`.`,
	].join('\n');
}

export function formatFindingRow(finding, index) {
	const pr = finding.pr_number ? `#${finding.pr_number}` : 'n/a';
	const source = finding.source_issue ? `#${finding.source_issue}` : 'n/a';
	return `| ${index + 1} | ${finding.classification || 'unknown'} | ${finding.code || finding.kind || 'unknown'} | ${pr} | ${source} | ${String(finding.message || '').replace(/\|/g, '/').slice(0, 120)} |`;
}

export function buildOperatorSummary({
	mode = {},
	detection = {},
	apply = {},
	escalation = {},
	evidenceSources = {},
	workflowRunUrl = '',
} = {}) {
	const findings = detection.findings || [];
	const actionable = findings.filter((finding) => finding.classification !== SAFETY_CATEGORIES.NO_ACTION);
	const lines = [
		'## OPS — Post-Merge Self-Healing operator summary',
		'',
		activationModelDescription(),
		'',
		'### Execution mode',
		`| Setting | Value |`,
		'|---|---|',
		`| dry_run (apply) | \`${mode.dry_run ?? 'true'}\` |`,
		`| apply_safe_fixes | \`${mode.apply_safe_fixes ?? 'false'}\` |`,
		`| open_visible_escalations | \`${mode.open_visible_escalations ?? 'false'}\` |`,
		`| open_escalation_issues (full live) | \`${mode.open_escalation_issues ?? 'false'}\` |`,
		'',
		'### Evidence ingested',
	];

	if (evidenceSources.manifests?.length) {
		for (const manifest of evidenceSources.manifests) {
			lines.push(`- Manifest \`${manifest.path}\`: ${manifest.target_count} target(s)`);
		}
	} else {
		lines.push('- Manifests: none recorded');
	}

	lines.push(
		`- Closeout report sources: ${evidenceSources.closeout_report_sources?.length ?? 0}`,
		`- Open exception issues: ${evidenceSources.open_exception_issues ?? 0}`,
		`- Open remediation issues: ${evidenceSources.open_remediation_issues ?? 0}`,
		`- Open escalation issues: ${evidenceSources.open_escalation_issues ?? 0}`,
	);

	if (evidenceSources.workflow_run?.id) {
		lines.push(`- Triggering workflow run: \`${evidenceSources.workflow_run.id}\` (${evidenceSources.workflow_run.conclusion || 'unknown'})`);
	}

	lines.push(
		'',
		'### Detection',
		`- Status: \`${detection.status || 'unknown'}\``,
		`- Findings: ${findings.length} total, ${actionable.length} actionable`,
		`- Summary: \`${JSON.stringify(detection.summary || {})}\``,
		'',
	);

	if (actionable.length > 0) {
		lines.push(
			'| # | Classification | Code | PR | Source | Message |',
			'|---|---|---|---|---|---|',
			...actionable.map((finding, index) => formatFindingRow(finding, index)),
			'',
		);
	} else {
		lines.push('_No actionable findings — clean state or no evidence of residual problems._', '');
	}

	lines.push(
		'### Apply (safe auto-fix)',
		`- Status: \`${apply.status || 'not run'}\``,
		`- Summary: \`${JSON.stringify(apply.summary || {})}\``,
		'',
		'### Escalation',
		`- Status: \`${escalation.status || 'not run'}\``,
		`- Summary: \`${JSON.stringify(escalation.summary || {})}\``,
	);

	if (Array.isArray(escalation.actions) && escalation.actions.length > 0) {
		lines.push('', '| Action | Status | Issue | Dedupe key |', '|---|---|---|---|');
		for (const action of escalation.actions) {
			lines.push(`| ${action.action} | ${action.status} | ${action.issue || action.existing_issue_number || 'planned'} | \`${action.dedupe_key || ''}\` |`);
		}
	}

	if (workflowRunUrl) {
		lines.push('', `Run URL: ${workflowRunUrl}`);
	}

	lines.push(
		'',
		'### Operator next steps',
		'- Review artifact `post-merge-self-healing-report` for full JSON payloads.',
		'- For `safe_auto_fix` findings: authorize live repair with `workflow_dispatch`, `dry_run=false`, `apply_safe_fixes=true`.',
		'- For `operator_authorization_required` findings: request Bill/Atlas decision before any live mutation.',
		'- Automatic runs already open/update deduped issues for `cursor_remediation_required` when `open_visible_escalations=true`.',
	);

	return `${lines.join('\n')}\n`;
}

function parseArgs(argv = []) {
	const options = {
		modePath: null,
		detectionPath: null,
		applyPath: null,
		escalationPath: null,
		evidencePath: null,
		outputPath: null,
		workflowRunUrl: process.env.GITHUB_RUN_URL || '',
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === '--mode' && argv[index + 1]) {
			options.modePath = argv[index + 1];
			index += 1;
		} else if (arg === '--detection' && argv[index + 1]) {
			options.detectionPath = argv[index + 1];
			index += 1;
		} else if (arg === '--apply' && argv[index + 1]) {
			options.applyPath = argv[index + 1];
			index += 1;
		} else if (arg === '--escalation' && argv[index + 1]) {
			options.escalationPath = argv[index + 1];
			index += 1;
		} else if (arg === '--evidence' && argv[index + 1]) {
			options.evidencePath = argv[index + 1];
			index += 1;
		} else if (arg === '--output' && argv[index + 1]) {
			options.outputPath = argv[index + 1];
			index += 1;
		} else if (arg === '--workflow-run-url' && argv[index + 1]) {
			options.workflowRunUrl = argv[index + 1];
			index += 1;
		}
	}

	return options;
}

function readJsonOptional(filePath) {
	if (!filePath || !fs.existsSync(path.resolve(filePath))) return {};
	return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
}

export async function main(argv = process.argv.slice(2)) {
	const options = parseArgs(argv);
	const evidence = readJsonOptional(options.evidencePath);
	const summary = buildOperatorSummary({
		mode: readJsonOptional(options.modePath),
		detection: readJsonOptional(options.detectionPath),
		apply: readJsonOptional(options.applyPath),
		escalation: readJsonOptional(options.escalationPath),
		evidenceSources: evidence.evidenceSources || {},
		workflowRunUrl: options.workflowRunUrl,
	});

	if (options.outputPath) {
		fs.writeFileSync(path.resolve(options.outputPath), summary);
	} else {
		process.stdout.write(summary);
	}
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((error) => {
		console.error(error);
		process.exitCode = 1;
	});
}
