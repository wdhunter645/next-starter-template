import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
	collectCloseoutReportPrStatus,
	detectFromEvidenceBundle,
	detectPendingManifestTargets,
} from '../scripts/ci/post_merge_self_heal_detect.mjs';
import { SAFETY_CATEGORIES } from '../scripts/ci/post_merge_self_heal_classify.mjs';
import {
	normalizeCloseoutReport,
	remediationIssueToMetadata,
} from '../scripts/ci/post_merge_self_heal_collect_evidence.mjs';
import {
	buildOperatorSummary,
	ACTIVATION_MODEL,
} from '../scripts/ci/post_merge_self_heal_operator_summary.mjs';
import {
	escalateFromDetectionReport,
	filterEscalationFindings,
} from '../scripts/ci/post_merge_self_heal_escalate.mjs';
import { applyFromDetectionReport } from '../scripts/ci/post_merge_self_heal_apply.mjs';

import cleanStateFixture from './fixtures/post-merge-self-heal/clean-state.json' assert { type: 'json' };

describe('post-merge self-healing activation', () => {
	it('detects pending manifest targets without proven closeout pass', () => {
		const findings = detectPendingManifestTargets({
			manifests: [{
				manifest_path: 'scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json',
				targets: [{ pr: 1858, source_issue: 1855 }],
			}],
			closeoutReports: [],
		});

		expect(findings).toHaveLength(1);
		expect(findings[0].kind).toBe('pending_closeout_replay');
	});

	it('collectCloseoutReportPrStatus tracks pass and fail per PR', () => {
		const status = collectCloseoutReportPrStatus([
			{ status: 'partial_failure', results: [{ pr: 1860, status: 'fail' }] },
			{ status: 'success', results: [{ pr: 1860, status: 'pass', sync_action: 'post_merge_success' }] },
		]);
		expect(status.get('1860')).toBe('pass');
	});

	it('normalizes combined and single closeout reports', () => {
		expect(normalizeCloseoutReport({ status: 'failure', results: [{ pr: 1, status: 'fail' }] })).toEqual([
			{ status: 'failure', results: [{ pr: 1, status: 'fail' }] },
		]);
		expect(normalizeCloseoutReport({ status: 'success', reports: [{ results: [] }] })).toEqual([
			{ results: [] },
		]);
	});

	it('maps remediation issues into detection metadata', () => {
		const metadata = remediationIssueToMetadata({
			number: 1813,
			state: 'open',
			title: 'Post-merge closeout exception for PR #1811 / source #1810 / closeout_blocker_declared',
			body: '- PR: #1811\n- Source issue: #1810\n## Detected failure condition\n- closeout_blocker_declared: blocked',
			labels: [{ name: 'post-merge-failure' }],
		});
		expect(metadata.linked_pr).toBe('1811');
		expect(metadata.source_issue).toBe(1810);
	});

	it('detectFromEvidenceBundle surfaces pending manifest findings from live-shaped bundle', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'self-heal-evidence-'));
		const manifestPath = path.join(dir, 'targets-remediation-backlog.json');
		fs.writeFileSync(manifestPath, JSON.stringify({ targets: [{ pr: 1860, source_issue: 1848 }] }, null, 2));

		const report = detectFromEvidenceBundle({
			manifestPaths: [manifestPath],
			manifests: [{
				manifest_path: manifestPath,
				targets: [{ pr: 1860, source_issue: 1848 }],
			}],
			closeoutReports: [],
			exceptionIssues: [],
			remediationIssues: [],
			evidenceSources: {
				manifests: [{ path: manifestPath, target_count: 1 }],
				closeout_report_sources: [],
				open_exception_issues: 0,
			},
			errors: [],
		});

		expect(report.status).toBe('findings');
		expect(report.findings.some((finding) => finding.kind === 'pending_closeout_replay')).toBe(true);
	});

	it('buildOperatorSummary documents activation model A/B', () => {
		const summary = buildOperatorSummary({
			mode: {
				dry_run: 'true',
				apply_safe_fixes: 'false',
				open_visible_escalations: 'true',
			},
			detection: {
				status: 'findings',
				findings: [{
					classification: SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED,
					code: 'pending_closeout_replay',
					pr_number: 1860,
					source_issue: 1848,
					message: 'Pending replay',
				}],
				summary: { cursor_remediation_required: 1 },
			},
			evidenceSources: {
				manifests: [{ path: 'targets.json', target_count: 1 }],
				closeout_report_sources: [],
				open_exception_issues: 2,
			},
		});

		expect(summary).toContain(ACTIVATION_MODEL.AUTOMATIC_VISIBLE_ESCALATION);
		expect(summary).toContain(ACTIVATION_MODEL.MANUAL_LIVE_FIXES);
		expect(summary).toContain('pending_closeout_replay');
	});

	it('filterEscalationFindings honors cursor-only visible escalation scope', () => {
		const findings = filterEscalationFindings([
			{ classification: SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED },
			{ classification: SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED },
		], { escalationScope: 'cursor_remediation_only' });

		expect(findings).toHaveLength(1);
		expect(findings[0].classification).toBe(SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED);
	});

	it('live issue creation only happens when apply-visible-escalations is used', async () => {
		const report = {
			findings: [{
				classification: SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED,
				pr_number: 1860,
				source_issue: 1848,
				message: 'Needs Cursor remediation',
				metadata: { code: 'pending_closeout_replay' },
			}],
		};

		const dry = await escalateFromDetectionReport(report, {
			dryRun: true,
			escalationScope: 'cursor_remediation_only',
		});
		expect(dry.summary.planned).toBe(1);
		expect(dry.summary.created).toBe(0);
	});

	it('clean state produces no mutation in dry-run apply and escalation planning', async () => {
		const report = buildDetectionReportFromFixture(cleanStateFixture.input);
		const applyOutcome = applyFromDetectionReport(report, { dryRun: true });
		const escalateOutcome = await escalateFromDetectionReport(report, { dryRun: true });

		expect(applyOutcome.summary.manifest_prunes_planned).toBe(0);
		expect(escalateOutcome.summary.planned).toBe(0);
	});

	it('manifest pruning remains bounded to explicit live apply', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'self-heal-bounded-'));
		const manifestPath = path.join(dir, 'targets.json');
		fs.writeFileSync(manifestPath, JSON.stringify({ targets: [{ pr: 1860, source_issue: 1848 }] }, null, 2));
		const report = {
			findings: [{
				kind: 'stale_manifest_entry',
				classification: SAFETY_CATEGORIES.SAFE_AUTO_FIX,
				pr_number: 1860,
				manifest_path: manifestPath,
			}],
			closeoutReports: [{ status: 'success', results: [{ pr: 1860, status: 'pass', sync_action: 'post_merge_success' }] }],
			manifests: [{ manifest_path: manifestPath, targets: [{ pr: 1860, source_issue: 1848 }] }],
		};

		const dry = applyFromDetectionReport(report, { dryRun: true, rootDir: dir });
		const live = applyFromDetectionReport(report, { dryRun: false, rootDir: dir });

		expect(dry.summary.manifest_prunes_planned).toBeGreaterThan(0);
		expect(dry.summary.manifest_prunes_applied).toBe(0);
		expect(live.summary.manifest_prunes_applied).toBeGreaterThan(0);
	});
});

function buildDetectionReportFromFixture(input) {
	return detectFromEvidenceBundle({
		...input,
		evidenceSources: { manifests: [], closeout_report_sources: [] },
		errors: [],
	});
}
