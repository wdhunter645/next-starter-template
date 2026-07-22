#!/usr/bin/env node

/**
 * CI-002 administrative closeout classifier (dry-run).
 *
 * Wraps `post_merge_self_heal_classify.mjs` and adds the admin-closeout outcome
 * `queue_admin_closeout`. Classification only — no GitHub mutations.
 *
 * Contract: docs/reference/ci/admin-closeout-auto-repair-contract.md
 */

import fs from 'node:fs';
import path from 'node:path';
import {
	SAFETY_CATEGORIES as SELF_HEAL_CATEGORIES,
	FINDING_TYPES as SELF_HEAL_FINDING_TYPES,
	classifyFinding as classifySelfHealFinding,
	classifyFindings as classifySelfHealFindings,
	highestPriorityCategory as selfHealHighestPriority,
	summarizeClassifications as summarizeSelfHeal,
} from './post_merge_self_heal_classify.mjs';

export const CLOSEOUT_OUTCOMES = Object.freeze({
	SAFE_AUTO_FIX: 'safe_auto_fix',
	QUEUE_ADMIN_CLOSEOUT: 'queue_admin_closeout',
	CURSOR_REMEDIATION_REQUIRED: 'cursor_remediation_required',
	OPERATOR_AUTHORIZATION_REQUIRED: 'operator_authorization_required',
	NO_ACTION: 'no_action',
});

/**
 * Naming reconciliation (Stage 0 #2435):
 * self-heal `intentionally_deferred` maps to CI-002 `queue_admin_closeout`
 * when the finding is administrative and not product remediation.
 */
export const OUTCOME_FROM_SELF_HEAL = Object.freeze({
	[SELF_HEAL_CATEGORIES.SAFE_AUTO_FIX]: CLOSEOUT_OUTCOMES.SAFE_AUTO_FIX,
	[SELF_HEAL_CATEGORIES.CURSOR_REMEDIATION_REQUIRED]: CLOSEOUT_OUTCOMES.CURSOR_REMEDIATION_REQUIRED,
	[SELF_HEAL_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED]: CLOSEOUT_OUTCOMES.OPERATOR_AUTHORIZATION_REQUIRED,
	[SELF_HEAL_CATEGORIES.INTENTIONALLY_DEFERRED]: CLOSEOUT_OUTCOMES.QUEUE_ADMIN_CLOSEOUT,
	[SELF_HEAL_CATEGORIES.NO_ACTION]: CLOSEOUT_OUTCOMES.NO_ACTION,
});

export const ADMIN_FINDING_TYPES = Object.freeze({
	STALE_LABEL_AFTER_CLEAN_MERGE: 'stale_label_after_clean_merge',
	FAILED_REQUIRED_TEST: 'failed_required_test',
	MISSING_VALIDATION_EVIDENCE: 'missing_validation_evidence',
	DUPLICATE_EXCEPTION_ISSUE: 'duplicate_exception_issue',
	AMBIGUOUS_SOURCE_ISSUE: 'ambiguous_source_issue',
	ADMIN_WARNING_NON_DETERMINISTIC: 'admin_warning_non_deterministic',
	PRODUCT_OR_SECURITY_DEFECT: 'product_or_security_defect',
	UNRESOLVED_REVIEWER_OBJECTION: 'unresolved_reviewer_objection',
	CLEAN_STATE: 'clean_state',
});

const BLOCKER_TYPES = new Set([
	ADMIN_FINDING_TYPES.FAILED_REQUIRED_TEST,
	ADMIN_FINDING_TYPES.MISSING_VALIDATION_EVIDENCE,
	ADMIN_FINDING_TYPES.PRODUCT_OR_SECURITY_DEFECT,
	ADMIN_FINDING_TYPES.UNRESOLVED_REVIEWER_OBJECTION,
	SELF_HEAL_FINDING_TYPES.FAILED_REQUIRED_WORKFLOW,
	SELF_HEAL_FINDING_TYPES.AUTH_TOKEN_SECRET_FAILURE,
	SELF_HEAL_FINDING_TYPES.ALLOWLIST_VIOLATION,
	SELF_HEAL_FINDING_TYPES.UNRESOLVED_REVIEW_THREAD,
	SELF_HEAL_FINDING_TYPES.MISSING_REVIEWER_DISPOSITION,
	SELF_HEAL_FINDING_TYPES.RUNTIME_APP_BEHAVIOR_CHANGE,
]);

