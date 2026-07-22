#!/usr/bin/env node

/**
 * CI-002 administrative closeout auto-repair planner.
 *
 * Dry-run only in this delivery. Apply mode is intentionally refused until
 * fixture coverage and Atlas review authorize mutation.
 *
 * Contract: docs/reference/ci/admin-closeout-auto-repair-contract.md
 */

import fs from 'node:fs';
import path from 'node:path';
import {
	CLOSEOUT_OUTCOMES,
	classifyCloseoutReport,
	loadCloseoutFixture,
} from './closeout_classifier.mjs';

export const PLANNED_ACTIONS = Object.freeze({
	ADD_ADMIN_CLOSEOUT_COMMENT: 'add_admin_closeout_comment',
	RECONCILE_STALE_LABEL: 'reconcile_stale_label',
	CLOSE_DUPLICATE_EXCEPTION: 'close_duplicate_exception',
	QUEUE_ADMIN_ITEM: 'queue_admin_item',
	ESCALATE_CURSOR_REMEDIATION: 'escalate_cursor_remediation',
	ESCALATE_OPERATOR: 'escalate_operator',
	NO_ACTION: 'no_action',
});

function actionForFinding(finding) {
	switch (finding.outcome) {
		case CLOSEOUT_OUTCOMES.SAFE_AUTO_FIX:
			if (finding.kind === 'duplicate_exception_issue' || finding.kind === 'duplicate_remediation_issue') {
				return {
					action: PLANNED_ACTIONS.CLOSE_DUPLICATE_EXCEPTION,
					mutates: true,
					allowed_in_apply: true,
				};
			}
			if (finding.kind === 'stale_label_after_clean_merge' || finding.kind === 'stale_terminal_source_issue_labels') {
				return {
					action: PLANNED_ACTIONS.RECONCILE_STALE_LABEL,
					mutates: true,
					allowed_in_apply: true,
				};
			}
			return {
				action: PLANNED_ACTIONS.ADD_ADMIN_CLOSEOUT_COMMENT,
				mutates: true,
				allowed_in_apply: true,
			};
		case CLOSEOUT_OUTCOMES.QUEUE_ADMIN_CLOSEOUT:
			return {
				action: PLANNED_ACTIONS.QUEUE_ADMIN_ITEM,
				mutates: false,
				allowed_in_apply: false,
			};
		case CLOSEOUT_OUTCOMES.CURSOR_REMEDIATION_REQUIRED:
			return {
				action: PLANNED_ACTIONS.ESCALATE_CURSOR_REMEDIATION,
				mutates: false,
				allowed_in_apply: false,
			};
		case CLOSEOUT_OUTCOMES.OPERATOR_AUTHORIZATION_REQUIRED:
			return {
				action: PLANNED_ACTIONS.ESCALATE_OPERATOR,
				mutates: false,
				allowed_in_apply: false,
			};
		default:
			return {
				action: PLANNED_ACTIONS.NO_ACTION,
				mutates: false,
				allowed_in_apply: false,
			};
	}
}

/**
 * Build a dry-run repair plan from a classifier report.
 * Never mutates GitHub state.
 */
export function planAdminCloseoutRepairs(report = {}) {
	const classified = classifyCloseoutReport(report);
	const planned = classified.findings.map((finding) => {
		const plan = actionForFinding(finding);
		return {
			kind: finding.kind,
			outcome: finding.outcome,
			blocker: finding.blocker,
			may_auto_repair: finding.may_auto_repair,
			planned_action: plan.action,
			would_mutate: plan.mutates && finding.may_auto_repair,
			allowed_when_apply_enabled: plan.allowed_in_apply && finding.may_auto_repair,
			reason: finding.reason,
			pr_number: finding.pr_number,
			source_issue: finding.source_issue,
		};
	});

	const wouldMutateCount = planned.filter((entry) => entry.would_mutate).length;

	return {
		ok: true,
		dry_run: true,
		apply_enabled: false,
		mutations_performed: 0,
		pr_number: classified.pr_number,
		source_issue: classified.source_issue,
		overall_outcome: classified.overall_outcome,
		blockers_never_auto_repaired: classified.blockers_never_auto_repaired,
		summary: {
			...classified.summary,
			planned_mutations: wouldMutateCount,
		},
		planned,
		authority: 'Bill / ChatGPT authority preserved. Apply mode is disabled in this delivery; dry-run plans only.',
		blocker_safety_statement:
			'Product, build, test, security, auth, privacy, design, data, scope, missing validation, ambiguous source issue, and unresolved reviewer defects are never auto-repaired.',
	};
}

