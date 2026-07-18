/**
 * Determines when automatic and manual post-merge closeout should run.
 * Automatic merge closeout is owned by `.github/workflows/post-merge-closeout.yml`
 * (`Post-Merge Detection`). Manual and batch backfill remain on
 * `post-merge-pr-body-closeout.yml`.
 */

import fs from 'node:fs';
import path from 'node:path';

export const CLOSEOUT_BODY_DIR = 'scripts/ci/post-merge-closeout';

export function defaultCloseoutBodyPath(prNumber) {
	if (prNumber === undefined || prNumber === null || prNumber === '') return '';
	const normalized = String(prNumber).trim();
	if (!normalized || normalized === '0') return '';
	return path.join(CLOSEOUT_BODY_DIR, `pr-${normalized}-body.md`);
}

/**
 * Resolve a default closeout body path only when it is a real file under workspace.
 * Empty/missing prNumber must never resolve to the workspace directory itself
 * (`path.resolve(workspace, '')` === workspace).
 */
export function resolveExistingCloseoutBodyFile(prNumber, workspace = process.cwd()) {
	const relativePath = defaultCloseoutBodyPath(prNumber);
	if (!relativePath) return '';
	const candidate = path.resolve(workspace, relativePath);
	try {
		if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
			return candidate;
		}
	} catch {
		return '';
	}
	return '';
}

export function resolveCloseoutBodyApply({
	prNumber = '',
	automatic = false,
	bodyFile = '',
	skipBodyApply = false,
	workspace = process.cwd(),
} = {}) {
	if (automatic) {
		const candidate = resolveExistingCloseoutBodyFile(prNumber, workspace);
		if (candidate) {
			return { bodyFile: candidate, skipBodyApply: false };
		}
		return { bodyFile: '', skipBodyApply: true };
	}
	return {
		bodyFile: bodyFile ? path.resolve(workspace, bodyFile) : '',
		skipBodyApply: skipBodyApply === true || skipBodyApply === 'true',
	};
}

export function shouldRunAutomaticCloseout({
	eventName = '',
	merged = false,
	baseRef = '',
} = {}) {
	return (
		eventName === 'pull_request_target' &&
		String(merged) === 'true' &&
		baseRef === 'main'
	);
}

export function isManualBatchCloseout({ eventName = '', runBatch = false } = {}) {
	return eventName === 'workflow_dispatch' && String(runBatch) === 'true';
}

export function isManualSingleCloseout({ eventName = '', runBatch = false } = {}) {
	return eventName === 'workflow_dispatch' && String(runBatch) !== 'true';
}

export function shouldRunCloseoutJob({
	eventName = '',
	merged = false,
	baseRef = '',
} = {}) {
	return shouldRunAutomaticCloseout({ eventName, merged, baseRef }) || eventName === 'workflow_dispatch';
}
