#!/usr/bin/env node
/**
 * Pilot / Promotion Candidate qualification scenarios for cumulative lane
 * evidence. Exercises progression, return-to-Development, protected-stop,
 * missing-evidence block, supersession, and rollback disposition.
 * Work unit #2885 / parent #2678. Pure evaluation — no GitHub mutation.
 */

import { fileURLToPath } from 'node:url';
import { EVENT_MARKER } from './adapters.mjs';
import { evaluateLaneExit } from './lane-exit.mjs';
import { evaluateLaneExitWithAdminResidue } from './admin-residue.mjs';
import { reconcileCumulativeWorkUnit } from './reconcile-unit.mjs';
import { validateCumulativeEvidenceEvent } from './validate-event.mjs';

const CANDIDATE_SHA = 'f03ba72586ad98379cdaf3ba708c3d9a4b762fda';
const SOURCE_ISSUE = 2885;
const WORK_UNIT = '2678-004';

function commentFromEvent(event, id, createdAt) {
  return {
    id,
    createdAt,
    body: `${EVENT_MARKER}\n${JSON.stringify(event, null, 2)}`,
  };
}

function sandboxExit(overrides = {}) {
  return {
    schemaVersion: 'lgfc-cumulative-evidence:v1',
    idempotencyKey: 'pilot-sandbox-exit',
    sourceIssue: SOURCE_ISSUE,
    workUnitId: WORK_UNIT,
    lane: 'sandbox',
    transition: 'exit',
    candidateSha: null,
    actorRole: 'implementation_operations',
    actor: 'pilot',
    timestamp: '2026-08-01T00:00:00.000Z',
    result: 'pass',
    evidenceRefs: [],
    supersedes: null,
    protectedStops: [],
    nextExpectedTransition: 'enter',
    summary: 'Sandbox adopted',
    laneFields: {
      hypothesis: 'Cumulative evidence supports full lane progression',
      isolationBoundary: 'component/cumulative-lane-evidence',
      observedResult: 'fixtures pass',
      disposition: 'adopt_to_development',
      carriedRisks: [],
    },
    ...overrides,
  };
}

function developmentExit(overrides = {}) {
  return {
    schemaVersion: 'lgfc-cumulative-evidence:v1',
    idempotencyKey: 'pilot-development-exit',
    sourceIssue: SOURCE_ISSUE,
    workUnitId: WORK_UNIT,
    lane: 'development',
    transition: 'exit',
    candidateSha: null,
    actorRole: 'pr_approver_engineering',
    actor: 'pilot',
    timestamp: '2026-08-01T01:00:00.000Z',
    result: 'pass',
    evidenceRefs: [],
    supersedes: null,
    protectedStops: [],
    nextExpectedTransition: 'enter',
    summary: 'Development exit',
    laneFields: {
      sourceIssue: SOURCE_ISSUE,
      objective: 'Qualify Promotion Candidate',
      allowlist: ['schemas/cumulative-lane-evidence/v1/**', 'scripts/cumulative-lane-evidence/**'],
      implementationSummary: 'Children #2882–#2884 integrated',
      verification: { result: 'PASS' },
      reviewDispositions: 'independent review complete',
      limitationsAndRollback: 'revert component PRs; keep Issue history',
      componentCandidate: { sha: CANDIDATE_SHA, branch: 'component/cumulative-lane-evidence' },
    },
    ...overrides,
  };
}

function promotionExit(overrides = {}) {
  return {
    schemaVersion: 'lgfc-cumulative-evidence:v1',
    idempotencyKey: 'pilot-promotion-exit',
    sourceIssue: SOURCE_ISSUE,
    workUnitId: WORK_UNIT,
    lane: 'promotion_candidate',
    transition: 'exit',
    candidateSha: CANDIDATE_SHA,
    actorRole: 'pmo_engineering',
    actor: 'pilot',
    timestamp: '2026-08-01T02:00:00.000Z',
    result: 'pass',
    evidenceRefs: [{ kind: 'commit', uri: CANDIDATE_SHA }],
    supersedes: null,
    protectedStops: [],
    nextExpectedTransition: 'enter',
    summary: 'Promotion Candidate qualified — Production Go is separate',
    laneFields: {
      candidateSha: CANDIDATE_SHA,
      qualificationEvidence: {
        progression: 'PASS',
        returnToDevelopment: 'PASS',
        protectedStop: 'PASS',
        rollback: 'PASS',
      },
      driftReconciliation: 'No unreviewed drift from integrated Development children',
      unresolvedRisks: ['Production promotion remains separately authorized'],
      productionRecommendation: 'go',
    },
    ...overrides,
  };
}

/**
 * @returns {{ name: string, ok: boolean, details: object }[]}
 */
