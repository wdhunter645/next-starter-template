#!/usr/bin/env node
/**
 * Administrative-residue classifier for cumulative lane evidence.
 * Administrative / diagnostic residue must not halt safe in-lane work;
 * only lane-exit evaluation may fail closed. Work unit #2884 / parent #2678.
 */

import { ADMINISTRATIVE_CONTROLLER_KINDS } from './controller-transaction-adapter.mjs';
import { evaluateLaneExit } from './lane-exit.mjs';

/**
 * @param {{
 *   controllerKinds?: string[],
 *   legacyRecords?: { kind?: string, retirementClass?: string }[],
 *   unresolvedAdminNotes?: string[],
 * }} params
 * @returns {{
 *   blocksInLaneWork: false,
 *   blocksLaneExit: boolean,
 *   residue: object[],
 *   reasons: string[],
 * }}
 */
export function classifyAdministrativeResidue({
  controllerKinds = [],
  legacyRecords = [],
  unresolvedAdminNotes = [],
} = {}) {
  const residue = [];

  for (const kind of controllerKinds) {
    residue.push({
      source: 'controller',
      kind,
      administrative: ADMINISTRATIVE_CONTROLLER_KINDS.includes(kind),
    });
  }
  for (const record of legacyRecords) {
    residue.push({
      source: 'legacy',
      kind: record.kind || 'legacy_unknown',
      retirementClass: record.retirementClass || null,
      administrative: true,
    });
  }
  for (const note of unresolvedAdminNotes) {
    residue.push({
      source: 'admin_note',
      kind: 'unresolved_admin_note',
      note,
      administrative: true,
    });
  }

  // Hard invariant from #2678 launch package: administrative residue never
  // blocks continued safe in-lane work by itself.
  return {
    blocksInLaneWork: false,
    blocksLaneExit: false,
    residue,
    reasons: residue.map((r) => `${r.source}:${r.kind}`),
  };
}

/**
 * Combine administrative residue with lane-exit evaluation. Residue alone
 * cannot flip `canExit` to false; only missing/invalid exit evidence or
 * protected stops (via evaluateLaneExit) can.
 *
 * @param {{
 *   sourceIssue: number,
 *   workUnitId: string,
 *   lane: string,
 *   parsedEvents: object[],
 *   controllerKinds?: string[],
 *   legacyRecords?: object[],
 *   unresolvedAdminNotes?: string[],
 * }} params
 */
export function evaluateLaneExitWithAdminResidue(params = {}) {
  const residue = classifyAdministrativeResidue(params);
  const exit = evaluateLaneExit({
    sourceIssue: params.sourceIssue,
    workUnitId: params.workUnitId,
    lane: params.lane,
    parsedEvents: params.parsedEvents || [],
  });

  return {
    ...exit,
    administrativeResidue: residue,
    // Explicit reinforcement of the non-blocking invariant.
    inLaneWorkPermitted: residue.blocksInLaneWork === false,
  };
}
