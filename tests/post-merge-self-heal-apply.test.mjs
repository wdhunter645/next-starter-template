import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
	APPLY_ACTIONS,
	applyFromDetectionReport,
	applyManifestPruneAction,
	applySafeAutoFixActions,
	filterSafeAutoFixFindings,
	hasClosedSourceIssue,
	hasOpenRequiredBlocker,
	hasProvenCloseoutPass,
	planDuplicateIssueActions,
	planManifestPruneActions,
	planSafeAutoFixActions,
	planStaleIssueCloseoutCandidates,
	previewManifestPrune,
} from '../scripts/ci/post_merge_self_heal_apply.mjs';
import {
	FINDING_TYPES,
	SAFETY_CATEGORIES,
} from '../scripts/ci/post_merge_self_heal_classify.mjs';
import { RECOMMENDED_ACTIONS } from '../scripts/ci/post_merge_self_heal_detect.mjs';

function staleManifestFinding({ pr = 1860, manifest = 'targets-remediation-backlog.json' } = {}) {
	return {
		kind: FINDING_TYPES.STALE_MANIFEST_ENTRY,
		classification: SAFETY_CATEGORIES.SAFE_AUTO_FIX,
		pr_number: pr,
		manifest_path: manifest,
		recommended_action: RECOMMENDED_ACTIONS.PRUNE_MANIFEST_ENTRY,
	};
}

function reviewerFinding() {
	return {
		kind: FINDING_TYPES.MISSING_REVIEWER_DISPOSITION,
		classification: SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED,
		pr_number: 1860,
		source_issue: 1848,
		code: 'missing_reviewer_disposition',
		message: 'Trusted reviewer comment lacks PR-body disposition.',
	};
}

describe('post-merge self-healing apply planner', () => {
	it('filters only safe_auto_fix findings for mutation', () => {
		const safe = filterSafeAutoFixFindings([
			staleManifestFinding(),
			reviewerFinding(),
		]);

		expect(safe).toHaveLength(1);
		expect(safe[0].kind).toBe(FINDING_TYPES.STALE_MANIFEST_ENTRY);
	});

	it('plans manifest prune actions for stale manifest findings', () => {
		const actions = planManifestPruneActions(
			[staleManifestFinding()],
			{
				closeoutReports: [{
					status: 'success',
					results: [{ pr: 1860, status: 'pass', sync_action: 'post_merge_success' }],
				}],
			},
		);

		expect(actions).toHaveLength(1);
		expect(actions[0]).toMatchObject({
			action: APPLY_ACTIONS.PRUNE_MANIFEST,
			pr_number: 1860,
			applies_changes: true,
		});
	});

	it('plans duplicate issue closures as dry-run only', () => {
		const actions = planDuplicateIssueActions([
			{
				kind: FINDING_TYPES.DUPLICATE_REMEDIATION_ISSUE,
				classification: SAFETY_CATEGORIES.SAFE_AUTO_FIX,
				issue_number: 1871,
				evidence: [{ type: 'duplicate_issue', issue: 1871, canonical_issue: 1863 }],
			},
		]);

		expect(actions).toHaveLength(1);
		expect(actions[0]).toMatchObject({
			action: APPLY_ACTIONS.PLAN_DUPLICATE_CLOSURE,
			dry_run_only: true,
			applies_changes: false,
		});
	});

	it('marks stale issue closeout candidates dry-run when evidence is incomplete', () => {
		const actions = planStaleIssueCloseoutCandidates([
			{
				kind: FINDING_TYPES.STALE_EXCEPTION_ISSUE,
				classification: SAFETY_CATEGORIES.SAFE_AUTO_FIX,
				issue_number: 1900,
			},
		]);

		expect(actions).toHaveLength(1);
		expect(actions[0].eligible).toBe(false);
		expect(actions[0].dry_run_only).toBe(true);
	});

	it('marks stale issue closeout candidates eligible when evidence is complete', () => {
		const actions = planStaleIssueCloseoutCandidates([
			{
				kind: FINDING_TYPES.STALE_EXCEPTION_ISSUE,
				classification: SAFETY_CATEGORIES.SAFE_AUTO_FIX,
				issue_number: 1900,
				evidence: [{
					pr_passed_closeout: true,
					source_issue_state: 'closed',
					source_issue_state_reason: 'completed',
					open_blockers: [],
				}],
			},
		]);

		expect(actions[0].eligible).toBe(true);
		expect(actions[0].applies_changes).toBe(false);
	});

	it('skips unsafe reviewer findings without mutation', () => {
		const plan = planSafeAutoFixActions({
			findings: [staleManifestFinding(), reviewerFinding()],
		});

		expect(plan.safe_findings).toBe(1);
		expect(plan.skipped.some((entry) => entry.action === APPLY_ACTIONS.SKIPPED_UNSAFE)).toBe(true);
		expect(plan.actions.every((entry) => entry.action !== APPLY_ACTIONS.SKIPPED_UNSAFE)).toBe(true);
	});
});

