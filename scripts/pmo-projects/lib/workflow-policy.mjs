/**
 * Pure policy helpers for the PMO project task-materializer workflow.
 * Keep mutation authorization decisions out of YAML-only conditionals so
 * they can be unit-tested.
 */

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

	// apply mode
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
