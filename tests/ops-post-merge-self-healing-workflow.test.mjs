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
		expect(workflow).toContain('backlog_scope:');
	});

	it('integrates detect, apply, and escalate scripts in order', () => {
		const workflow = fs.readFileSync('.github/workflows/ops-post-merge-self-healing.yml', 'utf8');

		const backlogIndex = workflow.indexOf('post_merge_self_heal_backlog.mjs');
		const detectIndex = workflow.indexOf('post_merge_self_heal_detect.mjs');
		const applyIndex = workflow.indexOf('post_merge_self_heal_apply.mjs');
		const escalateIndex = workflow.indexOf('post_merge_self_heal_escalate.mjs');

		expect(backlogIndex).toBeGreaterThan(-1);
		expect(detectIndex).toBeGreaterThan(-1);
		expect(detectIndex).toBeGreaterThan(backlogIndex);
		expect(applyIndex).toBeGreaterThan(detectIndex);
		expect(escalateIndex).toBeGreaterThan(applyIndex);
	});

	it('uploads distinct self-healing artifacts', () => {
		const workflow = fs.readFileSync('.github/workflows/ops-post-merge-self-healing.yml', 'utf8');

		expect(workflow).toContain('name: post-merge-self-healing-report');
		expect(workflow).toContain('post-merge-self-heal-backlog.json');
		expect(workflow).toContain('post-merge-self-heal-detection.json');
		expect(workflow).toContain('post-merge-self-heal-apply.json');
		expect(workflow).toContain('post-merge-self-heal-escalation.json');
	});

	it('runs only manually or on the scheduled backlog lane', () => {
		const workflow = fs.readFileSync('.github/workflows/ops-post-merge-self-healing.yml', 'utf8');
		const triggerBlock = workflow.slice(workflow.indexOf('on:'), workflow.indexOf('permissions:'));

		expect(triggerBlock).toContain('workflow_dispatch:');
		expect(triggerBlock).toContain('schedule:');
		expect(triggerBlock).not.toContain('workflow_run:');
		expect(triggerBlock).not.toMatch(/^\s*issues:\s*$/m);
		expect(triggerBlock).not.toContain('push:');
		expect(workflow).not.toContain('github.event.workflow_run');
		expect(workflow).not.toContain('post-merge-closeout-artifact');
		expect(workflow).not.toContain('Download post-merge closeout artifact');
	});

	it('queues self-healing runs instead of racing repository writes', () => {
		const workflow = fs.readFileSync('.github/workflows/ops-post-merge-self-healing.yml', 'utf8');

		expect(workflow).toContain('concurrency:');
		expect(workflow).toContain('group: ops-post-merge-self-healing-${{ github.repository }}');
		expect(workflow).toContain('cancel-in-progress: false');
	});

	it('uses least-privilege permissions for transition self-healing', () => {
		const workflow = fs.readFileSync('.github/workflows/ops-post-merge-self-healing.yml', 'utf8');

		expect(workflow).toContain('contents: read');
		expect(workflow).toContain('issues: write');
		expect(workflow).not.toContain('contents: write');
		expect(workflow).not.toContain('pull-requests: write');
	});

	it('exports GitHub auth env to the apply safe auto-fix step', () => {
		const workflow = fs.readFileSync('.github/workflows/ops-post-merge-self-healing.yml', 'utf8');
		const applyStep = workflow.slice(
			workflow.indexOf('- name: Apply safe auto-fix actions'),
			workflow.indexOf('- name: Open or update escalation issues'),
		);

		expect(applyStep).toContain('GITHUB_TOKEN: ${{ github.token }}');
		expect(applyStep).toContain('GITHUB_REPOSITORY: ${{ github.repository }}');
	});
});
