#!/usr/bin/env node

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

import { applyMergedPrBody } from './apply_merged_pr_body.mjs';
import { closeDuplicateRemediationIssues } from './close_duplicate_remediation_issues.mjs';
import { closeRemediationIssuesForPr } from './close_remediation_issues_for_pr.mjs';
import { runValidator, WORKFLOW_RUN_SCOPE_MERGE_ONLY } from './post_merge_validator.mjs';
import { githubRepoRequest } from './github_issue_api.mjs';

function runSync({ repository, prNumber, syncAction }) {
	execFileSync('node', ['scripts/orchestrator/sync-pr-state.mjs'], {
		stdio: 'inherit',
		env: {
			...process.env,
			GITHUB_REPOSITORY: repository,
			PR_NUMBER: String(prNumber),
			SYNC_ACTION: syncAction,
			POST_MERGE_RESULT_PATH: 'post-merge-result.json',
			GH_TOKEN: process.env.GITHUB_TOKEN || process.env.GH_TOKEN,
		},
	});
}

async function fetchMergedPr({ token, repository, prNumber }) {
	return githubRepoRequest({
		token,
		repository,
		path: `/pulls/${prNumber}`,
		userAgent: 'lgfc-post-merge-closeout',
	});
}

export async function runPostMergeCloseout({
	token,
	repository,
	prNumber,
	bodyFile,
	sha = '',
	runId = '',
	skipBodyApply = false,
	workflowRunScope = WORKFLOW_RUN_SCOPE_MERGE_ONLY,
}) {
	const pr = await fetchMergedPr({ token, repository, prNumber });
	if (!pr.merged_at) {
		throw new Error(`PR #${prNumber} is not merged; refusing post-merge closeout.`);
	}

	const mergeSha = sha || pr.merge_commit_sha || '';

	if (!skipBodyApply) {
		await applyMergedPrBody({ token, repository, prNumber, bodyFile });
	}

	const result = await runValidator({
		token,
		repository,
		eventName: 'workflow_dispatch',
		inputPrNumber: String(prNumber),
		sha: mergeSha,
		runId,
		workflowRunScope,
	});

	fs.writeFileSync('post-merge-result.json', `${JSON.stringify(result, null, 2)}\n`);

	if (result.sync_action && result.sync_action !== 'skipped') {
		runSync({ repository, prNumber, syncAction: result.sync_action });
	}

	if (result.sync_action === 'post_merge_success') {
		await closeRemediationIssuesForPr({
			token,
			repository,
			prNumber,
			mergeSha: result.merge_sha || mergeSha,
			sourceIssue: result.source_issue || '',
		});
		await closeDuplicateRemediationIssues({ token, repository, dryRun: false });
	}

	return result;
}

export async function main() {
	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
	const repository = process.env.GITHUB_REPOSITORY;
	const prNumber = process.env.PR_NUMBER || process.env.INPUT_PR_NUMBER;
	const bodyFile = process.env.BODY_FILE;
	const skipBodyApply = process.env.SKIP_BODY_APPLY === 'true';

	if (!token || !repository || !prNumber) {
		throw new Error('GITHUB_TOKEN, GITHUB_REPOSITORY, and PR_NUMBER are required.');
	}

	if (!skipBodyApply && !bodyFile) {
		throw new Error('BODY_FILE is required unless SKIP_BODY_APPLY=true.');
	}

	const result = await runPostMergeCloseout({
		token,
		repository,
		prNumber,
		bodyFile,
		sha: process.env.GITHUB_SHA || '',
		runId: process.env.GITHUB_RUN_ID || '',
		skipBodyApply,
	});

	console.log(JSON.stringify(result, null, 2));
	if (result.status === 'fail') process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((error) => {
		console.error(error);
		process.exit(1);
	});
}
