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

	it('enables scheduled daily backlog apply while manual dispatch defaults to dry-run', () => {
		const workflow = fs.readFileSync('.github/workflows/ops-post-merge-self-healing.yml', 'utf8');

		expect(workflow).toContain('workflow_run:');
		expect(workflow).toContain('schedule:');
		expect(workflow).toMatch(/elif \[ "\$\{\{ github\.event_name \}\}" = "workflow_run" \]; then[\s\S]*echo "dry_run=false"[\s\S]*echo "apply_safe_fixes=true"/);
		expect(workflow).toMatch(/elif \[ "\$\{\{ github\.event_name \}\}" = "schedule" \]; then[\s\S]*echo "dry_run=false"[\s\S]*echo "apply_safe_fixes=true"/);
		expect(workflow).toMatch(/else[\s\S]*echo "dry_run=true"[\s\S]*echo "apply_safe_fixes=false"/);
		expect(workflow).toMatch(/echo "open_escalation_issues=false"/);
	});

	it('triggers on matching post-merge issue events only', () => {
		const workflow = fs.readFileSync('.github/workflows/ops-post-merge-self-healing.yml', 'utf8');

		expect(workflow).toContain('issues:');
		expect(workflow).toContain('types: [opened, reopened, edited, labeled]');
		expect(workflow).toContain("startsWith(github.event.issue.title, 'Post-merge closeout exception')");
		expect(workflow).toContain("contains(join(github.event.issue.labels.*.name, ','), 'post-merge-failure')");
		expect(workflow).toMatch(/elif \[ "\$\{\{ github\.event_name \}\}" = "issues" \]; then[\s\S]*echo "backlog_scope=event_issue"/);
	});

	it('uses least-privilege permissions for issue-event self-healing', () => {
		const workflow = fs.readFileSync('.github/workflows/ops-post-merge-self-healing.yml', 'utf8');

		expect(workflow).toContain('contents: read');
		expect(workflow).toContain('issues: write');
		expect(workflow).not.toContain('contents: write');
		expect(workflow).not.toContain('pull-requests: write');
	});

	it('includes Post-Merge Detection as a workflow_run trigger for per-merge closeout self-healing', () => {
		const workflow = fs.readFileSync('.github/workflows/ops-post-merge-self-healing.yml', 'utf8');

		expect(workflow).toContain('- Post-Merge Detection');
		expect(workflow).toContain('post-merge-validation-result');
		expect(workflow).toContain('post-merge-closeout-artifact/post-merge-result.json');
		expect(workflow).toContain('--result post-merge-closeout-artifact/post-merge-result.json');
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
