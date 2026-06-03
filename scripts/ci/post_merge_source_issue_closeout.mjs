export const STALE_SOURCE_ISSUE_LABELS = [
	'status:blocked',
	'status:queued',
	'status:failed',
	'status:post-merge-verify',
];

export const REMEDIATION_ISSUE_LABEL = 'post-merge-failure';
export const REMEDIATION_TITLE_PREFIX = 'Post-merge remediation required for ';

export function isRemediationIssue({ title = '', labels = [] } = {}) {
	const labelNames = new Set(
		(labels || []).map((label) => (typeof label === 'string' ? label : label?.name)).filter(Boolean),
	);
	if (labelNames.has(REMEDIATION_ISSUE_LABEL)) return true;
	return String(title || '').startsWith(REMEDIATION_TITLE_PREFIX);
}

export function buildSourceIssueCloseoutComment({
	prNumber,
	mergeSha,
	validatorStatus,
	verificationResult,
	closeoutReason,
}) {
	return [
		'Source issue closeout after successful post-merge verification.',
		'',
		`- PR: #${prNumber}`,
		`- Merge SHA: ${mergeSha || 'unknown'}`,
		`- Validator status: ${validatorStatus}`,
		`- Post-merge verification result: ${verificationResult}`,
		`- Closeout reason: ${closeoutReason}`,
	].join('\n');
}

export function postMergeVerificationResult(postMergeResult) {
	if (!postMergeResult) return 'not recorded';
	if (postMergeResult.status === 'pass' && !postMergeResult.remediation_required) return 'pass';
	if (postMergeResult.status === 'pass' && postMergeResult.remediation_required) return 'pass-with-remediation';
	if (postMergeResult.status === 'fail') return 'fail';
	return String(postMergeResult.status || 'unknown');
}

export function shouldCloseSourceIssue({
	action,
	issueNumber,
	isMerged,
	issueMeta = null,
	postMergeResult = null,
}) {
	if (!issueNumber) return { close: false, reason: 'missing_source_issue' };
	if (!isMerged) return { close: false, reason: 'pr_not_merged' };
	if (action !== 'post_merge_success') return { close: false, reason: `action_${action}` };
	if (postMergeResult && postMergeResult.status !== 'pass') {
		return { close: false, reason: 'validator_not_pass' };
	}
	if (postMergeResult?.remediation_required) {
		return { close: false, reason: 'remediation_required' };
	}
	if (issueMeta && isRemediationIssue(issueMeta)) {
		return { close: false, reason: 'remediation_issue' };
	}
	return { close: true, reason: 'post_merge_validation_success' };
}
