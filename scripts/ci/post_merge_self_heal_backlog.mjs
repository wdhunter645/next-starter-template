#!/usr/bin/env node

/**
 * Backlog and issue-event coordinator for post-merge self-healing.
 * Scans post-merge exception issues, classifies deterministic safe outcomes,
 * and applies only bounded issue dispositions when explicitly authorized.
 */

import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

import { githubRepoRequest } from './github_issue_api.mjs';
import {
	LEGACY_REMEDIATION_TITLE_PREFIX,
	REMEDIATION_ISSUE_LABEL,
	REMEDIATION_TITLE_PREFIX,
} from './post_merge_source_issue_closeout.mjs';

export const POST_MERGE_EXCEPTION_SIGNATURE =
	'Post-merge closeout exception detected. CI refused deterministic source issue closeout.';

export const SELF_HEAL_BACKLOG_MARKER = '<!-- post-merge-self-healing-backlog-disposition -->';

/** Marks exception issues CI scanned but cannot auto-close; excluded from repeat backlog scans. */
export const OPS_PR_ESCALATION_LABEL = 'ops-pr-escalation';

export const BACKLOG_DISPOSITIONS = Object.freeze({
	SAFE_TO_CLOSE: 'safe_to_close',
	SAFE_MANIFEST_OR_METADATA_REPAIR: 'safe_manifest_or_metadata_repair',
	DUPLICATE_OF_CANONICAL_REMEDIATION: 'duplicate_of_canonical_remediation',
	PRESERVE_ACTIVE_SOURCE: 'preserve_active_source',
	PRESERVE_AMBIGUOUS_EVIDENCE: 'preserve_ambiguous_evidence',
	UNSAFE_OPERATOR_REVIEW_REQUIRED: 'unsafe_operator_review_required',
	NOT_POST_MERGE_EXCEPTION: 'not_post_merge_exception',
});

const POST_MERGE_EXCEPTION_LABELS = new Set([
	REMEDIATION_ISSUE_LABEL,
	'post-merge-remediation',
	'post-merge-self-healing',
	'post-merge-exception',
]);

function labelNames(labels = []) {
	return (Array.isArray(labels) ? labels : [])
		.map((label) => (typeof label === 'string' ? label : label?.name))
		.filter(Boolean);
}

function hasLabel(issue = {}, labels = POST_MERGE_EXCEPTION_LABELS) {
	return labelNames(issue.labels).some((name) => labels.has(name));
}

export function hasOpsPrEscalationLabel(issue = {}) {
	return labelNames(issue?.labels).includes(OPS_PR_ESCALATION_LABEL);
}

/** Labels applied when handing an exception to Ops; ensures queue search discoverability. */
export function opsEscalationLabelsToApply(existingLabels = []) {
	const names = new Set(labelNames(existingLabels));
	const labels = [OPS_PR_ESCALATION_LABEL];
	if (!names.has(REMEDIATION_ISSUE_LABEL)) {
		labels.unshift(REMEDIATION_ISSUE_LABEL);
	}
	return labels;
}

export function isBacklogScanCandidate(issue = {}) {
	return (
		String(issue?.state || '').toLowerCase() === 'open'
		&& isPostMergeExceptionIssue(issue)
		&& !hasOpsPrEscalationLabel(issue)
	);
}

export function isPostMergeExceptionIssue(issue = {}) {
	if (!issue || issue.pull_request) return false;
	const title = String(issue.title || '');
	const body = String(issue.body || '');
	return (
		title.startsWith(REMEDIATION_TITLE_PREFIX)
		|| title.startsWith(LEGACY_REMEDIATION_TITLE_PREFIX)
		|| title.startsWith('Post-merge closeout exception')
		|| body.includes(POST_MERGE_EXCEPTION_SIGNATURE)
		|| hasLabel(issue)
	);
}

function parseNumber(value) {
	if (value === null || value === undefined || value === '') return null;
	const match = String(value).match(/\d+/);
	return match ? Number(match[0]) : null;
}

function firstBodyMatch(body = '', patterns = []) {
	for (const pattern of patterns) {
		const match = String(body || '').match(pattern);
		if (match?.[1]) return match[1].trim();
	}
	return null;
}

