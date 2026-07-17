import { describe, expect, it } from 'vitest';

import { parseNameStatus } from '../../scripts/pmo-projects/resolve-workflow-manifests.mjs';

describe('PMO materializer workflow change parsing', () => {
	it('parses added modified and deleted paths', () => {
		expect(
			parseNameStatus(
				[
					'M\tdocs/ops/implementation-plans/a/project-manifest.json',
					'A\tdocs/ops/implementation-plans/b/project-manifest.json',
					'D\tdocs/ops/implementation-plans/c/project-manifest.json',
				].join('\n'),
			),
		).toEqual([
			{
				status: 'M',
				path: 'docs/ops/implementation-plans/a/project-manifest.json',
			},
			{
				status: 'A',
				path: 'docs/ops/implementation-plans/b/project-manifest.json',
			},
			{
				status: 'D',
				path: 'docs/ops/implementation-plans/c/project-manifest.json',
			},
		]);
	});

	it('expands a rename into a deleted old path and added new path', () => {
		expect(
			parseNameStatus(
				'R100\tdocs/ops/implementation-plans/old/project-manifest.json\tdocs/ops/implementation-plans/new/project-manifest.json',
			),
		).toEqual([
			{
				status: 'D',
				path: 'docs/ops/implementation-plans/old/project-manifest.json',
			},
			{
				status: 'A',
				path: 'docs/ops/implementation-plans/new/project-manifest.json',
			},
		]);
	});
});
