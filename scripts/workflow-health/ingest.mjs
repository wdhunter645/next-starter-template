#!/usr/bin/env node
/**
 * Idempotent ingestion and supersession for workflow-health envelopes.
 * Pure append-only merge — never mutates execution authority, never deletes
 * history. Work unit #2887 / parent #2680.
 */

import { validateEnvelope } from './envelope.mjs';

/**
 * Duplicate-suppression and supersession identity is scoped to the owning
 * transaction so events from different work transactions can never suppress
 * or supersede each other.
 * @param {string} transactionId
 * @param {string} idempotencyKey
 */
function scopedKey(transactionId, idempotencyKey) {
  return `${transactionId}\u0000${idempotencyKey}`;
}

/** Locale-independent code-unit comparison for deterministic tie-breaks. */
function compareCodeUnits(a, b) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/**
 * Merge incoming envelopes into an existing event store.
 *
 * Rules:
 * - Duplicate `idempotencyKey` within the same transaction → suppress
 *   (no second copy). Identical keys on different transactions are distinct.
 * - An event whose `supersedes` names an earlier key in the same transaction
 *   marks that key superseded; superseded events remain in history but are
 *   excluded from the active set. Self-supersession is ignored, and because
 *   supersession only accepts chronologically earlier targets, cycles cannot
 *   empty the active set.
 * - Invalid envelopes are rejected and reported; they never enter the store.
 * - Sort order is chronological by `occurredAt`, then transaction and
 *   idempotency key by code-unit comparison (locale-independent).
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
    const key = scopedKey(event.transactionId, event.idempotencyKey);
    if (seenKeys.has(key)) {
      if (fromIncoming) suppressedDuplicates.push(event.idempotencyKey);
      return;
    }
    seenKeys.add(key);
    store.push({ ...event });
  };

  for (const event of existing || []) accept(event, false);
  for (const event of incoming || []) accept(event, true);

  store.sort((a, b) => {
    const delta = Date.parse(a.occurredAt) - Date.parse(b.occurredAt);
    if (delta !== 0) return delta;
    return compareCodeUnits(
      scopedKey(a.transactionId, a.idempotencyKey),
      scopedKey(b.transactionId, b.idempotencyKey),
    );
  });

  // Supersession may only target a chronologically earlier event in the same
  // transaction. Walking the sorted store and requiring the target to have
  // been seen already makes self-references and cycles structurally
  // impossible (a cycle would need a forward-in-time edge).
  const supersededScoped = new Set();
  const supersededRaw = new Set();
  const walked = new Set();
  for (const event of store) {
    if (
      event.supersedes &&
      event.supersedes !== event.idempotencyKey &&
      walked.has(scopedKey(event.transactionId, event.supersedes))
    ) {
      supersededScoped.add(scopedKey(event.transactionId, event.supersedes));
      supersededRaw.add(event.supersedes);
    }
    walked.add(scopedKey(event.transactionId, event.idempotencyKey));
  }

  const active = store.filter(
    (event) => !supersededScoped.has(scopedKey(event.transactionId, event.idempotencyKey)),
  );

  return {
    ok: rejected.length === 0,
    events: store,
    active,
    suppressedDuplicates,
    supersededKeys: [...supersededRaw],
    rejected,
    mutatesExecutionAuthority: false,
  };
}
