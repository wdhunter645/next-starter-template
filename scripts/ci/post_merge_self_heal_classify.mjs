#!/usr/bin/env node

/**
 * Post-merge self-healing classifier and safety model.
 *
 * Pure classification only — no GitHub mutations, manifest writes, or auto-fix
 * execution. Later child issues consume these exports.
 */

export const SAFETY_CATEGORIES = Object.freeze({
	SAFE_AUTO_FIX: 'safe_auto_fix',
	CURSOR_ESCALATION_REQUIRED: 'cursor_escalation_required',
	OPERATOR_AUTHORIZATION_REQUIRED: 'operator_authorization_required',
	NO_ACTION: 'no_action',
	UNKNOWN: 'unknown',
});

export const FINDING_TYPES = Object.freeze({
	STALE_MANIFEST_ENTRY: 'stale_manifest_entry',
	DUPLICATE_REMEDIATION_ISSUE: 'duplicate_remediation_issue',
	STALE_EXCEPTION_ISSUE: 'stale_exception_issue',
	FALSE_RED_ARTIFACT_UPLOAD: 'false_red_artifact_upload',
	MISSING_REVIEWER_DISPOSITION: 'missing_reviewer_disposition',
	SOURCE_ISSUE_MISMATCH: 'source_issue_mismatch',
	ALLOWLIST_VIOLATION: 'allowlist_violation',
	UNRESOLVED_REVIEW_THREAD: 'unresolved_review_thread',
	FAILED_REQUIRED_WORKFLOW: 'failed_required_workflow',
	AUTH_TOKEN_SECRET_FAILURE: 'auth_token_secret_failure',
	AMBIGUOUS_CLOSEOUT_BLOCKER: 'ambiguous_closeout_blocker',
	ACTIVE_ALTERNATE_PROGRAM_LANE: 'active_alternate_program_lane',
	TRANCHE_A_SCOPE: 'tranche_a_scope',
	PROGRAM_LANE_ISSUE_MUTATION: 'program_lane_issue_mutation',
	SOURCE_ISSUE_LINKAGE_CHANGE: 'source_issue_linkage_change',
	POST_MERGE_PR_BODY_MUTATION: 'post_merge_pr_body_mutation',
	RUNTIME_APP_BEHAVIOR_CHANGE: 'runtime_app_behavior_change',
	OUT_OF_ALLOWLIST_SCOPE: 'out_of_allowlist_scope',
	CLEAN_STATE: 'clean_state',
	UNRECOGNIZED_FAILURE: 'unrecognized_failure',
	INCOMPLETE_REPORT_PAYLOAD: 'incomplete_report_payload',
	CONTRADICTORY_REPO_STATE: 'contradictory_repo_state',
});

const TRANCHE_A_SOURCE_ISSUE = '1255';

const FINDING_TYPE_TO_CATEGORY = Object.freeze({
	[FINDING_TYPES.STALE_MANIFEST_ENTRY]: SAFETY_CATEGORIES.SAFE_AUTO_FIX,
	[FINDING_TYPES.DUPLICATE_REMEDIATION_ISSUE]: SAFETY_CATEGORIES.SAFE_AUTO_FIX,
	[FINDING_TYPES.STALE_EXCEPTION_ISSUE]: SAFETY_CATEGORIES.SAFE_AUTO_FIX,
	[FINDING_TYPES.FALSE_RED_ARTIFACT_UPLOAD]: SAFETY_CATEGORIES.SAFE_AUTO_FIX,
	[FINDING_TYPES.MISSING_REVIEWER_DISPOSITION]: SAFETY_CATEGORIES.CURSOR_ESCALATION_REQUIRED,
	[FINDING_TYPES.SOURCE_ISSUE_MISMATCH]: SAFETY_CATEGORIES.CURSOR_ESCALATION_REQUIRED,
	[FINDING_TYPES.ALLOWLIST_VIOLATION]: SAFETY_CATEGORIES.CURSOR_ESCALATION_REQUIRED,
	[FINDING_TYPES.UNRESOLVED_REVIEW_THREAD]: SAFETY_CATEGORIES.CURSOR_ESCALATION_REQUIRED,
	[FINDING_TYPES.FAILED_REQUIRED_WORKFLOW]: SAFETY_CATEGORIES.CURSOR_ESCALATION_REQUIRED,
	[FINDING_TYPES.AUTH_TOKEN_SECRET_FAILURE]: SAFETY_CATEGORIES.CURSOR_ESCALATION_REQUIRED,
	[FINDING_TYPES.AMBIGUOUS_CLOSEOUT_BLOCKER]: SAFETY_CATEGORIES.CURSOR_ESCALATION_REQUIRED,
	[FINDING_TYPES.ACTIVE_ALTERNATE_PROGRAM_LANE]: SAFETY_CATEGORIES.CURSOR_ESCALATION_REQUIRED,
	[FINDING_TYPES.TRANCHE_A_SCOPE]: SAFETY_CATEGORIES.CURSOR_ESCALATION_REQUIRED,
	[FINDING_TYPES.PROGRAM_LANE_ISSUE_MUTATION]: SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED,
	[FINDING_TYPES.SOURCE_ISSUE_LINKAGE_CHANGE]: SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED,
	[FINDING_TYPES.POST_MERGE_PR_BODY_MUTATION]: SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED,
	[FINDING_TYPES.RUNTIME_APP_BEHAVIOR_CHANGE]: SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED,
	[FINDING_TYPES.OUT_OF_ALLOWLIST_SCOPE]: SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED,
	[FINDING_TYPES.CLEAN_STATE]: SAFETY_CATEGORIES.NO_ACTION,
	[FINDING_TYPES.UNRECOGNIZED_FAILURE]: SAFETY_CATEGORIES.UNKNOWN,
	[FINDING_TYPES.INCOMPLETE_REPORT_PAYLOAD]: SAFETY_CATEGORIES.UNKNOWN,
	[FINDING_TYPES.CONTRADICTORY_REPO_STATE]: SAFETY_CATEGORIES.UNKNOWN,
});

