#!/usr/bin/env node

/**
 * Post-merge self-healing classifier aligned with
 * docs/reference/ci/post-merge-self-healing-classification-contract.md
 *
 * Classification only — no GitHub mutations or auto-fix execution.
 */

export const SAFETY_CATEGORIES = Object.freeze({
	SAFE_AUTO_FIX: 'safe_auto_fix',
	CURSOR_REMEDIATION_REQUIRED: 'cursor_remediation_required',
	OPERATOR_AUTHORIZATION_REQUIRED: 'operator_authorization_required',
	INTENTIONALLY_DEFERRED: 'intentionally_deferred',
	NO_ACTION: 'no_action',
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
	PROGRAM_LANE_ISSUE_MUTATION: 'program_lane_issue_mutation',
	SOURCE_ISSUE_LINKAGE_CHANGE: 'source_issue_linkage_change',
	POST_MERGE_PR_BODY_MUTATION: 'post_merge_pr_body_mutation',
	RUNTIME_APP_BEHAVIOR_CHANGE: 'runtime_app_behavior_change',
	OUT_OF_ALLOWLIST_SCOPE: 'out_of_allowlist_scope',
	INTENTIONALLY_DEFERRED: 'intentionally_deferred',
	CLEAN_STATE: 'clean_state',
	UNRECOGNIZED_FAILURE: 'unrecognized_failure',
	INCOMPLETE_REPORT_PAYLOAD: 'incomplete_report_payload',
	CONTRADICTORY_REPO_STATE: 'contradictory_repo_state',
});

const FINDING_TYPE_TO_CATEGORY = Object.freeze({
	[FINDING_TYPES.STALE_MANIFEST_ENTRY]: SAFETY_CATEGORIES.SAFE_AUTO_FIX,
	[FINDING_TYPES.DUPLICATE_REMEDIATION_ISSUE]: SAFETY_CATEGORIES.SAFE_AUTO_FIX,
	[FINDING_TYPES.STALE_EXCEPTION_ISSUE]: SAFETY_CATEGORIES.SAFE_AUTO_FIX,
	[FINDING_TYPES.FALSE_RED_ARTIFACT_UPLOAD]: SAFETY_CATEGORIES.SAFE_AUTO_FIX,
	[FINDING_TYPES.MISSING_REVIEWER_DISPOSITION]: SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED,
	[FINDING_TYPES.SOURCE_ISSUE_MISMATCH]: SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED,
	[FINDING_TYPES.ALLOWLIST_VIOLATION]: SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED,
	[FINDING_TYPES.UNRESOLVED_REVIEW_THREAD]: SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED,
	[FINDING_TYPES.FAILED_REQUIRED_WORKFLOW]: SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED,
	[FINDING_TYPES.AMBIGUOUS_CLOSEOUT_BLOCKER]: SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED,
	[FINDING_TYPES.UNRECOGNIZED_FAILURE]: SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED,
	[FINDING_TYPES.INCOMPLETE_REPORT_PAYLOAD]: SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED,
	[FINDING_TYPES.CONTRADICTORY_REPO_STATE]: SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED,
	[FINDING_TYPES.AUTH_TOKEN_SECRET_FAILURE]: SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED,
	[FINDING_TYPES.ACTIVE_ALTERNATE_PROGRAM_LANE]: SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED,
	[FINDING_TYPES.PROGRAM_LANE_ISSUE_MUTATION]: SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED,
	[FINDING_TYPES.SOURCE_ISSUE_LINKAGE_CHANGE]: SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED,
	[FINDING_TYPES.POST_MERGE_PR_BODY_MUTATION]: SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED,
	[FINDING_TYPES.RUNTIME_APP_BEHAVIOR_CHANGE]: SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED,
	[FINDING_TYPES.OUT_OF_ALLOWLIST_SCOPE]: SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED,
	[FINDING_TYPES.INTENTIONALLY_DEFERRED]: SAFETY_CATEGORIES.INTENTIONALLY_DEFERRED,
	[FINDING_TYPES.CLEAN_STATE]: SAFETY_CATEGORIES.NO_ACTION,
});

