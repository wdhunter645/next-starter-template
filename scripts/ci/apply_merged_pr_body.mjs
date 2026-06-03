#!/usr/bin/env node

import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

async function apiRequest({ token, repository, requestPath, method = 'GET', body }) {
	const response = await fetch(`https://api.github.com/repos/${repository}${requestPath}`, {
		method,
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28',
			'User-Agent': 'lgfc-apply-merged-pr-body',
			...(body ? { 'Content-Type': 'application/json' } : {}),
		},
		...(body ? { body: JSON.stringify(body) } : {}),
	});

	if (!response.ok) {
		throw new Error(`${method} ${requestPath} failed: ${response.status} ${await response.text()}`);
	}

	return response.status === 204 ? null : response.json();
}

export async function applyMergedPrBody({ token, repository, prNumber, bodyFile }) {
	const body = fs.readFileSync(bodyFile, 'utf8');
	const pr = await apiRequest({ token, repository, requestPath: `/pulls/${prNumber}` });

	if (!pr.merged_at) {
		throw new Error(`PR #${prNumber} is not merged; refusing to apply remediated body.`);
	}

	await apiRequest({
		token,
		repository,
		requestPath: `/pulls/${prNumber}`,
		method: 'PATCH',
		body: { body },
	});

	return { pr: Number(prNumber), merge_sha: pr.merge_commit_sha };
}

export async function main() {
	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
	const repository = process.env.GITHUB_REPOSITORY;
	const prNumber = process.env.PR_NUMBER || process.env.INPUT_PR_NUMBER;
	const bodyFile = process.env.BODY_FILE;

	if (!token || !repository || !prNumber || !bodyFile) {
		throw new Error('GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER, and BODY_FILE are required.');
	}

	if (!fs.existsSync(bodyFile)) {
		throw new Error(`Body file not found: ${bodyFile}`);
	}

	const result = await applyMergedPrBody({ token, repository, prNumber, bodyFile });
	console.log(JSON.stringify({ status: 'applied', ...result }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((error) => {
		console.error(error);
		process.exit(1);
	});
}
