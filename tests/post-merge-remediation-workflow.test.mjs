import fs from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('Post-Merge Remediation workflow', () => {
	it('creates remediation issues from the closeout artifact without self-healing mutations', () => {
		const workflow = fs.readFileSync('.github/workflows/post-merge-remediation.yml', 'utf8');

		const downloadIndex = workflow.indexOf('Download validation result');
		const remediateIndex = workflow.indexOf('Create or update remediation issue');
		const dedupeIndex = workflow.indexOf('Close duplicate remediation issues');

		expect(downloadIndex).toBeGreaterThan(-1);
		expect(remediateIndex).toBeGreaterThan(downloadIndex);
		expect(dedupeIndex).toBeGreaterThan(remediateIndex);
		expect(workflow).toContain('post-merge-validation-result/post-merge-result.json');
		expect(workflow).toContain('post_merge_remediation_issue.mjs');
		expect(workflow).toContain('close_duplicate_remediation_issues.mjs');
		expect(workflow).not.toContain('post_merge_self_heal_backlog.mjs');
		expect(workflow).not.toContain('post_merge_self_heal_detect.mjs');
		expect(workflow).not.toContain('post_merge_self_heal_apply.mjs');
		expect(workflow).not.toContain('--apply');
	});
});
