import { describe, expect, it } from 'vitest';

import {
	classifyFinding,
	classifyFindings,
	classifyReport,
	FINDING_TYPES,
	highestPriorityCategory,
	isCleanReport,
	isSafeAutoFixCategory,
	SAFETY_CATEGORIES,
	summarizeClassifications,
} from '../scripts/ci/post_merge_self_heal_classify.mjs';

describe('post-merge self-healing classifier', () => {
	it('classifies stale manifest entry as safe_auto_fix', () => {
		const result = classifyFinding({
			type: FINDING_TYPES.STALE_MANIFEST_ENTRY,
			message: 'PR #1502 already passed deterministic closeout but remains in manifest.',
			metadata: { pr: '1502', manifest: 'targets-ci-pending.json' },
		});

		expect(result).toMatchObject({
			type: FINDING_TYPES.STALE_MANIFEST_ENTRY,
			category: SAFETY_CATEGORIES.SAFE_AUTO_FIX,
			safe_auto_fix: true,
			requires_cursor_escalation: false,
			requires_operator_authorization: false,
		});
	});

	it('classifies duplicate remediation issue as safe_auto_fix', () => {
		const result = classifyFinding({
			code: 'duplicate_remediation_issue',
			message: 'Issue #1230 duplicates canonical remediation issue #1228.',
		});

		expect(result.category).toBe(SAFETY_CATEGORIES.SAFE_AUTO_FIX);
	});

	it('classifies missing reviewer disposition as cursor_escalation_required', () => {
		const result = classifyFinding({
			type: FINDING_TYPES.MISSING_REVIEWER_DISPOSITION,
			code: 'missing_reviewer_disposition',
			message: 'Trusted reviewer comment lacks PR-body disposition.',
		});

		expect(result.category).toBe(SAFETY_CATEGORIES.CURSOR_ESCALATION_REQUIRED);
		expect(result.safe_auto_fix).toBe(false);
	});

	it('classifies allowlist violation as cursor_escalation_required', () => {
		const result = classifyFinding({
			code: 'allowlist_violation',
			message: 'Changed file scripts/unlisted.mjs is outside the PR allowlist.',
		});

		expect(result.category).toBe(SAFETY_CATEGORIES.CURSOR_ESCALATION_REQUIRED);
	});

	it('classifies active alternate program lane as cursor_escalation_required', () => {
		const result = classifyFinding({
			code: 'active_alternate_program_lane',
			message: 'Source issue #1255 is an active alternate program lane; CI refused closeout mutation.',
		});

		expect(result.category).toBe(SAFETY_CATEGORIES.CURSOR_ESCALATION_REQUIRED);
		expect(isSafeAutoFixCategory(result.category)).toBe(false);
	});

	it('classifies Tranche A scope without authorization as cursor_escalation_required', () => {
		const result = classifyFinding({
			type: FINDING_TYPES.TRANCHE_A_SCOPE,
			source_issue: '1255',
			message: 'Tranche A source issue requires explicit authorization before mutation.',
		});

		expect(result.category).toBe(SAFETY_CATEGORIES.CURSOR_ESCALATION_REQUIRED);
		expect(isSafeAutoFixCategory(result.category)).toBe(false);
	});

	it('classifies program-lane issue mutation as operator_authorization_required', () => {
		const result = classifyFinding({
			type: FINDING_TYPES.PROGRAM_LANE_ISSUE_MUTATION,
			message: 'Closing active program-lane issue requires operator authorization.',
		});

		expect(result.category).toBe(SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED);
		expect(result.requires_operator_authorization).toBe(true);
	});

	it('classifies empty clean state as no_action', () => {
		expect(isCleanReport({
			status: 'pass',
			findings: [],
			manifests: [{ targets: [] }, { targets: [] }],
			remediation_issues: [],
		})).toBe(true);

		const report = classifyReport({
			status: 'success',
			findings: [],
			manifests: [{ targets: [] }],
			remediation_issues: [],
		});

		expect(report.category).toBe(SAFETY_CATEGORIES.NO_ACTION);
		expect(report.findings[0].type).toBe(FINDING_TYPES.CLEAN_STATE);
	});

	it('classifies unknown/unrecognized finding as unknown', () => {
		const result = classifyFinding({
			code: 'mystery_gate_failure',
			message: 'Unmapped failure reason from legacy detector.',
		});

		expect(result).toMatchObject({
			type: FINDING_TYPES.UNRECOGNIZED_FAILURE,
			category: SAFETY_CATEGORIES.UNKNOWN,
		});
	});

	it('classifies incomplete report payload as unknown', () => {
		const report = classifyReport(null);

		expect(report.category).toBe(SAFETY_CATEGORIES.UNKNOWN);
		expect(report.findings[0].type).toBe(FINDING_TYPES.INCOMPLETE_REPORT_PAYLOAD);
	});

	it('prioritizes unknown over escalation when summarizing mixed findings', () => {
		const classified = classifyFindings([
			{ type: FINDING_TYPES.STALE_MANIFEST_ENTRY },
			{ code: 'mystery_gate_failure' },
		]);

		expect(highestPriorityCategory(classified)).toBe(SAFETY_CATEGORIES.UNKNOWN);
		expect(summarizeClassifications(classified)).toMatchObject({
			safe_auto_fix: 1,
			unknown: 1,
		});
	});

	it('detects contradictory pass + remediation_required state as unknown', () => {
		const report = classifyReport({
			status: 'pass',
			remediation_required: true,
			findings: [],
		});

		expect(report.category).toBe(SAFETY_CATEGORIES.UNKNOWN);
		expect(report.findings.some((entry) => entry.type === FINDING_TYPES.CONTRADICTORY_REPO_STATE)).toBe(true);
	});
});
