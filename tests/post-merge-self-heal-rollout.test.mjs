import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
	APPLY_ACTIONS,
	applyFromDetectionReport,
	planSafeAutoFixActions,
} from '../scripts/ci/post_merge_self_heal_apply.mjs';
import { SAFETY_CATEGORIES } from '../scripts/ci/post_merge_self_heal_classify.mjs';
import { buildDetectionReport } from '../scripts/ci/post_merge_self_heal_detect.mjs';
import { escalateFromDetectionReport } from '../scripts/ci/post_merge_self_heal_escalate.mjs';
import { ESCALATION_MARKER } from '../scripts/ci/post_merge_self_heal_escalate.mjs';

import cleanStateFixture from './fixtures/post-merge-self-heal/clean-state.json' assert { type: 'json' };
import safeManifestFixture from './fixtures/post-merge-self-heal/safe-manifest-stale.json' assert { type: 'json' };
import unsafeReviewerFixture from './fixtures/post-merge-self-heal/unsafe-reviewer-disposition.json' assert { type: 'json' };
import duplicateFixture from './fixtures/post-merge-self-heal/duplicate-remediation-issue.json' assert { type: 'json' };
import ambiguousFixture from './fixtures/post-merge-self-heal/ambiguous-evidence.json' assert { type: 'json' };

describe('post-merge self-healing rollout checkpoints', () => {
	it('clean repo state produces no mutations', async () => {
		const report = buildDetectionReport(cleanStateFixture.input);
		const applyOutcome = await applyFromDetectionReport(report, { dryRun: true });
		const escalateOutcome = await escalateFromDetectionReport(report, { dryRun: true });

		expect(report.status).toBe('success');
		expect(report.findings.every((finding) => finding.classification === SAFETY_CATEGORIES.NO_ACTION)).toBe(true);
		expect(applyOutcome.summary.manifest_prunes_planned).toBe(0);
		expect(escalateOutcome.summary.planned).toBe(0);
	});

	it('safe manifest fixture proposes manifest pruning only', async () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'self-heal-rollout-'));
		const manifestPath = path.join(dir, 'targets-remediation-backlog.json');
		fs.writeFileSync(manifestPath, JSON.stringify({
			targets: [{ pr: 1860, source_issue: 1848 }],
		}, null, 2));

		const input = {
			...safeManifestFixture.input,
			manifests: [{
				manifest_path: manifestPath,
				targets: [{ pr: 1860, source_issue: 1848 }],
			}],
		};
		const report = buildDetectionReport(input);
		const plan = planSafeAutoFixActions(report, {
			closeoutReports: input.closeoutReports,
			manifests: input.manifests,
		});
		const applyOutcome = await applyFromDetectionReport({
			...report,
			closeoutReports: input.closeoutReports,
			manifests: input.manifests,
		}, { dryRun: true, rootDir: dir });

		expect(report.status).toBe('findings');
		expect(report.findings.some((finding) => finding.classification === SAFETY_CATEGORIES.SAFE_AUTO_FIX)).toBe(true);
		expect(plan.actions.some((action) => action.action === APPLY_ACTIONS.PRUNE_MANIFEST)).toBe(true);
		expect(applyOutcome.summary.manifest_prunes_planned).toBeGreaterThan(0);
		expect(applyOutcome.summary.skipped_unsafe).toBe(0);
	});

	it('unsafe reviewer fixture escalates without auto-fix', async () => {
		const report = buildDetectionReport(unsafeReviewerFixture.input);
		const applyOutcome = await applyFromDetectionReport(report, { dryRun: true });
		const escalateOutcome = await escalateFromDetectionReport(report, { dryRun: true });

		expect(report.findings.some((finding) => finding.classification === SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED)).toBe(true);
		expect(applyOutcome.summary.safe_findings).toBe(0);
		expect(applyOutcome.applied).toEqual([]);
		expect(escalateOutcome.summary.planned).toBe(1);
		expect(escalateOutcome.actions[0].body).toContain(ESCALATION_MARKER);
	});

	it('duplicate issue fixture plans duplicate closure without creating issues', async () => {
		const report = buildDetectionReport(duplicateFixture.input);
		const applyOutcome = await applyFromDetectionReport(report, { dryRun: true });
		const escalateOutcome = await escalateFromDetectionReport(report, { dryRun: true });

		expect(report.findings.some((finding) => finding.classification === SAFETY_CATEGORIES.SAFE_AUTO_FIX)).toBe(true);
		expect(applyOutcome.summary.duplicate_plans).toBeGreaterThan(0);
		expect(escalateOutcome.summary.planned).toBe(0);
	});

	it('ambiguous evidence fixture escalates with operator or cursor classification and no mutation', async () => {
		const report = buildDetectionReport(ambiguousFixture.input);
		const applyOutcome = await applyFromDetectionReport(report, { dryRun: true });
		const escalateOutcome = await escalateFromDetectionReport(report, { dryRun: true });

		expect(report.findings.some((finding) =>
			finding.classification === SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED
			|| finding.classification === SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED,
		)).toBe(true);
		expect(applyOutcome.summary.manifest_prunes_planned).toBe(0);
		expect(escalateOutcome.summary.planned).toBeGreaterThan(0);
	});
});
