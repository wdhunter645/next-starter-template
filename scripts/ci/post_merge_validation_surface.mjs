import fs from 'node:fs';
import path from 'node:path';

const WORKFLOW_DIR = '.github/workflows';

export const POST_MERGE_VALIDATION_WORKFLOWS = [
	{
		file: 'post-merge-closeout.yml',
		workflowName: 'Post-Merge Detection',
		jobIds: ['detect'],
		notes: 'Single automatic post-merge closeout owner: validate, sync, and remediation handoff.',
	},
	{
		file: 'post-merge-remediation.yml',
		workflowName: 'Post-Merge Remediation',
		jobIds: ['remediate'],
		notes: 'Creates remediation issues only when post-merge validation fails.',
	},
	{
		file: 'diataxis-post-merge-validate.yml',
		workflowName: 'DIATAXIS Post-Merge Validation',
		jobIds: ['validate'],
		notes: 'Evidence-only DIATAXIS audit for merged documentation changes.',
	},
];

export const POST_MERGE_VALIDATION_SCRIPTS = [
	'scripts/ci/post_merge_validator.mjs',
	'scripts/ci/post_merge_remediation_issue.mjs',
	'scripts/ci/post_merge_implementation_evidence.mjs',
	'scripts/ci/post_merge_diataxis_audit.mjs',
	'scripts/ci/post_merge_reviewer_audit.mjs',
];

function readWorkflow(relativePath, root = process.cwd()) {
	return fs.readFileSync(path.join(root, WORKFLOW_DIR, relativePath), 'utf8');
}

function extractWorkflowName(contents) {
	const match = contents.match(/^name:\s*(.+)$/m);
	return match ? match[1].trim() : '';
}

function extractJobIds(contents) {
	const jobsMatch = contents.match(/^jobs:\s*$/m);
	if (!jobsMatch) return [];

	const jobsSection = contents.slice(jobsMatch.index);
	const ids = [];
	for (const match of jobsSection.matchAll(/^  ([A-Za-z0-9_-]+):\s*$/gm)) {
		ids.push(match[1]);
	}
	return ids;
}

export function validatePostMergeValidationSurface(options = {}) {
	const root = options.root ?? process.cwd();
	const errors = [];

	for (const entry of POST_MERGE_VALIDATION_WORKFLOWS) {
		const workflowPath = path.join(root, WORKFLOW_DIR, entry.file);
		if (!fs.existsSync(workflowPath)) {
			errors.push(`Missing post-merge workflow: ${entry.file}`);
			continue;
		}

		const contents = fs.readFileSync(workflowPath, 'utf8');
		const workflowName = extractWorkflowName(contents);
		const jobIds = extractJobIds(contents);

		if (workflowName !== entry.workflowName) {
			errors.push(`${entry.file} workflow name must be "${entry.workflowName}" (found "${workflowName}")`);
		}

		for (const jobId of entry.jobIds) {
			if (!jobIds.includes(jobId)) {
				errors.push(`${entry.file} must define job id "${jobId}"`);
			}
		}
	}

	for (const scriptPath of POST_MERGE_VALIDATION_SCRIPTS) {
		if (!fs.existsSync(path.join(root, scriptPath))) {
			errors.push(`Missing post-merge validation script: ${scriptPath}`);
		}
	}

	const closeoutPath = path.join(root, WORKFLOW_DIR, 'post-merge-closeout.yml');
	if (fs.existsSync(closeoutPath)) {
		const closeoutContents = readWorkflow('post-merge-closeout.yml', root);
		if (!closeoutContents.includes('run_post_merge_closeout.mjs')) {
			errors.push('post-merge-closeout.yml must invoke run_post_merge_closeout.mjs');
		}
		if (closeoutContents.includes('sync-pr-state.mjs')) {
			errors.push('post-merge-closeout.yml must not invoke sync-pr-state.mjs directly; use run_post_merge_closeout.mjs');
		}
	}

	const remediationPath = path.join(root, WORKFLOW_DIR, 'post-merge-remediation.yml');
	if (fs.existsSync(remediationPath)) {
		const remediationContents = readWorkflow('post-merge-remediation.yml', root);
		if (!remediationContents.includes('post_merge_remediation_issue.mjs')) {
			errors.push('post-merge-remediation.yml must invoke post_merge_remediation_issue.mjs');
		}
		if (!/workflow_run\.conclusion\s*==\s*'failure'/.test(remediationContents)) {
			errors.push('post-merge-remediation.yml must run only when Post-Merge Detection fails');
		}
	}

	return {
		ok: errors.length === 0,
		errors,
		workflows: POST_MERGE_VALIDATION_WORKFLOWS,
		scripts: POST_MERGE_VALIDATION_SCRIPTS,
	};
}

export function renderPostMergeValidationChecklist() {
	const lines = [
		'## LGFC Post-Merge Validation Surface',
		'',
		'Post-merge validation reports evidence from merged code and PR metadata.',
		'Failures create remediation issues and pause orchestration advancement.',
		'',
		'Workflows:',
	];

	for (const entry of POST_MERGE_VALIDATION_WORKFLOWS) {
		lines.push(`- \`${entry.file}\` (${entry.workflowName})`);
	}

	lines.push('', 'Core scripts:');
	for (const scriptPath of POST_MERGE_VALIDATION_SCRIPTS) {
		lines.push(`- \`${scriptPath}\``);
	}

	return lines.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const result = validatePostMergeValidationSurface();
	if (!result.ok) {
		for (const error of result.errors) {
			console.error(`ERROR: ${error}`);
		}
		process.exit(1);
	}

	console.log('OK: post-merge validation surface validated.');
	console.log('');
	console.log(renderPostMergeValidationChecklist());
}
