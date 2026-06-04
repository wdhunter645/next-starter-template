#!/usr/bin/env node

import { pathToFileURL } from 'node:url';
import { githubRepoRequest } from './github_issue_api.mjs';
import {
	REMEDIATION_ISSUE_LABEL,
	REMEDIATION_TITLE_PREFIX,
} from './post_merge_source_issue_closeout.mjs';
import { parseRemediationIssue } from './close_duplicate_remediation_issues.mjs';

function request(args) {
	return githubRepoRequest({ ...args, userAgent: 'lgfc-close-remediation-for-pr' });
}

async function paginateOpenRemediationIssues({ token, repository }) {
	const issues = [];
	let page = 1;

	while (true) {
		const batch = await request({
			token,
			repository,
			path: `/issues?state=open&labels=${encodeURIComponent(REMEDIATION_ISSUE_LABEL)}&per_page=100&page=${page}`,
		});
		if (!Array.isArray(batch) || batch.length === 0) break;
		for (const issue of batch) {
			if (issue.pull_request) continue;
			if (!String(issue.title || '').startsWith(REMEDIATION_TITLE_PREFIX)) continue;
			issues.push(issue);
		}
		if (batch.length < 100) break;
		page += 1;
	}

	return issues;
}

export function remediationIssuesForPr(issues, prNumber) {
	const target = String(prNumber);
	return issues.filter((issue) => {
		const parsed = parseRemediationIssue(issue);
		return parsed.pr === target;
	});
}

export function remediationCloseComment({ prNumber, mergeSha, sourceIssue }) {
	return [
		'Closing remediation issue after successful post-merge closeout.',
		'',
		`- PR: #${prNumber}`,
		`- Merge SHA: ${mergeSha || 'unknown'}`,
		`- Source issue: ${sourceIssue ? `#${sourceIssue}` : 'none'}`,
		'- Validator status: pass',
		'- Remediation required: no',
	].join('\n');
}

export async function closeRemediationIssuesForPr({
	token,
	repository,
	prNumber,
	mergeSha = '',
	sourceIssue = '',
	dryRun = false,
	listOpenIssues,
	requestFn = request,
}) {
	const openIssues = listOpenIssues
		? await listOpenIssues({ token, repository })
		: await paginateOpenRemediationIssues({ token, repository });
	const matches = remediationIssuesForPr(openIssues, prNumber);
	const closed = [];
	const failed = [];

	for (const issue of matches) {
		if (dryRun) {
			closed.push({ number: issue.number, dry_run: true });
			continue;
		}

		try {
			await requestFn({
				token,
				repository,
				path: `/issues/${issue.number}/comments`,
				method: 'POST',
				body: {
					body: remediationCloseComment({ prNumber, mergeSha, sourceIssue }),
				},
			});

			await requestFn({
				token,
				repository,
				path: `/issues/${issue.number}`,
				method: 'PATCH',
				body: { state: 'closed', state_reason: 'completed' },
			});

			closed.push({ number: issue.number });
		} catch (error) {
			console.error(`Failed to close remediation issue #${issue.number} for PR #${prNumber}:`, error);
			failed.push({
				number: issue.number,
				message: error instanceof Error ? error.message : String(error),
			});
		}
	}

	return {
		prNumber: String(prNumber),
		scanned: openIssues.length,
		matched: matches.length,
		closed,
		failed,
	};
}

export async function main() {
	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
	const repository = process.env.GITHUB_REPOSITORY;
	const prNumber = process.env.PR_NUMBER;
	const mergeSha = process.env.MERGE_SHA || '';
	const sourceIssue = process.env.SOURCE_ISSUE || '';
	const dryRun = ['1', 'true', 'yes'].includes(String(process.env.DRY_RUN || '').toLowerCase());

	if (!token || !repository || !prNumber) {
		throw new Error('GITHUB_TOKEN/GH_TOKEN, GITHUB_REPOSITORY, and PR_NUMBER are required.');
	}

	const outcome = await closeRemediationIssuesForPr({
		token,
		repository,
		prNumber,
		mergeSha,
		sourceIssue,
		dryRun,
	});
	console.log(JSON.stringify(outcome, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((error) => {
		console.error(error);
		process.exit(1);
	});
}
