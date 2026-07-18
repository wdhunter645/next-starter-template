import { resolveRepositoryState } from './state-resolver.mjs';
import { planAction } from './action-planner.mjs';

const SUPPORTED_EVENTS = new Set(['issues', 'issue_comment', 'pull_request', 'pull_request_review', 'pull_request_review_comment', 'workflow_run', 'workflow_dispatch', 'schedule']);

export function evaluateControllerEvent({ eventName, trusted, input, policy = {} }) {
  const snapshot = resolveRepositoryState(input);
  if (!SUPPORTED_EVENTS.has(eventName)) {
    return { ok: false, apply: false, snapshot, plan: { class: 'halt', reason: 'unsupported_event', mutations: [], expectedRevision: snapshot.revision } };
  }
  if (!trusted) {
    return { ok: false, apply: false, snapshot, plan: { class: 'halt', reason: 'untrusted_event', mutations: [], expectedRevision: snapshot.revision } };
  }
  const plan = planAction(snapshot, policy);
  const apply = !['disabled', 'observe'].includes(policy.mode || 'observe') && plan.mutations.length > 0;
  return { ok: plan.class !== 'halt', apply, snapshot, plan };
}
