#!/usr/bin/env node
/**
 * Read-side adapter: extract cumulative lane evidence events from Issue
 * comments and resolve the authoritative (non-superseded) event per logical
 * slot. Work unit #2883 / parent #2678.
 */

export const EVENT_MARKER = '<!-- lgfc-cumulative-evidence:v1 -->';

function commentBody(comment) {
  return comment.body || comment.bodyText || '';
}

/**
 * @param {object[]} comments
 * @returns {{ commentId: string, author: string, createdAt: string, event: object }[]}
 */
export function parseCumulativeEvidenceEvents(comments = []) {
  const results = [];
  for (const comment of comments) {
    const body = commentBody(comment);
    const trimmed = body.trimStart();
    if (!trimmed.startsWith(EVENT_MARKER)) continue;

    const payload = trimmed.slice(EVENT_MARKER.length).trim();
    let event;
    try {
      event = JSON.parse(payload);
    } catch {
      // A malformed marker payload is never authoritative; skip it rather
      // than throw, so one bad comment cannot break the whole read path.
      continue;
    }
    if (!event || typeof event !== 'object') continue;

    results.push({
      commentId: String(comment.id ?? comment.databaseId ?? ''),
      author: comment.user?.login || comment.author?.login || '',
      createdAt: comment.created_at || comment.createdAt || '',
      event,
    });
  }

  results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  return results;
}

function slotKeyOf(event) {
  return `${event.sourceIssue}::${event.workUnitId}::${event.lane}`;
}

/**
 * Resolve the latest non-superseded event per logical slot
 * (sourceIssue + workUnitId + lane). An event is superseded if any other
 * parsed event's `supersedes` names its `idempotencyKey` — this holds for
 * multi-step supersession chains, not just a single correction.
 *
 * @param {{ commentId: string, createdAt: string, event: object }[]} parsedEvents
 * @returns {{ commentId: string, createdAt: string, event: object }[]}
 */
export function resolveAuthoritativeEventsBySlot(parsedEvents = []) {
  const superseded = new Set();
  for (const entry of parsedEvents) {
    if (entry.event?.supersedes) superseded.add(entry.event.supersedes);
  }

  const bySlot = new Map();
  for (const entry of parsedEvents) {
    const e = entry.event;
    if (!e || superseded.has(e.idempotencyKey)) continue;
    const key = slotKeyOf(e);
    const existing = bySlot.get(key);
    if (!existing || new Date(entry.createdAt) >= new Date(existing.createdAt)) {
      bySlot.set(key, entry);
    }
  }

  return [...bySlot.values()];
}

export { slotKeyOf };
