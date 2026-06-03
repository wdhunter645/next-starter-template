#!/usr/bin/env node

import { pathToFileURL } from 'node:url';
import { githubRepoRequest } from './github_issue_api.mjs';

const REMEDIATION_LABEL = 'post-merge-failure';
const TITLE_PREFIX = 'Post-merge remediation required for ';

export function parseRemediationIssue(issue) {
	const body = String(issue?.body || '');
	const title = String(issue?.title || '');

	const prFromBody = body.match(/^- PR: #(\d+)$/m)?.[1] ?? null;
	const prFromTitle = title.match(/PR #(\d+)/)?.[1] ?? null;
	const pr = prFromBody || prFromTitle || null;

	const mergeFromBody = body.match(/^- Merge SHA: (.+)$/m)?.[1]?.trim() ?? null;
	const mergeFromTitle = title.match(/merge ([0-9a-f]+)/i)?.[1] ?? null;
	const merge_sha = (mergeFromBody || mergeFromTitle || 'unknown').toLowerCase();

	const sourceFromBody = body.match(/^- Source issue: #(\d+)$/m)?.[1] ?? null;
	const source_issue = sourceFromBody ? Number(sourceFromBody) : null;

	const group_key =
		merge_sha === 'unknown'
			? `unknown-${issue?.number ?? 'missing'}`
			: `${pr || 'none'}|${merge_sha}`;

	return {
		number: issue?.number,
		html_url: issue?.html_url,
		created_at: issue?.created_at,
		pr,
		merge_sha,
		source_issue,
		group_key,
	};
}

export function groupRemediationIssues(issues) {
	const groups = new Map();
	for (const issue of issues) {
		const parsed = parseRemediationIssue(issue);
		if (!groups.has(parsed.group_key)) groups.set(parsed.group_key, []);
		groups.get(parsed.group_key).push({ ...issue, parsed });
	}
	return groups;
}

export function planDuplicateClosures(groups) {
	const actions = [];

	for (const issues of groups.values()) {
		if (issues.length <= 1) continue;

		const sorted = [...issues].sort((a, b) => {
			const timeA = Date.parse(a.created_at || a.parsed?.created_at) || 0;
			const timeB = Date.parse(b.created_at || b.parsed?.created_at) || 0;
			return timeA - timeB;
		});
		const canonical = sorted[0];
		const protectedNumbers = new Set(
			sorted.map((issue) => issue.parsed.source_issue).filter((value) => Number.isInteger(value)),
		);

		for (const duplicate of sorted.slice(1)) {
			if (protectedNumbers.has(duplicate.number)) continue;
			actions.push({ canonical, duplicate });
		}
	}

	return actions;
}

export function duplicateCloseComment({ canonical, duplicate }) {
	const prLabel = duplicate.parsed.pr ? `PR #${duplicate.parsed.pr}` : 'unknown PR';
	return [
		'Closing as a duplicate post-merge remediation issue.',
		'',
		`- Canonical remediation issue: #${canonical.number}`,
		`- Group: ${prLabel} @ merge \`${duplicate.parsed.merge_sha}\``,
		`- This issue (#${duplicate.number}) was opened after #${canonical.number} and is redundant.`,
		'',
		`Track remediation in ${canonical.html_url || `#${canonical.number}`}.`,
	].join('\n');
}

function request(args) {
	return githubRepoRequest({ ...args, userAgent: 'lgfc-close-duplicate-remediation' });
}

async function paginateOpenRemediationIssues({ token, repository }) {
	const issues = [];
	let page = 1;

	while (true) {
		const batch = await request({
			token,
			repository,
			path: `/issues?state=open&labels=${encodeURIComponent(REMEDIATION_LABEL)}&per_page=100&page=${page}`,
		});

		if (!Array.isArray(batch) || batch.length === 0) break;

		for (const issue of batch) {
			if (issue.pull_request) continue;
			if (!String(issue.title || '').startsWith(TITLE_PREFIX)) continue;
			issues.push(issue);
		}

		if (batch.length < 100) break;
		page += 1;
	}

	return issues;
}

export async function closeDuplicateRemediationIssues({ token, repository, dryRun = false }) {
	const openIssues = await paginateOpenRemediationIssues({ token, repository });
	const groups = groupRemediationIssues(openIssues);
	const actions = planDuplicateClosures(groups);
	const closed = [];

	for (const action of actions) {
		if (dryRun) {
			closed.push({
				number: action.duplicate.number,
				canonical: action.canonical.number,
				dry_run: true,
			});
			continue;
		}

		try {
			await request({
				token,
				repository,
				path: `/issues/${action.duplicate.number}/comments`,
				method: 'POST',
				body: { body: duplicateCloseComment(action) },
			});

			await request({
				token,
				repository,
				path: `/issues/${action.duplicate.number}`,
				method: 'PATCH',
				body: { state: 'closed', state_reason: 'not_planned' },
			});

			closed.push({
				number: action.duplicate.number,
				canonical: action.canonical.number,
			});
		} catch (error) {
			console.error(`Failed to close duplicate issue #${action.duplicate.number}:`, error);
		}
	}

	return {
		scanned: openIssues.length,
		groups: groups.size,
		closed,
	};
}

export async function main() {
	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
	const repository = process.env.GITHUB_REPOSITORY;
	const dryRun = ['1', 'true', 'yes'].includes(String(process.env.DRY_RUN || '').toLowerCase());

	if (!token || !repository) {
		throw new Error('GITHUB_TOKEN/GH_TOKEN and GITHUB_REPOSITORY are required.');
	}

	const outcome = await closeDuplicateRemediationIssues({ token, repository, dryRun });
	console.log(JSON.stringify(outcome, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((error) => {
		console.error(error);
		process.exit(1);
	});
}
