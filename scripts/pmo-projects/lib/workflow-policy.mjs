/**
 * Pure policy helpers for the PMO project task-materializer workflow.
 * Keep mutation authorization and event-to-manifest selection decisions out of
 * YAML-only conditionals so they can be unit-tested.
 */

const PROJECT_MANIFEST_PATTERN =
	/^docs\/ops\/implementation-plans\/[a-z0-9]+(?:-[a-z0-9]+)*\/project-manifest\.json$/;

export function normalizeMode(raw = 'dry-run') {
	const value = String(raw || 'dry-run').trim().toLowerCase();
	if (value === 'apply' || value === 'dry-run') return value;
	return null;
}

export function isTrustedRepositoryContext({
	eventName,
	repository,
	headRepository,
	pullRequest,
} = {}) {
	if (eventName === 'workflow_dispatch' || eventName === 'push') {
		return true;
	}

	if (eventName === 'pull_request' || eventName === 'pull_request_target') {
		if (pullRequest?.head?.repo?.fork === true) return false;
		if (
			headRepository &&
			repository &&
			String(headRepository).toLowerCase() !== String(repository).toLowerCase()
		) {
			return false;
		}
		return true;
	}

	return false;
}

/**
 * Decide whether issue mutation (apply) is allowed for this event.
 * Fail closed: any uncertainty returns allowed=false.
 */
export function resolveMaterializerAuthorization({
	eventName,
	mode,
	repository,
	headRepository,
	pullRequest,
	explicitApplyAuthorized = false,
} = {}) {
	const normalizedMode = normalizeMode(mode);
	if (!normalizedMode) {
		return {
			allowed: false,
			effectiveMode: 'dry-run',
			reason: 'invalid_mode',
			permissions: { contents: 'read', issues: 'read' },
		};
	}

	const trusted = isTrustedRepositoryContext({
		eventName,
		repository,
		headRepository,
		pullRequest,
	});

	if (normalizedMode === 'dry-run') {
		return {
			allowed: true,
			effectiveMode: 'dry-run',
			reason: 'dry_run',
			permissions: { contents: 'read', issues: 'read' },
		};
	}

	if (eventName === 'pull_request' || eventName === 'pull_request_target') {
		return {
			allowed: false,
			effectiveMode: 'dry-run',
			reason: 'apply_forbidden_on_pull_request',
			permissions: { contents: 'read', issues: 'read' },
		};
	}

	if (!trusted) {
		return {
			allowed: false,
			effectiveMode: 'dry-run',
			reason: 'untrusted_repository_context',
			permissions: { contents: 'read', issues: 'read' },
		};
	}

	if (eventName !== 'workflow_dispatch') {
		return {
			allowed: false,
			effectiveMode: 'dry-run',
			reason: 'apply_requires_workflow_dispatch',
			permissions: { contents: 'read', issues: 'read' },
		};
	}

	if (!explicitApplyAuthorized) {
		return {
			allowed: false,
			effectiveMode: 'dry-run',
			reason: 'apply_not_explicitly_authorized',
			permissions: { contents: 'read', issues: 'read' },
		};
	}

	return {
		allowed: true,
		effectiveMode: 'apply',
		reason: 'workflow_dispatch_apply_authorized',
		permissions: { contents: 'read', issues: 'write' },
	};
}

export function assertManifestPathSafe(manifestPath = '') {
	const value = String(manifestPath || '').trim();
	if (!value) {
		return { ok: false, reason: 'manifest_path_required' };
	}
	if (value.startsWith('/') || value.includes('..') || value.includes('\\')) {
		return { ok: false, reason: 'manifest_path_unsafe' };
	}
	if (!value.endsWith('project-manifest.json') && !value.endsWith('.json')) {
		return { ok: false, reason: 'manifest_path_must_be_json' };
	}
	return { ok: true, path: value };
}

export function assertProjectManifestPathSafe(manifestPath = '') {
	const basic = assertManifestPathSafe(manifestPath);
	if (!basic.ok) return basic;
	if (!PROJECT_MANIFEST_PATTERN.test(basic.path)) {
		return { ok: false, reason: 'manifest_path_not_canonical' };
	}
	return basic;
}

export function isZeroCommitSha(value = '') {
	return /^0{40}$/.test(String(value || '').trim());
}

function normalizeChangedFile(change) {
	if (typeof change === 'string') {
		return { status: 'M', path: change };
	}
	if (!change || typeof change !== 'object') return null;
	const status = String(change.status || 'M').trim().toUpperCase();
	const path = String(change.path || '').trim();
	if (!path) return null;
	return { status, path };
}

/**
 * Resolve the exact manifest set for a workflow event.
 *
 * Automatic events only validate manifests that actually changed. New branch
 * creation and script/workflow-only changes are successful no-op evaluations.
 * Manifest deletion fails closed and requires explicit operator disposition.
 */
export function resolveWorkflowManifestSelection({
	eventName,
	explicitManifestPath = '',
	changedFiles = [],
	beforeSha = '',
} = {}) {
	if (eventName === 'workflow_dispatch') {
		const pathCheck = assertProjectManifestPathSafe(explicitManifestPath);
		if (!pathCheck.ok) {
			return {
				ok: false,
				skip: false,
				reason: pathCheck.reason,
				paths: [],
				deletedPaths: [],
			};
		}
		return {
			ok: true,
			skip: false,
			reason: 'explicit_manifest',
			paths: [pathCheck.path],
			deletedPaths: [],
		};
	}

	if (!['push', 'pull_request', 'pull_request_target'].includes(eventName)) {
		return {
			ok: false,
			skip: false,
			reason: 'unsupported_event',
			paths: [],
			deletedPaths: [],
		};
	}

	if (eventName === 'push' && isZeroCommitSha(beforeSha)) {
		return {
			ok: true,
			skip: true,
			reason: 'new_branch_no_manifest_delta',
			paths: [],
			deletedPaths: [],
		};
	}

	const selected = new Set();
	const deleted = new Set();

	for (const raw of changedFiles) {
		const change = normalizeChangedFile(raw);
		if (!change) continue;
		const pathCheck = assertProjectManifestPathSafe(change.path);
		if (!pathCheck.ok) continue;
		if (change.status.startsWith('D')) {
			deleted.add(pathCheck.path);
		} else {
			selected.add(pathCheck.path);
		}
	}

	if (deleted.size > 0) {
		return {
			ok: false,
			skip: false,
			reason: 'manifest_deleted',
			paths: [],
			deletedPaths: [...deleted].sort(),
		};
	}

	const paths = [...selected].sort();
	if (paths.length === 0) {
		return {
			ok: true,
			skip: true,
			reason: 'no_changed_manifest',
			paths: [],
			deletedPaths: [],
		};
	}

	return {
		ok: true,
		skip: false,
		reason: 'changed_manifests',
		paths,
		deletedPaths: [],
	};
}
