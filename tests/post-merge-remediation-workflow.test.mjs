import fs from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('Post-Merge Remediation workflow', () => {
	it('runs deterministic self-healing before remediation issue upsert', () => {
		const workflow = fs.readFileSync('.github/workflows/post-merge-remediation.yml', 'utf8');

		const healIndex = workflow.indexOf('Run deterministic self-healing before remediation issue creation');
		const remediateIndex = workflow.indexOf('Create or update remediation issue');

		expect(healIndex).toBeGreaterThan(-1);
		expect(remediateIndex).toBeGreaterThan(healIndex);
		expect(workflow).toContain('post_merge_self_heal_backlog.mjs');
		expect(workflow).toContain('post_merge_self_heal_detect.mjs');
		expect(workflow).toContain('post_merge_self_heal_apply.mjs');
		expect(workflow).toContain('--apply');
		expect(workflow).toContain('post-merge-validation-result/post-merge-result.json');
	});
});
