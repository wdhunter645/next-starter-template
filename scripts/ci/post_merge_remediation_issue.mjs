#!/usr/bin/env node

import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { githubRepoRequest } from './github_issue_api.mjs';

export function remediationTitle(result) {
	const pr = result?.pr ? `PR #${result.pr}` : `merge ${String(result?.merge_sha || 'unknown').slice(0, 12)}`;
	return `Post-merge remediation required for ${pr}`;
}

export function remediationBody(result) {
	const lines = [
		'Post-merge validation detected follow-up work.',
		'',
		`- PR: ${result.pr ? `#${result.pr}` : 'none'}`,
		`- Merge SHA: ${result.merge_sha || 'unknown'}`,
		`- Source issue: ${result.source_issue ? `#${result.source_issue}` : 'none'}`,
		`- Validator status: ${result.status}`,
		`- Remediation required: ${result.remediation_required ? 'yes' : 'no'}`,
		'',
		'## Workflow failures',
	];

	if (result.workflow_failures?.length) {
		for (const failure of result.workflow_failures) {
			lines.push(
				`- ${failure.workflow} — ${failure.classification} — ${failure.required ? 'required' : 'optional'} — ${failure.url || 'no run URL'}`,
			);
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

	lines.push('', '## Metadata failures');
	if (result.metadata_failures?.length) {
		for (const failure of result.metadata_failures) {
			lines.push(`- ${failure.code}: ${failure.message}`);
		}
	} else {
		lines.push('- none');
	}

	return `${lines.join('\n')}\n`;
}

function request(args) {
	return githubRepoRequest({ ...args, userAgent: 'lgfc-post-merge-remediation' });
}

export async function upsertRemediationIssue({ token, repository, result }) {
	if (!result.remediation_required) {
		return { action: 'skipped', issue: null };
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
