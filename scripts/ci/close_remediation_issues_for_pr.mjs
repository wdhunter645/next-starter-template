#!/usr/bin/env node

import { pathToFileURL } from 'node:url';
import { githubRepoRequest } from './github_issue_api.mjs';
import {
	isRemediationIssue,
	LEGACY_REMEDIATION_TITLE_PREFIX,
	REMEDIATION_ISSUE_LABEL,
	REMEDIATION_TITLE_PREFIX,
} from './post_merge_source_issue_closeout.mjs';
import { parseRemediationIssue } from './close_duplicate_remediation_issues.mjs';

function request(args) {
	return githubRepoRequest({ ...args, userAgent: 'lgfc-close-remediation-for-pr' });
}

export function isOpenRemediationIssue(issue) {
	if (issue?.pull_request) return false;
	return isRemediationIssue({ title: issue?.title, labels: issue?.labels });
}

function addRemediationIssues(issuesByNumber, batch) {
	if (!Array.isArray(batch)) return;
	for (const issue of batch) {
		if (!isOpenRemediationIssue(issue)) continue;
		issuesByNumber.set(issue.number, issue);
	}
}

export const REMEDIATION_TITLE_SEARCH_QUERIES = [
	'Post-merge closeout exception',
	'Post-merge remediation required',
];

export async function searchOpenRemediationIssues({
	token,
	repository,
	searchQueries = REMEDIATION_TITLE_SEARCH_QUERIES,
	fetchFn = fetch,
}) {
	const issuesByNumber = new Map();

	for (const titleFragment of searchQueries) {
		const q = `repo:${repository} is:issue is:open in:title "${titleFragment}"`;
		try {
			const response = await fetchFn(
				`https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						Accept: 'application/vnd.github+json',
						'X-GitHub-Api-Version': '2022-11-28',
						'User-Agent': 'lgfc-close-remediation-for-pr',
					},
				},
			);
			if (!response.ok) {
				console.error(`Remediation issue search failed (${response.status}): ${q}`);
				continue;
			}
			const data = await response.json();
			addRemediationIssues(issuesByNumber, data.items);
		} catch (error) {
			console.error(`Remediation issue search error for ${q}:`, error);
		}
	}

	return [...issuesByNumber.values()];
}

async function paginateOpenRemediationIssues({ token, repository }) {
	const issuesByNumber = new Map();
	let page = 1;

	while (true) {
		const batch = await request({
			token,
			repository,
			path: `/issues?state=open&labels=${encodeURIComponent(REMEDIATION_ISSUE_LABEL)}&per_page=100&page=${page}`,
		});
		if (!Array.isArray(batch) || batch.length === 0) break;
		addRemediationIssues(issuesByNumber, batch);
		if (batch.length < 100) break;
		page += 1;
	}

	// Relabeled remediation exceptions can lose post-merge-failure while staying open (#1601).
	for (const issue of await searchOpenRemediationIssues({ token, repository })) {
		issuesByNumber.set(issue.number, issue);
	}

	return [...issuesByNumber.values()];
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
	const closedNumbers = new Set();

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
			closedNumbers.add(issue.number);
		} catch (error) {
			console.error(`Failed to close remediation issue #${issue.number} for PR #${prNumber}:`, error);
			failed.push({
				number: issue.number,
				message: error instanceof Error ? error.message : String(error),
			});
		}
	}

	const sourceIssueNumber = Number(sourceIssue);
	if (
		Number.isInteger(sourceIssueNumber) &&
		!closedNumbers.has(sourceIssueNumber) &&
		!dryRun
	) {
		const linkedRemediationSource = openIssues.find((issue) => issue.number === sourceIssueNumber);
		if (linkedRemediationSource && isRemediationIssue(linkedRemediationSource)) {
			try {
				await requestFn({
					token,
					repository,
					path: `/issues/${sourceIssueNumber}/comments`,
					method: 'POST',
					body: {
						body: remediationCloseComment({ prNumber, mergeSha, sourceIssue }),
					},
				});

				await requestFn({
					token,
					repository,
					path: `/issues/${sourceIssueNumber}`,
					method: 'PATCH',
					body: { state: 'closed', state_reason: 'completed' },
				});

				closed.push({ number: sourceIssueNumber, linked_source: true });
			} catch (error) {
				console.error(
					`Failed to close linked remediation source issue #${sourceIssueNumber} for PR #${prNumber}:`,
					error,
				);
				failed.push({
					number: sourceIssueNumber,
					message: error instanceof Error ? error.message : String(error),
				});
			}
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
