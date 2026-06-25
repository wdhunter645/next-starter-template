import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
	isPruneEligibleReportStatus,
	pruneCloseoutManifestContent,
	pruneCloseoutManifestFromReport,
	successfulCloseoutPrs,
} from '../scripts/ci/prune_closeout_manifest.mjs';

const tempDirs = [];

afterEach(() => {
	for (const dir of tempDirs) {
		try {
			fs.rmSync(dir, { recursive: true, force: true });
		} catch {
			// ignore cleanup errors
		}
	}
	tempDirs.length = 0;
});

describe('prune closeout manifest helpers', () => {
	it('treats success and partial_failure as prune-eligible report statuses', () => {
		expect(isPruneEligibleReportStatus('success')).toBe(true);
		expect(isPruneEligibleReportStatus('partial_failure')).toBe(true);
		expect(isPruneEligibleReportStatus('failure')).toBe(false);
		expect(isPruneEligibleReportStatus('error')).toBe(false);
	});

	it('identifies only post_merge_success PRs as prune-eligible', () => {
		const prs = successfulCloseoutPrs({
			results: [
				{ pr: 1, status: 'pass', sync_action: 'post_merge_success' },
				{ pr: 2, status: 'pass', sync_action: 'post_merge_remediation' },
				{ pr: 3, status: 'fail', sync_action: 'post_merge_failure' },
			],
		});

		expect([...prs]).toEqual(['1']);
	});

	it('prunes only successful targets from a partial_failure report', () => {
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prune-partial-'));
		tempDirs.push(tempDir);
		const manifestPath = path.join(tempDir, 'targets.json');
		fs.writeFileSync(
			manifestPath,
			`${JSON.stringify(
				{
					targets: [
						{ pr: 10, body_file: 'scripts/ci/post-merge-closeout/pr-10-body.md' },
						{ pr: 11, body_file: 'scripts/ci/post-merge-closeout/pr-11-body.md' },
					],
				},
				null,
				2,
			)}\n`,
		);

		const result = pruneCloseoutManifestFromReport({
			manifestPath,
			report: {
				status: 'partial_failure',
				results: [
					{ pr: '10', status: 'pass', sync_action: 'post_merge_success' },
					{ pr: '11', status: 'fail', sync_action: 'post_merge_failure' },
				],
			},
		});

		expect(result).toMatchObject({ pruned: 1, remaining: 1 });
		expect(JSON.parse(fs.readFileSync(manifestPath, 'utf8')).targets).toEqual([
			{ pr: 11, body_file: 'scripts/ci/post-merge-closeout/pr-11-body.md' },
		]);
	});

	it('skips pruning for full failure reports', () => {
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prune-failure-'));
		tempDirs.push(tempDir);
		const manifestPath = path.join(tempDir, 'targets.json');
		fs.writeFileSync(
			manifestPath,
			`${JSON.stringify({ targets: [{ pr: 1, body_file: 'scripts/ci/post-merge-closeout/pr-1-body.md' }] })}\n`,
		);

		const result = pruneCloseoutManifestFromReport({
			manifestPath,
			report: {
				status: 'failure',
				results: [{ pr: '1', status: 'fail', sync_action: 'post_merge_failure' }],
			},
		});

		expect(result).toMatchObject({
			skipped: 'report_not_prune_eligible',
			pruned: 0,
		});
		expect(JSON.parse(fs.readFileSync(manifestPath, 'utf8')).targets).toHaveLength(1);
	});

	it('keeps an empty manifest valid after pruning', () => {
		const result = pruneCloseoutManifestContent(
			`${JSON.stringify({ triggered_at: '2026-06-14T00:00:00Z', targets: [{ pr: 1 }] })}\n`,
			new Set(['1']),
		);

		expect(result.pruned).toBe(1);
		expect(JSON.parse(result.content)).toEqual({ triggered_at: '2026-06-14T00:00:00Z', targets: [] });
	});
});