const LEGACY_CODE_TO_FINDING_TYPE = Object.freeze({
	stale_manifest_entry: FINDING_TYPES.STALE_MANIFEST_ENTRY,
	duplicate_remediation_issue: FINDING_TYPES.DUPLICATE_REMEDIATION_ISSUE,
	duplicate_closeout_issue: FINDING_TYPES.DUPLICATE_REMEDIATION_ISSUE,
	stale_exception_issue: FINDING_TYPES.STALE_EXCEPTION_ISSUE,
	false_red_artifact_upload: FINDING_TYPES.FALSE_RED_ARTIFACT_UPLOAD,
	missing_reviewer_disposition: FINDING_TYPES.MISSING_REVIEWER_DISPOSITION,
	outdated_reviewer_thread_without_disposition: FINDING_TYPES.MISSING_REVIEWER_DISPOSITION,
	source_issue_mismatch: FINDING_TYPES.SOURCE_ISSUE_MISMATCH,
	allowlist_violation: FINDING_TYPES.ALLOWLIST_VIOLATION,
	missing_changed_file: FINDING_TYPES.ALLOWLIST_VIOLATION,
	unresolved_review_thread: FINDING_TYPES.UNRESOLVED_REVIEW_THREAD,
	failed_required_workflow: FINDING_TYPES.FAILED_REQUIRED_WORKFLOW,
	required_workflow_failure: FINDING_TYPES.FAILED_REQUIRED_WORKFLOW,
	auth_token_secret_failure: FINDING_TYPES.AUTH_TOKEN_SECRET_FAILURE,
	'secret-access/configuration': FINDING_TYPES.AUTH_TOKEN_SECRET_FAILURE,
	ambiguous_closeout_blocker: FINDING_TYPES.AMBIGUOUS_CLOSEOUT_BLOCKER,
	closeout_blocker_declared: FINDING_TYPES.AMBIGUOUS_CLOSEOUT_BLOCKER,
	active_alternate_program_lane: FINDING_TYPES.ACTIVE_ALTERNATE_PROGRAM_LANE,
	program_lane_issue_mutation: FINDING_TYPES.PROGRAM_LANE_ISSUE_MUTATION,
	source_issue_linkage_change: FINDING_TYPES.SOURCE_ISSUE_LINKAGE_CHANGE,
	post_merge_pr_body_mutation: FINDING_TYPES.POST_MERGE_PR_BODY_MUTATION,
	runtime_app_behavior_change: FINDING_TYPES.RUNTIME_APP_BEHAVIOR_CHANGE,
	out_of_allowlist_scope: FINDING_TYPES.OUT_OF_ALLOWLIST_SCOPE,
	intentionally_deferred: FINDING_TYPES.INTENTIONALLY_DEFERRED,
	clean_state: FINDING_TYPES.CLEAN_STATE,
	unrecognized_failure: FINDING_TYPES.UNRECOGNIZED_FAILURE,
	incomplete_report_payload: FINDING_TYPES.INCOMPLETE_REPORT_PAYLOAD,
	contradictory_repo_state: FINDING_TYPES.CONTRADICTORY_REPO_STATE,
});

function normalizeFindingType(finding = {}) {
	const explicitType = String(finding.type || finding.kind || finding.finding_type || '').trim();
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

function isDeterministicPostMergeBodyMutation(finding = {}) {
	return Boolean(finding.deterministic)
		&& Boolean(finding.supported_by_closeout_script)
		&& normalizeFindingType(finding) === FINDING_TYPES.POST_MERGE_PR_BODY_MUTATION;
}

export function resolveFindingType(finding = {}) {
	const normalized = normalizeFindingType(finding);
	return normalized || FINDING_TYPES.UNRECOGNIZED_FAILURE;
}

export function classifyFinding(finding = {}, context = {}) {
	const type = resolveFindingType(finding);
	let classification = FINDING_TYPE_TO_CATEGORY[type] ?? SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED;

	if (finding.deferred === true || type === FINDING_TYPES.INTENTIONALLY_DEFERRED) {
		classification = SAFETY_CATEGORIES.INTENTIONALLY_DEFERRED;
	} else if (isDeterministicPostMergeBodyMutation(finding)) {
		classification = SAFETY_CATEGORIES.SAFE_AUTO_FIX;
	} else if (finding.operator_authorization_required === true) {
		classification = SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED;
	}

	return {
		kind: type,
		classification,
		safe_auto_fix: classification === SAFETY_CATEGORIES.SAFE_AUTO_FIX,
		requires_cursor_remediation: classification === SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED,
		requires_operator_authorization: classification === SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED,
		intentionally_deferred: classification === SAFETY_CATEGORIES.INTENTIONALLY_DEFERRED,
		message: finding.message || finding.summary || '',
		evidence: Array.isArray(finding.evidence) ? finding.evidence : [],
		pr_number: finding.pr_number ?? finding.pr ?? null,
		source_issue: finding.source_issue ?? finding.issue_number ?? null,
		recommended_action: finding.recommended_action || null,
		metadata: {
			code: finding.code || null,
			...(finding.metadata && typeof finding.metadata === 'object' ? finding.metadata : {}),
		},
	};
}

export function classifyFindings(findings = [], context = {}) {
	return (Array.isArray(findings) ? findings : []).map((finding) => classifyFinding(finding, context));
}

export function summarizeClassifications(classified = []) {
	const summary = {
		safe_auto_fix: 0,
		cursor_remediation_required: 0,
		operator_authorization_required: 0,
		intentionally_deferred: 0,
		no_action: 0,
	};

	for (const entry of classified) {
		if (summary[entry.classification] !== undefined) {
			summary[entry.classification] += 1;
		}
	}

	return summary;
}

const CATEGORY_PRIORITY = [
	SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED,
	SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED,
	SAFETY_CATEGORIES.INTENTIONALLY_DEFERRED,
	SAFETY_CATEGORIES.SAFE_AUTO_FIX,
	SAFETY_CATEGORIES.NO_ACTION,
];

export function highestPriorityCategory(classified = []) {
	if (!Array.isArray(classified) || classified.length === 0) {
		return SAFETY_CATEGORIES.NO_ACTION;
	}

	for (const category of CATEGORY_PRIORITY) {
		if (classified.some((entry) => entry.classification === category)) {
			return category;
		}
	}

	return SAFETY_CATEGORIES.NO_ACTION;
}

export function isCleanReport(report = {}) {
	if (!report || typeof report !== 'object') {
		return false;
	}

	const status = String(report.status || '').toLowerCase();
	const findings = Array.isArray(report.findings) ? report.findings : [];

	if ((status === 'pass' || status === 'success') && findings.length === 0) {
		return true;
	}

	return false;
}
