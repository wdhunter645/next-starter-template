import { describe, expect, it } from 'vitest';

import {
	buildResult,
	commentBody,
	isRequiredMergeProtectionRun,
	latestRunsByWorkflow,
	metadataFailures,
	renderPostMergeReport,
	resolvePrNumber,
	reviewerFindings,
	workflowFailures,
} from '../scripts/ci/post_merge_validator.mjs';
import { remediationBody, remediationTitle } from '../scripts/ci/post_merge_remediation_issue.mjs';

const baseBody = [
	'- **Issue:** #1122',
	'',
	'## CHANGE SUMMARY',
	'- Implemented change.',
	'',
	'## BUILD / TEST / VERIFICATION',
	'- PASS',
	'',
	'## ACCEPTANCE CRITERIA',
	'- Required checks pass.',
	'',
	'## REQUIRED PRE-REVIEW SELF-CHECK',
	'- Complete.',
].join('\n');

function mergedPr(overrides = {}) {
	return {
		body: baseBody,
		files: [{ path: 'package.json' }],
		isDraft: false,
		mergedAt: '2026-06-02T17:21:10Z',
		baseRefName: 'main',
		mergeCommit: { oid: 'abc123' },
		url: 'https://github.test/pull/1',
		...overrides,
	};
}

describe('post-merge PR resolution', () => {
	it('resolves a merged PR from associated commit pulls', () => {
		const result = resolvePrNumber({
			eventName: 'push',
			associatedPulls: [{ number: 1188, state: 'closed', merged_at: '2026-06-02T17:21:10Z', base: { ref: 'main' } }],
		});

		expect(result).toEqual({ pr: '1188', method: 'commit-pulls-api', skip_reason: 'none' });
	});

	it('skips when no merged PR is associated with the commit', () => {
		const result = resolvePrNumber({ eventName: 'push', associatedPulls: [] });

		expect(result).toMatchObject({ pr: '', skip_reason: 'no merged PR associated with commit' });
		expect(buildResult({ resolution: result, mergeSha: 'abc123' })).toMatchObject({
			status: 'skipped',
			remediation_required: false,
		});
	});
});

describe('post-merge metadata validation', () => {
	it('passes metadata checks for a merged PR with source issue and required sections', () => {
		expect(metadataFailures(mergedPr(), (file) => file === 'package.json')).toEqual([]);
	});

	it('fails metadata checks when issue linkage is missing', () => {
		const failures = metadataFailures(mergedPr({ body: baseBody.replace('- **Issue:** #1122\n\n', '') }), () => true);

		expect(failures).toContainEqual(expect.objectContaining({ code: 'missing_source_issue' }));
		expect(
			buildResult({
				pr: mergedPr({ body: baseBody.replace('- **Issue:** #1122\n\n', '') }),
				resolution: { pr: '1188' },
				metadata: failures,
			}),
		).toMatchObject({ status: 'fail', remediation_required: true, sync_action: 'post_merge_failure' });
	});

	it('treats missing advisory sections as remediation without failing closeout validation', () => {
		const bodyWithoutAdvisory = baseBody.replace('\n\n## REQUIRED PRE-REVIEW SELF-CHECK\n- Complete.', '');
		const failures = metadataFailures(mergedPr({ body: bodyWithoutAdvisory }), () => true);
		const result = buildResult({ pr: mergedPr({ body: bodyWithoutAdvisory }), resolution: { pr: '1188' }, metadata: failures });

		expect(failures).toContainEqual(expect.objectContaining({ code: 'missing_advisory_section', severity: 'advisory' }));
		expect(result).toMatchObject({ status: 'pass', remediation_required: true, sync_action: 'post_merge_remediation' });
	});
});

describe('post-merge reviewer audit classification', () => {
	it('fails when a trusted reviewer posts a late high-severity finding', () => {
		const findings = reviewerFindings({
			pr: mergedPr(),
			issueComments: [
				{
					created_at: '2026-06-02T17:25:00Z',
					body: 'P1 blocking: must fix this regression.',
					html_url: 'https://github.test/comment/1',
					user: { login: 'gemini-code-assist' },
				},
			],
		});

		const result = buildResult({ pr: mergedPr(), resolution: { pr: '1188' }, findings });

		expect(findings).toHaveLength(1);
		expect(result).toMatchObject({ status: 'fail', late_findings: 1, remediation_required: true, sync_action: 'post_merge_failure' });
	});
});