export function runPilotScenarios() {
  const results = [];

  // 1) Full progression Sandbox → Development → Promotion Candidate
  {
    const comments = [
      commentFromEvent(sandboxExit(), 1, '2026-08-01T00:00:00.000Z'),
      commentFromEvent(developmentExit(), 2, '2026-08-01T01:00:00.000Z'),
      commentFromEvent(promotionExit(), 3, '2026-08-01T02:00:00.000Z'),
    ];
    const unit = reconcileCumulativeWorkUnit({
      sourceIssue: SOURCE_ISSUE,
      workUnitId: WORK_UNIT,
      lane: 'promotion_candidate',
      comments,
    });
    const parsed = comments.map((c, i) => ({
      commentId: String(i + 1),
      createdAt: c.createdAt,
      event: JSON.parse(c.body.slice(EVENT_MARKER.length).trim()),
    }));
    const sandboxOk = evaluateLaneExit({
      sourceIssue: SOURCE_ISSUE,
      workUnitId: WORK_UNIT,
      lane: 'sandbox',
      parsedEvents: parsed,
    }).canExit;
    const devOk = evaluateLaneExit({
      sourceIssue: SOURCE_ISSUE,
      workUnitId: WORK_UNIT,
      lane: 'development',
      parsedEvents: parsed,
    }).canExit;
    const promoOk = evaluateLaneExit({
      sourceIssue: SOURCE_ISSUE,
      workUnitId: WORK_UNIT,
      lane: 'promotion_candidate',
      parsedEvents: parsed,
    }).canExit;
    results.push({
      name: 'progression_sandbox_development_promotion',
      ok: sandboxOk && devOk && promoOk && unit.authoritativeEventCount === 3,
      details: { sandboxOk, devOk, promoOk, authoritativeEventCount: unit.authoritativeEventCount },
    });
  }

  // 2) Return to Development from Promotion Candidate
  {
    const returnEvent = {
      ...promotionExit({
        idempotencyKey: 'pilot-promotion-return',
        transition: 'return_to_development',
        result: 'fail',
        summary: 'Return to Development for correction',
        nextExpectedTransition: 'enter',
      }),
      laneFields: {
        ...promotionExit().laneFields,
        productionRecommendation: 'return_to_development',
        unresolvedRisks: ['qualification gap'],
      },
    };
    const validation = validateCumulativeEvidenceEvent(returnEvent, {});
    results.push({
      name: 'return_to_development',
      ok: validation.ok && returnEvent.transition === 'return_to_development',
      details: { validation },
    });
  }

  // 3) Protected stop blocks lane exit
  {
    const blocked = developmentExit({
      idempotencyKey: 'pilot-dev-protected-stop',
      protectedStops: ['requiredGateFailure'],
      result: 'blocked',
    });
    const parsed = [
      {
        commentId: '1',
        createdAt: '2026-08-01T01:00:00.000Z',
        event: blocked,
      },
    ];
    const exit = evaluateLaneExit({
      sourceIssue: SOURCE_ISSUE,
      workUnitId: WORK_UNIT,
      lane: 'development',
      parsedEvents: parsed,
    });
    results.push({
      name: 'protected_stop_blocks_exit',
      ok: exit.canExit === false && exit.blockedReasons.some((r) => r.startsWith('protected-stop:')),
      details: exit,
    });
  }

  // 4) Missing evidence blocks exit only (in-lane work still permitted)
  {
    const exit = evaluateLaneExitWithAdminResidue({
      sourceIssue: SOURCE_ISSUE,
      workUnitId: WORK_UNIT,
      lane: 'development',
      parsedEvents: [],
      controllerKinds: ['duplicate_suppression'],
      unresolvedAdminNotes: ['dashboard lag'],
    });
    results.push({
      name: 'missing_evidence_blocks_exit_not_in_lane',
      ok: exit.canExit === false && exit.inLaneWorkPermitted === true,
      details: exit,
    });
  }

  // 5) Supersession: correction replaces prior sandbox exit disposition
  {
    const original = sandboxExit();
    const correction = sandboxExit({
      idempotencyKey: 'pilot-sandbox-corrected',
      transition: 'correct',
      supersedes: 'pilot-sandbox-exit',
      timestamp: '2026-08-01T00:10:00.000Z',
      laneFields: {
        ...sandboxExit().laneFields,
        disposition: 'retain_as_evidence',
        carriedRisks: ['deferred adoption'],
      },
    });
    const unit = reconcileCumulativeWorkUnit({
      sourceIssue: SOURCE_ISSUE,
      workUnitId: WORK_UNIT,
      lane: 'sandbox',
      comments: [
        commentFromEvent(original, 1, '2026-08-01T00:00:00.000Z'),
        commentFromEvent(correction, 2, '2026-08-01T00:10:00.000Z'),
      ],
    });
    const auth = unit.authoritativeEvents.find((e) => e.lane === 'sandbox');
    results.push({
      name: 'supersession_correction',
      ok:
        unit.authoritativeEventCount === 1 &&
        auth?.idempotencyKey === 'pilot-sandbox-corrected' &&
        auth?.laneFields?.disposition === 'retain_as_evidence',
      details: { authoritativeEventCount: unit.authoritativeEventCount, auth },
    });
  }

  // 6) Rollback disposition — disable adapters, keep history
  {
    const unit = reconcileCumulativeWorkUnit({
      sourceIssue: SOURCE_ISSUE,
      workUnitId: WORK_UNIT,
      lane: 'development',
      comments: [commentFromEvent(developmentExit(), 1, '2026-08-01T01:00:00.000Z')],
      controllerTransactions: [
        { kind: 'mutation_disabled', outcome: 'deferred', idempotencyKey: 'pilot-rollback-disable' },
      ],
      legacyBodies: [{ id: 'L1', body: '## POST-MERGE CLOSEOUT CHECKLIST\n- retained' }],
    });
    results.push({
      name: 'rollback_preserves_history',
      ok:
        unit.historyPreserved === true &&
        unit.reversible === true &&
        unit.laneExit.inLaneWorkPermitted === true &&
        unit.legacy.records.length === 1,
      details: {
        historyPreserved: unit.historyPreserved,
        reversible: unit.reversible,
        legacyCount: unit.legacy.records.length,
      },
    });
  }

  return results;
}

export function summarizePilotScenarios(results = runPilotScenarios()) {
  const failed = results.filter((r) => !r.ok);
  return {
    candidateSha: CANDIDATE_SHA,
    sourceIssue: SOURCE_ISSUE,
    workUnitId: WORK_UNIT,
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.map((f) => f.name),
    ok: failed.length === 0,
    results,
  };
}

export { CANDIDATE_SHA, SOURCE_ISSUE, WORK_UNIT };

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const summary = summarizePilotScenarios();
  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.ok ? 0 : 1);
}
