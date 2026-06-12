#!/usr/bin/env node

import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { githubRepoRequest } from './github_issue_api.mjs';
import { REMEDIATION_TITLE_PREFIX } from './post_merge_source_issue_closeout.mjs';

export function blockingCloseoutFailures(result = {}) {
	const blockingMetadata = (result.metadata_failures || []).filter((failure) => failure?.severity !== 'advisory');
	const blockingWorkflows = (result.workflow_failures || []).filter(
		(failure) => failure?.required || failure?.classification !== 'optional-remediation-failure',
	);

	return [
		...blockingMetadata,
		...(result.implementation_failures || []),
		...(result.diataxis_failures || []),
		...(result.reviewer_findings || []).map((finding) => ({
			code: 'late_reviewer_finding',
			message: `${finding?.reviewer || 'reviewer'}: ${finding?.body || finding?.url || 'finding recorded'}`,
		})),
		...(result.reviewer_disposition_failures || []),
		...blockingWorkflows.map((failure) => ({
			code: 'workflow_failure',
			message: `${failure?.workflow || 'workflow'} ${failure?.conclusion || ''} ${failure?.classification || ''}`.trim(),
		})),
	];
}

function failureConditions(result = {}) {
	return blockingCloseoutFailures(result);
}

function exceptionKey(result = {}) {
	const source = result.source_issue ? `source #${result.source_issue}` : 'source none';
	const condition = failureConditions(result)[0]?.code || 'closeout_exception';
	return `${source} / ${condition}`;
}

export function remediationTitle(result) {
	const pr = result?.pr ? `PR #${result.pr}` : `merge ${String(result?.merge_sha || 'unknown').slice(0, 12)}`;
	return `${REMEDIATION_TITLE_PREFIX}${pr} / ${exceptionKey(result)}`;
}

export function remediationBody(result) {
	const conditions = failureConditions(result);
	const lines = [
		'Post-merge closeout exception detected. CI refused deterministic source issue closeout.',
		'',
		`- PR: ${result.pr ? `#${result.pr}` : 'none'}`,
		`- Merge SHA: ${result.merge_sha || 'unknown'}`,
		`- Source issue: ${result.source_issue ? `#${result.source_issue}` : 'none'}`,
		`- Source issue candidates: ${result.source_issue_candidates?.length ? result.source_issue_candidates.join(', ') : 'none'}`,
		`- Source issue closeout mode: ${result.source_issue_closeout_mode || 'not evaluated'}`,
		`- Validator status: ${result.status}`,
		`- Remediation required: ${result.remediation_required ? 'yes' : 'no'}`,
		`- Workflow run URL: ${result.workflow_run_url || 'not recorded'}`,
		`- Terminal label result: ${result.terminal_label_result?.summary || 'not evaluated'}`,
		`- Queue advancement status: ${result.queue_advancement_status || 'stopped; Atlas/Bill review required'}`,
		'',
		'## Detected failure condition',
	];

	if (conditions.length) {
		for (const failure of conditions) {
			lines.push(`- ${failure.code}: ${failure.message}`);
		}
	} else {
		lines.push('- closeout_exception: Closeout was ambiguous or unsafe.');
	}

	lines.push(
		'',
		'## Action CI refused to take',
		'- CI did not close, relabel, or otherwise mutate the source issue.',
		'- CI did not advance the queue, launch Program 1, mutate Program 2, or create child issues.',
		'',
		'## Required Atlas/Bill decision',
		'- Decide whether the source issue may be closed, corrected, or kept open.',
		'- Authorize any corrective PR or issue mutation through a bounded follow-up issue/PR.',
		'- Queue advancement remains stopped until the exception is resolved.',
		'',
		'## Evidence collected by CI',
		'',
		'## Rollback recommendation',
		result.status === 'fail'
			? '- Consider reverting the merge commit if the merged change cannot be corrected quickly and production/orchestration risk remains.'
			: '- No rollback recommendation recorded.',
		'',
		'## Workflow failures',
	);

	if (result.workflow_failures?.length) {
		for (const failure of result.workflow_failures) {
			lines.push(
				`- ${failure.workflow} — ${failure.classification} — ${failure.required ? 'required' : 'optional'} — ${failure.url || 'no run URL'}`,
			);
		}
	} else {
		lines.push('- none');
	}

	lines.push('', '## Metadata failures');
	if (result.metadata_failures?.length) {
		for (const failure of result.metadata_failures) {
			lines.push(`- ${failure.code}: ${failure.message}`);
		}
	} else {
		lines.push('- none');
	}

	lines.push('', '## Implementation evidence failures');
	if (result.implementation_failures?.length) {
		for (const failure of result.implementation_failures) {
			lines.push(`- ${failure.code}: ${failure.message}`);
		}
	} else {
		lines.push('- none');
	}

	lines.push('', '## DIATAXIS failures');
	if (result.diataxis_failures?.length) {
		for (const failure of result.diataxis_failures) {
			lines.push(`- ${failure.code}: ${failure.message}`);
		}
	} else {
		lines.push('- none');
	}

	lines.push('', '## Reviewer findings');
	if (result.reviewer_findings?.length) {
		for (const finding of result.reviewer_findings) {
			lines.push(`- ${finding.url} by ${finding.reviewer}: ${finding.body}`);
		}
	} else {
		lines.push('- none');
	}

	return `${lines.join('\n')}\n`;
}

function request(args) {
	return githubRepoRequest({ ...args, userAgent: 'lgfc-post-merge-remediation' });
}

export function shouldUpsertRemediationIssue(result = {}) {
	if (result.status === 'skipped') return false;
	return blockingCloseoutFailures(result).length > 0;
}

export async function upsertRemediationIssue({ token, repository, result }) {
	if (!shouldUpsertRemediationIssue(result)) {
		return { action: 'skipped', issue: null, reason: 'validation-passed-or-skipped' };
	}

	const title = remediationTitle(result);
	const body = remediationBody(result);
	const search = await request({
		token,
		repository,
		path: `/issues?state=open&per_page=100`,
	});
	const existing = Array.isArray(search) ? search.find((issue) => issue.title === title && !issue.pull_request) : undefined;

	if (existing) {
		await request({
			token,
			repository,
			path: `/issues/${existing.number}`,
			method: 'PATCH',
			body: { body },
		});
		return { action: 'updated', issue: existing.html_url || `#${existing.number}` };
	}

	const created = await request({
		token,
		repository,
		path: '/issues',
		method: 'POST',
		body: { title, body, labels: ['post-merge-failure'] },
	});

	return { action: 'created', issue: created.html_url || `#${created.number}` };
}

export async function main() {
	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
	const repository = process.env.GITHUB_REPOSITORY;
	const resultPath = process.env.POST_MERGE_RESULT_PATH || process.argv[2] || 'post-merge-result.json';

	if (!token || !repository) throw new Error('GITHUB_TOKEN/GH_TOKEN and GITHUB_REPOSITORY are required.');
	const result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
	const outcome = await upsertRemediationIssue({ token, repository, result });
	console.log(JSON.stringify(outcome, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((error) => {
		console.error(error);
		process.exit(1);
	});
}
