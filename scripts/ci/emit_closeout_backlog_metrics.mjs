#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { BATCH_CLOSEOUT_REPORT_PATH } from './run_batch_post_merge_closeout.mjs';

const OPS_ESCALATION_LABEL = 'ops-pr-escalation';

export function formatBacklogMetricsMarkdown({
	open = 0,
	closed = 0,
	byCode = {},
} = {}) {
	const lines = [
		'## Post-merge closeout backlog metrics',
		'',
		'### ops-pr-escalation issue counts (GraphQL)',
		`- Open: ${open}`,
		`- Closed: ${closed}`,
		`- Total: ${open + closed}`,
	];

	const codes = Object.entries(byCode).sort(([left], [right]) => left.localeCompare(right));
	if (codes.length > 0) {
		lines.push('', '### Batch failure code rollup (`summary.by_code`)');
		for (const [code, count] of codes) {
			lines.push(`- ${code}: ${count}`);
		}
	} else {
		lines.push('', '### Batch failure code rollup (`summary.by_code`)', '- none');
	}

	return `${lines.join('\n')}\n`;
}

export async function fetchOpsEscalationIssueCounts({
	token,
	repository,
	fetchFn = fetch,
} = {}) {
	const [owner, name] = String(repository || '').split('/');
	if (!owner || !name || !token) {
		throw new Error('token and repository owner/name are required for backlog metrics.');
	}

	const query = `
		query($owner: String!, $name: String!) {
			repository(owner: $owner, name: $name) {
				open: issues(states: OPEN, labels: ["${OPS_ESCALATION_LABEL}"], first: 1) {
					totalCount
				}
				closed: issues(states: CLOSED, labels: ["${OPS_ESCALATION_LABEL}"], first: 1) {
					totalCount
				}
			}
		}
	`;

	const response = await fetchFn('https://api.github.com/graphql', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			'User-Agent': 'lgfc-emit-closeout-backlog-metrics',
		},
		body: JSON.stringify({ query, variables: { owner, name } }),
	});

	if (!response.ok) {
		let text = '';
		try {
			text = await response.text();
		} catch {
			// ignore secondary read failures
		}
		throw new Error(`GraphQL request failed: ${response.status} ${text}`);
	}

	const payload = await response.json();
	if (payload.errors?.length) {
		throw new Error(payload.errors.map((error) => error.message).join('; '));
	}

	const open = payload.data?.repository?.open?.totalCount ?? 0;
	const closed = payload.data?.repository?.closed?.totalCount ?? 0;
	return { open, closed, total: open + closed };
}

export function readBatchFailureCodeRollup(reportPath = BATCH_CLOSEOUT_REPORT_PATH, workspace = process.cwd()) {
	const resolved = path.resolve(workspace, reportPath);
	if (!fs.existsSync(resolved)) return {};
	try {
		const payload = JSON.parse(fs.readFileSync(resolved, 'utf8'));
		return payload.summary?.by_code || {};
	} catch {
		return {};
	}
}

export async function emitCloseoutBacklogMetrics({
	token,
	repository,
	reportPath = BATCH_CLOSEOUT_REPORT_PATH,
	workspace = process.cwd(),
	fetchFn = fetch,
	writeStepSummaryFn = (markdown) => {
		if (process.env.GITHUB_STEP_SUMMARY) {
			fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
		}
	},
} = {}) {
	const counts = await fetchOpsEscalationIssueCounts({ token, repository, fetchFn });
	const byCode = readBatchFailureCodeRollup(reportPath, workspace);
	const markdown = formatBacklogMetricsMarkdown({ ...counts, byCode });
	writeStepSummaryFn(markdown);
	console.log(markdown.trim());
	return { ...counts, by_code: byCode, markdown };
}

export async function main() {
	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
	const repository = process.env.GITHUB_REPOSITORY;
	const reportPath = process.env.CLOSEOUT_BATCH_REPORT || BATCH_CLOSEOUT_REPORT_PATH;

	try {
		await emitCloseoutBacklogMetrics({ token, repository, reportPath });
	} catch (error) {
		console.error(error);
		process.exitCode = 1;
	}
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main();
}