export function parsePostMergeExceptionIssue(issue = {}) {
	const title = String(issue.title || '');
	const body = String(issue.body || '');
	const prNumber = parseNumber(
		issue.pr_number
		?? issue.linked_pr
		?? firstBodyMatch(body, [/^- PR: #?(\d+)$/m, /\bPR #(\d+)\b/i])
		?? firstBodyMatch(title, [/\bPR #(\d+)\b/i]),
	);
	const sourceIssue = parseNumber(
		issue.source_issue
		?? issue.linked_source_issue
		?? firstBodyMatch(body, [/^- Source issue: #?(\d+)$/m, /\bsource issue #(\d+)\b/i]),
	);
	const failureCode = String(
		issue.failure_code
		?? issue.code
		?? firstBodyMatch(body, [/^## Detected failure condition\s*\n- ([^:\n]+):/m, /^- Failure class: ([^\n]+)$/m])
		?? 'closeout_exception',
	).trim().toLowerCase();
	const canonicalIssue = parseNumber(
		issue.canonical_issue
		?? firstBodyMatch(body, [
			/Canonical remediation issue: #?(\d+)/i,
			/Superseded by #?(\d+)/i,
			/Newer canonical issue: #?(\d+)/i,
		]),
	);
	const programIssue = parseNumber(
		issue.program_issue
		?? firstBodyMatch(body, [/Program issue: #?(\d+)/i, /Relevant program issue: #?(\d+)/i]),
	);
	const completedChildIssue = parseNumber(
		issue.completed_child_issue
		?? firstBodyMatch(body, [/#1847 child issue: #?(\d+)/i, /Completed child issue: #?(\d+)/i]),
	);

	return {
		number: issue.number,
		title,
		body,
		labels: labelNames(issue.labels),
		state: String(issue.state || '').toLowerCase(),
		created_at: issue.created_at || issue.createdAt || null,
		updated_at: issue.updated_at || issue.updatedAt || null,
		html_url: issue.html_url || issue.url || null,
		pr_number: prNumber,
		source_issue: sourceIssue,
		failure_code: failureCode,
		canonical_issue: canonicalIssue,
		program_issue: programIssue,
		completed_child_issue: completedChildIssue,
	};
}

function issueKey(parsed = {}) {
	if (!parsed.pr_number || !parsed.source_issue || !parsed.failure_code) return null;
	return `${parsed.pr_number}|${parsed.source_issue}|${parsed.failure_code}`.toLowerCase();
}

function issueStateReason(issue = {}) {
	if (!issue) return '';
	return String(issue?.state_reason || issue?.stateReason || '').toLowerCase();
}

function isClosedComplete(issue = {}) {
	if (!issue) return false;
	const state = String(issue?.state || '').toLowerCase();
	const labels = new Set(labelNames(issue?.labels));
	return state === 'closed' && (
		issueStateReason(issue) === 'completed'
		|| issueStateReason(issue) === ''
		|| labels.has('status:complete')
	);
}

function isOpenActive(issue = {}) {
	if (!issue) return false;
	const state = String(issue?.state || '').toLowerCase();
	const labels = new Set(labelNames(issue?.labels));
	return state === 'open' && (
		labels.has('status:active')
		|| labels.has('status:implementation')
		|| labels.has('status:blocked')
		|| labels.has('status:review')
		|| labels.has('status:post-merge-verify')
	);
}

function hasProvenNoRemainingAction(parsed = {}, sourceIssue = {}) {
	const body = parsed.body || '';
	if (!isClosedComplete(sourceIssue)) return false;
	if (/\b(open blocker|blocking issue|remains blocked|ambiguous|manual review|required atlas\/bill decision)\b/i.test(body)) {
		return false;
	}
	return (
		/\bValidator status: pass\b/i.test(body)
		|| /\bRemediation required: no\b/i.test(body)
		|| /\bpost[- ]merge closeout (?:passed|pass)\b/i.test(body)
		|| parsed.labels.includes('status:complete')
	);
}

function hasUnsafeOperatorSignal(parsed = {}) {
	const text = `${parsed.failure_code}\n${parsed.title}\n${parsed.body}`;
	return /\b(auth|secret|token|configuration|runtime app|production|queue advancement|program lane|source issue linkage)\b/i.test(text);
}

function hasAmbiguousSignal(parsed = {}) {
	if (!parsed.pr_number || !parsed.source_issue) return true;
	const text = `${parsed.failure_code}\n${parsed.body}`;
	return /\b(reviewer|review-comment|source issue candidates|ambiguous|manual review|required atlas\/bill decision|workflow_failure|closeout_blocker_declared)\b/i.test(text);
}

function canonicalDuplicateMap(parsedIssues = []) {
	const byKey = new Map();
	for (const parsed of parsedIssues) {
		const key = issueKey(parsed);
		if (!key) continue;
		if (!byKey.has(key)) byKey.set(key, []);
		byKey.get(key).push(parsed);
	}

	const duplicates = new Map();
	for (const group of byKey.values()) {
		if (group.length < 2) continue;
		const sorted = [...group].sort((a, b) => {
			const timeA = Date.parse(a.created_at || '') || 0;
			const timeB = Date.parse(b.created_at || '') || 0;
			return timeB - timeA;
		});
		const explicitCanonical = sorted.find((issue) => issue.canonical_issue === issue.number);
		const referencedCanonical = sorted.find((issue) =>
			issue.canonical_issue && sorted.some((candidate) => candidate.number === issue.canonical_issue)
		);
		const canonical = explicitCanonical
			|| sorted.find((issue) => issue.number === referencedCanonical?.canonical_issue);
		if (!canonical?.number) continue;
		for (const duplicate of sorted) {
			if (duplicate.number === canonical.number) continue;
			duplicates.set(duplicate.number, canonical);
		}
	}
	return duplicates;
}

function detectorIssueMetadata(issue = {}, parsed = {}) {
	return {
		...issue,
		linked_pr: parsed.pr_number ?? null,
		pr_number: parsed.pr_number ?? null,
		linked_source_issue: parsed.source_issue ?? null,
		source_issue: parsed.source_issue ?? null,
		failure_code: parsed.failure_code || null,
		canonical_issue: parsed.canonical_issue ?? null,
		canonical: parsed.canonical_issue === parsed.number,
		metadata: {
			...(issue.metadata && typeof issue.metadata === 'object' ? issue.metadata : {}),
			pr: parsed.pr_number ?? null,
			source_issue: parsed.source_issue ?? null,
			failure_code: parsed.failure_code || null,
		},
	};
}

export function classifyBacklogIssue(parsed = {}, context = {}) {
	const sourceIssue = parsed.source_issue ? context.sourceIssuesByNumber?.[parsed.source_issue] : null;
	const programIssue = parsed.program_issue ? context.sourceIssuesByNumber?.[parsed.program_issue] : null;
	const duplicateCanonical = context.duplicatesByIssueNumber?.get(parsed.number);

	if (duplicateCanonical) {
		return {
			disposition: BACKLOG_DISPOSITIONS.DUPLICATE_OF_CANONICAL_REMEDIATION,
			issue_number: parsed.number,
			canonical_issue: duplicateCanonical.number,
			safe_to_close: true,
			reason: `Issue #${parsed.number} duplicates newer canonical post-merge issue #${duplicateCanonical.number}.`,
		};
	}

	if (parsed.canonical_issue && parsed.canonical_issue !== parsed.number) {
		return {
			disposition: BACKLOG_DISPOSITIONS.DUPLICATE_OF_CANONICAL_REMEDIATION,
			issue_number: parsed.number,
			canonical_issue: parsed.canonical_issue,
			safe_to_close: true,
			reason: `Issue #${parsed.number} records canonical post-merge issue #${parsed.canonical_issue}.`,
		};
	}

	if (sourceIssue && isOpenActive(sourceIssue)) {
		return {
			disposition: BACKLOG_DISPOSITIONS.PRESERVE_ACTIVE_SOURCE,
			issue_number: parsed.number,
			source_issue: parsed.source_issue,
			safe_to_close: false,
			reason: `Source issue #${parsed.source_issue} remains active; preserve exception for review.`,
		};
	}

	if (hasUnsafeOperatorSignal(parsed)) {
		return {
			disposition: BACKLOG_DISPOSITIONS.UNSAFE_OPERATOR_REVIEW_REQUIRED,
			issue_number: parsed.number,
			source_issue: parsed.source_issue,
			safe_to_close: false,
			reason: 'Finding includes operator-authority, secret/config, runtime, queue, or linkage signals.',
		};
	}

	if (
		parsed.completed_child_issue
		&& parsed.program_issue
		&& isClosedComplete(sourceIssue)
		&& isClosedComplete(programIssue)
	) {
		return {
			disposition: BACKLOG_DISPOSITIONS.SAFE_TO_CLOSE,
			issue_number: parsed.number,
			source_issue: parsed.source_issue,
			safe_to_close: true,
			reason: `Completed/superseded #1847 child #${parsed.completed_child_issue} is covered by closed program issue #${parsed.program_issue}.`,
		};
	}

	if (sourceIssue && hasProvenNoRemainingAction(parsed, sourceIssue)) {
		return {
			disposition: BACKLOG_DISPOSITIONS.SAFE_TO_CLOSE,
			issue_number: parsed.number,
			source_issue: parsed.source_issue,
			safe_to_close: true,
			reason: `Source issue #${parsed.source_issue} is closed complete and issue evidence proves no remaining blocker.`,
		};
	}

	if (hasAmbiguousSignal(parsed) || !sourceIssue) {
		return {
			disposition: BACKLOG_DISPOSITIONS.PRESERVE_AMBIGUOUS_EVIDENCE,
			issue_number: parsed.number,
			source_issue: parsed.source_issue,
			safe_to_close: false,
			reason: 'Reviewer/source/verification evidence is missing, ambiguous, or requires scoped human/Cursor review.',
		};
	}

	return {
		disposition: BACKLOG_DISPOSITIONS.PRESERVE_AMBIGUOUS_EVIDENCE,
		issue_number: parsed.number,
		source_issue: parsed.source_issue,
		safe_to_close: false,
		reason: 'No deterministic safe-close rule matched.',
	};
}

export function buildBacklogReport({
	issues = [],
	sourceIssuesByNumber = {},
	manifestSummary = {},
	dryRun = true,
} = {}) {
	const allOpenPostMergeIssues = (issues || []).filter((issue) =>
		String(issue?.state || '').toLowerCase() === 'open' && isPostMergeExceptionIssue(issue)
	);
	const skippedAlreadyEscalated = allOpenPostMergeIssues.filter(hasOpsPrEscalationLabel);
	const openPostMergeIssues = (issues || []).filter(isBacklogScanCandidate);
	const parsedIssues = openPostMergeIssues.map(parsePostMergeExceptionIssue);
	const detectorIssues = openPostMergeIssues.map((issue, index) =>
		detectorIssueMetadata(issue, parsedIssues[index])
	);
	const duplicatesByIssueNumber = canonicalDuplicateMap(parsedIssues);
	const classifications = parsedIssues.map((parsed) => ({
		issue: parsed,
		...classifyBacklogIssue(parsed, { sourceIssuesByNumber, duplicatesByIssueNumber }),
	}));

	const safeClosures = classifications.filter((entry) => entry.safe_to_close);
	const duplicateClosures = classifications.filter((entry) =>
		entry.disposition === BACKLOG_DISPOSITIONS.DUPLICATE_OF_CANONICAL_REMEDIATION
	);
	const preservedActive = classifications.filter((entry) =>
		entry.disposition === BACKLOG_DISPOSITIONS.PRESERVE_ACTIVE_SOURCE
	);
	const preservedAmbiguous = classifications.filter((entry) =>
		entry.disposition === BACKLOG_DISPOSITIONS.PRESERVE_AMBIGUOUS_EVIDENCE
	);
	const unsafe = classifications.filter((entry) =>
		entry.disposition === BACKLOG_DISPOSITIONS.UNSAFE_OPERATOR_REVIEW_REQUIRED
	);

	return {
		status: 'classified',
		dry_run: dryRun,
		exceptionIssues: detectorIssues,
		remediationIssues: detectorIssues,
		deferredIssues: detectorIssues.filter((issue) => hasLabel(issue, new Set(['intentionally-deferred']))),
		classifications,
		summary: {
			total_open_post_merge_exception_issues: allOpenPostMergeIssues.length,
			skipped_already_escalated: skippedAlreadyEscalated.length,
			total_scanned: openPostMergeIssues.length,
			auto_closed: dryRun ? 0 : safeClosures.length,
			auto_close_planned: dryRun ? safeClosures.length : 0,
			ops_pr_escalation_labeled: 0,
			ops_pr_escalation_planned: dryRun
				? classifications.filter((entry) => !entry.safe_to_close).length
				: 0,
			manifest_fixes_applied: manifestSummary.manifest_prunes_applied || 0,
			manifest_fixes_planned: manifestSummary.manifest_prunes_planned || 0,
			duplicate_closures: dryRun ? 0 : duplicateClosures.length,
			duplicate_closures_planned: dryRun ? duplicateClosures.length : 0,
			preserved_active_source_issues: preservedActive.length,
			preserved_ambiguous_issues: preservedAmbiguous.length,
			unsafe_escalated_issues: unsafe.length,
			before_open_post_merge_issue_count: allOpenPostMergeIssues.length,
			after_open_post_merge_issue_count: dryRun
				? allOpenPostMergeIssues.length
				: Math.max(0, allOpenPostMergeIssues.length - safeClosures.length),
		},
	};
}

export function dispositionComment(entry = {}) {
	return [
		SELF_HEAL_BACKLOG_MARKER,
		'',
		'Post-merge self-healing classified this exception issue.',
		'',
		`- Disposition: ${entry.disposition}`,
		`- Safe to close: ${entry.safe_to_close ? 'yes' : 'no'}`,
		entry.canonical_issue ? `- Canonical issue: #${entry.canonical_issue}` : null,
		entry.source_issue ? `- Source issue: #${entry.source_issue}` : null,
		`- Reason: ${entry.reason}`,
		'',
		entry.safe_to_close
			? 'CI is applying a deterministic safe close for this post-merge exception.'
			: [
				'CI is preserving this issue for Operations review and applied the `ops-pr-escalation` label.',
				'Ops should remediate via a bounded follow-up PR using the source issue evidence above.',
				'This issue will not be rescanned by daily self-healing while `ops-pr-escalation` remains.',
			].join(' '),
	].filter(Boolean).join('\n');
}

function closeStateReason(entry = {}) {
	return entry.disposition === BACKLOG_DISPOSITIONS.DUPLICATE_OF_CANONICAL_REMEDIATION
		? 'not_planned'
		: 'completed';
}

function request(args) {
	return githubRepoRequest({ ...args, userAgent: 'lgfc-post-merge-self-heal-backlog' });
}

export async function ensureOpsPrEscalationLabel({
	token,
	repository,
	requestFn = request,
} = {}) {
	try {
		await requestFn({
			token,
			repository,
			path: '/labels',
			method: 'POST',
			body: {
				name: OPS_PR_ESCALATION_LABEL,
				color: 'B60205',
				description: 'Post-merge self-healing scanned this exception and requires Ops PR remediation.',
			},
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		if (!/already_exists/i.test(message)) {
			throw error;
		}
	}
}

export async function executeBacklogDisposition(entry = {}, {
	token,
	repository,
	dryRun = true,
	requestFn = request,
} = {}) {
	const issueNumber = entry.issue_number;
	if (!issueNumber) {
		return { ...entry, status: 'skipped', reason: 'missing_issue_number', dry_run: dryRun };
	}

	if (dryRun) {
		if (entry.safe_to_close) {
			return { ...entry, status: 'planned_close', dry_run: true };
		}
		return { ...entry, status: 'planned_ops_escalation', dry_run: true };
	}

	await requestFn({
		token,
		repository,
		path: `/issues/${issueNumber}/comments`,
		method: 'POST',
		body: { body: dispositionComment(entry) },
	});

	if (!entry.safe_to_close) {
		const existingLabels = entry.issue?.labels || entry.labels || [];
		await requestFn({
			token,
			repository,
			path: `/issues/${issueNumber}/labels`,
			method: 'POST',
			body: { labels: opsEscalationLabelsToApply(existingLabels) },
		});
		return { ...entry, status: 'ops_escalated', dry_run: false };
	}

	await requestFn({
		token,
		repository,
		path: `/issues/${issueNumber}`,
		method: 'PATCH',
		body: { state: 'closed', state_reason: closeStateReason(entry) },
	});

	return { ...entry, status: 'closed', dry_run: false };
}

export async function executeBacklogReport(report = {}, options = {}) {
	if (options.dryRun === false && options.token && options.repository) {
		await ensureOpsPrEscalationLabel(options);
	}

	const outcomes = [];
	for (const entry of report.classifications || []) {
		try {
			outcomes.push(await executeBacklogDisposition(entry, options));
		} catch (error) {
			outcomes.push({
				...entry,
				status: 'failed',
				error: error instanceof Error ? error.message : String(error),
				dry_run: options.dryRun !== false,
			});
		}
	}

	return {
		status: options.dryRun === false ? 'executed' : 'dry_run',
		dry_run: options.dryRun !== false,
		outcomes,
		summary: {
			closed: outcomes.filter((entry) => entry.status === 'closed').length,
			ops_escalated: outcomes.filter((entry) => entry.status === 'ops_escalated').length,
			planned_close: outcomes.filter((entry) => entry.status === 'planned_close').length,
			planned_ops_escalation: outcomes.filter((entry) => entry.status === 'planned_ops_escalation').length,
			failed: outcomes.filter((entry) => entry.status === 'failed').length,
		},
	};
}

async function paginateOpenIssues({ token, repository }) {
	const issues = [];
	let page = 1;
	while (true) {
		const batch = await request({
			token,
			repository,
			path: `/issues?state=open&per_page=100&page=${page}`,
		});
		if (!Array.isArray(batch) || batch.length === 0) break;
		issues.push(...batch.filter((issue) => !issue.pull_request));
		if (batch.length < 100) break;
		page += 1;
	}
	return issues;
}

async function fetchIssueByNumber({ token, repository, number }) {
	return request({ token, repository, path: `/issues/${number}` });
}

async function fetchSourceIssues({ token, repository, parsedIssues = [] }) {
	const numbers = new Set();
	for (const parsed of parsedIssues) {
		if (parsed.source_issue) numbers.add(parsed.source_issue);
		if (parsed.program_issue) numbers.add(parsed.program_issue);
	}

	const entries = await Promise.all([...numbers].map(async (number) => {
		try {
			return [number, await fetchIssueByNumber({ token, repository, number })];
		} catch (error) {
			return [number, {
				number,
				state: 'unknown',
				fetch_error: error instanceof Error ? error.message : String(error),
			}];
		}
	}));

	return Object.fromEntries(entries);
}

function parseArgs(argv = []) {
	const options = {
		outputPath: null,
		eventIssuePath: null,
		dryRun: true,
	};
	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === '--output' && argv[index + 1]) {
			options.outputPath = argv[index + 1];
			index += 1;
		} else if (arg === '--event-issue' && argv[index + 1]) {
			options.eventIssuePath = argv[index + 1];
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

	if (!token || !repository) {
		throw new Error('GITHUB_TOKEN/GH_TOKEN and GITHUB_REPOSITORY are required.');
	}

	const issues = options.eventIssuePath
		? [JSON.parse(fs.readFileSync(options.eventIssuePath, 'utf8'))]
		: await paginateOpenIssues({ token, repository });
	const parsedIssues = issues.filter(isPostMergeExceptionIssue).map(parsePostMergeExceptionIssue);
	const sourceIssuesByNumber = await fetchSourceIssues({ token, repository, parsedIssues });
	const report = buildBacklogReport({
		issues,
		sourceIssuesByNumber,
		dryRun: options.dryRun,
	});
	const execution = await executeBacklogReport(report, {
		token,
		repository,
		dryRun: options.dryRun,
	});
	const executedSummary = options.dryRun
		? report.summary
		: {
			...report.summary,
			auto_closed: execution.summary.closed,
			auto_close_planned: 0,
			ops_pr_escalation_labeled: execution.summary.ops_escalated,
			ops_pr_escalation_planned: 0,
			duplicate_closures: execution.outcomes.filter((entry) =>
				entry.status === 'closed'
				&& entry.disposition === BACKLOG_DISPOSITIONS.DUPLICATE_OF_CANONICAL_REMEDIATION
			).length,
			duplicate_closures_planned: 0,
			after_open_post_merge_issue_count: Math.max(
				0,
				report.summary.before_open_post_merge_issue_count - execution.summary.closed,
			),
		};
	const output = { ...report, summary: executedSummary, execution };
	const serialized = `${JSON.stringify(output, null, 2)}\n`;
	if (options.outputPath) {
		fs.writeFileSync(options.outputPath, serialized);
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
