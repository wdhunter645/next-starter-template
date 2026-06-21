#!/usr/bin/env node

/**
 * Live evidence collector for post-merge self-healing detection.
 * Gathers closeout manifests (from checkout), closeout reports, open exception/remediation
 * issues, and optional workflow_run context without mutating source issues.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

import { githubRepoRequest } from './github_issue_api.mjs';
import {
	parseRemediationIssue,
} from './close_duplicate_remediation_issues.mjs';
import {
	searchOpenRemediationIssues,
} from './close_remediation_issues_for_pr.mjs';
import { loadManifestSnapshots, DEFAULT_MANIFESTS } from './post_merge_self_heal_detect.mjs';
import { BATCH_CLOSEOUT_REPORT_PATH } from './run_batch_post_merge_closeout.mjs';
import {
	ESCALATION_LABEL,
	ESCALATION_MARKER,
} from './post_merge_self_heal_escalate.mjs';

export const CLOSEOUT_ARTIFACT_NAMES = [
	'post-merge-batch-closeout-report',
	'post-merge-single-closeout-report',
];

export const CLOSEOUT_REPORT_FILENAMES = [
	BATCH_CLOSEOUT_REPORT_PATH,
	'post-merge-result.json',
];

function readJsonIfExists(filePath) {
	if (!filePath || !fs.existsSync(filePath)) return null;
	try {
		return JSON.parse(fs.readFileSync(filePath, 'utf8'));
	} catch {
		return null;
	}
}

export function remediationIssueToMetadata(issue) {
	const parsed = parseRemediationIssue(issue);
	return {
		number: issue.number,
		state: issue.state,
		title: issue.title,
		linked_pr: parsed.pr,
		pr: parsed.pr,
		pr_number: parsed.pr,
		source_issue: parsed.source_issue,
		linked_source_issue: parsed.source_issue,
		failure_code: parsed.failure_code,
		code: parsed.failure_code,
		labels: (issue.labels || []).map((label) => (typeof label === 'string' ? label : label?.name)).filter(Boolean),
		html_url: issue.html_url,
	};
}

export function escalationIssueToMetadata(issue) {
	const body = String(issue?.body || '');
	return {
		number: issue.number,
		state: issue.state,
		title: issue.title,
		linked_pr: body.match(/^- Failing PR: #(\d+)$/m)?.[1] ?? null,
		source_issue: body.match(/^- Source issue: #(\d+)$/m)?.[1] ?? null,
		failure_code: body.match(/^- Failure class: (.+)$/m)?.[1]?.trim() ?? null,
		labels: (issue.labels || []).map((label) => (typeof label === 'string' ? label : label?.name)).filter(Boolean),
		html_url: issue.html_url,
		is_escalation: true,
	};
}

export function normalizeCloseoutReport(raw) {
	if (!raw || typeof raw !== 'object') return null;
	if (Array.isArray(raw.reports)) {
		return raw.reports;
	}
	if (Array.isArray(raw.results)) {
		return [raw];
	}
	if (raw.status && raw.pr) {
		return [{ status: raw.status, results: [raw] }];
	}
	return null;
}

export function mergeCloseoutReports(existing = [], incoming = []) {
	const merged = [...existing];
	for (const report of incoming) {
		if (!report) continue;
		merged.push(report);
	}
	return merged;
}

export function parseDownloadedCloseoutReports(downloadDir) {
	const reports = [];
	for (const filename of CLOSEOUT_REPORT_FILENAMES) {
		const filePath = path.join(downloadDir, filename);
		const raw = readJsonIfExists(filePath);
		const normalized = normalizeCloseoutReport(raw);
		if (normalized) {
			reports.push(...normalized);
		}
	}
	return reports;
}

async function paginateIssues({ token, repository, pathSuffix }) {
	const issues = [];
	let page = 1;
	while (true) {
		const batch = await githubRepoRequest({
			token,
			repository,
			path: `${pathSuffix}${pathSuffix.includes('?') ? '&' : '?'}per_page=100&page=${page}`,
			userAgent: 'lgfc-post-merge-self-heal-collect',
		});
		if (!Array.isArray(batch) || batch.length === 0) break;
		issues.push(...batch.filter((issue) => !issue.pull_request));
		if (batch.length < 100) break;
		page += 1;
	}
	return issues;
}

export async function fetchOpenEscalationIssues({ token, repository }) {
	if (!token || !repository) return [];
	const labeled = await paginateIssues({
		token,
		repository,
		pathSuffix: `/issues?state=open&labels=${encodeURIComponent(ESCALATION_LABEL)}`,
	});
	return labeled.filter((issue) => String(issue.body || '').includes(ESCALATION_MARKER));
}

export async function fetchLiveIssueMetadata({ token, repository }) {
	const remediationIssues = token && repository
		? (await searchOpenRemediationIssues({ token, repository })).map(remediationIssueToMetadata)
		: [];
	const escalationIssuesRaw = await fetchOpenEscalationIssues({ token, repository });
	const escalationIssues = escalationIssuesRaw.map(escalationIssueToMetadata);
	const exceptionIssues = remediationIssues.filter((issue) =>
		(issue.labels || []).includes('post-merge-failure')
		|| String(issue.title || '').includes('Post-merge closeout exception'),
	);

	return {
		exceptionIssues,
		remediationIssues,
		escalationIssues,
		existingEscalationIssues: escalationIssuesRaw,
	};
}

async function listRecentWorkflowRuns({ token, repository, workflowName, limit = 5 }) {
	const [owner, repo] = repository.split('/');
	const workflows = await githubRepoRequest({
		token,
		repository,
		path: '/actions/workflows?per_page=100',
		userAgent: 'lgfc-post-merge-self-heal-collect',
	});
	const workflow = (workflows.workflows || []).find((entry) => entry.name === workflowName);
	if (!workflow?.id) return [];

	const runs = await githubRepoRequest({
		token,
		repository,
		path: `/actions/workflows/${workflow.id}/runs?status=completed&per_page=${limit}`,
		userAgent: 'lgfc-post-merge-self-heal-collect',
	});
	return runs.workflow_runs || [];
}

async function downloadArtifactZip({ token, repository, artifactId, destZip }) {
	const [owner, repo] = repository.split('/');
	const response = await fetch(
		`https://api.github.com/repos/${owner}/${repo}/actions/artifacts/${artifactId}/zip`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28',
				'User-Agent': 'lgfc-post-merge-self-heal-collect',
			},
			redirect: 'follow',
		},
	);
	if (!response.ok) {
		throw new Error(`Artifact download failed: ${response.status}`);
	}
	const buffer = Buffer.from(await response.arrayBuffer());
	fs.writeFileSync(destZip, buffer);
}

export async function downloadCloseoutArtifactsFromRun({
	token,
	repository,
	runId,
	destDir,
	artifactNames = CLOSEOUT_ARTIFACT_NAMES,
}) {
	if (!token || !repository || !runId) {
		return { downloaded: [], errors: ['missing token, repository, or run id'] };
	}

	const artifacts = await githubRepoRequest({
		token,
		repository,
		path: `/actions/runs/${runId}/artifacts?per_page=100`,
		userAgent: 'lgfc-post-merge-self-heal-collect',
	});
	const downloaded = [];
	const errors = [];

	for (const artifact of artifacts.artifacts || []) {
		if (!artifactNames.includes(artifact.name)) continue;
		const zipPath = path.join(destDir, `${artifact.name}.zip`);
		const extractDir = path.join(destDir, artifact.name);
		try {
			await downloadArtifactZip({ token, repository, artifactId: artifact.id, destZip: zipPath });
			fs.mkdirSync(extractDir, { recursive: true });
			execFileSync('unzip', ['-o', zipPath, '-d', extractDir], { stdio: 'pipe' });
			downloaded.push({ name: artifact.name, dir: extractDir, run_id: runId });
		} catch (error) {
			errors.push(error instanceof Error ? error.message : String(error));
		}
	}

	return { downloaded, errors };
}

export async function collectCloseoutReportsFromWorkflowHistory({
	token,
	repository,
	workflowRunId = null,
	workflowName = 'Post-Merge PR Body Closeout',
	localReportPaths = [],
}) {
	const closeoutReports = [];
	const errors = [];
	const sources = [];

	for (const reportPath of localReportPaths) {
		const raw = readJsonIfExists(reportPath);
		const normalized = normalizeCloseoutReport(raw);
		if (normalized) {
			closeoutReports.push(...normalized);
			sources.push({ type: 'local_file', path: reportPath });
		}
	}

	if (!token || !repository) {
		return { closeoutReports, sources, errors };
	}

	const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'self-heal-closeout-'));
	try {
		const runIds = workflowRunId
			? [String(workflowRunId)]
			: (await listRecentWorkflowRuns({ token, repository, workflowName, limit: 3 }))
				.map((run) => String(run.id));

		for (const runId of runIds) {
			const { downloaded, errors: downloadErrors } = await downloadCloseoutArtifactsFromRun({
				token,
				repository,
				runId,
				destDir: path.join(tempRoot, runId),
			});
			errors.push(...downloadErrors);
			for (const entry of downloaded) {
				const reports = parseDownloadedCloseoutReports(entry.dir);
				if (reports.length > 0) {
					closeoutReports.push(...reports);
					sources.push({ type: 'workflow_artifact', run_id: runId, artifact: entry.name });
				}
			}
		}
	} finally {
		fs.rmSync(tempRoot, { recursive: true, force: true });
	}

	return { closeoutReports, sources, errors };
}

export async function collectLiveEvidence({
	token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN,
	repository = process.env.GITHUB_REPOSITORY,
	rootDir = process.cwd(),
	manifestPaths = DEFAULT_MANIFESTS,
	workflowRunId = process.env.SELF_HEAL_TRIGGER_RUN_ID || '',
	workflowRunName = process.env.SELF_HEAL_TRIGGER_WORKFLOW_NAME || '',
	workflowRunConclusion = process.env.SELF_HEAL_TRIGGER_RUN_CONCLUSION || '',
	localReportPaths = [],
} = {}) {
	const errors = [];
	const manifests = loadManifestSnapshots(manifestPaths, { rootDir });
	const issueMetadata = await fetchLiveIssueMetadata({ token, repository });

	const reportCollection = await collectCloseoutReportsFromWorkflowHistory({
		token,
		repository,
		workflowRunId: workflowRunId || null,
		localReportPaths,
	});
	errors.push(...reportCollection.errors);

	const evidenceSources = {
		manifests: manifests.map((manifest) => ({
			path: manifest.manifest_path,
			target_count: (manifest.targets || []).length,
			missing: manifest.missing === true,
		})),
		closeout_report_sources: reportCollection.sources,
		open_exception_issues: issueMetadata.exceptionIssues.length,
		open_remediation_issues: issueMetadata.remediationIssues.length,
		open_escalation_issues: issueMetadata.escalationIssues.length,
		workflow_run: workflowRunId
			? {
				id: workflowRunId,
				name: workflowRunName || null,
				conclusion: workflowRunConclusion || null,
			}
			: null,
	};

	return {
		manifestPaths,
		manifests,
		closeoutReports: reportCollection.closeoutReports,
		exceptionIssues: issueMetadata.exceptionIssues,
		remediationIssues: issueMetadata.remediationIssues,
		deferredIssues: [],
		existingEscalationIssues: issueMetadata.existingEscalationIssues,
		evidenceSources,
		errors,
	};
}

function parseArgs(argv = []) {
	const options = {
		outputPath: null,
		rootDir: process.cwd(),
		workflowRunId: process.env.SELF_HEAL_TRIGGER_RUN_ID || '',
		localReportPaths: [],
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === '--output' && argv[index + 1]) {
			options.outputPath = argv[index + 1];
			index += 1;
		} else if (arg === '--root' && argv[index + 1]) {
			options.rootDir = argv[index + 1];
			index += 1;
		} else if (arg === '--workflow-run-id' && argv[index + 1]) {
			options.workflowRunId = argv[index + 1];
			index += 1;
		} else if (arg === '--local-report' && argv[index + 1]) {
			options.localReportPaths.push(argv[index + 1]);
			index += 1;
		}
	}

	return options;
}

export async function main(argv = process.argv.slice(2)) {
	const options = parseArgs(argv);
	const bundle = await collectLiveEvidence({
		rootDir: options.rootDir,
		workflowRunId: options.workflowRunId,
		localReportPaths: options.localReportPaths,
	});
	const serialized = `${JSON.stringify(bundle, null, 2)}\n`;

	if (options.outputPath) {
		fs.writeFileSync(path.resolve(options.outputPath), serialized);
	} else {
		process.stdout.write(serialized);
	}

	if (bundle.errors.length > 0) {
		process.exitCode = 2;
	}
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((error) => {
		console.error(error);
		process.exitCode = 1;
	});
}