describe('post-merge self-healing apply executor', () => {
	it('previews manifest pruning without writing files by default', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'self-heal-apply-'));
		const manifestPath = path.join(dir, 'targets.json');
		fs.writeFileSync(manifestPath, JSON.stringify({
			targets: [
				{ pr: 1860, source_issue: 1848 },
				{ pr: 1870, source_issue: 1850 },
			],
		}, null, 2));

		const preview = previewManifestPrune(
			fs.readFileSync(manifestPath, 'utf8'),
			new Set(['1860']),
		);

		expect(preview.pruned).toBe(1);
		expect(preview.remaining).toBe(1);
		expect(fs.readFileSync(manifestPath, 'utf8')).toContain('"pr": 1860');
	});

	it('applies manifest pruning when dryRun is false', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'self-heal-apply-'));
		const manifestPath = path.join(dir, 'targets.json');
		fs.writeFileSync(manifestPath, JSON.stringify({
			targets: [{ pr: 1860, source_issue: 1848 }],
		}, null, 2));

		const outcome = applyManifestPruneAction({
			action: APPLY_ACTIONS.PRUNE_MANIFEST,
			manifest_path: manifestPath,
			pr_number: 1860,
			successful_prs: ['1860'],
		}, { dryRun: false, rootDir: dir });

		expect(outcome.pruned).toBe(1);
		expect(JSON.parse(fs.readFileSync(manifestPath, 'utf8')).targets).toEqual([]);
	});

	it('returns dry_run outcome without writing manifest files', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'self-heal-apply-'));
		const manifestPath = path.join(dir, 'targets.json');
		fs.writeFileSync(manifestPath, JSON.stringify({
			targets: [{ pr: 1860, source_issue: 1848 }],
		}, null, 2));

		const outcome = applyFromDetectionReport({
			findings: [staleManifestFinding({ manifest: manifestPath })],
			closeoutReports: [{
				status: 'success',
				results: [{ pr: 1860, status: 'pass', sync_action: 'post_merge_success' }],
			}],
		}, { dryRun: true, rootDir: dir });

		expect(outcome.status).toBe('dry_run');
		expect(outcome.summary.manifest_prunes_planned).toBe(1);
		expect(outcome.summary.manifest_prunes_applied).toBe(0);
		expect(JSON.parse(fs.readFileSync(manifestPath, 'utf8')).targets).toHaveLength(1);
	});

	it('does not auto-fix unsafe reviewer disposition findings', () => {
		const outcome = applySafeAutoFixActions(
			planSafeAutoFixActions({ findings: [reviewerFinding()] }),
			{ dryRun: false },
		);

		expect(outcome.applied).toEqual([]);
		expect(outcome.summary.skipped_unsafe).toBe(1);
		expect(outcome.summary.safe_findings).toBe(0);
	});
});

describe('post-merge self-healing apply evidence helpers', () => {
	it('detects proven closeout pass evidence', () => {
		expect(hasProvenCloseoutPass({ pr_passed_closeout: true })).toBe(true);
		expect(hasProvenCloseoutPass({ closeout_status: 'pass' })).toBe(true);
		expect(hasProvenCloseoutPass({})).toBe(false);
	});

	it('detects closed source issue evidence', () => {
		expect(hasClosedSourceIssue({ source_issue_state: 'closed', source_issue_state_reason: 'completed' })).toBe(true);
		expect(hasClosedSourceIssue({ source_issue_state: 'open' })).toBe(false);
	});

	it('detects open required blockers', () => {
		expect(hasOpenRequiredBlocker({ open_required_blocker: true })).toBe(true);
		expect(hasOpenRequiredBlocker({ open_blockers: ['workflow_failure'] })).toBe(true);
		expect(hasOpenRequiredBlocker({})).toBe(false);
	});
});
