import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import {
	emitCloseoutBacklogMetrics,
	fetchOpsEscalationIssueCounts,
	formatBacklogMetricsMarkdown,
	readBatchFailureCodeRollup,
} from '../scripts/ci/emit_closeout_backlog_metrics.mjs';
import { buildBatchCloseoutReport, rollupFailureCodesByCode } from '../scripts/ci/run_batch_post_merge_closeout.mjs';
import { mergeFailureCodeRollups } from '../scripts/ci/run_post_merge_closeout_all_manifests.mjs';

describe('emit_closeout_backlog_metrics', () => {
	it('formats backlog metrics and failure code rollup markdown', () => {
		const markdown = formatBacklogMetricsMarkdown({
			open: 12,
			closed: 34,
			byCode: {
				late_reviewer_finding: 2,
				rate_limit_queue: 1,
			},
		});

		expect(markdown).toContain('Open: 12');
		expect(markdown).toContain('Closed: 34');
		expect(markdown).toContain('late_reviewer_finding: 2');
		expect(markdown).toContain('rate_limit_queue: 1');
	});

	it('fetches ops-pr-escalation counts via GraphQL', async () => {
		const fetchFn = vi.fn(async () => ({
			ok: true,
			json: async () => ({
				data: {
					repository: {
						open: { totalCount: 5 },
						closed: { totalCount: 9 },
					},
				},
			}),
		}));

		await expect(
			fetchOpsEscalationIssueCounts({
				token: 'token',
				repository: 'owner/repo',
				fetchFn,
			}),
		).resolves.toEqual({ open: 5, closed: 9, total: 14 });
	});

	it('reads summary.by_code from the batch closeout report', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'closeout-metrics-'));
		const reportPath = path.join(dir, 'post-merge-batch-closeout.json');
		fs.writeFileSync(
			reportPath,
			`${JSON.stringify(buildBatchCloseoutReport({
				results: [{
					pr: '1',
					status: 'fail',
					metadata_failures: [{ code: 'source_issue_not_open' }],
				}],
			}), null, 2)}\n`,
		);

		expect(readBatchFailureCodeRollup(reportPath, dir)).toEqual({
			source_issue_not_open: 1,
		});

		fs.rmSync(dir, { recursive: true, force: true });
	});

	it('emits metrics to step summary output', async () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'closeout-metrics-emit-'));
		const reportPath = path.join(dir, 'post-merge-batch-closeout.json');
		fs.writeFileSync(
			reportPath,
			`${JSON.stringify({
				summary: { by_code: { workflow_failure: 1 } },
			}, null, 2)}\n`,
		);

		const summaries = [];
		const result = await emitCloseoutBacklogMetrics({
			token: 'token',
			repository: 'owner/repo',
			reportPath,
			workspace: dir,
			fetchFn: async () => ({
				ok: true,
				json: async () => ({
					data: { repository: { open: { totalCount: 1 }, closed: { totalCount: 2 } } },
				}),
			}),
			writeStepSummaryFn: (markdown) => summaries.push(markdown),
		});

		expect(result.open).toBe(1);
		expect(result.by_code).toEqual({ workflow_failure: 1 });
		expect(summaries[0]).toContain('workflow_failure: 1');

		fs.rmSync(dir, { recursive: true, force: true });
	});
});

describe('batch failure code rollup', () => {
	it('rolls up structured failure buckets into summary.by_code', () => {
		const byCode = rollupFailureCodesByCode([
			{
				pr: '1',
				status: 'fail',
				metadata_failures: [{ code: 'source_issue_not_open' }],
				reviewer_findings: [{ code: 'late_reviewer_finding' }],
			},
			{ pr: '2', status: 'queued', phase: 'rate_limit_rerun' },
		]);

		expect(byCode).toEqual({
			source_issue_not_open: 1,
			late_reviewer_finding: 1,
			rate_limit_queue: 1,
		});
	});

	it('merges by_code across aggregate manifest reports', () => {
		expect(mergeFailureCodeRollups([
			{ summary: { by_code: { late_reviewer_finding: 2 } } },
			{ summary: { by_code: { late_reviewer_finding: 1, workflow_failure: 1 } } },
		])).toEqual({
			late_reviewer_finding: 3,
			workflow_failure: 1,
		});
	});
});
