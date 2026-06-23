import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
	formatManifestList,
	normalizeRepoPath,
	parseManifestList,
	resolveCloseoutManifestsFromPush,
	RERUN_MANIFEST,
} from '../scripts/ci/resolve_closeout_manifests_from_push.mjs';
import { DEFAULT_MANIFESTS } from '../scripts/ci/run_post_merge_closeout_all_manifests.mjs';

describe('resolve_closeout_manifests_from_push', () => {
	it('normalizes repository-relative paths', () => {
		expect(normalizeRepoPath('./scripts/ci/foo.mjs')).toBe('scripts/ci/foo.mjs');
	});

	it('replays only changed manifests from push', () => {
		const wave3b = 'scripts/ci/post-merge-closeout/targets-ops-burn-down-wave3b.json';
		const resolved = resolveCloseoutManifestsFromPush({
			changedPaths: [wave3b],
			includeRerunWhenPopulated: false,
		});
		expect(resolved).toEqual([wave3b]);
		expect(resolved).not.toContain(DEFAULT_MANIFESTS[0]);
	});

	it('includes rerun manifest when populated and not already selected', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'closeout-resolve-'));
		const repoRerun = path.join(dir, RERUN_MANIFEST);
		fs.mkdirSync(path.dirname(repoRerun), { recursive: true });
		fs.writeFileSync(
			repoRerun,
			JSON.stringify({ targets: [{ pr: 1, body_file: 'scripts/ci/post-merge-closeout/pr-1-body.md' }] }),
		);
		const wave3b = 'scripts/ci/post-merge-closeout/targets-ops-burn-down-wave3b.json';
		const resolved = resolveCloseoutManifestsFromPush({
			changedPaths: [wave3b],
			workspace: dir,
		});
		expect(resolved).toEqual([RERUN_MANIFEST, wave3b]);
	});

	it('formats and parses manifest lists for CLOSEOUT_MANIFESTS', () => {
		const list = ['scripts/ci/a.json', 'scripts/ci/b.json'];
		expect(parseManifestList(formatManifestList(list))).toEqual(list);
	});
});
