import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

const workflow = fs.readFileSync(
	'.github/workflows/pmo-project-task-materializer.yml',
	'utf8',
);

describe('materializer workflow definition', () => {
	it('uses static permissions', () => {
		expect(workflow.includes('issues: ${{')).toBe(false);
		expect(workflow.includes('issues: read')).toBe(true);
		expect(workflow.includes('issues: write')).toBe(true);
	});

	it('isolates write access to manual apply', () => {
		expect(workflow.includes("github.event_name == 'workflow_dispatch'")).toBe(true);
		expect(workflow.includes("inputs.mode == 'apply'")).toBe(true);
		expect(workflow.includes('inputs.authorize_apply == true')).toBe(true);
	});

	it('keeps automatic execution dry-run and propagates pipe failures', () => {
		expect(workflow.includes('INPUT_MODE: dry-run')).toBe(true);
		expect((workflow.match(/set -o pipefail/g) || []).length).toBe(2);
	});
});
