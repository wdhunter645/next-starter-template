import { execFileSync } from 'node:child_process';

import {
	GENERATED_BLOCK_BEGIN,
	GENERATED_BLOCK_END,
	extractGeneratedBlock,
	extractTaskMarker,
	taskMarker,
	upsertGeneratedBlock,
} from './markers.mjs';
import { validateProjectManifest } from './validate-manifest.mjs';

function bulletList(items = []) {
	if (!items.length) return '- (none)';
	return items.map((item) => `- ${item}`).join('\n');
}

export function buildGeneratedTaskBlock(manifest, task) {
	const slug = manifest.project.slug;
	const marker = taskMarker(slug, task.id);
	const predecessors =
		(task.predecessors || []).map((id) => `#${manifest.tasks.find((t) => t.id === id)?.issueNumber || id}`).join(', ') ||
		'none';
	const successors =
		(task.successors || []).map((id) => `#${manifest.tasks.find((t) => t.id === id)?.issueNumber || id}`).join(', ') ||
		'none';

	return [
		GENERATED_BLOCK_BEGIN,
		marker,
		`Parent Project: #${manifest.project.issueNumber}`,
		manifest.project.parentIssueNumber
			? `Parent Program: #${manifest.project.parentIssueNumber}`
			: 'Parent Program: none',
		`Project Branch: \`${manifest.delivery.projectBranch}\``,
		`Task ID: ${task.id}`,
		`Task State: ${task.state}`,
		`Execution Agent: ${manifest.roles.executionAgent}`,
		`Wake Eligible: ${task.wakeEligible ? 'yes' : 'no'}`,
		`Predecessor: ${predecessors}`,
		`Successor: ${successors}`,
		`Delivery Model: Model ${manifest.delivery.model} child`,
		`Pull Request Base: \`${task.pullRequestBase}\``,
		`Production Auto-Merge: prohibited (delivery.autoMergeProduction=${manifest.delivery.autoMergeProduction})`,
		'',
		'## Objective',
		'',
		task.objective,
		'',
		'## Acceptance Criteria',
		'',
		bulletList(task.acceptanceCriteria),
		'',
		'## Verification',
		'',
		bulletList(task.verification),
		'',
		'## Stop Conditions',
		'',
		bulletList(task.stopConditions),
		'',
		'## Allowed Paths',
		'',
		bulletList(task.allowedPaths),
		'',
		'## Prohibited Paths',
		'',
		bulletList(task.prohibitedPaths),
		'',
		'## Manifest Linkage',
		'',
		`- Manifest: \`${manifest.project.manifestPath}\``,
		`- Design: \`${manifest.project.designPath}\``,
		`- Implementation plan: \`${manifest.project.implementationPlanPath}\``,
		`- Branch pattern: \`${task.branchPattern}\``,
		GENERATED_BLOCK_END,
	].join('\n');
}

export function buildCreateIssueBody(manifest, task) {
	const marker = taskMarker(manifest.project.slug, task.id);
	const generated = buildGeneratedTaskBlock(manifest, task);
	return [
		marker,
		'',
		generated,
		'',
		'## Human notes',
		'',
		'_Preserve operator discussion below this line. The materializer only owns the generated block above._',
		'',
	].join('\n');
}

export function desiredIssueTitle(manifest, task) {
	return `TASK: #${manifest.project.issueNumber}-${task.id} | ${task.title}`;
}

function labelsEqual(a = [], b = []) {
	const left = [...a].map(String).sort();
	const right = [...b].map(String).sort();
	if (left.length !== right.length) return false;
	return left.every((value, index) => value === right[index]);
}

function normalizeBodyForCompare(body = '') {
	return String(body).replace(/\r\n/g, '\n').trim();
}

/**
 * Pure planning step. Does not mutate GitHub.
 */
