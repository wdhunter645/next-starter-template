import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import {
	BATCH_CLOSEOUT_REPORT_PATH,
	buildBatchCloseoutReport,
	buildFailureReason,
	loadCloseoutTargets,
	runBatchPostMergeCloseout,
	summarizeTargetResult,
	writeBatchCloseoutReport,
} from '../scripts/ci/run_batch_post_merge_closeout.mjs';
import { implementationEvidenceFailures } from '../scripts/ci/post_merge_implementation_evidence.mjs';

const tempFiles = [];

afterEach(() => {
	for (const file of tempFiles) {
		try {
			fs.unlinkSync(file);
		} catch {
			// ignore cleanup errors
		}
	}
	if (fs.existsSync(BATCH_CLOSEOUT_REPORT_PATH)) {
		fs.unlinkSync(BATCH_CLOSEOUT_REPORT_PATH);
	}
	if (fs.existsSync('post-merge-result.json')) {
		fs.unlinkSync('post-merge-result.json');
	}
});

describe('batch post-merge closeout reporting', () => {
	it('records missing body file failures without aborting other targets', async () => {
		const runPostMergeCloseoutFn = vi.fn(async () => ({
			status: 'pass',
			sync_action: 'post_merge_success',
			source_issue: '1116',
			remediation_required: false,
		}));

		const report = await runBatchPostMergeCloseout({
			token: 'token',
			repository: 'org/repo',
			targets: [
				{ pr: 1239, body_file: 'scripts/ci/post-merge-closeout/does-not-exist.md' },
				{ pr: 1243, body_file: 'scripts/ci/post-merge-closeout/pr-1243-body.md' },
			],
			runPostMergeCloseoutFn,
			closeDuplicateRemediationIssuesFn: async () => ({ closed: [] }),
		});

		expect(runPostMergeCloseoutFn).toHaveBeenCalledTimes(1);
		expect(report.results).toHaveLength(2);
		expect(report.results[0]).toMatchObject({
			pr: '1239',
			status: 'error',
			phase: 'preflight',
			failure_reason: expect.stringContaining('Closeout body file not found'),
		});
		expect(report.results[1]).toMatchObject({ pr: '1243', status: 'pass' });
		expect(report.status).toBe('partial_failure');
	});

	it('records per-target validation failures with diagnostic detail', async () => {
		fs.writeFileSync(
			'post-merge-result.json',
			`${JSON.stringify({
				status: 'fail',
				metadata_failures: [],
				implementation_failures: [{ code: 'verification_not_pass', message: 'PENDING' }],
				diataxis_failures: [],
				reviewer_findings: [],
				workflow_failures: [],
			})}\n`,
		);

		const entry = summarizeTargetResult({
			prNumber: '1239',
			result: {
				status: 'fail',
				sync_action: 'post_merge_failure',
				source_issue: '1196',
				remediation_required: true,
			},
			detail: JSON.parse(fs.readFileSync('post-merge-result.json', 'utf8')),
		});

		expect(entry).toMatchObject({
			pr: '1239',
			status: 'fail',
			phase: 'validation',
			failure_reason: 'implementation:verification_not_pass',
		});
		expect(buildFailureReason(entry)).toBe('implementation:verification_not_pass');
	});

	it('records workflow failure reasons with workflow names', () => {
		expect(
			buildFailureReason({
				status: 'fail',
				workflow_failures: [
					{
						workflow: 'Docs Guardrails',
						classification: 'optional-remediation-failure',
						required: false,
					},
				],
			}),
		).toBe('workflow:Docs Guardrails');
	});

	it('writes batch report on setup failure', () => {
		const report = buildBatchCloseoutReport({
			error: new Error('GITHUB_REPOSITORY is required.'),
			failedPhase: 'setup',
		});
		writeBatchCloseoutReport(report, BATCH_CLOSEOUT_REPORT_PATH);

		expect(fs.existsSync(BATCH_CLOSEOUT_REPORT_PATH)).toBe(true);
		expect(JSON.parse(fs.readFileSync(BATCH_CLOSEOUT_REPORT_PATH, 'utf8'))).toMatchObject({
			status: 'failure',
			failed_phase: 'setup',
			error: { phase: 'setup', message: 'GITHUB_REPOSITORY is required.' },
		});
	});

	it('supports dry-run without GitHub writes', async () => {
		const runPostMergeCloseoutFn = vi.fn();
		const closeDuplicateRemediationIssuesFn = vi.fn();

		const report = await runBatchPostMergeCloseout({
			token: 'token',
			repository: 'org/repo',
			targets: [{ pr: 1239, body_file: 'scripts/ci/post-merge-closeout/pr-1239-body.md' }],
			dryRun: true,
			runPostMergeCloseoutFn,
			closeDuplicateRemediationIssuesFn,
		});

		expect(runPostMergeCloseoutFn).not.toHaveBeenCalled();
		expect(closeDuplicateRemediationIssuesFn).not.toHaveBeenCalled();
		expect(report.results[0]).toMatchObject({ pr: '1239', status: 'dry_run', phase: 'dry_run' });
		expect(report.status).toBe('success');
	});

	it('loads manifest targets from targets.json', () => {
		const { targets } = loadCloseoutTargets('scripts/ci/post-merge-closeout/targets.json');
		expect(targets.map((target) => target.pr)).toEqual([1239, 1243]);
	});

	it('remediated PR 1239 body passes implementation evidence checks', () => {
		const body = fs.readFileSync('scripts/ci/post-merge-closeout/pr-1239-body.md', 'utf8');
		expect(implementationEvidenceFailures({ body, files: [] })).toEqual([]);
	});
});

describe('batch closeout manifest fixture', () => {
	it('writes diagnostic report to a temp path', () => {
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'batch-closeout-'));
		const manifestPath = path.join(tempDir, 'targets.json');
		tempFiles.push(manifestPath);
		fs.writeFileSync(
			manifestPath,
			`${JSON.stringify({ targets: [{ pr: 1, body_file: 'missing.md' }] })}\n`,
		);

		expect(() => loadCloseoutTargets(manifestPath)).not.toThrow();
	});
});