const OPERATOR_TYPES = new Set([
	ADMIN_FINDING_TYPES.AMBIGUOUS_SOURCE_ISSUE,
	SELF_HEAL_FINDING_TYPES.ACTIVE_ALTERNATE_PROGRAM_LANE,
	SELF_HEAL_FINDING_TYPES.PROGRAM_LANE_ISSUE_MUTATION,
	SELF_HEAL_FINDING_TYPES.SOURCE_ISSUE_LINKAGE_CHANGE,
	SELF_HEAL_FINDING_TYPES.OUT_OF_ALLOWLIST_SCOPE,
]);

const SAFE_ADMIN_TYPES = new Set([
	ADMIN_FINDING_TYPES.STALE_LABEL_AFTER_CLEAN_MERGE,
	ADMIN_FINDING_TYPES.DUPLICATE_EXCEPTION_ISSUE,
	SELF_HEAL_FINDING_TYPES.STALE_MANIFEST_ENTRY,
	SELF_HEAL_FINDING_TYPES.DUPLICATE_REMEDIATION_ISSUE,
	SELF_HEAL_FINDING_TYPES.STALE_EXCEPTION_ISSUE,
	SELF_HEAL_FINDING_TYPES.STALE_TERMINAL_SOURCE_ISSUE_LABELS,
]);

const QUEUE_ADMIN_TYPES = new Set([
	ADMIN_FINDING_TYPES.ADMIN_WARNING_NON_DETERMINISTIC,
	SELF_HEAL_FINDING_TYPES.INTENTIONALLY_DEFERRED,
]);

const OUTCOME_PRIORITY = [
	CLOSEOUT_OUTCOMES.OPERATOR_AUTHORIZATION_REQUIRED,
	CLOSEOUT_OUTCOMES.CURSOR_REMEDIATION_REQUIRED,
	CLOSEOUT_OUTCOMES.QUEUE_ADMIN_CLOSEOUT,
	CLOSEOUT_OUTCOMES.SAFE_AUTO_FIX,
	CLOSEOUT_OUTCOMES.NO_ACTION,
];

function normalizeAdminType(finding = {}) {
	const explicit = String(finding.type || finding.kind || finding.finding_type || '').trim();
	if (explicit && Object.values(ADMIN_FINDING_TYPES).includes(explicit)) {
		return explicit;
	}

	const code = String(finding.code || '').trim().toLowerCase();
	if (code === 'stale_label' || code === 'stale_label_after_clean_merge') {
		return ADMIN_FINDING_TYPES.STALE_LABEL_AFTER_CLEAN_MERGE;
	}
	if (code === 'failed_required_test' || code === 'failed_test') {
		return ADMIN_FINDING_TYPES.FAILED_REQUIRED_TEST;
	}
	if (code === 'missing_validation' || code === 'missing_validation_evidence') {
		return ADMIN_FINDING_TYPES.MISSING_VALIDATION_EVIDENCE;
	}
	if (code === 'duplicate_exception' || code === 'duplicate_exception_issue') {
		return ADMIN_FINDING_TYPES.DUPLICATE_EXCEPTION_ISSUE;
	}
	if (code === 'ambiguous_source_issue' || code === 'ambiguous_source') {
		return ADMIN_FINDING_TYPES.AMBIGUOUS_SOURCE_ISSUE;
	}
	if (code === 'admin_warning' || code === 'admin_warning_non_deterministic') {
		return ADMIN_FINDING_TYPES.ADMIN_WARNING_NON_DETERMINISTIC;
	}
	if (code === 'clean_state') {
		return ADMIN_FINDING_TYPES.CLEAN_STATE;
	}
	return '';
}

