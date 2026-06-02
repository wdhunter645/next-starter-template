#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REQUIRED_BODY_SECTIONS = [
	'## CHANGE SUMMARY',
	'## BUILD / TEST / VERIFICATION',
	'## ACCEPTANCE CRITERIA',
	'## REQUIRED PRE-REVIEW SELF-CHECK',
];

const TRUSTED_REVIEWER_PATTERN = /chatgpt-codex-connector|gemini-code-assist|copilot-pull-request-reviewer|cubic-dev-ai/i;
const HIGH_SEVERITY_PATTERN =
	/(^|[^A-Za-z0-9])(P0|P1)([^A-Za-z0-9]|$)|high[- ]priority|request changes|requested changes|must fix|blocking/i;
const RESOLVED_PATTERN = /addressed in|\bresolved\b|all checks passed|no warnings detected/i;
const UNRESOLVED_PATTERN = /\bunresolved\b|\bnot\s+resolved\b|\bstill\s+open\b|\bstill\s+blocking\b/i;
const OPTIONAL_WORKFLOWS = new Set(['Auto-Sync Documentation']);
const REQUIRED_WORKFLOW_PATTERNS = [
	/quality/i,
	/secret scan|gitleaks/i,
	/zip/i,
	/pr issue accounting/i,
	/drift/i,
	/intent/i,
	/main change monitor/i,
	/enforce pr only/i,
];

