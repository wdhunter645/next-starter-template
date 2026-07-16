import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const SCHEMA_PATH = path.resolve(
	__dirname,
	'..',
	'project-manifest.schema.json',
);

const ALLOWED_TOP_LEVEL = new Set([
	'schemaVersion',
	'project',
	'roles',
	'delivery',
	'launch',
	'deliverables',
	'tasks',
	'validation',
	'closeout',
]);

const PROJECT_REQUIRED = [
	'issueNumber',
	'slug',
	'title',
	'parentIssueNumber',
	'lifecycle',
	'priorityLabel',
	'objective',
	'completedDeliverable',
	'designPath',
	'implementationPlanPath',
	'manifestPath',
];

const TASK_REQUIRED = [
	'id',
	'title',
	'objective',
	'state',
	'predecessors',
	'successors',
	'parallelGroup',
	'branchPattern',
	'pullRequestBase',
	'allowedPaths',
	'prohibitedPaths',
	'acceptanceCriteria',
	'verification',
	'stopConditions',
	'labels',
	'wakeEligible',
];

function isPlainObject(value) {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function pushError(errors, pathLabel, message) {
	errors.push(`${pathLabel}: ${message}`);
}

function assertPositiveInt(errors, pathLabel, value, { allowNull = false } = {}) {
	if (allowNull && value === null) return;
	if (!Number.isInteger(value) || value < 1) {
		pushError(errors, pathLabel, 'must be a positive integer');
	}
}

function assertNonEmptyString(errors, pathLabel, value) {
	if (typeof value !== 'string' || value.trim().length === 0) {
		pushError(errors, pathLabel, 'must be a non-empty string');
	}
}

function assertStringArray(errors, pathLabel, value, { minItems = 0 } = {}) {
	if (!Array.isArray(value)) {
		pushError(errors, pathLabel, 'must be an array of strings');
		return;
	}
	if (value.length < minItems) {
		pushError(errors, pathLabel, `must contain at least ${minItems} item(s)`);
	}
	value.forEach((item, index) => {
		if (typeof item !== 'string' || item.trim().length === 0) {
			pushError(errors, `${pathLabel}[${index}]`, 'must be a non-empty string');
		}
	});
}

function detectCycle(tasksById) {
	const visiting = new Set();
	const visited = new Set();
	const stack = [];

	function dfs(id) {
		if (visiting.has(id)) {
			return [...stack, id];
		}
		if (visited.has(id)) return null;
		visiting.add(id);
		stack.push(id);
		const task = tasksById.get(id);
		for (const successor of task?.successors || []) {
			const cycle = dfs(successor);
			if (cycle) return cycle;
		}
		stack.pop();
		visiting.delete(id);
		visited.add(id);
		return null;
	}

	for (const id of tasksById.keys()) {
		const cycle = dfs(id);
		if (cycle) return cycle;
	}
	return null;
}

/**
 * Deterministic PMO project-manifest validator.
 * Fail-closed: any invariant violation returns ok=false with explicit paths.
 */
export function validateProjectManifest(manifest, options = {}) {
	const errors = [];
	const { strictUnknownFields = true } = options;

	if (!isPlainObject(manifest)) {
		return {
			ok: false,
			errors: ['$: manifest must be a JSON object'],
			warnings: [],
		};
	}

	if (strictUnknownFields) {
		for (const key of Object.keys(manifest)) {
			if (!ALLOWED_TOP_LEVEL.has(key)) {
				pushError(errors, key, 'unknown top-level field (strict mode)');
			}
		}
	}

	if (manifest.schemaVersion !== 1) {
		pushError(errors, 'schemaVersion', 'must equal 1');
	}

	if (!isPlainObject(manifest.project)) {
		pushError(errors, 'project', 'must be an object');
	} else {
		for (const key of PROJECT_REQUIRED) {
			if (!(key in manifest.project)) {
				pushError(errors, `project.${key}`, 'required field is missing');
			}
		}
		assertPositiveInt(errors, 'project.issueNumber', manifest.project.issueNumber);
		assertNonEmptyString(errors, 'project.slug', manifest.project.slug);
		if (
			typeof manifest.project.slug === 'string' &&
			!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.project.slug)
		) {
			pushError(errors, 'project.slug', 'must be lowercase kebab-case');
		}
		assertNonEmptyString(errors, 'project.title', manifest.project.title);
		assertPositiveInt(errors, 'project.parentIssueNumber', manifest.project.parentIssueNumber, {
			allowNull: true,
		});
		if (!['pipeline', 'active', 'closed'].includes(manifest.project.lifecycle)) {
			pushError(errors, 'project.lifecycle', 'must be pipeline|active|closed');
		}
		assertNonEmptyString(errors, 'project.priorityLabel', manifest.project.priorityLabel);
		if (
			typeof manifest.project.priorityLabel === 'string' &&
			!manifest.project.priorityLabel.startsWith('pmo:priority:')
		) {
			pushError(errors, 'project.priorityLabel', 'must start with pmo:priority:');
		}
		assertNonEmptyString(errors, 'project.objective', manifest.project.objective);
		assertNonEmptyString(
			errors,
			'project.completedDeliverable',
			manifest.project.completedDeliverable,
		);
		assertNonEmptyString(errors, 'project.designPath', manifest.project.designPath);
		assertNonEmptyString(
			errors,
			'project.implementationPlanPath',
			manifest.project.implementationPlanPath,
		);
		assertNonEmptyString(errors, 'project.manifestPath', manifest.project.manifestPath);
	}

	if (!isPlainObject(manifest.roles)) {
		pushError(errors, 'roles', 'must be an object');
	} else {
		const roles = manifest.roles;
		assertNonEmptyString(errors, 'roles.preparationOwner', roles.preparationOwner);
		assertNonEmptyString(errors, 'roles.executionAgent', roles.executionAgent);
		assertStringArray(errors, 'roles.operationsOwner', roles.operationsOwner, { minItems: 1 });
		assertNonEmptyString(errors, 'roles.tier2Escalation', roles.tier2Escalation);
		assertNonEmptyString(errors, 'roles.productAuthority', roles.productAuthority);
		assertStringArray(errors, 'roles.productionApprovers', roles.productionApprovers, {
			minItems: 1,
		});

		if (roles.preparationOwner && roles.preparationOwner !== 'chatgpt-atlas') {
			pushError(
				errors,
				'roles.preparationOwner',
				'must be chatgpt-atlas unless an explicit source-issue exception is recorded',
			);
		}
		if (roles.executionAgent && roles.executionAgent !== 'cursor-local') {
			pushError(
				errors,
				'roles.executionAgent',
				'must be cursor-local for repository implementation/operations projects',
			);
		}
		if (
			Array.isArray(roles.productionApprovers) &&
			roles.productionApprovers.includes('cursor-local')
		) {
			pushError(errors, 'roles.productionApprovers', 'Cursor cannot be a production approver');
		}
		if (
			Array.isArray(roles.productionApprovers) &&
			!roles.productionApprovers.some((a) => a === 'bill' || a === 'chatgpt-atlas')
		) {
			pushError(
				errors,
				'roles.productionApprovers',
				'must include at least one of bill or chatgpt-atlas',
			);
		}
	}

	if (!isPlainObject(manifest.delivery)) {
		pushError(errors, 'delivery', 'must be an object');
	} else {
		const delivery = manifest.delivery;
		if (!['A', 'B'].includes(delivery.model)) {
			pushError(errors, 'delivery.model', 'must be A or B');
		}
		if (delivery.autoMergeProduction !== false) {
			pushError(
				errors,
				'delivery.autoMergeProduction',
				'must be false (automatic merge to production/main is prohibited)',
			);
		}
		assertNonEmptyString(errors, 'delivery.productionBase', delivery.productionBase);
		if (delivery.productionBase && delivery.productionBase !== 'main') {
			pushError(
				errors,
				'delivery.productionBase',
				'must equal main unless repository authority names another protected production branch',
			);
		}
		if (delivery.promotionApproval !== 'bill-or-chatgpt') {
			pushError(errors, 'delivery.promotionApproval', 'must equal bill-or-chatgpt');
		}
		assertNonEmptyString(errors, 'delivery.rollbackProfile', delivery.rollbackProfile);
		assertNonEmptyString(
			errors,
			'delivery.childPullRequestBase',
			delivery.childPullRequestBase,
		);
		assertNonEmptyString(
			errors,
			'delivery.promotionPullRequestBase',
			delivery.promotionPullRequestBase,
		);

		if (delivery.model === 'B') {
			if (typeof delivery.projectBranch !== 'string' || !delivery.projectBranch.trim()) {
				pushError(errors, 'delivery.projectBranch', 'required for Model B');
			} else if (delivery.projectBranch === 'main') {
				pushError(
					errors,
					'delivery.projectBranch',
					'must not equal main (Model B project branch is non-production)',
				);
			}
			if (
				typeof delivery.projectBranch === 'string' &&
				delivery.childPullRequestBase !== delivery.projectBranch
			) {
				pushError(
					errors,
					'delivery.childPullRequestBase',
					'must equal delivery.projectBranch for Model B',
				);
			}
			if (delivery.autoIntegrateNonMain === true && delivery.projectBranch === 'main') {
				pushError(
					errors,
					'delivery.autoIntegrateNonMain',
					'cannot be true when projectBranch is production/main',
				);
			}
		}

		if (
			delivery.promotionPullRequestBase &&
			delivery.productionBase &&
			delivery.promotionPullRequestBase !== delivery.productionBase
		) {
			pushError(
				errors,
				'delivery.promotionPullRequestBase',
				'must equal delivery.productionBase',
			);
		}

		if (delivery.autoIntegrateNonMain === true && delivery.autoMergeProduction !== false) {
			pushError(
				errors,
				'delivery',
				'autoIntegrateNonMain cannot coexist with production auto-merge',
			);
		}
	}

	if (!isPlainObject(manifest.launch)) {
		pushError(errors, 'launch', 'must be an object');
	} else {
		const launch = manifest.launch;
		if (!['prepared', 'launched', 'held', 'complete'].includes(launch.state)) {
			pushError(errors, 'launch.state', 'must be prepared|launched|held|complete');
		}
		assertPositiveInt(errors, 'launch.authorizationIssueNumber', launch.authorizationIssueNumber);
		assertStringArray(errors, 'launch.startConditions', launch.startConditions);
		assertStringArray(errors, 'launch.blockingConditions', launch.blockingConditions);
		if (typeof launch.continuousExecution !== 'boolean') {
			pushError(errors, 'launch.continuousExecution', 'must be boolean');
		}
		if (typeof launch.requiresNewPromptBetweenTasks !== 'boolean') {
			pushError(errors, 'launch.requiresNewPromptBetweenTasks', 'must be boolean');
		}
		if (
			launch.continuousExecution === true &&
			(!Array.isArray(manifest.tasks) || manifest.tasks.length === 0)
		) {
			pushError(
				errors,
				'launch.continuousExecution',
				'may be true only when a validated task graph exists',
			);
		}
		if (
			launch.state === 'launched' &&
			launch.continuousExecution === true &&
			launch.requiresNewPromptBetweenTasks !== false
		) {
			pushError(
				errors,
				'launch.requiresNewPromptBetweenTasks',
				'must be false for launched continuous-execution projects',
			);
		}
	}

	if (!Array.isArray(manifest.deliverables) || manifest.deliverables.length === 0) {
		pushError(errors, 'deliverables', 'must be a non-empty array');
	} else {
		const deliverableIds = new Set();
		manifest.deliverables.forEach((item, index) => {
			const base = `deliverables[${index}]`;
			if (!isPlainObject(item)) {
				pushError(errors, base, 'must be an object');
				return;
			}
			assertNonEmptyString(errors, `${base}.id`, item.id);
			if (item.id) {
				if (deliverableIds.has(item.id)) {
					pushError(errors, `${base}.id`, `duplicate deliverable id ${item.id}`);
				}
				deliverableIds.add(item.id);
			}
			if (
				!['runtime', 'documentation', 'test-evidence', 'operations', 'closeout'].includes(
					item.type,
				)
			) {
				pushError(errors, `${base}.type`, 'invalid deliverable type');
			}
			assertNonEmptyString(errors, `${base}.description`, item.description);
			if (typeof item.required !== 'boolean') {
				pushError(errors, `${base}.required`, 'must be boolean');
			}
			assertNonEmptyString(errors, `${base}.acceptanceEvidence`, item.acceptanceEvidence);
		});

		if (manifest.delivery?.model === 'B') {
			const hasOpsOrCloseout = manifest.deliverables.some(
				(d) => d && (d.type === 'operations' || d.type === 'closeout'),
			);
			if (!hasOpsOrCloseout) {
				pushError(
					errors,
					'deliverables',
					'Model B projects require at least one operations or closeout deliverable',
				);
			}
		}
	}

	const tasksById = new Map();
	if (!Array.isArray(manifest.tasks) || manifest.tasks.length === 0) {
		pushError(errors, 'tasks', 'must be a non-empty array');
	} else {
		manifest.tasks.forEach((task, index) => {
			const base = `tasks[${index}]`;
			if (!isPlainObject(task)) {
				pushError(errors, base, 'must be an object');
				return;
			}
			for (const key of TASK_REQUIRED) {
				if (!(key in task)) {
					pushError(errors, `${base}.${key}`, 'required field is missing');
				}
			}
			assertNonEmptyString(errors, `${base}.id`, task.id);
			if (task.id) {
				if (tasksById.has(task.id)) {
					pushError(errors, `${base}.id`, `duplicate task id ${task.id}`);
				} else {
					tasksById.set(task.id, task);
				}
			}
			if ('issueNumber' in task && task.issueNumber !== undefined) {
				assertPositiveInt(errors, `${base}.issueNumber`, task.issueNumber);
			}
			assertNonEmptyString(errors, `${base}.title`, task.title);
			assertNonEmptyString(errors, `${base}.objective`, task.objective);
			if (!['active', 'prepared', 'held', 'complete'].includes(task.state)) {
				pushError(errors, `${base}.state`, 'must be active|prepared|held|complete');
			}
			assertStringArray(errors, `${base}.predecessors`, task.predecessors);
			assertStringArray(errors, `${base}.successors`, task.successors);
			assertNonEmptyString(errors, `${base}.branchPattern`, task.branchPattern);
			assertNonEmptyString(errors, `${base}.pullRequestBase`, task.pullRequestBase);
			assertStringArray(errors, `${base}.allowedPaths`, task.allowedPaths);
			assertStringArray(errors, `${base}.prohibitedPaths`, task.prohibitedPaths);
			assertStringArray(errors, `${base}.acceptanceCriteria`, task.acceptanceCriteria, {
				minItems: 1,
			});
			assertStringArray(errors, `${base}.verification`, task.verification, { minItems: 1 });
			assertStringArray(errors, `${base}.stopConditions`, task.stopConditions, {
				minItems: 1,
			});
			assertStringArray(errors, `${base}.labels`, task.labels);
			if (typeof task.wakeEligible !== 'boolean') {
				pushError(errors, `${base}.wakeEligible`, 'must be boolean');
			}

			if (task.pullRequestBase === 'main') {
				pushError(
					errors,
					`${base}.pullRequestBase`,
					'no task may use main as an automatic-integration base',
				);
			}

			if (
				manifest.delivery?.model === 'B' &&
				manifest.delivery?.projectBranch &&
				task.pullRequestBase &&
				task.pullRequestBase !== manifest.delivery.projectBranch
			) {
				pushError(
					errors,
					`${base}.pullRequestBase`,
					'must equal delivery.projectBranch for Model B',
				);
			}

			if (
				task.wakeEligible === true &&
				!['active'].includes(task.state) &&
				manifest.launch?.state !== 'launched'
			) {
				// wakeEligible may be true only when executable now; prepared/held/pipeline deny it
			}

			if (['prepared', 'held'].includes(task.state) && task.wakeEligible === true) {
				pushError(
					errors,
					`${base}.wakeEligible`,
					'may be true only when the task is executable now',
				);
			}

			if (
				(manifest.project?.lifecycle === 'pipeline' ||
					['prepared', 'held'].includes(task.state)) &&
				Array.isArray(task.labels) &&
				task.labels.includes('handoff:ready')
			) {
				pushError(
					errors,
					`${base}.labels`,
					'pipeline/prepared/held tasks must not include handoff:ready',
				);
			}

			if (
				manifest.launch?.state !== 'launched' &&
				Array.isArray(task.labels) &&
				task.labels.includes('handoff:ready')
			) {
				pushError(
					errors,
					`${base}.labels`,
					'pipeline projects must not generate handoff:ready',
				);
			}
		});

		for (const [id, task] of tasksById.entries()) {
			for (const pred of task.predecessors || []) {
				if (!tasksById.has(pred)) {
					pushError(errors, `tasks[${id}].predecessors`, `unresolved predecessor ${pred}`);
				}
			}
			for (const succ of task.successors || []) {
				if (!tasksById.has(succ)) {
					pushError(errors, `tasks[${id}].successors`, `unresolved successor ${succ}`);
				}
			}
		}

		const roots = [...tasksById.values()].filter(
			(task) => !task.predecessors || task.predecessors.length === 0,
		);
		if (tasksById.size > 0 && roots.length === 0) {
			pushError(errors, 'tasks', 'at least one task must have no predecessors');
		}

		const terminals = [...tasksById.values()].filter(
			(task) => !task.successors || task.successors.length === 0,
		);
		if (tasksById.size > 0 && terminals.length !== 1) {
			pushError(
				errors,
				'tasks',
				`exactly one terminal task is required (found ${terminals.length})`,
			);
		}

		if (
			terminals.length === 1 &&
			manifest.closeout?.terminalTaskId &&
			terminals[0].id !== manifest.closeout.terminalTaskId
		) {
			pushError(
				errors,
				`tasks[${terminals[0].id}]`,
				'terminal task must equal closeout.terminalTaskId',
			);
		}

		for (const task of tasksById.values()) {
			const isTerminal = !task.successors || task.successors.length === 0;
			if (!isTerminal && task.successors.length < 1) {
				pushError(
					errors,
					`tasks[${task.id}].successors`,
					'every non-terminal task must have at least one successor',
				);
			}
		}

		const cycle = detectCycle(tasksById);
		if (cycle) {
			pushError(errors, 'tasks', `dependency cycle detected: ${cycle.join(' -> ')}`);
		}

		const wakeEligible = [...tasksById.values()].filter((task) => task.wakeEligible === true);
		if (manifest.project?.lifecycle === 'pipeline' && wakeEligible.length > 0) {
			pushError(
				errors,
				'tasks',
				'pipeline projects must not mark tasks wakeEligible',
			);
		}
	}

	if (!isPlainObject(manifest.validation)) {
		pushError(errors, 'validation', 'must be an object');
	} else {
		assertNonEmptyString(errors, 'validation.manifestCommand', manifest.validation.manifestCommand);
		assertNonEmptyString(
			errors,
			'validation.materializeDryRunCommand',
			manifest.validation.materializeDryRunCommand,
		);
		assertStringArray(errors, 'validation.requiredProfiles', manifest.validation.requiredProfiles);
		assertStringArray(
			errors,
			'validation.projectIntegrationChecks',
			manifest.validation.projectIntegrationChecks,
		);
		assertStringArray(
			errors,
			'validation.productionPromotionChecks',
			manifest.validation.productionPromotionChecks,
		);
	}

	if (!isPlainObject(manifest.closeout)) {
		pushError(errors, 'closeout', 'must be an object');
	} else {
		assertNonEmptyString(errors, 'closeout.terminalTaskId', manifest.closeout.terminalTaskId);
		if (
			manifest.closeout.terminalTaskId &&
			tasksById.size > 0 &&
			!tasksById.has(manifest.closeout.terminalTaskId)
		) {
			pushError(
				errors,
				'closeout.terminalTaskId',
				`does not resolve to a task id (${manifest.closeout.terminalTaskId})`,
			);
		}
		if (manifest.closeout.finalReview !== 'bill-or-chatgpt') {
			pushError(errors, 'closeout.finalReview', 'must equal bill-or-chatgpt');
		}
		if (typeof manifest.closeout.productionVerificationRequired !== 'boolean') {
			pushError(errors, 'closeout.productionVerificationRequired', 'must be boolean');
		}
		assertStringArray(errors, 'closeout.operationsOwner', manifest.closeout.operationsOwner, {
			minItems: 1,
		});
		assertNonEmptyString(errors, 'closeout.tier2Escalation', manifest.closeout.tier2Escalation);
		assertNonEmptyString(errors, 'closeout.rollbackReference', manifest.closeout.rollbackReference);
	}

	return {
		ok: errors.length === 0,
		errors,
		warnings: [],
		taskCount: tasksById.size,
		terminalTaskId: manifest.closeout?.terminalTaskId ?? null,
	};
}

export function loadManifestFile(manifestPath, { cwd = process.cwd() } = {}) {
	const resolved = path.isAbsolute(manifestPath)
		? manifestPath
		: path.resolve(cwd, manifestPath);
	if (!fs.existsSync(resolved)) {
		throw new Error(`Manifest file not found: ${resolved}`);
	}
	let parsed;
	try {
		parsed = JSON.parse(fs.readFileSync(resolved, 'utf8'));
	} catch (error) {
		throw new Error(`Manifest JSON parse failed: ${error.message}`);
	}
	return { path: resolved, manifest: parsed };
}

export function readSchemaDocument() {
	return JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
}
