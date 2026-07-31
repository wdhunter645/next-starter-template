#!/usr/bin/env node
/**
 * Reconcile controller transactions, legacy evidence surfaces, and
 * cumulative events into one cumulative work-unit view. Read-only —
 * never mutates GitHub or deletes history. Work unit #2884 / parent #2678.
 */

import { parseCumulativeEvidenceEvents, resolveAuthoritativeEventsBySlot } from './adapters.mjs';
import { buildEventDraftFromControllerTransaction } from './controller-transaction-adapter.mjs';
import { mapLegacyEvidenceSurfaces } from './legacy-closeout-adapter.mjs';
import { evaluateLaneExitWithAdminResidue } from './admin-residue.mjs';

/**
 * @param {{
 *   sourceIssue: number,
 *   workUnitId: string,
 *   lane?: string,
 *   comments?: object[],
 *   controllerTransactions?: { kind: string, outcome?: string, idempotencyKey: string, details?: object }[],
 *   legacyBodies?: { id?: string, body: string, createdAt?: string }[],
 * }} params
 */
export function reconcileCumulativeWorkUnit({
  sourceIssue,
  workUnitId,
  lane = 'development',
  comments = [],
  controllerTransactions = [],
  legacyBodies = [],
} = {}) {
  const parsedEvents = parseCumulativeEvidenceEvents(comments);
  const authoritative = resolveAuthoritativeEventsBySlot(parsedEvents).filter(
    (entry) =>
      entry.event?.sourceIssue === sourceIssue && entry.event?.workUnitId === workUnitId,
  );

  const controllerDrafts = [];
  for (const tx of controllerTransactions) {
    const mapped = buildEventDraftFromControllerTransaction({
      ...tx,
      sourceIssue,
      workUnitId,
      idempotencyKey: tx.idempotencyKey,
    });
    controllerDrafts.push(mapped);
  }

  const legacy = mapLegacyEvidenceSurfaces({ bodies: legacyBodies });
  const exit = evaluateLaneExitWithAdminResidue({
    sourceIssue,
    workUnitId,
    lane,
    parsedEvents,
    controllerKinds: controllerTransactions.map((t) => t.kind),
    legacyRecords: legacy.records,
  });

  return {
    sourceIssue,
    workUnitId,
    lane,
    cumulativeEventCount: parsedEvents.length,
    authoritativeEventCount: authoritative.length,
    authoritativeEvents: authoritative.map((e) => e.event),
    controllerDrafts,
    legacy,
    laneExit: {
      canExit: exit.canExit,
      blockedReasons: exit.blockedReasons,
      inLaneWorkPermitted: exit.inLaneWorkPermitted,
    },
    administrativeResidue: exit.administrativeResidue,
    historyPreserved: true,
    reversible: true,
  };
}
