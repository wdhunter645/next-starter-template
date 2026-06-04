/**
 * Determines when Post-Merge PR Body Closeout should run.
 */

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