function evidenceComplete(finding = {}) {
	if (finding.evidence_complete === false) return false;
	if (finding.evidence_complete === true) return true;
	const evidence = finding.evidence;
	return Array.isArray(evidence) && evidence.length > 0;
}

function hasCanonicalDuplicateEvidence(finding = {}) {
	const evidence = Array.isArray(finding.evidence) ? finding.evidence : [];
	return evidence.some((entry) => entry?.canonical === true || entry?.canonical_issue);
}

/**
 * Fail-closed validation gate for safe_auto_fix.
 * Explicit fail/missing always wins over pass or merged_clean shortcuts.
 */
export function resolveValidationStatus(finding = {}, context = {}) {
	const candidates = [finding.validation_status, context.validation_status]
		.filter((value) => value != null && value !== '')
		.map((value) => String(value).trim().toLowerCase());

	if (candidates.some((value) => value === 'fail' || value === 'failed')) {
		return 'fail';
	}
	if (candidates.some((value) => value === 'missing')) {
		return 'missing';
	}
	if (candidates.some((value) => value === 'pass' || value === 'success')) {
		return 'pass';
	}
	return candidates[0] || null;
}

function validationAllowsSafeAutoFix(finding = {}, context = {}) {
	return resolveValidationStatus(finding, context) === 'pass' && evidenceComplete(finding);
}

function blockerOutcomeForFailedValidation(finding, adminType, validationStatus) {
	return buildResult({
		finding,
		kind: adminType,
		outcome: CLOSEOUT_OUTCOMES.CURSOR_REMEDIATION_REQUIRED,
		blocker: true,
		may_auto_repair: false,
		reason: validationStatus === 'missing'
			? 'Missing validation evidence — blocker; never auto-repaired.'
			: 'Validation failed — blocker; never auto-repaired.',
	});
}

function mapSelfHealOutcome(selfHealClassification) {
	return OUTCOME_FROM_SELF_HEAL[selfHealClassification] || CLOSEOUT_OUTCOMES.CURSOR_REMEDIATION_REQUIRED;
}

/**
 * Classify one administrative closeout finding.
 * Fail-closed: ambiguous or blocker classes never become safe_auto_fix.
 */