const LEGACY_CODE_TO_FINDING_TYPE = Object.freeze({
	stale_manifest_entry: FINDING_TYPES.STALE_MANIFEST_ENTRY,
	duplicate_remediation_issue: FINDING_TYPES.DUPLICATE_REMEDIATION_ISSUE,
	stale_exception_issue: FINDING_TYPES.STALE_EXCEPTION_ISSUE,
	false_red_artifact_upload: FINDING_TYPES.FALSE_RED_ARTIFACT_UPLOAD,
	missing_reviewer_disposition: FINDING_TYPES.MISSING_REVIEWER_DISPOSITION,
	source_issue_mismatch: FINDING_TYPES.SOURCE_ISSUE_MISMATCH,
	allowlist_violation: FINDING_TYPES.ALLOWLIST_VIOLATION,
	unresolved_review_thread: FINDING_TYPES.UNRESOLVED_REVIEW_THREAD,
	failed_required_workflow: FINDING_TYPES.FAILED_REQUIRED_WORKFLOW,
	required_workflow_failure: FINDING_TYPES.FAILED_REQUIRED_WORKFLOW,
	auth_token_secret_failure: FINDING_TYPES.AUTH_TOKEN_SECRET_FAILURE,
	'secret-access/configuration': FINDING_TYPES.AUTH_TOKEN_SECRET_FAILURE,
	ambiguous_closeout_blocker: FINDING_TYPES.AMBIGUOUS_CLOSEOUT_BLOCKER,
	closeout_blocker_declared: FINDING_TYPES.AMBIGUOUS_CLOSEOUT_BLOCKER,
	active_alternate_program_lane: FINDING_TYPES.ACTIVE_ALTERNATE_PROGRAM_LANE,
	tranche_a_scope: FINDING_TYPES.TRANCHE_A_SCOPE,
	program_lane_issue_mutation: FINDING_TYPES.PROGRAM_LANE_ISSUE_MUTATION,
	source_issue_linkage_change: FINDING_TYPES.SOURCE_ISSUE_LINKAGE_CHANGE,
	post_merge_pr_body_mutation: FINDING_TYPES.POST_MERGE_PR_BODY_MUTATION,
	runtime_app_behavior_change: FINDING_TYPES.RUNTIME_APP_BEHAVIOR_CHANGE,
	out_of_allowlist_scope: FINDING_TYPES.OUT_OF_ALLOWLIST_SCOPE,
	clean_state: FINDING_TYPES.CLEAN_STATE,
	unrecognized_failure: FINDING_TYPES.UNRECOGNIZED_FAILURE,
	incomplete_report_payload: FINDING_TYPES.INCOMPLETE_REPORT_PAYLOAD,
	contradictory_repo_state: FINDING_TYPES.CONTRADICTORY_REPO_STATE,
});

