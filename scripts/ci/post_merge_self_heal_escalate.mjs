#!/usr/bin/env node

/**
 * Escalation issue body generator and deduplication planner for post-merge self-healing CI.
 * Handles cursor_remediation_required and operator_authorization_required findings.
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { githubRepoRequest } from './github_issue_api.mjs';
import {
	FINDING_TYPES,
	SAFETY_CATEGORIES,
} from './post_merge_self_heal_classify.mjs';

export const ESCALATION_MARKER = '<!-- post-merge-self-healing-escalation -->';
export const ESCALATION_LABEL = 'post-merge-self-healing';
export const ESCALATION_TITLE_PREFIX = 'Post-merge self-healing escalation for ';

export function escalationDedupeKey({
	pr_number = null,
	source_issue = null,
	failure_class = null,
} = {}) {
	const pr = String(pr_number ?? 'none').trim();
	const source = String(source_issue ?? 'none').trim();
	const failure = String(failure_class ?? 'unknown').trim().toLowerCase();
	return `${pr}|${source}|${failure}`;
}

export function failureClassForFinding(finding = {}) {
	return String(
		finding.metadata?.code
		|| finding.kind
		|| finding.code
		|| 'unrecognized_failure',
	).trim().toLowerCase();
}

export function escalationTitle(finding = {}, context = {}) {
	const prLabel = finding.pr_number ? `PR #${finding.pr_number}` : 'unknown PR';
	const failure = failureClassForFinding(finding);
	return `${ESCALATION_TITLE_PREFIX}${prLabel} / source ${finding.source_issue ? `#${finding.source_issue}` : 'unknown'} / ${failure}`;
}

export function formatEvidenceList(finding = {}) {
	const evidence = Array.isArray(finding.evidence) ? finding.evidence : [];
	if (evidence.length === 0) {
		return '- none recorded';
	}

	return evidence.map((entry) => {
		if (typeof entry === 'string') return `- ${entry}`;
		const parts = Object.entries(entry)
			.filter(([, value]) => value !== null && value !== undefined && value !== '')
			.map(([key, value]) => `${key}=${JSON.stringify(value)}`);
		return `- ${parts.join(', ')}`;
	}).join('\n');
}

export function buildEscalationIssueBody(finding = {}, context = {}) {
	const failureClass = failureClassForFinding(finding);
	const requiresOperator = finding.classification === SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED
		|| finding.requires_operator_authorization === true;

	const lines = [
		ESCALATION_MARKER,
		'',
		'Post-merge self-healing CI detected a finding that cannot be repaired safely without scoped remediation or operator authorization.',
		'',
		'- Parent workflow: OPS — Post-Merge Self-Healing',
		`- Self-healing run: ${context.workflow_run_url || context.run_url || 'not recorded'}`,
		`- Self-healing job: ${context.job_name || 'not recorded'}`,
		`- Failing PR: ${finding.pr_number ? `#${finding.pr_number}` : 'unknown'}`,
		`- Source issue: ${finding.source_issue ? `#${finding.source_issue}` : 'unknown'}`,
		`- Failure class: ${failureClass}`,
		`- Classification: ${finding.classification || 'unknown'}`,
		`- Bill/Atlas authorization required: ${requiresOperator ? 'yes' : 'no'}`,
		'',
		'## Failure reason',
		finding.message || 'No message recorded for this finding.',
		'',
		'## Evidence',
		formatEvidenceList(finding),
		'',
		'## Workflow context',
		`- Workflow run ID: ${context.workflow_run_id || 'unknown'}`,
		`- Workflow run URL: ${context.workflow_run_url || context.run_url || 'unknown'}`,
		`- Job ID: ${context.job_id || 'unknown'}`,
		'',
		'## Reviewer context',
	];

	if (context.reviewer_comment_ids?.length) {
		for (const commentId of context.reviewer_comment_ids) {
			lines.push(`- review-comment:${commentId}`);
		}
	} else {
		lines.push('- none recorded');
	}

	lines.push(
		'',
		'## Likely affected files',
	);

	if (context.affected_files?.length) {
		for (const file of context.affected_files) lines.push(`- ${file}`);
	} else {
		lines.push('- unknown; inspect closeout report and PR diff');
	}

	lines.push(
		'',
		'## Cursor implementation constraints',
		'- Work only inside the authorized source issue and PR file-touch allowlist.',
		'- Do not edit runtime app code unless the source issue explicitly authorizes it.',
		'- Do not fabricate reviewer dispositions or bypass PR governance.',
		'- Do not merge, relabel, or close issues without explicit repository authority.',
		'',
		'## Acceptance criteria',
		'- Root cause is corrected with repository evidence recorded in the remediation PR.',
		'- Required governance gates pass on the remediation PR head.',
		'- Post-merge self-healing re-run reports no remaining finding for this PR/source/failure class.',
		'',
		'## Action CI refused to take',
		'- CI did not apply an automatic safe auto-fix.',
		'- CI did not mutate PR bodies, reviewer accounting, or source issue state.',
		'- CI did not advance queue state or merge any PR.',
	);

	return `${lines.join('\n')}\n`;
}

export function escalationUpdateComment(finding = {}, context = {}) {
	return [
		'Updated post-merge self-healing escalation evidence.',
		'',
		`- Timestamp: ${context.timestamp || new Date().toISOString()}`,
		`- Failure class: ${failureClassForFinding(finding)}`,
		`- Classification: ${finding.classification || 'unknown'}`,
		'',
		'## Latest evidence',
		formatEvidenceList(finding),
	].join('\n');
}

export function filterEscalationFindings(findings = []) {
	return (Array.isArray(findings) ? findings : []).filter((finding) =>
		finding?.classification === SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED
		|| finding?.classification === SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED,
	);
}

export function indexExistingEscalationIssues(issues = []) {
	const index = new Map();
	for (const issue of issues || []) {
		const body = String(issue?.body || '');
		if (!body.includes(ESCALATION_MARKER)) continue;

		const pr = body.match(/^- Failing PR: #(\d+)$/m)?.[1] ?? issue?.parsed?.pr ?? null;
		const source = body.match(/^- Source issue: #(\d+)$/m)?.[1] ?? null;
		const failure = body.match(/^- Failure class: (.+)$/m)?.[1]?.trim().toLowerCase() ?? null;
		const key = escalationDedupeKey({
			pr_number: pr,
			source_issue: source,
			failure_class: failure,
		});
		if (!index.has(key)) index.set(key, issue);
	}
	return index;
}

export function planEscalationActions(findings = [], { existingIssues = [] } = {}) {
	const escalationFindings = filterEscalationFindings(findings);
	const existingByKey = indexExistingEscalationIssues(existingIssues);
	const actions = [];

	for (const finding of escalationFindings) {
		const key = escalationDedupeKey({
			pr_number: finding.pr_number,
			source_issue: finding.source_issue,
			failure_class: failureClassForFinding(finding),
		});
		const existing = existingByKey.get(key);
		actions.push({
			action: existing ? 'update_issue' : 'create_issue',
			dedupe_key: key,
			finding,
			existing_issue_number: existing?.number ?? null,
			title: escalationTitle(finding),
			body: buildEscalationIssueBody(finding),
			update_comment: escalationUpdateComment(finding),
			labels: [ESCALATION_LABEL],
		});
	}

	return actions;
}

function request(args) {
	return githubRepoRequest({ ...args, userAgent: 'lgfc-post-merge-self-heal-escalate' });
}

export async function executeEscalationAction(action, { token, repository, dryRun = true } = {}) {
	if (dryRun) {
		return {
			...action,
			status: 'planned',
			dry_run: true,
		};
	}

	if (action.action === 'update_issue' && action.existing_issue_number) {
		await request({
			token,
			repository,
			path: `/issues/${action.existing_issue_number}`,
			method: 'PATCH',
			body: { body: action.body },
		});
		return {
			...action,
			status: 'updated',
			issue: `#${action.existing_issue_number}`,
		};
	}

	const created = await request({
		token,
		repository,
		path: '/issues',
		method: 'POST',
		body: {
			title: action.title,
			body: action.body,
			labels: action.labels,
		},
	});

	return {
		...action,
		status: 'created',
		issue: created.html_url || `#${created.number}`,
	};
}

export async function escalateFromDetectionReport(report = {}, options = {}) {
	const dryRun = options.dryRun !== false;
	const actions = planEscalationActions(report.findings || [], options);
	const outcomes = [];

	for (const action of actions) {
		try {
			outcomes.push(await executeEscalationAction(action, {
				token: options.token,
				repository: options.repository,
				dryRun,
			}));
		} catch (error) {
			outcomes.push({
				...action,
				status: 'failed',
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	return {
		status: dryRun ? 'dry_run' : 'executed',
		dry_run: dryRun,
		actions: outcomes,
		summary: {
			planned: outcomes.filter((entry) => entry.status === 'planned').length,
			created: outcomes.filter((entry) => entry.status === 'created').length,
			updated: outcomes.filter((entry) => entry.status === 'updated').length,
			failed: outcomes.filter((entry) => entry.status === 'failed').length,
		},
	};
}

function parseArgs(argv = []) {
	const options = {
		detectionReportPath: null,
		outputPath: null,
		dryRun: true,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === '--report' && argv[index + 1]) {
			options.detectionReportPath = argv[index + 1];
			index += 1;
		} else if (arg === '--output' && argv[index + 1]) {
			options.outputPath = argv[index + 1];
			index += 1;
		} else if (arg === '--apply') {
			options.dryRun = false;
		}
	}

	return options;
}

export async function main(argv = process.argv.slice(2)) {
	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
	const repository = process.env.GITHUB_REPOSITORY;
	const options = parseArgs(argv);

	if (!options.detectionReportPath) {
		throw new Error('--report is required.');
	}

	const report = JSON.parse(fs.readFileSync(path.resolve(options.detectionReportPath), 'utf8'));
	const outcome = await escalateFromDetectionReport(report, {
		dryRun: options.dryRun,
		token,
		repository,
		existingIssues: report.existingEscalationIssues || [],
		workflow_run_id: process.env.GITHUB_RUN_ID || '',
		workflow_run_url: process.env.GITHUB_RUN_URL || '',
		job_id: process.env.GITHUB_JOB || '',
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