export function planMaterialization(manifest, issueIndex, options = {}) {
	const validation = validateProjectManifest(manifest, options);
	if (!validation.ok) {
		return {
			ok: false,
			validation,
			actions: [],
			blocked: true,
			summary: {
				create: 0,
				update: 0,
				'no-change': 0,
				blocked: 0,
				'adoption-candidate': 0,
			},
		};
	}

	const actions = [];
	const slug = manifest.project.slug;
	const byMarker = issueIndex.byMarker || new Map();
	const byNumber = issueIndex.byNumber || new Map();

	for (const task of manifest.tasks) {
		const marker = taskMarker(slug, task.id);
		const markerHits = byMarker.get(marker) || [];
		const generatedBlock = buildGeneratedTaskBlock(manifest, task);
		const desiredTitle = desiredIssueTitle(manifest, task);
		const desiredLabels = [...(task.labels || [])];

		if (markerHits.length > 1) {
			actions.push({
				taskId: task.id,
				action: 'blocked',
				reason: `duplicate stable markers found on issues ${markerHits.map((i) => `#${i.number}`).join(', ')}`,
				marker,
				issueNumber: null,
			});
			continue;
		}

		if (markerHits.length === 1) {
			const issue = markerHits[0];
			const nextBody = upsertGeneratedBlock(issue.body || '', marker, generatedBlock);
			const bodyChanged =
				normalizeBodyForCompare(nextBody) !== normalizeBodyForCompare(issue.body || '');
			const titleChanged = (issue.title || '') !== desiredTitle;
			const labelChanged = !labelsEqual(
				(issue.labels || []).map((l) => (typeof l === 'string' ? l : l.name)),
				desiredLabels,
			);

			if (!bodyChanged && !titleChanged && !labelChanged) {
				actions.push({
					taskId: task.id,
					action: 'no-change',
					issueNumber: issue.number,
					marker,
				});
			} else {
				actions.push({
					taskId: task.id,
					action: 'update',
					issueNumber: issue.number,
					marker,
					changes: {
						body: bodyChanged,
						title: titleChanged,
						labels: labelChanged,
					},
					nextBody,
					nextTitle: desiredTitle,
					nextLabels: desiredLabels,
				});
			}
			continue;
		}

		// No marker hit.
		if (task.issueNumber) {
			const existing = byNumber.get(task.issueNumber);
			if (!existing) {
				actions.push({
					taskId: task.id,
					action: 'blocked',
					reason: `manifest issueNumber #${task.issueNumber} was not found`,
					marker,
					issueNumber: task.issueNumber,
				});
				continue;
			}

			const existingMarker = extractTaskMarker(existing.body || '');
			if (!existingMarker) {
				actions.push({
					taskId: task.id,
					action: 'adoption-candidate',
					reason: `issue #${task.issueNumber} lacks stable marker ${marker}; explicit operator adoption required`,
					marker,
					issueNumber: task.issueNumber,
				});
				continue;
			}

			if (existingMarker.marker !== marker) {
				actions.push({
					taskId: task.id,
					action: 'blocked',
					reason: `issue #${task.issueNumber} carries conflicting marker ${existingMarker.marker}`,
					marker,
					issueNumber: task.issueNumber,
				});
				continue;
			}
		}

		actions.push({
			taskId: task.id,
			action: 'create',
			marker,
			issueNumber: null,
			nextBody: buildCreateIssueBody(manifest, task),
			nextTitle: desiredTitle,
			nextLabels: desiredLabels,
		});
	}

	const summary = {
		create: 0,
		update: 0,
		'no-change': 0,
		blocked: 0,
		'adoption-candidate': 0,
	};
	for (const action of actions) {
		summary[action.action] = (summary[action.action] || 0) + 1;
	}

	const blocked =
		summary.blocked > 0 ||
		summary['adoption-candidate'] > 0;

	return {
		ok: !blocked,
		validation,
		actions,
		blocked,
		summary,
	};
}

