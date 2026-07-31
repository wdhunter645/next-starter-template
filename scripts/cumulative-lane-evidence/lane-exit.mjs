#!/usr/bin/env node
/**
 * Lane-exit evaluation over accumulated cumulative lane evidence.
 * Missing or invalid transition evidence blocks only lane exit; it never
 * blocks continued safe in-lane work. Work unit #2883 / parent #2678.
 */

import { validateCumulativeEvidenceEvent, EXIT_TRANSITIONS } from './validate-event.mjs';
import { resolveAuthoritativeEventsBySlot } from './adapters.mjs';

/**
 * @param {{
 *   sourceIssue: number,
 *   workUnitId: string,
 *   lane: string,
 *   parsedEvents: { commentId: string, createdAt: string, event: object }[],
 * }} params
 * @returns {{ canExit: boolean, blockedReasons: string[], exitEvent: object|null }}
 */
export function evaluateLaneExit({ sourceIssue, workUnitId, lane, parsedEvents = [] } = {}) {
  const targetKey = `${sourceIssue}::${workUnitId}::${lane}`;
  const authoritative = resolveAuthoritativeEventsBySlot(parsedEvents);
  const entry = authoritative.find(
    (candidate) =>
      `${candidate.event.sourceIssue}::${candidate.event.workUnitId}::${candidate.event.lane}` ===
      targetKey,
  );

  if (!entry) {
    return {
      canExit: false,
      blockedReasons: ['no_authoritative_event_for_lane'],
      exitEvent: null,
    };
  }

  const event = entry.event;
  if (!EXIT_TRANSITIONS.has(event.transition)) {
    return {
      canExit: false,
      blockedReasons: ['latest_authoritative_event_is_not_exit_or_closeout'],
      exitEvent: event,
    };
  }

  const validation = validateCumulativeEvidenceEvent(event, {});
  if (!validation.ok) {
    return { canExit: false, blockedReasons: validation.errors, exitEvent: event };
  }

  return { canExit: true, blockedReasons: [], exitEvent: event };
}
