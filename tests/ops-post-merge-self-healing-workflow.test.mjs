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
	});

	it('integrates detect, apply, and escalate scripts in order', () => {
		const workflow = fs.readFileSync('.github/workflows/ops-post-merge-self-healing.yml', 'utf8');

		const detectIndex = workflow.indexOf('post_merge_self_heal_detect.mjs');
		const applyIndex = workflow.indexOf('post_merge_self_heal_apply.mjs');
		const escalateIndex = workflow.indexOf('post_merge_self_heal_escalate.mjs');

		expect(detectIndex).toBeGreaterThan(-1);
		expect(applyIndex).toBeGreaterThan(detectIndex);
		expect(escalateIndex).toBeGreaterThan(applyIndex);
	});

	it('uploads distinct self-healing artifacts', () => {
		const workflow = fs.readFileSync('.github/workflows/ops-post-merge-self-healing.yml', 'utf8');

		expect(workflow).toContain('name: post-merge-self-healing-report');
		expect(workflow).toContain('post-merge-self-heal-detection.json');
		expect(workflow).toContain('post-merge-self-heal-apply.json');
		expect(workflow).toContain('post-merge-self-heal-escalation.json');
	});

	it('defaults scheduled and workflow_run invocations to dry-run mode', () => {
		const workflow = fs.readFileSync('.github/workflows/ops-post-merge-self-healing.yml', 'utf8');

		expect(workflow).toContain('workflow_run:');
		expect(workflow).toContain('schedule:');
		expect(workflow).toMatch(/echo "dry_run=true"/);
		expect(workflow).toMatch(/echo "apply_safe_fixes=false"/);
		expect(workflow).toMatch(/echo "open_escalation_issues=false"/);
	});
});
