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
	if (!prNumber) return '';
	return path.join(CLOSEOUT_BODY_DIR, `pr-${prNumber}-body.md`);
}

export function resolveCloseoutBodyApply({
	prNumber = '',
	automatic = false,
	bodyFile = '',
	skipBodyApply = false,
	workspace = process.cwd(),
} = {}) {
	const candidate = path.resolve(workspace, defaultCloseoutBodyPath(prNumber));
	if (automatic) {
		if (fs.existsSync(candidate)) {
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
