import { describe, expect, it } from 'vitest';

import {
	buildResult,
	commentBody,
	isPermittedClosedSourceIssueFollowup,
	isRequiredMergeProtectionRun,
	latestRunsByWorkflow,
	metadataFailures,
	preMergeReadinessBodyFailures,
	preMergeReviewerDispositionFailures,
	renderPostMergeReport,
	resolvePrNumber,
	reviewerFindings,
	sourceIssueAccounting,
	stripAutoRepairBlock,
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


	it('shares pre-merge body contract checks with the readiness gate', () => {
		const failures = preMergeReadinessBodyFailures(baseBody.replace('## CHANGE SUMMARY', '## SUMMARY'));

		expect(failures).toContainEqual(expect.objectContaining({
			code: 'missing_required_section',
			message: expect.stringContaining('## CHANGE SUMMARY'),
		}));
	});

	it('shares blocked closeout declaration checks with the readiness gate', () => {
		const failures = preMergeReadinessBodyFailures(`${baseBody}\n\n- Status: BLOCKED`);

		expect(failures).toContainEqual(expect.objectContaining({
			code: 'closeout_blocker_declared',
			message: 'PR body declares an exception state; deterministic source issue closeout would not be safe.',
		}));
	});

	it('emits one closeout blocker failure for merged blocked-status bodies', () => {
		const failures = metadataFailures(mergedPr({
			body: `${baseBody}\n\n- Status: BLOCKED`,
		}), () => true);

		const closeoutBlockerFailures = failures.filter((failure) => failure.code === 'closeout_blocker_declared');
		expect(closeoutBlockerFailures).toHaveLength(1);
		expect(closeoutBlockerFailures[0]).toMatchObject({
			message: 'PR body declares an exception state; deterministic source issue closeout would not be safe.',
		});
	});

	it('ignores generated CI auto-repair scaffolds in the shared body contract', () => {
		const body = [
			baseBody,
			'',
			'<!-- pr-body-auto-repair:start -->',
			'## PROGRESS + READINESS (MANDATORY)',
			'- Status: BLOCKED',
			'- Blocking Issues: auto-repair evidence requires agent verification before READY FOR REVIEW',
			'- review-comment:3427000000 — acknowledged — auto-generated disposition pending agent completion; agent must replace with final fix/rationale before READY FOR REVIEW — thread state: unresolved-with-rationale',
			'<!-- pr-body-auto-repair:end -->',
		].join('\n');

		expect(preMergeReadinessBodyFailures(body)).not.toContainEqual(expect.objectContaining({
			code: 'unresolved_auto_repair_scaffold',
		}));
	});

	it('fails pending agent-completion text outside generated CI auto-repair blocks', () => {
		const body = [
			baseBody,
			'',
			'- Status: BLOCKED',
			'- review-comment:3427000000 — acknowledged — auto-generated disposition pending agent completion; agent must replace with final fix/rationale before READY FOR REVIEW — thread state: unresolved',
		].join('\n');

		expect(preMergeReadinessBodyFailures(body)).toContainEqual(expect.objectContaining({
			code: 'unresolved_auto_repair_scaffold',
		}));
	});

	it('ignores forbidden placeholder tokens inside the CI auto-repair evidence block', () => {
		const body = [
			baseBody,
			'',
			'<!-- pr-body-auto-repair:start -->',
			'- auto-repair placeholder — agent must replace with exact change summary',
			'<!-- pr-body-auto-repair:end -->',
		].join('\n');

		expect(stripAutoRepairBlock(body)).not.toMatch(/auto-repair:start/);
		expect(preMergeReadinessBodyFailures(body)).not.toContainEqual(expect.objectContaining({
			code: 'forbidden_placeholder_token',
		}));
	});

	it('exports pre-merge reviewer disposition checks for the readiness gate', () => {
		const failures = preMergeReviewerDispositionFailures({
			body: baseBody,
			issueComments: [{
				id: 303,
				user: { login: 'gemini-code-assist' },
				body: 'P1 blocking: required governance section is missing.',
				created_at: '2026-06-11T10:00:00Z',
			}],
			headSha: 'abc123',
			readyForReviewAt: '2026-06-11T12:00:00Z',
		});

		expect(failures).toContainEqual(expect.objectContaining({
			code: 'undispositioned_reviewer_comment',
			commentId: '303',
		}));
	});

	it('does not require removed files to exist in the merge checkout', () => {
		const failures = metadataFailures(
			mergedPr({
				files: [
					{ filename: 'scripts/ci/merge_protection_surface.mjs', status: 'added' },
					{ filename: '.github/workflows/gate-zip-safety.yml', status: 'removed' },
				],
			}),
			(file) => file !== '.github/workflows/gate-zip-safety.yml',
		);

		expect(failures).toEqual([]);
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

	it('does not treat external issue URLs as same-repository source issues in build results', () => {
		const externalBody = baseBody.replace('#1122', 'https://github.com/other/repo/issues/1122');
		const result = buildResult({
			pr: mergedPr({ body: externalBody }),
			resolution: { pr: '1188' },
			repository: 'owner/repo',
		});

		expect(result.source_issue).toBeNull();
		expect(result.source_issue_candidates).toEqual(['https://github.com/other/repo/issues/1122']);
	});

	it('uses GITHUB_REPOSITORY as source issue accounting repository context fallback', () => {
		const previousRepository = process.env.GITHUB_REPOSITORY;
		process.env.GITHUB_REPOSITORY = 'owner/repo';
		try {
			expect(sourceIssueAccounting('- **Issue:** https://github.com/owner/repo/issues/1122').issueNumber).toBe('1122');
			expect(sourceIssueAccounting('- **Issue:** https://github.com/other/repo/issues/1122').issueNumber).toBe('');
		} finally {
			if (previousRepository === undefined) {
				delete process.env.GITHUB_REPOSITORY;
			} else {
				process.env.GITHUB_REPOSITORY = previousRepository;
			}
		}
	});

	it('treats missing advisory sections as remediation without failing closeout validation', () => {
		const bodyWithoutAdvisory = baseBody.replace('\n\n## REQUIRED PRE-REVIEW SELF-CHECK\n- Complete.', '');
		const failures = metadataFailures(mergedPr({ body: bodyWithoutAdvisory }), () => true);
		const result = buildResult({ pr: mergedPr({ body: bodyWithoutAdvisory }), resolution: { pr: '1188' }, metadata: failures });

		expect(failures).toContainEqual(expect.objectContaining({ code: 'missing_advisory_section', severity: 'advisory' }));
		expect(result).toMatchObject({ status: 'pass', remediation_required: false, sync_action: 'post_merge_success' });
	});

	it('treats optional-remediation-failure workflow noise as non-blocking success', () => {
		const failures = [
			{
				workflow: 'GATE — Reviewer Response Completion',
				classification: 'optional-remediation-failure',
				required: false,
				conclusion: 'cancelled',
			},
			{
				workflow: 'Post-Merge Remediation',
				classification: 'optional-remediation-failure',
				required: false,
				conclusion: 'failure',
			},
		];

		const result = buildResult({ pr: mergedPr(), resolution: { pr: '1239' }, failures });

		expect(result).toMatchObject({
			status: 'pass',
			remediation_required: false,
			sync_action: 'post_merge_success',
		});
		expect(result.workflow_failures).toHaveLength(2);
	});

	it('allows already-closed completed source issues only for remediation follow-up closeout', () => {
		const followupBody = `${baseBody}\n\nRemediation follow-up for PR #1412.`;
		const closedCompletedIssue = {
			state: 'closed',
			state_reason: 'completed',
			labels: [{ name: 'status:post-merge-verify' }, { name: 'post-merge-failure' }],
		};

		expect(isPermittedClosedSourceIssueFollowup({ body: followupBody, sourceIssue: closedCompletedIssue })).toBe(true);
		expect(
			metadataFailures(
				mergedPr({ body: followupBody }),
				() => true,
				{ sourceIssue: closedCompletedIssue, repoLabels: [{ name: 'status:complete' }] },
			),
		).toEqual([]);
		expect(
			metadataFailures(
				mergedPr(),
				() => true,
				{ sourceIssue: closedCompletedIssue, repoLabels: [{ name: 'status:complete' }] },
			),
		).toContainEqual(expect.objectContaining({ code: 'source_issue_not_open' }));
	});

	it('refuses closeout when the source issue is the active alternate Program 2 lane', () => {
		const failures = metadataFailures(mergedPr({ body: baseBody.replace('#1122', '#1255') }), () => true);

		expect(failures).toContainEqual(expect.objectContaining({ code: 'active_alternate_program_lane' }));
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
		expect(result).toMatchObject({ status: 'pass', remediation_required: false, sync_action: 'post_merge_success' });
	});
});

describe('post-merge structured output and remediation body', () => {
	it('emits structured result fields and a remediation issue body', () => {
		const result = buildResult({
			pr: mergedPr(),
			resolution: { pr: '1188' },
			failures: [
				{
					workflow: 'GATE — Quality Checks',
					classification: 'required-workflow-failure',
					required: true,
					url: 'https://github.test/actions/2',
					conclusion: 'failure',
				},
			],
			mergeSha: 'abc123',
		});

		expect(result).toMatchObject({
			status: 'fail',
			pr: 1188,
			merge_sha: 'abc123',
			source_issue: '1122',
			late_findings: 0,
			remediation_required: true,
			evidence_summary: expect.objectContaining({
				workflow_failures: 1,
			}),
			sync_action: 'post_merge_failure',
		});
		expect(commentBody(result)).toContain('## Workflow failures');
		expect(renderPostMergeReport(result)).toContain('Implementation evidence failures: 0');
		expect(remediationTitle(result)).toBe('Post-merge closeout exception for PR #1188 / source #1122 / workflow_failure');
		expect(remediationBody(result)).toContain('Required Atlas/Bill decision');
		expect(remediationBody(result)).toContain('GATE — Quality Checks');
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
		expect(result.remediation_required).toBe(false);
	});
});

describe('post-merge merge-protection workflow classification', () => {
	it('treats consolidated merge-protection jobs as required', () => {
		expect(isRequiredMergeProtectionRun({ name: 'quality' })).toBe(true);
		expect(isRequiredMergeProtectionRun({ name: 'GATE — Quality Checks' })).toBe(true);
		expect(isRequiredMergeProtectionRun({ name: 'Auto-Sync Documentation' })).toBe(false);
	});
});