function normalizeFindingType(finding = {}) {
	const explicitType = String(finding.type || finding.finding_type || '').trim();
	if (explicitType && FINDING_TYPE_TO_CATEGORY[explicitType]) {
		return explicitType;
	}

	const code = String(finding.code || '').trim().toLowerCase();
	if (LEGACY_CODE_TO_FINDING_TYPE[code]) {
		return LEGACY_CODE_TO_FINDING_TYPE[code];
	}

	if (code.includes('reviewer') && code.includes('disposition')) {
		return FINDING_TYPES.MISSING_REVIEWER_DISPOSITION;
	}
	if (code.includes('allowlist') || code === 'missing_changed_file') {
		return FINDING_TYPES.ALLOWLIST_VIOLATION;
	}
	if (code.includes('source_issue')) {
		return FINDING_TYPES.SOURCE_ISSUE_MISMATCH;
	}

	return '';
}

function referencesTrancheA(finding = {}, context = {}) {
	const issueNumbers = [
		finding.source_issue,
		finding.issue_number,
		finding.issueNumber,
		...(Array.isArray(finding.issue_numbers) ? finding.issue_numbers : []),
		...(Array.isArray(context.source_issue_numbers) ? context.source_issue_numbers : []),
	].map((value) => String(value ?? '').trim());

	return issueNumbers.includes(TRANCHE_A_SOURCE_ISSUE)
		|| Boolean(finding.tranche_a)
		|| Boolean(context.tranche_a);
}

function isDeterministicPostMergeBodyMutation(finding = {}) {
	return Boolean(finding.deterministic)
		&& Boolean(finding.supported_by_closeout_script)
		&& finding.type === FINDING_TYPES.POST_MERGE_PR_BODY_MUTATION;
}

export function resolveFindingType(finding = {}, context = {}) {
	const normalized = normalizeFindingType(finding);
	if (normalized) {
		return normalized;
	}
	return FINDING_TYPES.UNRECOGNIZED_FAILURE;
}

export function classifyFinding(finding = {}, context = {}) {
	const type = resolveFindingType(finding, context);
	let category = FINDING_TYPE_TO_CATEGORY[type] ?? SAFETY_CATEGORIES.UNKNOWN;

	if (type === FINDING_TYPES.TRANCHE_A_SCOPE && context.tranche_a_authorized) {
		category = SAFETY_CATEGORIES.CURSOR_ESCALATION_REQUIRED;
	} else if (referencesTrancheA(finding, context) && !context.tranche_a_authorized) {
		category = SAFETY_CATEGORIES.CURSOR_ESCALATION_REQUIRED;
	}

	if (type === FINDING_TYPES.POST_MERGE_PR_BODY_MUTATION && isDeterministicPostMergeBodyMutation(finding)) {
		category = SAFETY_CATEGORIES.SAFE_AUTO_FIX;
	}

	return {
		type,
		category,
		safe_auto_fix: category === SAFETY_CATEGORIES.SAFE_AUTO_FIX,
		requires_cursor_escalation: category === SAFETY_CATEGORIES.CURSOR_ESCALATION_REQUIRED,
		requires_operator_authorization: category === SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED,
		message: finding.message || finding.summary || '',
		metadata: {
			code: finding.code || null,
			...(finding.metadata && typeof finding.metadata === 'object' ? finding.metadata : {}),
		},
	};
}

export function classifyFindings(findings = [], context = {}) {
	const items = Array.isArray(findings) ? findings : [];
	return items.map((finding) => classifyFinding(finding, context));
}

function manifestTargetsEmpty(manifests = []) {
	if (!Array.isArray(manifests)) return false;
	return manifests.every((manifest) => {
		const targets = Array.isArray(manifest?.targets)
			? manifest.targets
			: (Array.isArray(manifest) ? manifest : []);
		return targets.length === 0;
	});
}

function hasOpenActionableIssues(issues = []) {
	if (!Array.isArray(issues)) return false;
	return issues.some((issue) => {
		const state = String(issue?.state || '').toLowerCase();
		const actionable = issue?.actionable !== false;
		return actionable && state === 'open';
	});
}

export function isCleanReport(report = {}) {
	if (!report || typeof report !== 'object') {
		return false;
	}

	const status = String(report.status || '').toLowerCase();
	const findings = Array.isArray(report.findings) ? report.findings : [];
	const residualFindings = Array.isArray(report.residual_findings) ? report.residual_findings : [];
	const manifests = Array.isArray(report.manifests) ? report.manifests : [];
	const remediationIssues = Array.isArray(report.remediation_issues) ? report.remediation_issues : [];

	if (status === 'pass' || status === 'success') {
		if (findings.length === 0 && residualFindings.length === 0) {
			return true;
		}
	}

	if (manifestTargetsEmpty(manifests) && !hasOpenActionableIssues(remediationIssues) && findings.length === 0) {
		return true;
	}

	return false;
}