export function linkedIssueNumber(body = '') {
	const sourceMarker = body.match(/<!--\s*orchestrator-source-issue:\s*(\d+)\s*-->/i);
	if (sourceMarker) return sourceMarker[1];

	const match = body.match(/(?:\*\*Issue:\*\*|Issue:)\s*(?:https?:\/\/github\.com\/[^/\s]+\/[^/\s]+\/issues\/|#)(\d+)/i);
	return match ? match[1] : '';
}

export function resolvePrNumber({
	eventName,
	inputPrNumber = '',
	eventPrNumber = '',
	eventPrMerged = '',
	eventPrBaseRef = '',
	associatedPulls = [],
} = {}) {
	if (eventName === 'pull_request_target') {
		if (String(eventPrMerged) === 'true' && eventPrBaseRef === 'main' && eventPrNumber) {
			return { pr: String(eventPrNumber), method: 'pull_request_target', skip_reason: 'none' };
		}
		return { pr: '', method: 'pull_request_target', skip_reason: 'closed PR was not merged into main' };
	}

	if (eventName === 'workflow_dispatch' && inputPrNumber) {
		return { pr: String(inputPrNumber), method: 'workflow_dispatch', skip_reason: 'none' };
	}

	const associated = associatedPulls.find((pull) => pull?.state === 'closed' && pull?.merged_at && pull?.base?.ref === 'main');
	if (associated?.number) {
		return { pr: String(associated.number), method: 'commit-pulls-api', skip_reason: 'none' };
	}

	return { pr: '', method: 'commit-pulls-api', skip_reason: 'no merged PR associated with commit' };
}

export function metadataFailures(pr, filesExist = () => true) {
	const failures = [];
	const body = pr?.body || '';

	if (!pr || pr.isDraft === true || !pr.mergedAt || pr.baseRefName !== 'main') {
		failures.push({ code: 'not_merged_to_main', message: 'Resolved PR is not a merged PR into main.' });
	}

	if (!linkedIssueNumber(body)) {
		failures.push({ code: 'missing_source_issue', message: 'Merged PR body does not contain a primary source issue.' });
	}

	if (/\b(TODO|TBD|placeholder)\b/i.test(body)) {
		failures.push({ code: 'forbidden_placeholder_token', message: 'Merged PR body contains a forbidden placeholder token.' });
	}

	for (const section of REQUIRED_BODY_SECTIONS) {
		if (!body.includes(section)) {
			failures.push({ code: 'missing_required_section', message: `Merged PR body is missing ${section}.` });
		}
	}

	for (const file of pr?.files || []) {
		const filePath = typeof file === 'string' ? file : file.path;
		if (filePath && !filesExist(filePath)) {
			failures.push({ code: 'missing_changed_file', message: `Merged PR file is absent from the checkout: ${filePath}` });
		}
	}

	return failures;
}

export function isResolvedText(body = '') {
	return RESOLVED_PATTERN.test(body) && !UNRESOLVED_PATTERN.test(body);
}

export function isHighSeverityFinding(body = '', state = '') {
	return (state === 'CHANGES_REQUESTED' || HIGH_SEVERITY_PATTERN.test(body)) && !isResolvedText(body);
}

export function isAfterMerge(value, mergedAt) {
	if (!value || !mergedAt) return false;
	return new Date(value).getTime() > new Date(mergedAt).getTime();
}

function findingLine(item, fallbackUrl) {
	const login = item.user?.login || 'unknown-reviewer';
	const url = item.html_url || item.url || item._links?.html?.href || fallbackUrl || 'unknown-url';
	const body = String(item.body || item.state || '')
		.replace(/\s+/g, ' ')
		.trim();
	return { reviewer: login, url, body: body.slice(0, 240) };
}

export function reviewerFindings({ pr, issueComments = [], reviewComments = [], reviews = [] }) {
	const mergedAt = pr?.mergedAt || pr?.merged_at || '';
	const prUrl = pr?.url || pr?.html_url || '';
	const findings = [];

	for (const comment of issueComments) {
		if (
			TRUSTED_REVIEWER_PATTERN.test(comment.user?.login || '') &&
			isAfterMerge(comment.created_at, mergedAt) &&
			isHighSeverityFinding(comment.body || '')
		) {
			findings.push(findingLine(comment, prUrl));
		}
	}

	for (const comment of reviewComments) {
		if (
			TRUSTED_REVIEWER_PATTERN.test(comment.user?.login || '') &&
			isAfterMerge(comment.created_at, mergedAt) &&
			isHighSeverityFinding(comment.body || '')
		) {
			findings.push(findingLine(comment, prUrl));
		}
	}

	for (const review of reviews) {
		if (
			TRUSTED_REVIEWER_PATTERN.test(review.user?.login || '') &&
			isAfterMerge(review.submitted_at, mergedAt) &&
			isHighSeverityFinding(review.body || '', review.state || '')
		) {
			findings.push(findingLine(review, prUrl));
		}
	}

	return findings;
}

export function docsSyncRequiredByAcceptance(body = '') {
	const acceptance = body.split('## ACCEPTANCE CRITERIA')[1]?.split('\n## ')[0] || '';
	return /auto-sync documentation|docs sync|documentation sync/i.test(acceptance);
}

export function classifyWorkflowRun(run, prBody = '') {
	const name = run.workflowName || run.name || '';
	const conclusion = String(run.conclusion || '').toLowerCase();
	const required = OPTIONAL_WORKFLOWS.has(name)
		? docsSyncRequiredByAcceptance(prBody)
		: REQUIRED_WORKFLOW_PATTERNS.some((pattern) => pattern.test(name));
	const classification =
		/COPILOT_GITHUB_TOKEN|secret/i.test(run.failureText || '') || OPTIONAL_WORKFLOWS.has(name)
			? 'secret-access/configuration'
			: required
				? 'required-workflow-failure'
				: 'optional-remediation-failure';

	return {
		workflow: name || 'unknown workflow',
		run_id: run.databaseId || run.id || null,
		url: run.url || run.html_url || '',
		conclusion,
		required,
		classification,
	};
}

export function workflowFailures({ runs = [], prBody = '', currentRunId = '' }) {
	return runs
		.filter((run) => String(run.databaseId || run.id || '') !== String(currentRunId || ''))
		.filter((run) => String(run.status || '').toLowerCase() === 'completed')
		.filter((run) => ['failure', 'timed_out', 'cancelled', 'action_required'].includes(String(run.conclusion || '').toLowerCase()))
		.filter((run) => !/post-merge detection|post-merge-intent-verification/i.test(run.workflowName || run.name || ''))
		.map((run) => classifyWorkflowRun(run, prBody));
}

export function buildResult({ pr = null, resolution, metadata = [], findings = [], failures = [], mergeSha = '' }) {
	if (!resolution?.pr) {
		return {
			status: 'skipped',
			pr: null,
			merge_sha: mergeSha,
			source_issue: null,
			late_findings: 0,
			workflow_failures: [],
			remediation_required: false,
			skip_reason: resolution?.skip_reason || 'no merged PR associated with commit',
		};
	}

	const requiredWorkflowFailures = failures.filter((failure) => failure.required);
	const status = metadata.length === 0 && findings.length === 0 && requiredWorkflowFailures.length === 0 ? 'pass' : 'fail';

	return {
		status,
		pr: Number(resolution.pr),
		merge_sha: mergeSha || pr?.mergeCommit?.oid || pr?.merge_commit_sha || '',
		source_issue: linkedIssueNumber(pr?.body || '') || null,
		late_findings: findings.length,
		workflow_failures: failures,
		remediation_required: metadata.length > 0 || findings.length > 0 || failures.length > 0,
		metadata_failures: metadata,
		reviewer_findings: findings,
		sync_action: status === 'pass' ? 'post_merge_success' : 'post_merge_failure',
	};
}

export function commentBody(result) {
	const lines = [
		`Post-merge validation result: ${result.status}`,
		'',
		`- PR: ${result.pr ? `#${result.pr}` : 'none'}`,
		`- Commit: ${result.merge_sha || 'unknown'}`,
		`- Source issue: ${result.source_issue ? `#${result.source_issue}` : 'none'}`,
		`- Late reviewer findings: ${result.late_findings}`,
		`- Workflow failures: ${result.workflow_failures.length}`,
		`- Remediation required: ${result.remediation_required ? 'yes' : 'no'}`,
	];

	for (const failure of result.workflow_failures) {
		lines.push(`  - ${failure.workflow}: ${failure.classification}${failure.required ? ' (required)' : ' (optional)'}`);
	}

	return `${lines.join('\n')}\n`;
}

function writeOutput(name, value) {
	const outputPath = process.env.GITHUB_OUTPUT;
	if (outputPath) fs.appendFileSync(outputPath, `${name}=${value}\n`);
}

async function apiRequest({ token, repository, path: requestPath, method = 'GET', body }) {
	const response = await fetch(`https://api.github.com/repos/${repository}${requestPath}`, {
		method,
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28',
			'User-Agent': 'lgfc-post-merge-validator',
			...(body ? { 'Content-Type': 'application/json' } : {}),
		},
		...(body ? { body: JSON.stringify(body) } : {}),
	});

	if (!response.ok) {
		throw new Error(`${method} ${requestPath} failed: ${response.status} ${await response.text()}`);
	}

	return response.status === 204 ? null : response.json();
}

async function paginate(args) {
	const out = [];
	let page = 1;
	while (true) {
		const separator = args.path.includes('?') ? '&' : '?';
		const data = await apiRequest({ ...args, path: `${args.path}${separator}per_page=100&page=${page}` });
		if (!Array.isArray(data) || data.length === 0) break;
		out.push(...data);
		if (data.length < 100) break;
		page += 1;
	}
	return out;
}

function uniqueRuns(...runGroups) {
	const byId = new Map();
	for (const group of runGroups) {
		for (const run of group || []) {
			const id = run.databaseId || run.id || run.html_url || run.url;
			if (id && !byId.has(id)) byId.set(id, run);
		}
	}
	return [...byId.values()];
}

function runTimestamp(run) {
	return Date.parse(run.created_at || run.createdAt || run.run_started_at || run.startedAt || run.updated_at || run.updatedAt || '') || 0;
}

export function latestRunsByWorkflow(runs = []) {
	const latest = new Map();
	for (const run of runs) {
		const name = run.workflowName || run.name || 'unknown workflow';
		const current = latest.get(name);
		if (!current || runTimestamp(run) >= runTimestamp(current)) latest.set(name, run);
	}
	return [...latest.values()];
}

function shouldInspectRun(run, currentRunId = '') {
	return (
		String(run.databaseId || run.id || '') !== String(currentRunId || '') &&
		String(run.status || '').toLowerCase() === 'completed' &&
		['failure', 'timed_out', 'cancelled', 'action_required'].includes(String(run.conclusion || '').toLowerCase())
	);
}

async function enrichFailedRuns({ token, repository, runs, currentRunId }) {
	return Promise.all(
		runs.map(async (run) => {
			if (!shouldInspectRun(run, currentRunId)) return run;
			const runId = run.databaseId || run.id;
			if (!runId) return run;

			try {
				const jobs = await apiRequest({ token, repository, path: `/actions/runs/${runId}/jobs?per_page=100` });
				const failureText = (jobs.jobs || [])
					.flatMap((job) => [
						job.name,
						...(job.steps || [])
							.filter((step) =>
								['failure', 'cancelled', 'timed_out', 'action_required'].includes(String(step.conclusion || '').toLowerCase()),
							)
							.map((step) => step.name),
					])
					.filter(Boolean)
					.join(' ');
				return { ...run, failureText };
			} catch {
				return run;
			}
		}),
	);
}

export async function runValidator({
	token,
	repository,
	eventName,
	inputPrNumber,
	eventPrNumber,
	eventPrMerged,
	eventPrBaseRef,
	sha,
	runId,
	workspace = process.cwd(),
}) {
	const pulls = eventName === 'push' ? await apiRequest({ token, repository, path: `/commits/${sha}/pulls` }) : [];
	const resolution = resolvePrNumber({ eventName, inputPrNumber, eventPrNumber, eventPrMerged, eventPrBaseRef, associatedPulls: pulls });

	if (!resolution.pr) return buildResult({ resolution, mergeSha: sha });

	const pr = await apiRequest({ token, repository, path: `/pulls/${resolution.pr}` });
	const prHeadSha = pr.head?.sha || '';

	const [issueComments, reviewComments, reviews, mergeRunsResponse, headRunsResponse] = await Promise.all([
		paginate({ token, repository, path: `/issues/${resolution.pr}/comments` }),
		paginate({ token, repository, path: `/pulls/${resolution.pr}/comments` }),
		paginate({ token, repository, path: `/pulls/${resolution.pr}/reviews` }),
		apiRequest({ token, repository, path: `/actions/runs?head_sha=${encodeURIComponent(sha)}&per_page=100` }),
		prHeadSha
			? apiRequest({ token, repository, path: `/actions/runs?head_sha=${encodeURIComponent(prHeadSha)}&per_page=100` })
			: { workflow_runs: [] },
	]);

	const normalizedPr = {
		body: pr.body || '',
		files: await paginate({ token, repository, path: `/pulls/${resolution.pr}/files` }),
		isDraft: pr.draft,
		mergedAt: pr.merged_at,
		baseRefName: pr.base?.ref,
		mergeCommit: { oid: pr.merge_commit_sha },
		url: pr.html_url,
	};

	const filesExist = (filePath) => fs.existsSync(path.join(workspace, filePath));
	const metadata = metadataFailures(normalizedPr, filesExist);
	const findings = reviewerFindings({ pr: normalizedPr, issueComments, reviewComments, reviews });
	const runs = latestRunsByWorkflow(uniqueRuns(mergeRunsResponse.workflow_runs, headRunsResponse.workflow_runs));
	const enrichedRuns = await enrichFailedRuns({ token, repository, runs, currentRunId: runId });
	const failures = workflowFailures({ runs: enrichedRuns, prBody: normalizedPr.body, currentRunId: runId });

	return buildResult({ pr: normalizedPr, resolution, metadata, findings, failures, mergeSha: sha });
}

export async function main() {
	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
	const repository = process.env.GITHUB_REPOSITORY;
	if (!token || !repository) throw new Error('GITHUB_TOKEN/GH_TOKEN and GITHUB_REPOSITORY are required.');

	const result = await runValidator({
		token,
		repository,
		eventName: process.env.GITHUB_EVENT_NAME || '',
		inputPrNumber: process.env.INPUT_PR_NUMBER || '',
		eventPrNumber: process.env.EVENT_PR_NUMBER || '',
		eventPrMerged: process.env.EVENT_PR_MERGED || '',
		eventPrBaseRef: process.env.EVENT_PR_BASE_REF || '',
		sha: process.env.GITHUB_SHA || '',
		runId: process.env.GITHUB_RUN_ID || '',
	});

	fs.writeFileSync('post-merge-result.json', `${JSON.stringify(result, null, 2)}\n`);
	fs.writeFileSync('post-merge-result.md', commentBody(result));

	writeOutput('status', result.status);
	writeOutput('pr_number', result.pr || '');
	writeOutput('sync_action', result.sync_action || 'skipped');
	writeOutput('remediation_required', result.remediation_required ? 'true' : 'false');

	console.log(JSON.stringify(result, null, 2));
	if (result.status === 'fail') process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((error) => {
		console.error(error);
		process.exit(1);
	});
}