export function createGhIssueClient({
	repository,
	execFile = execFileSync,
	env = process.env,
} = {}) {
	if (!repository) {
		throw new Error('repository is required (owner/name)');
	}

	function runGh(args, { input } = {}) {
		return execFile('gh', args, {
			encoding: 'utf8',
			env,
			input,
			maxBuffer: 10 * 1024 * 1024,
		});
	}

	return {
		async listOpenIssues() {
			const raw = runGh([
				'issue',
				'list',
				'--repo',
				repository,
				'--state',
				'open',
				'--limit',
				'500',
				'--json',
				'number,title,body,labels,state',
			]);
			return JSON.parse(raw);
		},

		async getIssue(number) {
			const raw = runGh([
				'issue',
				'view',
				String(number),
				'--repo',
				repository,
				'--json',
				'number,title,body,labels,state',
			]);
			return JSON.parse(raw);
		},

		async createIssue({ title, body, labels }) {
			const args = [
				'issue',
				'create',
				'--repo',
				repository,
				'--title',
				title,
				'--body',
				body,
			];
			for (const label of labels || []) {
				args.push('--label', label);
			}
			const url = runGh(args).trim();
			const match = url.match(/\/issues\/(\d+)/);
			return {
				number: match ? Number(match[1]) : null,
				url,
			};
		},

		async updateIssue({ number, title, body, labels }) {
			const args = ['issue', 'edit', String(number), '--repo', repository];
			if (title) args.push('--title', title);
			if (body !== undefined) args.push('--body', body);
			if (labels) {
				// Replace label set by removing all then adding desired is not
				// available atomically via gh; apply additive then remove extras.
				for (const label of labels) {
					args.push('--add-label', label);
				}
			}
			runGh(args);

			if (labels) {
				const current = await this.getIssue(number);
				const currentNames = (current.labels || []).map((l) =>
					typeof l === 'string' ? l : l.name,
				);
				const desired = new Set(labels);
				for (const name of currentNames) {
					if (!desired.has(name)) {
						runGh([
							'issue',
							'edit',
							String(number),
							'--repo',
							repository,
							'--remove-label',
							name,
						]);
					}
				}
			}

			return { number };
		},
	};
}

export function indexIssues(issues = []) {
	const byMarker = new Map();
	const byNumber = new Map();

	for (const issue of issues) {
		byNumber.set(issue.number, issue);
		const markerInfo = extractTaskMarker(issue.body || '');
		if (!markerInfo) continue;
		const list = byMarker.get(markerInfo.marker) || [];
		list.push(issue);
		byMarker.set(markerInfo.marker, list);
	}

	return { byMarker, byNumber };
}

/**
 * Apply planned actions. Validation must already have passed and the plan must
 * not contain blocked/adoption-candidate rows.
 */
export async function applyMaterialization(plan, client, { dryRun = false } = {}) {
	if (!plan.validation?.ok) {
		throw new Error('Refusing apply: manifest validation failed');
	}
	if (plan.blocked) {
		throw new Error('Refusing apply: plan contains blocked or adoption-candidate actions');
	}

	const results = [];
	for (const action of plan.actions) {
		if (action.action === 'no-change') {
			results.push({ ...action, applied: false });
			continue;
		}

		if (dryRun) {
			results.push({ ...action, applied: false, dryRun: true });
			continue;
		}

		if (action.action === 'create') {
			const created = await client.createIssue({
				title: action.nextTitle,
				body: action.nextBody,
				labels: action.nextLabels,
			});
			results.push({
				...action,
				applied: true,
				issueNumber: created.number,
				url: created.url,
			});
			continue;
		}

		if (action.action === 'update') {
			await client.updateIssue({
				number: action.issueNumber,
				title: action.changes?.title ? action.nextTitle : undefined,
				body: action.changes?.body ? action.nextBody : undefined,
				labels: action.changes?.labels ? action.nextLabels : undefined,
			});
			results.push({ ...action, applied: true });
			continue;
		}

		results.push({ ...action, applied: false, skipped: true });
	}

	return results;
}

export function formatPlanReport(plan, { mode = 'dry-run' } = {}) {
	const lines = [];
	lines.push(`Mode: ${mode}`);
	lines.push(`Validation: ${plan.validation.ok ? 'PASS' : 'FAIL'}`);
	if (!plan.validation.ok) {
		for (const error of plan.validation.errors) {
			lines.push(`  ERROR ${error}`);
		}
	}
	lines.push(
		`Summary: create=${plan.summary.create} update=${plan.summary.update} no-change=${plan.summary['no-change']} blocked=${plan.summary.blocked} adoption-candidate=${plan.summary['adoption-candidate']}`,
	);
	for (const action of plan.actions) {
		const issue = action.issueNumber ? `#${action.issueNumber}` : '(new)';
		lines.push(
			`- task ${action.taskId}: ${action.action} ${issue}${action.reason ? ` — ${action.reason}` : ''}`,
		);
	}
	return lines.join('\n');
}

export { extractGeneratedBlock, taskMarker };
