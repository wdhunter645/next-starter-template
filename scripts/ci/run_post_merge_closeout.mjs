#!/usr/bin/env node

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

import { applyMergedPrBody } from './apply_merged_pr_body.mjs';
import { closeDuplicateRemediationIssues } from './close_duplicate_remediation_issues.mjs';
import { closeRemediationIssuesForPr } from './close_remediation_issues_for_pr.mjs';
import {
	shouldUpsertRemediationIssue,
	upsertRemediationIssue,
} from './post_merge_remediation_issue.mjs';
import { runValidator, WORKFLOW_RUN_SCOPE_MERGE_ONLY } from './post_merge_validator.mjs';
import { githubRepoRequest } from './github_issue_api.mjs';
import { shouldRunAutomaticCloseout } from './post_merge_closeout_trigger.mjs';

export const POST_MERGE_RESULT_PATH = 'post-merge-result.json';
export const POST_MERGE_RESULT_MD_PATH = 'post-merge-result.md';

function runSync({ repository, prNumber, syncAction }) {
	execFileSync('node', ['scripts/orchestrator/sync-pr-state.mjs'], {
		stdio: 'inherit',
		env: {
			...process.env,
			GITHUB_REPOSITORY: repository,
			PR_NUMBER: String(prNumber),
			SYNC_ACTION: syncAction,
			POST_MERGE_RESULT_PATH,
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

export function resolveCloseoutEventContext({
	eventName = process.env.GITHUB_EVENT_NAME || '',
	inputPrNumber = process.env.PR_NUMBER || '',
	eventPrNumber = process.env.EVENT_PR_NUMBER || '',
	eventPrMerged = process.env.EVENT_PR_MERGED || '',
	eventPrBaseRef = process.env.EVENT_PR_BASE_REF || '',
	skipBodyApply = process.env.SKIP_BODY_APPLY || '',
	bodyFile = process.env.BODY_FILE || '',
} = {}) {
	const automatic = shouldRunAutomaticCloseout({
		eventName,
		merged: eventPrMerged,
		baseRef: eventPrBaseRef,
	});

	return {
		eventName,
		prNumber: String(inputPrNumber || eventPrNumber || ''),
		automatic,
		skipBodyApply: automatic ? true : skipBodyApply === 'true',
		bodyFile: automatic ? '' : bodyFile,
		eventPrMerged,
		eventPrBaseRef,
	};
}

export async function writePostMergeResultArtifactsAsync(result) {
	const { commentBody } = await import('./post_merge_validator.mjs');
	fs.writeFileSync(POST_MERGE_RESULT_PATH, `${JSON.stringify(result, null, 2)}\n`);
	fs.writeFileSync(POST_MERGE_RESULT_MD_PATH, commentBody(result));
}

export function buildCloseoutErrorResult({ prNumber, mergeSha = '', message = '' } = {}) {
	return {
		status: 'fail',
		pr: prNumber ? Number(prNumber) : null,
		merge_sha: mergeSha,
		source_issue: null,
		late_findings: 0,
		workflow_failures: [],
		metadata_failures: [{ code: 'closeout_runtime_error', message: message || 'Post-merge closeout failed.' }],
		implementation_failures: [],
		diataxis_failures: [],
		reviewer_findings: [],
		remediation_required: true,
		sync_action: 'post_merge_failure',
	};
}

export async function ensureCloseoutRemediationEvidence({ token, repository, result }) {
	if (!shouldUpsertRemediationIssue(result)) {
		return { action: 'skipped', issue: null, reason: 'no-remediation-required' };
	}
	return upsertRemediationIssue({ token, repository, result });
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
	eventName = 'workflow_dispatch',
	eventPrMerged = '',
	eventPrBaseRef = '',
} = {}) {
	const pr = await fetchMergedPr({ token, repository, prNumber });
	if (!pr.merged_at) {
		throw new Error(`PR #${prNumber} is not merged; refusing post-merge closeout.`);
	}

	const mergeSha = sha || pr.merge_commit_sha || '';

	if (!skipBodyApply) {
		if (!bodyFile) {
			throw new Error('BODY_FILE is required unless SKIP_BODY_APPLY=true.');
		}
		await applyMergedPrBody({ token, repository, prNumber, bodyFile });
	}

	const result = await runValidator({
		token,
		repository,
		eventName,
		inputPrNumber: String(prNumber),
		eventPrNumber: String(prNumber),
		eventPrMerged: eventPrMerged || 'true',
		eventPrBaseRef: eventPrBaseRef || pr.base?.ref || 'main',
		sha: mergeSha,
		runId,
		workflowRunScope,
	});

	await writePostMergeResultArtifactsAsync(result);

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

	await ensureCloseoutRemediationEvidence({ token, repository, result });

	return result;
}

export async function main() {
	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
	const repository = process.env.GITHUB_REPOSITORY;
	const context = resolveCloseoutEventContext();

	if (!token || !repository) {
		throw new Error('GITHUB_TOKEN, GITHUB_REPOSITORY, and PR_NUMBER are required.');
	}

	if (!context.prNumber) {
		console.log(
			JSON.stringify({
				status: 'skipped',
				reason: 'closeout_not_applicable',
				event: context.eventName,
			}),
		);
		return;
	}

	let result;
	try {
		result = await runPostMergeCloseout({
			token,
			repository,
			prNumber: context.prNumber,
			bodyFile: context.bodyFile,
			sha: process.env.GITHUB_SHA || '',
			runId: process.env.GITHUB_RUN_ID || '',
			skipBodyApply: context.skipBodyApply,
			eventName: context.eventName,
			eventPrMerged: context.eventPrMerged,
			eventPrBaseRef: context.eventPrBaseRef,
		});
	} catch (error) {
		console.error(error);
		result = buildCloseoutErrorResult({
			prNumber: context.prNumber,
			mergeSha: process.env.GITHUB_SHA || '',
			message: error instanceof Error ? error.message : String(error),
		});
		await writePostMergeResultArtifactsAsync(result);
		await ensureCloseoutRemediationEvidence({ token, repository, result });
		process.exitCode = 1;
		return;
	}

	console.log(JSON.stringify(result, null, 2));
	if (result.status === 'fail') process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch(async (error) => {
		console.error(error);
		const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
		const repository = process.env.GITHUB_REPOSITORY;
		const prNumber = process.env.PR_NUMBER || process.env.EVENT_PR_NUMBER || '';
		const result = buildCloseoutErrorResult({
			prNumber,
			mergeSha: process.env.GITHUB_SHA || '',
			message: error instanceof Error ? error.message : String(error),
		});
		try {
			await writePostMergeResultArtifactsAsync(result);
			if (token && repository) {
				await ensureCloseoutRemediationEvidence({ token, repository, result });
			}
		} catch (writeError) {
			console.error(writeError);
		}
		process.exit(1);
	});
}