export function classifyCloseoutFinding(finding = {}, context = {}) {
	const safeFinding = finding ?? {};
	const adminType = normalizeAdminType(safeFinding);

	if (adminType === ADMIN_FINDING_TYPES.CLEAN_STATE) {
		return buildResult({
			finding: safeFinding,
			kind: adminType,
			outcome: CLOSEOUT_OUTCOMES.NO_ACTION,
			blocker: false,
			may_auto_repair: false,
			reason: 'Clean administrative state; no mutation planned.',
		});
	}

	if (adminType && OPERATOR_TYPES.has(adminType)) {
		return buildResult({
			finding: safeFinding,
			kind: adminType,
			outcome: CLOSEOUT_OUTCOMES.OPERATOR_AUTHORIZATION_REQUIRED,
			blocker: true,
			may_auto_repair: false,
			reason: 'Ambiguous source lineage or protected administrative authority required.',
		});
	}

	if (adminType && BLOCKER_TYPES.has(adminType)) {
		return buildResult({
			finding: safeFinding,
			kind: adminType,
			outcome: CLOSEOUT_OUTCOMES.CURSOR_REMEDIATION_REQUIRED,
			blocker: true,
			may_auto_repair: false,
			reason: 'Product/build/test/security/reviewer blocker — never auto-repaired.',
		});
	}

	const validationStatus = resolveValidationStatus(safeFinding, context);

	if (adminType === ADMIN_FINDING_TYPES.DUPLICATE_EXCEPTION_ISSUE) {
		if (validationStatus === 'fail' || validationStatus === 'missing') {
			return blockerOutcomeForFailedValidation(safeFinding, adminType, validationStatus);
		}
		if (
			validationAllowsSafeAutoFix(safeFinding, context)
			&& hasCanonicalDuplicateEvidence(safeFinding)
		) {
			return buildResult({
				finding: safeFinding,
				kind: adminType,
				outcome: CLOSEOUT_OUTCOMES.SAFE_AUTO_FIX,
				blocker: false,
				may_auto_repair: true,
				reason: 'Duplicate exception with canonical evidence; safe close/link planned (dry-run).',
			});
		}
		return buildResult({
			finding: safeFinding,
			kind: adminType,
			outcome: CLOSEOUT_OUTCOMES.QUEUE_ADMIN_CLOSEOUT,
			blocker: false,
			may_auto_repair: false,
			reason: 'Duplicate exception lacks complete pass validation or canonical evidence; queue administrative closeout.',
		});
	}

	if (adminType === ADMIN_FINDING_TYPES.STALE_LABEL_AFTER_CLEAN_MERGE) {
		if (validationStatus === 'fail' || validationStatus === 'missing') {
			return blockerOutcomeForFailedValidation(safeFinding, adminType, validationStatus);
		}
		// merged_clean may corroborate pass evidence but cannot override fail/missing.
		if (validationAllowsSafeAutoFix(safeFinding, context) && safeFinding.merged_clean !== false) {
			return buildResult({
				finding: safeFinding,
				kind: adminType,
				outcome: CLOSEOUT_OUTCOMES.SAFE_AUTO_FIX,
				blocker: false,
				may_auto_repair: true,
				reason: 'Stale label after clean merge with complete evidence; deterministic admin repair planned (dry-run).',
			});
		}
		return buildResult({
			finding: safeFinding,
			kind: adminType,
			outcome: CLOSEOUT_OUTCOMES.QUEUE_ADMIN_CLOSEOUT,
			blocker: false,
			may_auto_repair: false,
			reason: 'Stale label without complete clean-merge pass evidence; queue administrative closeout.',
		});
	}

	if (adminType && QUEUE_ADMIN_TYPES.has(adminType)) {
		return buildResult({
			finding: safeFinding,
			kind: adminType,
			outcome: CLOSEOUT_OUTCOMES.QUEUE_ADMIN_CLOSEOUT,
			blocker: false,
			may_auto_repair: false,
			reason: 'Administrative warning is non-deterministic; queue without auto-repair.',
		});
	}

	if (adminType && SAFE_ADMIN_TYPES.has(adminType)) {
		if (validationStatus === 'fail' || validationStatus === 'missing') {
			return blockerOutcomeForFailedValidation(safeFinding, adminType, validationStatus);
		}
		if (validationAllowsSafeAutoFix(safeFinding, context)) {
			return buildResult({
				finding: safeFinding,
				kind: adminType,
				outcome: CLOSEOUT_OUTCOMES.SAFE_AUTO_FIX,
				blocker: false,
				may_auto_repair: true,
				reason: 'Deterministic administrative finding with complete pass evidence (dry-run plan only).',
			});
		}
	}

	// Delegate unrecognized / self-heal finding shapes to the existing classifier.
	const selfHeal = classifySelfHealFinding(safeFinding, context);
	let outcome = mapSelfHealOutcome(selfHeal.classification);

	if (safeFinding.operator_authorization_required === true) {
		outcome = CLOSEOUT_OUTCOMES.OPERATOR_AUTHORIZATION_REQUIRED;
	} else if (
		outcome === CLOSEOUT_OUTCOMES.SAFE_AUTO_FIX
		&& (
			safeFinding.blocker === true
			|| validationStatus === 'fail'
			|| validationStatus === 'missing'
			|| validationStatus !== 'pass'
		)
	) {
		// Fail closed: safe_auto_fix requires explicit validation pass.
		outcome = (validationStatus === 'fail' || validationStatus === 'missing' || safeFinding.blocker === true)
			? CLOSEOUT_OUTCOMES.CURSOR_REMEDIATION_REQUIRED
			: CLOSEOUT_OUTCOMES.QUEUE_ADMIN_CLOSEOUT;
	}

	const blocker = outcome === CLOSEOUT_OUTCOMES.CURSOR_REMEDIATION_REQUIRED
		|| outcome === CLOSEOUT_OUTCOMES.OPERATOR_AUTHORIZATION_REQUIRED;

	return buildResult({
		finding: safeFinding,
		kind: selfHeal.kind || adminType || 'unrecognized_finding',
		outcome,
		blocker,
		may_auto_repair: outcome === CLOSEOUT_OUTCOMES.SAFE_AUTO_FIX,
		reason: selfHeal.message
			|| `Mapped from self-heal classification ${selfHeal.classification} → ${outcome}.`,
		self_heal: selfHeal,
	});
}