/**
 * Apply mode is intentionally unavailable until a later authorized task.
 */
export function applyAdminCloseoutRepairs(_report = {}, options = {}) {
	return {
		ok: false,
		dry_run: false,
		apply_enabled: false,
		mutations_performed: 0,
		error: 'apply_mode_disabled',
		message:
			'CI-002 apply mode is disabled. Re-run with --dry-run. Apply mode requires a later authorized delivery after fixture soak and Atlas review.',
		options,
	};
}

function parseArgs(argv = process.argv.slice(2)) {
	const args = {
		dryRun: false,
		apply: false,
		fixture: '',
		report: '',
		pr: null,
	};

	for (let i = 0; i < argv.length; i += 1) {
		const arg = argv[i];
		if (arg === '--dry-run') args.dryRun = true;
		else if (arg === '--apply') args.apply = true;
		else if (arg === '--fixture') args.fixture = argv[++i] || '';
		else if (arg === '--report') args.report = argv[++i] || '';
		else if (arg === '--pr') args.pr = Number(argv[++i]);
	}

	return args;
}

function resolveReport(args) {
	if (args.fixture) return loadCloseoutFixture(args.fixture);
	if (args.report) return loadCloseoutFixture(args.report);
	if (Number.isInteger(args.pr) && args.pr > 0) {
		const candidate = path.resolve(`scripts/ci/fixtures/admin_closeout/pr-${args.pr}.json`);
		if (fs.existsSync(candidate)) return loadCloseoutFixture(candidate);
		throw new Error(
			`No local report for --pr ${args.pr}. Pass --fixture or --report.`,
		);
	}
	throw new Error(
		'Usage: node scripts/ci/admin_closeout_auto_repair.mjs --dry-run (--fixture <path> | --report <path> | --pr <number>)',
	);
}

export function renderRepairPlan(plan) {
	const lines = [
		'CI-002 admin closeout auto-repair (dry-run plan)',
		`Overall outcome: ${plan.overall_outcome}`,
		`PR: ${plan.pr_number ?? 'n/a'}`,
		`Source issue: ${plan.source_issue ?? 'n/a'}`,
		`Apply enabled: ${plan.apply_enabled ? 'YES' : 'NO'}`,
		`Mutations performed: ${plan.mutations_performed}`,
		`Planned mutations (not executed): ${plan.summary.planned_mutations}`,
		`Blockers never auto-repaired: ${plan.blockers_never_auto_repaired ? 'YES' : 'NO'}`,
		'',
		'Planned actions:',
	];

	for (const entry of plan.planned) {
		lines.push(
			`- [${entry.outcome}] ${entry.kind} → ${entry.planned_action}`
			+ (entry.would_mutate ? ' (would mutate if apply enabled)' : ' (no mutation)'),
		);
	}

	lines.push('');
	lines.push(plan.blocker_safety_statement);
	lines.push(plan.authority);
	return lines.join('\n');
}

export function runAdminRepairCli(argv = process.argv.slice(2), { stdout = console.log, stderr = console.error } = {}) {
	const args = parseArgs(argv);

	if (args.apply) {
		const refused = applyAdminCloseoutRepairs({}, { requested: true });
		stderr(refused.message);
		return 2;
	}

	if (!args.dryRun) {
		stderr('CI-002 admin_closeout_auto_repair.mjs requires --dry-run. Apply mode is disabled.');
		return 2;
	}

	let report;
	try {
		report = resolveReport(args);
	} catch (err) {
		stderr(String(err.message || err));
		return 2;
	}

	if (Number.isInteger(args.pr) && args.pr > 0 && report.pr_number == null) {
		report.pr_number = args.pr;
	}

	const plan = planAdminCloseoutRepairs(report);
	stdout(renderRepairPlan(plan));

	if (!plan.blockers_never_auto_repaired) {
		stderr('FAIL — blocker safety invariant violated.');
		return 1;
	}

	stdout('PASS — dry-run repair plan complete; no mutations performed.');
	return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	process.exitCode = runAdminRepairCli();
}
