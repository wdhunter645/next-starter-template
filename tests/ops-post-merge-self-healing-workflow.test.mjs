import fs from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('OPS — Post-Merge Self-Healing workflow', () => {
	it('defines manual dispatch inputs with dry_run default true', () => {
		const workflow = fs.readFileSync('.github/workflows/ops-post-merge-self-healing.yml', 'utf8');

		expect(workflow).toContain('name: OPS — Post-Merge Self-Healing');
		expect(workflow).toContain('dry_run:');
		expect(workflow).toContain("default: 'true'");
		expect(workflow).toContain('apply_safe_fixes:');
		expect(workflow).toContain('open_escalation_issues:');
		expect(workflow).toContain('open_visible_escalations:');
	});

	it('integrates collect, detect, apply, escalate, and operator summary in order', () => {
		const workflow = fs.readFileSync('.github/workflows/ops-post-merge-self-healing.yml', 'utf8');

		const collectIndex = workflow.indexOf('post_merge_self_heal_collect_evidence.mjs');
		const detectIndex = workflow.indexOf('post_merge_self_heal_detect.mjs');
		const applyIndex = workflow.indexOf('post_merge_self_heal_apply.mjs');
		const escalateIndex = workflow.indexOf('post_merge_self_heal_escalate.mjs');
		const summaryIndex = workflow.indexOf('post_merge_self_heal_operator_summary.mjs');

		expect(collectIndex).toBeGreaterThan(-1);
		expect(detectIndex).toBeGreaterThan(collectIndex);
		expect(applyIndex).toBeGreaterThan(detectIndex);
		expect(escalateIndex).toBeGreaterThan(applyIndex);
		expect(summaryIndex).toBeGreaterThan(escalateIndex);
	});

	it('uploads evidence, detection, apply, escalation, and operator summary artifacts', () => {
		const workflow = fs.readFileSync('.github/workflows/ops-post-merge-self-healing.yml', 'utf8');

		expect(workflow).toContain('name: post-merge-self-healing-report');
		expect(workflow).toContain('post-merge-self-heal-evidence.json');
		expect(workflow).toContain('post-merge-self-heal-detection.json');
		expect(workflow).toContain('post-merge-self-heal-apply.json');
		expect(workflow).toContain('post-merge-self-heal-escalation.json');
		expect(workflow).toContain('post-merge-self-heal-operator-summary.md');
	});

	it('defaults automatic invocations to dry-run apply with visible escalations enabled', () => {
		const workflow = fs.readFileSync('.github/workflows/ops-post-merge-self-healing.yml', 'utf8');

		expect(workflow).toContain('workflow_run:');
		expect(workflow).toContain('schedule:');
		expect(workflow).toMatch(/DRY_RUN="true"/);
		expect(workflow).toMatch(/APPLY_SAFE="false"/);
		expect(workflow).toMatch(/OPEN_VISIBLE="true"/);
		expect(workflow).toContain('--apply-visible-escalations');
	});
});
