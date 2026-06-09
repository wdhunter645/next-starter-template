export const STALE_SOURCE_ISSUE_LABELS = [
	'status:blocked',
	'status:queued',
	'status:assigned',
	'status:failed',
	'status:post-merge-verify',
	'status:pr-draft',
	'status:review',
	'status:implementation',
];

export const REMEDIATION_ISSUE_LABEL = 'post-merge-failure';
export const REMEDIATION_TITLE_PREFIX = 'Post-merge closeout exception for ';
export const LEGACY_REMEDIATION_TITLE_PREFIX = 'Post-merge remediation required for ';
export const TERMINAL_SOURCE_ISSUE_LABEL = 'status:complete';

const FOLLOWUP_CLOSEOUT_PATTERN =
	/\b(remediation|follow[- ]up|clarification|post[- ]merge evidence|closeout reconciliation|post[- ]merge closeout)\b/i;
const PRIOR_CLOSEOUT_REF_PATTERN =
	/\b(?:prior|previous|triggering|related|after|from)?\s*(?:PR|pull request|issue)\s+#\d+\b/i;

export function isPermittedClosedSourceIssueFollowup({ body = '', sourceIssue = null } = {}) {
	if (String(sourceIssue?.state || '').toLowerCase() !== 'closed') return false;
	if (String(sourceIssue?.state_reason || '').toLowerCase() !== 'completed') return false;
	return FOLLOWUP_CLOSEOUT_PATTERN.test(body) && PRIOR_CLOSEOUT_REF_PATTERN.test(body);
}

export function isRemediationIssue({ title = '', labels = [] } = {}) {
	const labelNames = new Set(
		(labels || []).map((label) => (typeof label === 'string' ? label : label?.name)).filter(Boolean),
	);
	if (labelNames.has(REMEDIATION_ISSUE_LABEL)) return true;
	const issueTitle = String(title || '');
	return issueTitle.startsWith(REMEDIATION_TITLE_PREFIX) || issueTitle.startsWith(LEGACY_REMEDIATION_TITLE_PREFIX);
}

export function planTerminalLabelReconciliation({ issueLabels = [], repoLabels = [] } = {}) {
	const labels = new Set(
		Array.from(issueLabels || [])
			.map((label) => (typeof label === 'string' ? label : label?.name))
			.filter(Boolean),
	);
	const availableLabels = new Set(
		Array.from(repoLabels || [])
			.map((label) => (typeof label === 'string' ? label : label?.name))
			.filter(Boolean),
	);

	if (!availableLabels.has(TERMINAL_SOURCE_ISSUE_LABEL)) {
		return {
			ok: false,
			reason: 'missing_status_complete_label',
			summary: '`status:complete` label is unavailable; source issue was not relabeled or closed.',
		};
	}

	const knownTerminalStatusLabels = new Set([...STALE_SOURCE_ISSUE_LABELS, TERMINAL_SOURCE_ISSUE_LABEL]);
	const unknownStatusLabels = [...labels].filter(
		(label) => label.startsWith('status:') && !knownTerminalStatusLabels.has(label),
	);
	if (unknownStatusLabels.length) {
		return {
			ok: false,
			reason: 'terminal_label_conflict',
			summary: `Unrecognized terminal status label(s): ${unknownStatusLabels.join(', ')}.`,
			conflictingLabels: unknownStatusLabels,
		};
	}

	const removeLabels = [...labels].filter(
		(label) =>
			(label.startsWith('status:') && label !== TERMINAL_SOURCE_ISSUE_LABEL) ||
			label === REMEDIATION_ISSUE_LABEL,
	);
	const addLabel = labels.has(TERMINAL_SOURCE_ISSUE_LABEL) ? '' : TERMINAL_SOURCE_ISSUE_LABEL;
	const terminalLabels = [...labels].filter((label) => !label.startsWith('status:') && label !== REMEDIATION_ISSUE_LABEL);
	if (!terminalLabels.includes(TERMINAL_SOURCE_ISSUE_LABEL)) terminalLabels.push(TERMINAL_SOURCE_ISSUE_LABEL);

	return {
		ok: true,
		reason: 'terminal_label_reconciliation_ready',
		removeLabels,
		addLabel,
		terminalLabels,
		summary: `remove ${removeLabels.length ? removeLabels.join(', ') : 'none'}; add ${addLabel || 'none'}; terminal ${TERMINAL_SOURCE_ISSUE_LABEL}`,
	};
}

export function buildSourceIssueCloseoutComment({
	prNumber,
	mergeSha,
	sourceIssueNumber,
	validatorStatus,
	verificationResult,
	closeoutReason,
	validationSummary = '',
	terminalLabelResult = '',
	sourceIssueCloseoutMode = '',
	queueAdvancementStatus = 'no queue action; Program 1 launch, Program 2 mutation, and child issue creation remain stopped',
}) {
	return [
		'Post-merge source issue closeout completed.',
		'',
		`- PR: #${prNumber}`,
		`- Merge SHA: ${mergeSha || 'unknown'}`,
		`- Source issue: ${sourceIssueNumber ? `#${sourceIssueNumber}` : 'unknown'}`,
		`- Source issue closeout mode: ${sourceIssueCloseoutMode || 'open_source_issue'}`,
		`- Validator status: ${validatorStatus}`,
		`- Post-merge verification result: ${verificationResult}`,
		`- Validation summary: ${validationSummary || 'no validation summary recorded'}`,
		`- Terminal label result: ${terminalLabelResult || 'status:complete applied; stale workflow labels removed'}`,
		`- Queue advancement status: ${queueAdvancementStatus}`,
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
	terminalLabelResult = null,
	prBody = '',
} = {}) {
	if (!issueNumber) return { close: false, reason: 'missing_source_issue' };
	if (!isMerged) return { close: false, reason: 'pr_not_merged' };
	if (action !== 'post_merge_success') return { close: false, reason: `action_${action}` };
	const closedFollowupAllowed =
		String(issueMeta?.state || '').toUpperCase() === 'CLOSED' &&
		(postMergeResult?.source_issue_closeout_mode === 'closed_remediation_followup' ||
			isPermittedClosedSourceIssueFollowup({
				body: prBody,
				sourceIssue: { state: 'closed', state_reason: 'completed' },
			}));
	if (issueMeta?.state && String(issueMeta.state).toUpperCase() !== 'OPEN' && !closedFollowupAllowed) {
		return { close: false, reason: 'source_issue_not_open' };
	}
	if (postMergeResult && postMergeResult.status !== 'pass') {
		return { close: false, reason: 'validator_not_pass' };
	}
	if (postMergeResult?.remediation_required) {
		return { close: false, reason: 'remediation_required' };
	}
	if ((postMergeResult?.reviewer_disposition_failures || []).length > 0) {
		return { close: false, reason: 'undispositioned_reviewer_findings' };
	}
	if (issueMeta && isRemediationIssue(issueMeta) && !closedFollowupAllowed) {
		return { close: false, reason: 'remediation_issue' };
	}
	if (terminalLabelResult && !terminalLabelResult.ok) {
		return { close: false, reason: terminalLabelResult.reason || 'terminal_label_reconciliation_failed' };
	}
	return { close: true, reason: 'post_merge_validation_success' };
}
