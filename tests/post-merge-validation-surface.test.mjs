import { describe, expect, it } from 'vitest';
import {
	POST_MERGE_VALIDATION_SCRIPTS,
	POST_MERGE_VALIDATION_WORKFLOWS,
	renderPostMergeValidationChecklist,
	validatePostMergeValidationSurface,
} from '../scripts/ci/post_merge_validation_surface.mjs';

describe('post-merge validation surface inventory', () => {
	it('validates the repository post-merge validation surface', () => {
		const result = validatePostMergeValidationSurface();
		expect(result.ok, result.errors.join('\n')).toBe(true);
	});

	it('documents the core post-merge workflows', () => {
		expect(POST_MERGE_VALIDATION_WORKFLOWS.map((entry) => entry.file)).toEqual([
			'post-merge-intent-verification.yml',
			'post-merge-remediation.yml',
			'diataxis-post-merge-validate.yml',
		]);
	});

	it('includes the expanded validation scripts', () => {
		expect(POST_MERGE_VALIDATION_SCRIPTS).toContain('scripts/ci/post_merge_implementation_evidence.mjs');
		expect(POST_MERGE_VALIDATION_SCRIPTS).toContain('scripts/ci/post_merge_diataxis_audit.mjs');
	});

	it('renders checklist text', () => {
		const checklist = renderPostMergeValidationChecklist();
		expect(checklist).toContain('Post-Merge Detection');
		expect(checklist).toContain('post_merge_validator.mjs');
	});
});
