import { describe, expect, it } from 'vitest';

import { loadCloseoutTargets } from '../scripts/ci/run_batch_post_merge_closeout.mjs';
import { alternateProgramLaneFailures } from '../scripts/ci/post_merge_validator.mjs';

const WAVE3B_MANIFEST = 'scripts/ci/post-merge-closeout/targets-ops-burn-down-wave3b.json';

describe('ops burn-down wave 3b batch-generated manifest', () => {
	it('loads 20 batch-generated closeout targets', () => {
		const { targets } = loadCloseoutTargets(WAVE3B_MANIFEST);
		expect(targets).toHaveLength(20);
		expect(targets[0]).toMatchObject({
			pr: 1327,
			source_issue: 1314,
			body_file: 'scripts/ci/post-merge-closeout/pr-1327-body.md',
		});
		expect(targets.every((target) => target.body_file && target.merge_sha && target.source_issue)).toBe(
			true,
		);
	});

	it('does not include active alternate program lane source issues', () => {
		const { targets } = loadCloseoutTargets(WAVE3B_MANIFEST);
		for (const target of targets) {
			expect(alternateProgramLaneFailures({ issueNumbers: [target.source_issue] })).toEqual([]);
		}
	});
});
