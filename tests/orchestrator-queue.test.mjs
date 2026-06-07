import { describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';

process.env.GITHUB_REPOSITORY = 'owner/repo';
process.env.PR_NUMBER = '42';
process.env.SYNC_ACTION = 'closed';

const createIssues = await import('../scripts/orchestrator/create-issues.mjs');
const createDraftPr = await import('../scripts/orchestrator/create-draft-pr.mjs');
const advanceQueue = await import('../scripts/orchestrator/advance-queue.mjs');
const syncPrState = await import('../scripts/orchestrator/sync-pr-state.mjs');
const ciEngine = await import('../scripts/orchestrator/ci-orchestration-engine.mjs');

function issue(number, status, createdAt) {
	return {
		number,
		title: `Task ${number}`,
		createdAt,
		labels: [{ name: 'orchestrator' }, { name: status }],
	};
}

function queryFor(statuses) {
	return vi.fn(() => Object.values(statuses).flat());
}

function ciIssue(number, status, createdAt, body = '<!-- lgfc-ci-phase:pr-hygiene-foundation -->', state = 'OPEN') {
	return {
		number,
		title: `CI Task ${number}`,
		createdAt,
		body,
		state,
		labels: [{ name: 'orchestrator' }, { name: 'type:ci' }, { name: status }],
	};
}

function remediationIssue(number, status, createdAt, state = 'OPEN') {
	return {
		number,
		title: `CI remediation ${number}`,
		createdAt,
		body: '<!-- lgfc-ci-orchestration-remediation -->\n# CI Orchestration Paused',
		state,
		labels: [{ name: 'orchestrator' }, { name: 'type:ci' }, { name: status }],
	};
}

describe('orchestrator issue creation queue model', () => {
	it('labels the first produced task as queued and subsequent tasks as blocked', () => {
		const tasks = [
			{ type: 'repository', agent: 'codex' },
			{ type: 'website', agent: 'cursor' },
			{ type: 'docs', agent: 'atlas' },
		];

		const labels = tasks.map((task, index) => createIssues.labelsForTask(task, createIssues.statusLabelForCreatedTask(index)));

		expect(labels[0]).toContain('status:queued');
		expect(labels[1]).toContain('status:blocked');
		expect(labels[2]).toContain('status:blocked');
	});

	it('labels every produced task as blocked when an orchestrator issue is already open', () => {
		const tasks = [
			{ type: 'repository', agent: 'codex' },
			{ type: 'website', agent: 'cursor' },
		];

		const labels = tasks.map((task, index) => createIssues.labelsForTask(task, createIssues.statusLabelForCreatedTask(index, true)));

		expect(labels[0]).toContain('status:blocked');
		expect(labels[1]).toContain('status:blocked');
	});

	it('does not count skipped existing tasks when assigning the first newly created task status', () => {
		const taskAlreadyHasIssue = [true, true, true, false];
		const producedStatuses = [];
		let createdIssueCount = 0;

		for (const exists of taskAlreadyHasIssue) {
			if (exists) continue;
			producedStatuses.push(createIssues.statusLabelForCreatedTask(createdIssueCount));
			createdIssueCount += 1;
		}

		expect(producedStatuses).toEqual(['status:queued']);
	});

	it('routes CI implementation issues to Cursor with CI labels', () => {
		const labels = createIssues.labelsForTask({ type: 'ci', agent: 'cursor' });

		expect(labels).toContain('orchestrator');
		expect(labels).toContain('status:queued');
		expect(labels).toContain('type:ci');
		expect(labels).toContain('agent:cursor');
	});

	it('detects missing orchestrator labels before issue creation', () => {
		expect(
			createIssues.missingRequiredLabels(
				['orchestrator', 'status:queued', 'agent:cursor'],
				['orchestrator', 'status:queued', 'status:blocked', 'type:ci', 'agent:cursor'],
			),
		).toEqual(['status:blocked', 'type:ci']);
	});

	it('skips task issue creation for terminal task statuses', () => {
		expect(createIssues.shouldCreateIssueForTask({ status: 'completed' })).toBe(false);
		expect(createIssues.shouldCreateIssueForTask({ status: 'closed' })).toBe(false);
		expect(createIssues.shouldCreateIssueForTask({ status: 'issues-created' })).toBe(false);
		expect(createIssues.shouldCreateIssueForTask({ status: 'active' })).toBe(true);
		expect(createIssues.shouldCreateIssueForTask({})).toBe(true);
	});
});

describe('CI orchestration engine', () => {
	const state = {
		sourceIssue: 1075,
		programIssue: 1058,
		canonicalDocs: ['docs/explanation/ci/lgfc-ci-production-design.md', 'docs/how-to/ci/lgfc-ci-implementation-plan.md'],
		monitoring: {
			repeatedFailureThreshold: 2,
			staleRunHours: 6,
			staleIssueDays: 7,
			expectedWorkflows: ['GATE - Quality Checks', 'Docs Guardrails'],
		},
		phases: [
			{
				id: 'pr-hygiene-foundation',
				title: 'PR Hygiene Foundation',
				dependsOn: [],
				objective: 'Normalize PR metadata before merge protection changes.',
				workflowScope: ['PR metadata normalization'],
				allowedFiles: ['.github/workflows/docs-guardrails.yml', 'scripts/ci/**'],
				forbiddenScope: ['production website behavior changes'],
				rollbackBoundary: 'Revert only PR hygiene automation.',
				validation: ['npm test -- tests/orchestrator-queue.test.mjs'],
				acceptanceCriteria: ['Generated issue is Cursor-ready.'],
				postMergeVerification: ['Confirm post-merge verification passed.'],
			},
			{
				id: 'merge-protection-consolidation',
				title: 'Merge Protection Consolidation',
				dependsOn: ['pr-hygiene-foundation'],
				objective: 'Consolidate deterministic gates.',
				workflowScope: ['deterministic gate consolidation'],
				allowedFiles: ['.github/workflows/gate-quality.yml'],
				forbiddenScope: ['reviewer lifecycle redesign'],
				rollbackBoundary: 'Revert merge-protection changes.',
				validation: ['npm test'],
				acceptanceCriteria: ['Deterministic blockers are consolidated.'],
				postMergeVerification: ['Confirm post-merge verification passed.'],
			},
		],
	};

	it('identifies the first dependency-ready CI phase when no active CI issue exists', () => {
		const decision = ciEngine.rolloutDecision({
			state,
			issues: [],
			runs: [
				{ workflowName: 'GATE - Quality Checks', status: 'completed', conclusion: 'success', createdAt: '2026-05-22T10:00:00Z' },
				{ workflowName: 'Docs Guardrails', status: 'completed', conclusion: 'success', createdAt: '2026-05-22T10:00:00Z' },
			],
			now: new Date('2026-05-22T11:00:00Z'),
		});

		expect(decision).toMatchObject({
			action: 'create',
			phase: { id: 'pr-hygiene-foundation' },
		});
	});

	it('refuses to create a duplicate active CI implementation issue', () => {
		const decision = ciEngine.rolloutDecision({
			state,
			issues: [ciIssue(1076, 'status:implementation', '2026-05-22T10:00:00Z')],
			runs: [],
			now: new Date('2026-05-22T11:00:00Z'),
		});

		expect(decision).toMatchObject({
			action: 'pause',
			reason: 'active_issue',
			issue: { number: 1076 },
		});
	});

	it('advances to the next dependency phase only after the previous phase is complete', () => {
		const decision = ciEngine.rolloutDecision({
			state,
			issues: [ciIssue(1076, 'status:complete', '2026-05-22T10:00:00Z', '<!-- lgfc-ci-phase:pr-hygiene-foundation -->', 'CLOSED')],
			runs: [
				{ workflowName: 'GATE - Quality Checks', status: 'completed', conclusion: 'success', createdAt: '2026-05-22T10:00:00Z' },
				{ workflowName: 'Docs Guardrails', status: 'completed', conclusion: 'success', createdAt: '2026-05-22T10:00:00Z' },
			],
			now: new Date('2026-05-22T11:00:00Z'),
		});

		expect(decision).toMatchObject({
			action: 'create',
			phase: { id: 'merge-protection-consolidation' },
		});
	});

	it('does not count an open status:complete issue as a completed phase', () => {
		const decision = ciEngine.rolloutDecision({
			state,
			issues: [ciIssue(1076, 'status:complete', '2026-05-22T10:00:00Z')],
			runs: [
				{ workflowName: 'GATE - Quality Checks', status: 'completed', conclusion: 'success', createdAt: '2026-05-22T10:00:00Z' },
				{ workflowName: 'Docs Guardrails', status: 'completed', conclusion: 'success', createdAt: '2026-05-22T10:00:00Z' },
			],
			now: new Date('2026-05-22T11:00:00Z'),
		});

		expect(decision).toMatchObject({
			action: 'pause',
			reason: 'duplicate_phase_issue',
			issue: { number: 1076 },
		});
	});

	it('ignores closed failed CI issues when selecting the next phase', () => {
		const decision = ciEngine.rolloutDecision({
			state,
			issues: [ciIssue(1076, 'status:failed', '2026-05-22T10:00:00Z', '<!-- lgfc-ci-phase:pr-hygiene-foundation -->', 'CLOSED')],
			runs: [
				{ workflowName: 'GATE - Quality Checks', status: 'completed', conclusion: 'success', createdAt: '2026-05-22T10:00:00Z' },
				{ workflowName: 'Docs Guardrails', status: 'completed', conclusion: 'success', createdAt: '2026-05-22T10:00:00Z' },
			],
			now: new Date('2026-05-22T11:00:00Z'),
		});

		expect(decision).toMatchObject({
			action: 'create',
			phase: { id: 'pr-hygiene-foundation' },
		});
	});

	it('excludes remediation issues from rollout gating', () => {
		const decision = ciEngine.rolloutDecision({
			state,
			issues: [remediationIssue(1080, 'status:failed', '2026-05-22T10:00:00Z')],
			runs: [
				{ workflowName: 'GATE - Quality Checks', status: 'completed', conclusion: 'success', createdAt: '2026-05-22T10:00:00Z' },
				{ workflowName: 'Docs Guardrails', status: 'completed', conclusion: 'success', createdAt: '2026-05-22T10:00:00Z' },
			],
			now: new Date('2026-05-22T11:00:00Z'),
		});

		expect(decision).toMatchObject({
			action: 'create',
			phase: { id: 'pr-hygiene-foundation' },
		});
	});

	it('pauses rollout on repeated CI workflow failures', () => {
		const report = ciEngine.ciHealthReport(
			[
				{
					workflowName: 'GATE - Quality Checks',
					status: 'completed',
					conclusion: 'failure',
					createdAt: '2026-05-22T09:00:00Z',
					url: 'https://github.com/owner/repo/actions/runs/1',
				},
				{
					workflowName: 'GATE - Quality Checks',
					status: 'completed',
					conclusion: 'timed_out',
					createdAt: '2026-05-22T10:00:00Z',
					url: 'https://github.com/owner/repo/actions/runs/2',
				},
			],
			state.monitoring,
			new Date('2026-05-22T11:00:00Z'),
		);

		expect(report.stable).toBe(false);
		expect(report.blocking).toContainEqual(
			expect.objectContaining({
				code: 'repeated_workflow_failure',
				evidence: 'https://github.com/owner/repo/actions/runs/1, https://github.com/owner/repo/actions/runs/2',
			}),
		);
	});

	it('includes workflow URLs in remediation evidence', () => {
		const decision = ciEngine.rolloutDecision({
			state,
			issues: [],
			runs: [
				{
					workflowName: 'GATE - Quality Checks',
					status: 'in_progress',
					conclusion: '',
					createdAt: '2026-05-22T01:00:00Z',
					url: 'https://github.com/owner/repo/actions/runs/3',
				},
			],
			now: new Date('2026-05-22T11:00:00Z'),
		});

		expect(decision).toMatchObject({
			action: 'pause',
			reason: 'ci_instability',
		});
		expect(decision.evidence).toContain(
			'GATE - Quality Checks has been in_progress since 2026-05-22T01:00:00Z (https://github.com/owner/repo/actions/runs/3)',
		);
	});

	it('creates remediation body text for duplicate phase pauses', () => {
		const decision = ciEngine.rolloutDecision({
			state,
			issues: [ciIssue(1076, 'status:complete', '2026-05-22T10:00:00Z')],
			runs: [],
			now: new Date('2026-05-22T11:00:00Z'),
		});
		const body = ciEngine.buildRemediationBody(decision);

		expect(decision.reason).toBe('duplicate_phase_issue');
		expect(body).toContain('Reason: duplicate_phase_issue');
		expect(body).toContain('Issue #1076 already exists for phase pr-hygiene-foundation.');
	});

	it('generates Cursor-ready issue bodies with required orchestration fields', () => {
		const body = ciEngine.buildIssueBody(state, state.phases[0]);

		expect(body).toContain('<!-- lgfc-ci-phase:pr-hygiene-foundation -->');
		expect(body).toContain('## Objective');
		expect(body).toContain('## Source-of-Truth Docs');
		expect(body).toContain('## Allowed Files');
		expect(body).toContain('## Rollback Boundary');
		expect(body).toContain('## Validation Requirements');
		expect(body).toContain('## Acceptance Criteria');
		expect(body).toContain('## Post-Merge Verification Requirements');
	});
});

describe('orchestrator draft PR preflight model', () => {
	it('recognizes standard duplicate issue markers', () => {
		expect(createDraftPr.isDuplicateIssueBody('Duplicate of #973')).toBe(true);
		expect(createDraftPr.isDuplicateIssueBody('Duplicate of Issue #973')).toBe(true);
		expect(createDraftPr.isDuplicateIssueBody('This was closed as duplicate during triage.')).toBe(true);
		expect(createDraftPr.isDuplicateIssueBody('Related to #973 but still active.')).toBe(false);
	});

	it('uses focused source markers for existing implementation PRs', () => {
		const query = createDraftPr.issuePrSearchQuery(981);
		expect(query).toContain('orchestrator-source-issue: 981');
		expect(query).toContain('- **Issue:** #981');
		expect(query).not.toContain('issues/981');
	});
});

describe('orchestrator queue advancement', () => {
	it('keeps a three-task queue serial until merge verification completes, then queues the next task', () => {
		const tasks = [
			{ type: 'repository', agent: 'codex' },
			{ type: 'website', agent: 'cursor' },
			{ type: 'docs', agent: 'atlas' },
		];
		const producedStatuses = tasks.map((task, index) =>
			createIssues.labelsForTask(task, createIssues.statusLabelForCreatedTask(index)).find((label) => label.startsWith('status:')),
		);

		expect(producedStatuses).toEqual(['status:queued', 'status:blocked', 'status:blocked']);

		const blockedOlder = issue(2, 'status:blocked', '2026-05-05T19:01:00Z');
		const blockedNewer = issue(3, 'status:blocked', '2026-05-05T19:02:00Z');
		const pipelineStates = ['status:queued', 'status:pr-draft', 'status:implementation', 'status:review', 'status:post-merge-verify'];

		for (const state of pipelineStates) {
			expect(
				advanceQueue.queueAdvanceDecision(
					queryFor({
						[state]: [issue(1, state, '2026-05-05T19:00:00Z')],
						'status:blocked': [blockedOlder, blockedNewer],
					}),
				),
			).not.toMatchObject({ action: 'advance' });
		}

		const transitions = [];
		const merged = syncPrState.syncPrState({
			prNumber: '42',
			action: 'merged',
			pr: { body: '**Issue:** #1', mergedAt: '2026-05-05T19:05:00Z', state: 'MERGED', url: 'https://example.test/pr/42' },
			setStatusFn: (...args) => transitions.push(args),
		});
		const complete = syncPrState.syncPrState({
			prNumber: '42',
			action: 'post_merge_success',
			pr: { body: '**Issue:** #1', mergedAt: '2026-05-05T19:05:00Z', state: 'MERGED', url: 'https://example.test/pr/42' },
			postMergeResult: { status: 'pass', remediation_required: false, merge_sha: 'abc123' },
			getIssueMeta: () => ({ title: 'Task 1', labels: ['orchestrator', 'status:post-merge-verify'], state: 'OPEN' }),
			setStatusFn: (...args) => transitions.push(args),
			reconcileTerminalLabelsFn: vi.fn(),
			getRepoLabels: () => ['status:complete'],
			run: vi.fn(),
		});

		expect(merged).toBe('post_merge_verify');
		expect(complete).toBe('complete');
		expect(transitions.map((transition) => transition.slice(1, 3))).toEqual([
			['status:review', 'status:post-merge-verify'],
		]);
		expect(advanceQueue.queueAdvanceDecision(queryFor({ 'status:blocked': [blockedNewer, blockedOlder] }))).toMatchObject({
			action: 'advance',
			issue: { number: 2 },
		});
	});

	it('keeps source issue open when post-merge remediation remains required', () => {
		const run = vi.fn();
		const transitions = [];

		const result = syncPrState.syncPrState({
			prNumber: '42',
			action: 'post_merge_remediation',
			pr: { body: '**Issue:** #1', mergedAt: '2026-05-05T19:05:00Z', state: 'MERGED', url: 'https://example.test/pr/42' },
			setStatusFn: (...args) => transitions.push(args),
			run,
		});

		expect(result).toBe('exception');
		expect(transitions).toEqual([]);
		expect(run).not.toHaveBeenCalled();
	});

	it('advances the oldest blocked task only after the active pipeline completes', () => {
		const queued = issue(1, 'status:queued', '2026-05-05T19:00:00Z');
		const blockedOlder = issue(2, 'status:blocked', '2026-05-05T19:01:00Z');
		const blockedNewer = issue(3, 'status:blocked', '2026-05-05T19:02:00Z');

		const pipelineStates = ['status:queued', 'status:pr-draft', 'status:implementation', 'status:review', 'status:post-merge-verify'];

		for (const state of pipelineStates) {
			const activeIssue = { ...queued, labels: [{ name: 'orchestrator' }, { name: state }] };
			expect(
				advanceQueue.queueAdvanceDecision(queryFor({ [state]: [activeIssue], 'status:blocked': [blockedOlder, blockedNewer] })),
			).not.toMatchObject({ action: 'advance' });
		}

		const decision = advanceQueue.queueAdvanceDecision(queryFor({ 'status:blocked': [blockedNewer, blockedOlder] }));

		expect(decision).toMatchObject({ action: 'advance', issue: { number: 2 } });
	});

	it('relabels the next blocked task and leaves traceability comment that triggers issue handoff', () => {
		const run = vi.fn();

		advanceQueue.advanceIssue(issue(2, 'status:blocked', '2026-05-05T19:01:00Z'), run);

		expect(run).toHaveBeenNthCalledWith(1, [
			'issue',
			'edit',
			'2',
			'--repo',
			'owner/repo',
			'--remove-label',
			'status:blocked',
			'--add-label',
			'status:queued',
		]);
		expect(run).toHaveBeenNthCalledWith(2, ['issue', 'comment', '2', '--repo', 'owner/repo', '--body', 'Queue advance: blocked → queued']);
	});

	it('halts without advancing when a post-merge exception leaves verification active', () => {
		const blocked = issue(3, 'status:blocked', '2026-05-05T19:02:00Z');
		const verifying = issue(1, 'status:post-merge-verify', '2026-05-05T19:00:00Z');
		const query = queryFor({ 'status:post-merge-verify': [verifying], 'status:blocked': [blocked] });
		const logs = [];
		const transitions = [];

		const failedTransition = syncPrState.syncPrState({
			prNumber: '42',
			action: 'post_merge_failure',
			pr: { body: '**Issue:** #1', mergedAt: '2026-05-05T19:05:00Z', state: 'MERGED', url: 'https://example.test/pr/42' },
			setStatusFn: (...args) => transitions.push(args),
		});

		const decision = advanceQueue.queueAdvanceDecision(query);
		advanceQueue.logDecision(decision, (message) => logs.push(message));

		expect(failedTransition).toBe('exception');
		expect(transitions).toEqual([]);
		expect(decision).toEqual({ action: 'halt_active' });
		expect(logs).toEqual(['halt: active']);
	});
});

describe('orchestrator workflow trigger compatibility', () => {
	it('uses status:queued labels for issue handoff and label changes for queue advancement', () => {
		const draftWorkflow = fs.readFileSync('.github/workflows/orchestrator-draft-pr.yml', 'utf8');
		const queueWorkflow = fs.readFileSync('.github/workflows/orchestrator-queue-advance.yml', 'utf8');
		const enforcePrOnlyWorkflow = fs.readFileSync('.github/workflows/enforce-pr-only.yml', 'utf8');
		const postMergeWorkflow = fs.readFileSync('.github/workflows/post-merge-intent-verification.yml', 'utf8');
		const postMergeValidatorScript = fs.readFileSync('scripts/ci/post_merge_validator.mjs', 'utf8');
		const ciOrchestrationWorkflow = fs.readFileSync('.github/workflows/ci-orchestration-engine.yml', 'utf8');
		const createIssuesScript = fs.readFileSync('scripts/orchestrator/create-issues.mjs', 'utf8');
		const createDraftPrScript = fs.readFileSync('scripts/orchestrator/create-draft-pr.mjs', 'utf8');
		const ciOrchestrationScript = fs.readFileSync('scripts/orchestrator/ci-orchestration-engine.mjs', 'utf8');

		expect(draftWorkflow).toContain('types: [opened, labeled]');
		expect(draftWorkflow).toContain("contains(github.event.issue.labels.*.name, 'status:queued')");
		expect(queueWorkflow).toContain('types: [labeled]');
		expect(queueWorkflow).toContain("node-version: '22'");
		expect(queueWorkflow).toContain("github.event.label.name == 'status:complete'");
		expect(queueWorkflow).toContain("github.event.label.name == 'status:failed'");
		expect(enforcePrOnlyWorkflow).toContain('commits/${GITHUB_SHA}/pulls');
		expect(postMergeWorkflow).toContain('node scripts/ci/post_merge_validator.mjs');
		expect(postMergeWorkflow).toContain('branches: [main]');
		expect(postMergeValidatorScript).toContain('/commits/${sha}/pulls');
		expect(ciOrchestrationWorkflow).toContain("node-version: '22'");
		expect(ciOrchestrationWorkflow).toContain('node scripts/orchestrator/ci-orchestration-engine.mjs');
		expect(ciOrchestrationScript).toContain('status:failed');
		expect(ciOrchestrationScript).toContain('lgfc-ci-phase:');
		expect(createIssuesScript).toContain('ensureLabels();');
		expect(createIssuesScript).toMatch(/['"]--state['"],\s*['"]all['"]/s);
		expect(createDraftPrScript).toContain('existingOpenPrForIssue(repo, issue.number)');
		expect(createDraftPrScript).toContain("issue.state !== 'OPEN'");
		expect(createDraftPrScript).toContain('no placeholder PR was created');
		expect(createDraftPrScript).not.toContain('orchestrator-placeholder-pr: true');
		expect(createDraftPrScript).not.toContain('commit --allow-empty');
	});
});
