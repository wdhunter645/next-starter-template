import { describe, expect, it } from 'vitest';

import {
	classifyFinding,
	FINDING_TYPES,
	SAFETY_CATEGORIES,
} from '../scripts/ci/post_merge_self_heal_classify.mjs';
import {
	buildDetectionReport,
	detectDuplicateRemediationIssues,
	detectEmptyCleanState,
	detectPostMergeFindings,
	detectStaleManifestEntries,
	RECOMMENDED_ACTIONS,
} from '../scripts/ci/post_merge_self_heal_detect.mjs';

describe('post-merge self-healing classifier', () => {
	it('classifies stale manifest entry as safe_auto_fix', () => {
		const result = classifyFinding({
			kind: FINDING_TYPES.STALE_MANIFEST_ENTRY,
			message: 'Manifest row remains after proven pass.',
		});

		expect(result.classification).toBe(SAFETY_CATEGORIES.SAFE_AUTO_FIX);
	});

	it('classifies missing reviewer disposition as cursor_remediation_required', () => {
		const result = classifyFinding({
			code: 'missing_reviewer_disposition',
			message: 'Trusted reviewer comment lacks PR-body disposition.',
		});

		expect(result.classification).toBe(SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED);
	});

	it('classifies active alternate program lane as operator_authorization_required', () => {
		const result = classifyFinding({
			code: 'active_alternate_program_lane',
			message: 'Program lane mutation requires operator authority.',
		});

		expect(result.classification).toBe(SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED);
	});

	it('classifies intentionally deferred findings without auto-fix', () => {
		const result = classifyFinding({
			kind: FINDING_TYPES.INTENTIONALLY_DEFERRED,
			deferred: true,
			message: 'Backlog item explicitly deferred.',
		});

		expect(result.classification).toBe(SAFETY_CATEGORIES.INTENTIONALLY_DEFERRED);
	});
});

describe('post-merge self-healing detector', () => {
	it('returns no_action when all manifests are empty and no exceptions exist', () => {
		const report = buildDetectionReport({
			manifests: [
				{ manifest_path: 'targets-ci-pending.json', targets: [] },
				{ manifest_path: 'targets-ci-pending-rerun.json', targets: [] },
			],
			closeoutReports: [{ status: 'success', results: [] }],
			exceptionIssues: [],
		});

		expect(report.status).toBe('success');
		expect(report.findings).toHaveLength(1);
		expect(report.findings[0].classification).toBe(SAFETY_CATEGORIES.NO_ACTION);
	});

	it('detects stale manifest entries after proven pass', () => {
		const findings = detectStaleManifestEntries({
			manifests: [{
				manifest_path: 'targets-remediation-backlog.json',
				targets: [{ pr: 1860, source_issue: 1848, body_file: 'pr-1860-body.md' }],
			}],
			closeoutReports: [{
				status: 'success',
				results: [{ pr: 1860, status: 'pass', sync_action: 'post_merge_success' }],
			}],
		});

		expect(findings).toHaveLength(1);
		expect(findings[0]).toMatchObject({
			kind: FINDING_TYPES.STALE_MANIFEST_ENTRY,
			recommended_action: RECOMMENDED_ACTIONS.PRUNE_MANIFEST_ENTRY,
		});
	});

	it('detects duplicate remediation issues', () => {
		const findings = detectDuplicateRemediationIssues({
			issues: [
				{ number: 1863, state: 'open', linked_pr: 1860, linked_source_issue: 1848, canonical: true },
				{ number: 1871, state: 'open', linked_pr: 1860, linked_source_issue: 1848 },
			],
		});

		expect(findings).toHaveLength(1);
		expect(findings[0].issue_number).toBe(1871);
	});

	it('classifies ambiguous closeout metadata failures for cursor remediation', () => {
		const report = detectPostMergeFindings({
			manifests: [{ manifest_path: 'targets-remediation-backlog.json', targets: [{ pr: 1860, source_issue: 1848 }] }],
			closeoutReports: [{
				status: 'partial_failure',
				results: [{
					pr: 1860,
					status: 'fail',
					source_issue: 1848,
					metadata_failures: [{
						code: 'closeout_blocker_declared',
						message: 'PR body contains Status: BLOCKED scaffold.',
					}],
				}],
			}],
		});

		expect(report.status).toBe('findings');
		expect(report.findings.some((finding) => finding.classification === SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED)).toBe(true);
	});

	it('returns partial_failure when report ingestion errors occur', () => {
		const report = detectPostMergeFindings({
			manifests: [],
			closeoutReports: [],
			errors: ['Missing JSON file: /tmp/missing-report.json'],
		});

		expect(report.status).toBe('partial_failure');
		expect(report.errors).toHaveLength(1);
	});

	it('does not emit clean-state finding when exception issues remain open', () => {
		const findings = detectEmptyCleanState({
			manifests: [{ manifest_path: 'targets-ci-pending.json', targets: [] }],
			closeoutReports: [],
			exceptionIssues: [{ number: 1863, state: 'open' }],
		});

		expect(findings).toEqual([]);
	});
});