function buildResult({
	finding,
	kind,
	outcome,
	blocker,
	may_auto_repair,
	reason,
	self_heal = null,
}) {
	return {
		kind,
		outcome,
		classification: outcome,
		blocker: Boolean(blocker),
		may_auto_repair: Boolean(may_auto_repair) && outcome === CLOSEOUT_OUTCOMES.SAFE_AUTO_FIX,
		safe_auto_fix: outcome === CLOSEOUT_OUTCOMES.SAFE_AUTO_FIX,
		queue_admin_closeout: outcome === CLOSEOUT_OUTCOMES.QUEUE_ADMIN_CLOSEOUT,
		requires_cursor_remediation: outcome === CLOSEOUT_OUTCOMES.CURSOR_REMEDIATION_REQUIRED,
		requires_operator_authorization: outcome === CLOSEOUT_OUTCOMES.OPERATOR_AUTHORIZATION_REQUIRED,
		message: finding.message || finding.summary || reason,
		reason,
		evidence: Array.isArray(finding.evidence) ? finding.evidence : [],
		pr_number: finding.pr_number ?? finding.pr ?? null,
		source_issue: finding.source_issue ?? finding.issue_number ?? null,
		recommended_action: finding.recommended_action || null,
		self_heal,
		metadata: {
			code: finding.code || null,
			...(finding.metadata && typeof finding.metadata === 'object' ? finding.metadata : {}),
		},
	};
}

export function classifyCloseoutFindings(findings = [], context = {}) {
	return (Array.isArray(findings) ? findings : []).map((finding) => classifyCloseoutFinding(finding, context));
}

export function summarizeCloseoutClassifications(classified = []) {
	const summary = {
		safe_auto_fix: 0,
		queue_admin_closeout: 0,
		cursor_remediation_required: 0,
		operator_authorization_required: 0,
		no_action: 0,
		blockers: 0,
		may_auto_repair: 0,
	};

	for (const entry of classified) {
		if (summary[entry.outcome] !== undefined) {
			summary[entry.outcome] += 1;
		}
		if (entry.blocker) summary.blockers += 1;
		if (entry.may_auto_repair) summary.may_auto_repair += 1;
	}

	return summary;
}

export function highestPriorityCloseoutOutcome(classified = []) {
	if (!Array.isArray(classified) || classified.length === 0) {
		return CLOSEOUT_OUTCOMES.NO_ACTION;
	}
	for (const outcome of OUTCOME_PRIORITY) {
		if (classified.some((entry) => entry.outcome === outcome)) {
			return outcome;
		}
	}
	return CLOSEOUT_OUTCOMES.NO_ACTION;
}

export function classifyCloseoutReport(report = {}) {
	const context = {
		validation_status: report.validation_status || report.validationStatus || null,
		merged: report.merged === true || report.pr_merged === true,
		pr_number: report.pr_number ?? report.pr ?? null,
		source_issue: report.source_issue ?? null,
	};

	const findings = Array.isArray(report.findings) ? report.findings : [];
	const classified = classifyCloseoutFindings(findings, context);
	const summary = summarizeCloseoutClassifications(classified);
	const overall = highestPriorityCloseoutOutcome(classified);

	return {
		ok: true,
		dry_run: true,
		mode: 'classify',
		pr_number: context.pr_number,
		source_issue: context.source_issue,
		validation_status: context.validation_status,
		overall_outcome: overall,
		blocker_safe: summary.blockers === 0 || classified.every((entry) =>
			!entry.may_auto_repair || !entry.blocker,
		),
		blockers_never_auto_repaired: classified
			.filter((entry) => entry.blocker)
			.every((entry) => entry.may_auto_repair === false),
		summary,
		findings: classified,
		authority: 'Bill / ChatGPT merge and protected-boundary authority unchanged. Classifier is dry-run only.',
	};
}