export function validateReportPayload(report = {}) {
	const errors = [];
	if (!report || typeof report !== 'object') {
		errors.push('report payload missing or not an object');
		return errors;
	}
	if (!('status' in report)) {
		errors.push('report.status missing');
	}
	if ('findings' in report && !Array.isArray(report.findings)) {
		errors.push('report.findings must be an array when present');
	}
	return errors;
}

export function detectContradictoryRepoState(report = {}) {
	const contradictions = [];
	const status = String(report?.status || '').toLowerCase();
	const findings = Array.isArray(report?.findings) ? report.findings : [];
	const remediationRequired = Boolean(report?.remediation_required);

	if ((status === 'pass' || status === 'success') && remediationRequired) {
		contradictions.push({
			type: FINDING_TYPES.CONTRADICTORY_REPO_STATE,
			code: 'pass_with_remediation_required',
			message: 'Report status is pass/success but remediation_required is true.',
		});
	}

	if ((status === 'fail' || status === 'failure') && findings.length === 0 && !remediationRequired) {
		contradictions.push({
			type: FINDING_TYPES.CONTRADICTORY_REPO_STATE,
			code: 'fail_without_findings',
			message: 'Report status is fail but no findings or remediation flag were recorded.',
		});
	}

	return contradictions;
}

export function classifyReport(report = {}, context = {}) {
	const payloadErrors = validateReportPayload(report);
	if (payloadErrors.length > 0) {
		return {
			category: SAFETY_CATEGORIES.UNKNOWN,
			findings: payloadErrors.map((message) => classifyFinding({
				type: FINDING_TYPES.INCOMPLETE_REPORT_PAYLOAD,
				code: 'incomplete_report_payload',
				message,
			}, context)),
			summary: {
				safe_auto_fix: 0,
				cursor_escalation_required: 0,
				operator_authorization_required: 0,
				no_action: 0,
				unknown: payloadErrors.length,
			},
		};
	}

	const contradictions = detectContradictoryRepoState(report);
	const rawFindings = [
		...(Array.isArray(report.findings) ? report.findings : []),
		...(Array.isArray(report.residual_findings) ? report.residual_findings : []),
		...contradictions,
	];

	if (rawFindings.length === 0 && isCleanReport(report)) {
		const clean = classifyFinding({ type: FINDING_TYPES.CLEAN_STATE, message: 'No actionable closeout or remediation findings.' }, context);
		return {
			category: SAFETY_CATEGORIES.NO_ACTION,
			findings: [clean],
			summary: summarizeClassifications([clean]),
		};
	}

	const classified = classifyFindings(rawFindings, context);
	const summary = summarizeClassifications(classified);
	const category = highestPriorityCategory(classified);

	return {
		category,
		findings: classified,
		summary,
	};
}

const CATEGORY_PRIORITY = [
	SAFETY_CATEGORIES.UNKNOWN,
	SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED,
	SAFETY_CATEGORIES.CURSOR_ESCALATION_REQUIRED,
	SAFETY_CATEGORIES.SAFE_AUTO_FIX,
	SAFETY_CATEGORIES.NO_ACTION,
];

export function highestPriorityCategory(classified = []) {
	if (!Array.isArray(classified) || classified.length === 0) {
		return SAFETY_CATEGORIES.NO_ACTION;
	}

	for (const category of CATEGORY_PRIORITY) {
		if (classified.some((entry) => entry.category === category)) {
			return category;
		}
	}

	return SAFETY_CATEGORIES.UNKNOWN;
}

export function summarizeClassifications(classified = []) {
	const summary = {
		safe_auto_fix: 0,
		cursor_escalation_required: 0,
		operator_authorization_required: 0,
		no_action: 0,
		unknown: 0,
	};

	for (const entry of classified) {
		if (summary[entry.category] !== undefined) {
			summary[entry.category] += 1;
		}
	}

	return summary;
}

export function isSafeAutoFixCategory(category) {
	return category === SAFETY_CATEGORIES.SAFE_AUTO_FIX;
}

export function requiresGitHubMutation(category) {
	return category === SAFETY_CATEGORIES.SAFE_AUTO_FIX
		|| category === SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED;
}
