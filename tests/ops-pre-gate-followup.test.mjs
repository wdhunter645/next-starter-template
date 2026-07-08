import { describe, expect, it } from 'vitest';

import { classifyWorkflowRun } from '../scripts/ci/post_merge_validator.mjs';
import {
	remediationBody,
	shouldUpsertRemediationIssue,
} from '../scripts/ci/post_merge_remediation_issue.mjs';

describe('post-merge failed pre-gate follow-up issue evidence', () => {
	it('creates remediation issue evidence even when a failed workflow is required', () => {
		const result = {
			status: 'pass',
			pr: 2373,
			merge_sha: 'abc123',
			source_issue: 2376,
			workflow_failures: [
				classifyWorkflowRun({
					workflowName: 'ZIP History Audit (Full History)',
					conclusion: 'failure',
					databaseId: 28957717158,
					html_url: 'https://github.test/actions/runs/28957717158',
					failedJobs: [{
						id: 12345,
						name: 'audit',
						url: 'https://github.test/actions/runs/28957717158/job/12345',
						steps: [{ name: 'Scan full git history for ZIPs', conclusion: 'failure' }],
					}],
				}),
			],
		};

		expect(shouldUpsertRemediationIssue(result)).toBe(true);
		const body = remediationBody(result);
		expect(body).toContain('ZIP History Audit (Full History)');
		expect(body).toContain('required / blocking future PRs');
		expect(body).toContain('run 28957717158');
		expect(body).toContain('Job 12345: audit');
		expect(body).toContain('Step: Scan full git history for ZIPs (failure)');
	});
});