describe('post-merge workflow failure classification', () => {
	it('ignores stale workflow failures when a newer run for the workflow passed', () => {
		const latest = latestRunsByWorkflow([
			{ workflowName: 'GATE - Quality Checks', status: 'completed', conclusion: 'failure', created_at: '2026-06-02T10:00:00Z' },
			{ workflowName: 'GATE - Quality Checks', status: 'completed', conclusion: 'success', created_at: '2026-06-02T10:05:00Z' },
		]);

		expect(workflowFailures({ prBody: baseBody, runs: latest })).toEqual([]);
	});

	it('fails the original PR when a required workflow fails', () => {
		const failures = workflowFailures({
			prBody: baseBody,
			runs: [
				{
					workflowName: 'GATE - Quality Checks',
					status: 'completed',
					conclusion: 'failure',
					databaseId: 1,
					url: 'https://github.test/actions/1',
				},
			],
		});

		const result = buildResult({ pr: mergedPr(), resolution: { pr: '1188' }, failures });

		expect(failures[0]).toMatchObject({ required: true, classification: 'required-workflow-failure' });
		expect(result).toMatchObject({ status: 'fail', remediation_required: true, sync_action: 'post_merge_failure' });
	});

	it('requires remediation but does not fail the original PR for optional docs sync failure', () => {
		const failures = workflowFailures({
			prBody: baseBody,
			runs: [
				{
					workflowName: 'Auto-Sync Documentation',
					status: 'completed',
					conclusion: 'failure',
					databaseId: 2,
					url: 'https://github.test/actions/2',
					failureText: 'COPILOT_GITHUB_TOKEN secret is unavailable to this workflow run.',
				},
			],
		});

		const result = buildResult({ pr: mergedPr(), resolution: { pr: '1188' }, failures });

		expect(failures[0]).toMatchObject({ required: false, classification: 'secret-access/configuration' });
		expect(result).toMatchObject({ status: 'pass', remediation_required: true, sync_action: 'post_merge_remediation' });
	});
});

describe('post-merge structured output and remediation body', () => {
	it('emits structured result fields and a remediation issue body', () => {
		const result = buildResult({
			pr: mergedPr(),
			resolution: { pr: '1188' },
			failures: [
				{
					workflow: 'Auto-Sync Documentation',
					classification: 'secret-access/configuration',
					required: false,
					url: 'https://github.test/actions/2',
					conclusion: 'failure',
				},
			],
			mergeSha: 'abc123',
		});

		expect(result).toMatchObject({
			status: 'pass',
			pr: 1188,
			merge_sha: 'abc123',
			source_issue: '1122',
			late_findings: 0,
			remediation_required: true,
			evidence_summary: expect.objectContaining({
				workflow_failures: 1,
			}),
			sync_action: 'post_merge_remediation',
		});
		expect(commentBody(result)).toContain('## Workflow failures');
		expect(renderPostMergeReport(result)).toContain('Implementation evidence failures: 0');
		expect(remediationTitle(result)).toBe('Post-merge remediation required for PR #1188');
		expect(remediationBody(result)).toContain('Auto-Sync Documentation');
	});

	it('fails when merged implementation evidence is incomplete', () => {
		const implementation = [{
			code: 'allowlist_violation',
			message: 'Merged changed file is outside declared allowlist: src/app/page.tsx',
		}];

		const result = buildResult({
			pr: mergedPr(),
			resolution: { pr: '1188' },
			implementation,
		});

		expect(result).toMatchObject({
			status: 'fail',
			implementation_failures: implementation,
			sync_action: 'post_merge_failure',
		});
	});

	it('skips remediation issue creation when validation passed', () => {
		const result = buildResult({
			pr: mergedPr(),
			resolution: { pr: '1188' },
			failures: [{
				workflow: 'Auto-Sync Documentation',
				classification: 'secret-access/configuration',
				required: false,
				url: 'https://github.test/actions/2',
				conclusion: 'failure',
			}],
		});

		expect(result.status).toBe('pass');
		expect(result.remediation_required).toBe(true);
	});
});

describe('post-merge merge-protection workflow classification', () => {
	it('treats consolidated merge-protection jobs as required', () => {
		expect(isRequiredMergeProtectionRun({ name: 'quality' })).toBe(true);
		expect(isRequiredMergeProtectionRun({ name: 'GATE — Quality Checks' })).toBe(true);
		expect(isRequiredMergeProtectionRun({ name: 'Auto-Sync Documentation' })).toBe(false);
	});
});