export function loadCloseoutFixture(fixturePath) {
	const absolute = path.resolve(fixturePath);
	const raw = fs.readFileSync(absolute, 'utf8');
	return JSON.parse(raw);
}

function parseArgs(argv = process.argv.slice(2)) {
	const args = {
		dryRun: false,
		fixture: '',
		report: '',
		pr: null,
	};

	for (let i = 0; i < argv.length; i += 1) {
		const arg = argv[i];
		if (arg === '--dry-run') args.dryRun = true;
		else if (arg === '--fixture') args.fixture = argv[++i] || '';
		else if (arg === '--report') args.report = argv[++i] || '';
		else if (arg === '--pr') args.pr = Number(argv[++i]);
	}

	return args;
}

function resolveReportInput(args) {
	if (args.fixture) {
		return loadCloseoutFixture(args.fixture);
	}
	if (args.report) {
		return loadCloseoutFixture(args.report);
	}
	if (Number.isInteger(args.pr) && args.pr > 0) {
		const candidate = path.resolve(
			`scripts/ci/fixtures/admin_closeout/pr-${args.pr}.json`,
		);
		if (fs.existsSync(candidate)) {
			return loadCloseoutFixture(candidate);
		}
		throw new Error(
			`No local report for --pr ${args.pr}. Pass --fixture or --report with classifier inputs. Live GitHub fetch is intentionally not performed in dry-run classifier CLI.`,
		);
	}
	throw new Error(
		'Usage: node scripts/ci/closeout_classifier.mjs --dry-run (--fixture <path> | --report <path> | --pr <number>)',
	);
}

export function renderClassifierReport(result) {
	const lines = [
		'CI-002 closeout classifier (dry-run)',
		`Overall outcome: ${result.overall_outcome}`,
		`PR: ${result.pr_number ?? 'n/a'}`,
		`Source issue: ${result.source_issue ?? 'n/a'}`,
		`Validation status: ${result.validation_status ?? 'n/a'}`,
		`Blockers never auto-repaired: ${result.blockers_never_auto_repaired ? 'YES' : 'NO'}`,
		`Summary: ${JSON.stringify(result.summary)}`,
		'',
		'Findings:',
	];

	for (const finding of result.findings) {
		lines.push(
			`- [${finding.outcome}] ${finding.kind}: ${finding.reason}`,
		);
	}

	lines.push('');
	lines.push(result.authority);
	return lines.join('\n');
}

export function runClassifierCli(argv = process.argv.slice(2), { stdout = console.log, stderr = console.error } = {}) {
	const args = parseArgs(argv);

	if (!args.dryRun) {
		stderr('CI-002 closeout_classifier.mjs requires --dry-run. Apply/mutation modes are not enabled.');
		return 2;
	}

	let report;
	try {
		report = resolveReportInput(args);
	} catch (err) {
		stderr(String(err.message || err));
		return 2;
	}

	if (Number.isInteger(args.pr) && args.pr > 0 && report.pr_number == null) {
		report.pr_number = args.pr;
	}

	const result = classifyCloseoutReport(report);
	stdout(renderClassifierReport(result));

	if (!result.blockers_never_auto_repaired) {
		stderr('FAIL — classifier safety invariant violated: a blocker was marked may_auto_repair.');
		return 1;
	}

	stdout('PASS — dry-run classification complete; no mutations performed.');
	return 0;
}

export {
	SELF_HEAL_CATEGORIES,
	SELF_HEAL_FINDING_TYPES,
	classifySelfHealFinding,
	classifySelfHealFindings,
	selfHealHighestPriority,
	summarizeSelfHeal,
};

if (import.meta.url === `file://${process.argv[1]}`) {
	process.exitCode = runClassifierCli();
}
