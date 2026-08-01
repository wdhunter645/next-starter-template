#!/usr/bin/env node
/**
 * Idempotent ingestion and supersession for workflow-health envelopes.
 * Pure append-only merge — never mutates execution authority, never deletes
 * history. Work unit #2887 / parent #2680.
 */

import { validateEnvelope } from './envelope.mjs';

/**
 * Merge incoming envelopes into an existing event store.
 *
 * Rules:
 * - Duplicate `idempotencyKey` → suppress (no second copy).
 * - An event whose `supersedes` names another key marks that key superseded;
 *   superseded events remain in history but are excluded from the active set.
 * - Invalid envelopes are rejected and reported; they never enter the store.
 * - Sort order is chronological by `occurredAt`, then idempotencyKey.
 *
 * @param {object[]} existing
 * @param {object[]} incoming
 * @returns {{
 *   ok: boolean,
 *   events: object[],
 *   active: object[],
 *   suppressedDuplicates: string[],
 *   supersededKeys: string[],
 *   rejected: { idempotencyKey: string|null, errors: string[] }[],
 *   mutatesExecutionAuthority: false,
 * }}
 */
export function ingestEvents(existing = [], incoming = []) {
  const store = [];
  const seenKeys = new Set();
  const suppressedDuplicates = [];
  const rejected = [];

  const accept = (event, fromIncoming) => {
    const validation = validateEnvelope(event);
    if (!validation.ok) {
      if (fromIncoming) {
        rejected.push({
          idempotencyKey: event?.idempotencyKey ?? null,
          errors: validation.errors,
        });
      }
      return;
    }
    if (seenKeys.has(event.idempotencyKey)) {
      if (fromIncoming) suppressedDuplicates.push(event.idempotencyKey);
      return;
    }
    seenKeys.add(event.idempotencyKey);
    store.push({ ...event });
  };

  for (const event of existing || []) accept(event, false);
  for (const event of incoming || []) accept(event, true);

  store.sort((a, b) => {
    const delta = Date.parse(a.occurredAt) - Date.parse(b.occurredAt);
    if (delta !== 0) return delta;
    return a.idempotencyKey.localeCompare(b.idempotencyKey);
  });

  const supersededKeys = new Set();
  for (const event of store) {
    if (event.supersedes) supersededKeys.add(event.supersedes);
  }

  const active = store.filter((event) => !supersededKeys.has(event.idempotencyKey));

  return {
    ok: rejected.length === 0,
    events: store,
    active,
    suppressedDuplicates,
    supersededKeys: [...supersededKeys],
    rejected,
    mutatesExecutionAuthority: false,
  };
}
