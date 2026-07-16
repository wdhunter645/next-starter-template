import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
	applyMaterialization,
	buildGeneratedTaskBlock,
	indexIssues,
	planMaterialization,
	desiredIssueTitle,
} from '../../scripts/pmo-projects/lib/materialize-issues.mjs';
import {
	extractGeneratedBlock,
	taskMarker,
	upsertGeneratedBlock,
} from '../../scripts/pmo-projects/lib/markers.mjs';
import {
	loadManifestFile,
	validateProjectManifest,
} from '../../scripts/pmo-projects/lib/validate-manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, 'fixtures');
const repoRoot = path.resolve(__dirname, '../..');

function readFixture(name) {
	return JSON.parse(fs.readFileSync(path.join(fixturesDir, name), 'utf8'));
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

describe('PMO project manifest validator', () => {
	it('accepts the committed #2546 bootstrap manifest', () => {
		const { manifest } = loadManifestFile(
			'docs/ops/implementation-plans/pmo-project-autonomous-delivery/project-manifest.json',
			{ cwd: repoRoot },
		);
		const result = validateProjectManifest(manifest);
		expect(result.errors).toEqual([]);
		expect(result.ok).toBe(true);
		expect(result.terminalTaskId).toBe('007');
		expect(result.taskCount).toBe(7);
	});

	it('accepts the valid fixture', () => {
		const result = validateProjectManifest(readFixture('valid-manifest.json'));
		expect(result.ok).toBe(true);
	});

	it('fails closed when required project fields are missing', () => {
		const manifest = clone(readFixture('valid-manifest.json'));
		delete manifest.project.objective;
		const result = validateProjectManifest(manifest);
		expect(result.ok).toBe(false);
		expect(result.errors.some((e) => e.includes('project.objective'))).toBe(true);
	});

	it('rejects duplicate task IDs', () => {
		const manifest = clone(readFixture('valid-manifest.json'));
		manifest.tasks[1].id = '001';
		const result = validateProjectManifest(manifest);
		expect(result.ok).toBe(false);
		expect(result.errors.some((e) => /duplicate task id/.test(e))).toBe(true);
	});

	it('rejects unresolved predecessor/successor references', () => {
		const manifest = clone(readFixture('valid-manifest.json'));
		manifest.tasks[0].successors = ['999'];
		const result = validateProjectManifest(manifest);
		expect(result.ok).toBe(false);
		expect(result.errors.some((e) => /unresolved successor 999/.test(e))).toBe(true);
	});

	it('rejects dependency cycles', () => {
		const manifest = clone(readFixture('valid-manifest.json'));
		manifest.tasks[0].successors = ['002'];
		manifest.tasks[1].successors = ['001'];
		manifest.tasks[1].predecessors = ['001'];
		manifest.tasks[0].predecessors = ['002'];
		const result = validateProjectManifest(manifest);
		expect(result.ok).toBe(false);
		expect(result.errors.some((e) => /cycle/.test(e))).toBe(true);
	});

	it('requires exactly one terminal task', () => {
		const manifest = clone(readFixture('valid-manifest.json'));
		manifest.tasks.push({
			...clone(manifest.tasks[1]),
			id: '003',
			issueNumber: 9103,
			title: 'Second terminal',
			predecessors: ['001'],
			successors: [],
		});
		const result = validateProjectManifest(manifest);
		expect(result.ok).toBe(false);
		expect(result.errors.some((e) => /exactly one terminal task/.test(e))).toBe(true);
	});

	it('rejects projectBranch equal to main for Model B', () => {
		const manifest = clone(readFixture('valid-manifest.json'));
		manifest.delivery.projectBranch = 'main';
		manifest.delivery.childPullRequestBase = 'main';
		manifest.tasks.forEach((task) => {
			task.pullRequestBase = 'main';
		});
		const result = validateProjectManifest(manifest);
		expect(result.ok).toBe(false);
		expect(
			result.errors.some((e) => e.includes('delivery.projectBranch') && e.includes('main')),
		).toBe(true);
	});

	it('rejects autoMergeProduction=true', () => {
		const manifest = clone(readFixture('valid-manifest.json'));
		manifest.delivery.autoMergeProduction = true;
		const result = validateProjectManifest(manifest);
		expect(result.ok).toBe(false);
		expect(result.errors.some((e) => e.includes('delivery.autoMergeProduction'))).toBe(true);
	});

	it('rejects tasks that use main as pullRequestBase', () => {
		const manifest = clone(readFixture('valid-manifest.json'));
		manifest.tasks[0].pullRequestBase = 'main';
		const result = validateProjectManifest(manifest);
		expect(result.ok).toBe(false);
		expect(result.errors.some((e) => /automatic-integration base/.test(e))).toBe(true);
	});

	it('rejects Cursor as a production approver', () => {
		const manifest = clone(readFixture('valid-manifest.json'));
		manifest.roles.productionApprovers = ['cursor-local'];
		const result = validateProjectManifest(manifest);
		expect(result.ok).toBe(false);
		expect(result.errors.some((e) => /production approver/.test(e))).toBe(true);
	});

	it('rejects handoff:ready on prepared tasks', () => {
		const manifest = clone(readFixture('valid-manifest.json'));
		manifest.tasks[1].labels.push('handoff:ready');
		const result = validateProjectManifest(manifest);
		expect(result.ok).toBe(false);
		expect(result.errors.some((e) => /handoff:ready/.test(e))).toBe(true);
	});
});

describe('PMO issue materializer planning', () => {
	it('plans create when no marker exists', () => {
		const manifest = clone(readFixture('valid-manifest.json'));
		delete manifest.tasks[0].issueNumber;
		delete manifest.tasks[1].issueNumber;
		const plan = planMaterialization(manifest, indexIssues([]));
		expect(plan.validation.ok).toBe(true);
		expect(plan.summary.create).toBe(2);
		expect(plan.actions.every((a) => a.action === 'create')).toBe(true);
	});

	it('plans no-change on repeated identical apply state', () => {
		const manifest = readFixture('valid-manifest.json');
		const issues = manifest.tasks.map((task) => {
			const marker = taskMarker(manifest.project.slug, task.id);
			const generated = buildGeneratedTaskBlock(manifest, task);
			const body = upsertGeneratedBlock('', marker, generated);
			return {
				number: task.issueNumber,
				title: desiredIssueTitle(manifest, task),
				body,
				labels: task.labels.map((name) => ({ name })),
			};
		});

		const first = planMaterialization(manifest, indexIssues(issues));
		expect(first.summary['no-change']).toBe(2);

		const second = planMaterialization(manifest, indexIssues(issues));
		expect(second.summary['no-change']).toBe(2);
		expect(second.summary.create).toBe(0);
		expect(second.summary.update).toBe(0);
	});

	it('plans update when generated block metadata changes', () => {
		const manifest = clone(readFixture('valid-manifest.json'));
		const task = manifest.tasks[0];
		const marker = taskMarker(manifest.project.slug, task.id);
		const staleBody = `${marker}\n\n<!-- BEGIN LGFC GENERATED PROJECT TASK -->\nstale\n<!-- END LGFC GENERATED PROJECT TASK -->\n`;
		const issues = [
			{
				number: task.issueNumber,
				title: desiredIssueTitle(manifest, task),
				body: staleBody,
				labels: task.labels.map((name) => ({ name })),
			},
			{
				number: manifest.tasks[1].issueNumber,
				title: desiredIssueTitle(manifest, manifest.tasks[1]),
				body: upsertGeneratedBlock(
					'',
					taskMarker(manifest.project.slug, manifest.tasks[1].id),
					buildGeneratedTaskBlock(manifest, manifest.tasks[1]),
				),
				labels: manifest.tasks[1].labels.map((name) => ({ name })),
			},
		];

		const plan = planMaterialization(manifest, indexIssues(issues));
		const update = plan.actions.find((a) => a.taskId === '001');
		expect(update.action).toBe('update');
		expect(update.changes.body).toBe(true);
		expect(extractGeneratedBlock(update.nextBody)).toContain('Task ID: 001');
	});

	it('preserves human-authored content outside the generated block', () => {
		const manifest = readFixture('valid-manifest.json');
		const task = manifest.tasks[0];
		const marker = taskMarker(manifest.project.slug, task.id);
		const human = '## Human notes\n\nDo not delete this discussion.';
		const body = `${marker}\n\n${buildGeneratedTaskBlock(manifest, task)}\n\n${human}\n`;
		const next = upsertGeneratedBlock(
			body,
			marker,
			buildGeneratedTaskBlock(manifest, { ...task, objective: 'Updated objective' }),
		);
		expect(next).toContain('Do not delete this discussion.');
		expect(next).toContain('Updated objective');
	});

	it('reports adoption-candidate when issueNumber lacks marker', () => {
		const manifest = clone(readFixture('valid-manifest.json'));
		const issues = [
			{
				number: 9101,
				title: 'Pre-existing task without marker',
				body: 'Human authored body only',
				labels: [],
			},
			{
				number: 9102,
				title: desiredIssueTitle(manifest, manifest.tasks[1]),
				body: upsertGeneratedBlock(
					'',
					taskMarker(manifest.project.slug, '002'),
					buildGeneratedTaskBlock(manifest, manifest.tasks[1]),
				),
				labels: manifest.tasks[1].labels.map((name) => ({ name })),
			},
		];
		const plan = planMaterialization(manifest, indexIssues(issues));
		const row = plan.actions.find((a) => a.taskId === '001');
		expect(row.action).toBe('adoption-candidate');
		expect(plan.blocked).toBe(true);
	});

	it('blocks duplicate markers', () => {
		const manifest = readFixture('valid-manifest.json');
		const marker = taskMarker(manifest.project.slug, '001');
		const body = upsertGeneratedBlock(
			'',
			marker,
			buildGeneratedTaskBlock(manifest, manifest.tasks[0]),
		);
		const issues = [
			{ number: 9101, title: 'A', body, labels: [] },
			{ number: 9199, title: 'B', body, labels: [] },
			{
				number: 9102,
				title: desiredIssueTitle(manifest, manifest.tasks[1]),
				body: upsertGeneratedBlock(
					'',
					taskMarker(manifest.project.slug, '002'),
					buildGeneratedTaskBlock(manifest, manifest.tasks[1]),
				),
				labels: [],
			},
		];
		const plan = planMaterialization(manifest, indexIssues(issues));
		expect(plan.actions.find((a) => a.taskId === '001').action).toBe('blocked');
	});

	it('apply is idempotent through an in-memory client', async () => {
		const manifest = clone(readFixture('valid-manifest.json'));
		delete manifest.tasks[0].issueNumber;
		delete manifest.tasks[1].issueNumber;

		const store = new Map();
		let nextNumber = 1000;
		const client = {
			async listOpenIssues() {
				return [...store.values()];
			},
			async createIssue({ title, body, labels }) {
				nextNumber += 1;
				const issue = {
					number: nextNumber,
					title,
					body,
					labels: (labels || []).map((name) => ({ name })),
					url: `https://example.test/issues/${nextNumber}`,
				};
				store.set(nextNumber, issue);
				return { number: nextNumber, url: issue.url };
			},
			async updateIssue({ number, title, body, labels }) {
				const issue = store.get(number);
				if (title) issue.title = title;
				if (body !== undefined) issue.body = body;
				if (labels) issue.labels = labels.map((name) => ({ name }));
				return { number };
			},
			async getIssue(number) {
				return store.get(number);
			},
		};

		const firstPlan = planMaterialization(manifest, indexIssues([]));
		expect(firstPlan.summary.create).toBe(2);
		const firstApply = await applyMaterialization(firstPlan, client);
		expect(firstApply.every((row) => row.applied)).toBe(true);
		expect(store.size).toBe(2);

		const secondPlan = planMaterialization(manifest, indexIssues([...store.values()]));
		expect(secondPlan.summary['no-change']).toBe(2);
		const secondApply = await applyMaterialization(secondPlan, client);
		expect(secondApply.every((row) => row.applied === false)).toBe(true);
		expect(store.size).toBe(2);
	});

	it('refuses apply when validation fails', async () => {
		const bad = clone(readFixture('valid-manifest.json'));
		bad.delivery.autoMergeProduction = true;
		const plan = planMaterialization(bad, indexIssues([]));
		await expect(applyMaterialization(plan, {})).rejects.toThrow(/validation failed/);
	});
});
