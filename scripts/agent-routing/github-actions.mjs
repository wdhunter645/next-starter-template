const ALLOWED_MUTATIONS = new Set([
  'set_labels',
  'post_comment',
  'rerun_failed_job',
  'merge_pr',
  'close_issue',
  'create_issue',
]);

export function validateMutation(mutation, liveState) {
  if (!mutation || !ALLOWED_MUTATIONS.has(mutation.type)) return { ok: false, reason: 'unsupported_mutation' };
  if (mutation.expectedRevision !== liveState.revision) return { ok: false, reason: 'state_revision_changed' };
  if (mutation.type === 'merge_pr' && mutation.base === 'main') return { ok: false, reason: 'automatic_main_merge_prohibited' };
  if (mutation.type === 'create_issue' && mutation.promoteToMain === true) {
    return { ok: false, reason: 'automatic_main_merge_prohibited' };
  }
  if (mutation.untrusted === true) return { ok: false, reason: 'untrusted_event' };
  return { ok: true, reason: 'authorized' };
}

export function prepareBoundedMutation(plan, mutation) {
  return { ...mutation, expectedRevision: mutation.expectedRevision || plan.expectedRevision, actionKey: plan.actionKey };
}
