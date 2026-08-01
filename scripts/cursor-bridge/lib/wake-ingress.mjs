/**
 * Cursor-only wake / packet-ingress routing (#2997).
 *
 * Canonical mechanical predicate for whether a trusted repository event may
 * enter the Chromebook Cursor Local Bridge queue. Semantic task readiness is
 * evaluated later by Cursor — this module only answers "is this Cursor-routed?".
 *
 * `.github/workflows/cursor-local-wake.yml` must stay aligned with
 * `shouldDeliverCursorWake`. Claude Code / ChatGPT wakes use separate paths
 * and must never write Chromebook Bridge packets.
 */

export const CURSOR_AGENT_LABEL = 'agent:cursor';
export const CURSOR_HANDOFF_LABEL = 'handoff:ready';
export const CURSOR_RESUME_PREFIX = 'LOCAL CURSOR RESUME';

/** Agent labels that route work away from Cursor Local. */
export const NON_CURSOR_AGENT_LABELS = Object.freeze([
  'agent:ChatGPT',
  'agent:chatgpt',
  'agent:claude',
  'agent:Claude',
  'agent:codex',
  'agent:copilot',
  'agent:atlas',
  'agent:Atlas',
]);

/**
 * Comment body prefixes that are directed at non-Cursor agents / lanes.
 * These must not create Chromebook Bridge wake packets.
 */
export const NON_CURSOR_COMMENT_PREFIXES = Object.freeze([
  'CHATGPT HANDOFF',
  'CLAUDE CODE RESUME',
  'CLAUDE CODE WAKE',
  'CLAUDE CODE HANDOFF',
]);

function normalizeLabels(labels) {
  if (!Array.isArray(labels)) return [];
  return labels.map((l) => (typeof l === 'string' ? l : l?.name)).filter(Boolean);
}

function commentStartsWith(body, prefix) {
  const text = String(body || '').replace(/^\uFEFF/, '').trimStart();
  return text.startsWith(prefix);
}

/**
 * Positive Cursor routing signal on a live Issue.
 * Labels alone or an equivalent Cursor resume marker establish routing.
 */
export function hasCursorRoutingSignal({ labels = [], commentBody = '' } = {}) {
  const names = normalizeLabels(labels);
  if (names.includes(CURSOR_AGENT_LABEL)) return true;
  if (commentStartsWith(commentBody, CURSOR_RESUME_PREFIX)) return true;
  return false;
}

/**
 * True when the event is directed at ChatGPT/Atlas, Claude, or another
 * non-Cursor agent without a positive Cursor routing signal — or when the
 * comment marker itself belongs to a non-Cursor wake lane.
 */
export function isNonCursorDirectedTraffic({ labels = [], commentBody = '' } = {}) {
  const names = normalizeLabels(labels);
  const hasCursor = names.includes(CURSOR_AGENT_LABEL);
  const hasNonCursorAgent = names.some((name) => NON_CURSOR_AGENT_LABELS.includes(name));
  if (hasNonCursorAgent && !hasCursor) return true;

  for (const prefix of NON_CURSOR_COMMENT_PREFIXES) {
    if (commentStartsWith(commentBody, prefix)) return true;
  }
  return false;
}

/**
 * Decide whether cursor-local-wake may write a Chromebook Bridge packet.
 *
 * @param {object} event
 * @returns {{ deliver: boolean, reason: string }}
 */
export function shouldDeliverCursorWake(event = {}) {
  const expectedRepo = event.expectedRepo || 'wdhunter645/next-starter-template';
  if (event.repository !== expectedRepo) {
    return { deliver: false, reason: 'untrusted_repository' };
  }

  const labels = normalizeLabels(event.issueLabels);
  const commentBody = event.commentBody || '';

  if (isNonCursorDirectedTraffic({ labels, commentBody })) {
    return { deliver: false, reason: 'non_cursor_directed_traffic' };
  }

  if (event.eventName === 'workflow_dispatch') {
    if (event.actor !== 'wdhunter645') {
      return { deliver: false, reason: 'dispatch_actor_not_authorized' };
    }
    if (!labels.includes(CURSOR_AGENT_LABEL)) {
      return { deliver: false, reason: 'absent_cursor_routing' };
    }
    return { deliver: true, reason: 'manual_dispatch_cursor_routed' };
  }

  if (event.eventName === 'issues') {
    if (event.action !== 'labeled' || event.labelName !== CURSOR_HANDOFF_LABEL) {
      return { deliver: false, reason: 'unrelated_issue_label_event' };
    }
    if (!labels.includes(CURSOR_AGENT_LABEL)) {
      return { deliver: false, reason: 'absent_cursor_routing' };
    }
    return { deliver: true, reason: 'handoff_ready_on_cursor_issue' };
  }

  if (event.eventName === 'issue_comment') {
    const state = String(event.issueState || '').toLowerCase();
    if (state !== 'open') {
      return { deliver: false, reason: 'source_issue_not_open' };
    }
    if (!commentStartsWith(commentBody, CURSOR_RESUME_PREFIX)) {
      return { deliver: false, reason: 'not_cursor_resume_marker' };
    }
    if (!labels.includes(CURSOR_AGENT_LABEL) || !labels.includes(CURSOR_HANDOFF_LABEL)) {
      return { deliver: false, reason: 'absent_cursor_routing' };
    }
    return { deliver: true, reason: 'local_cursor_resume' };
  }

  return { deliver: false, reason: 'unrelated_github_traffic' };
}
