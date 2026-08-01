#!/usr/bin/env node
/**
 * Normalized event adapters for workflow-health observability.
 * Consume Bridge comments, controller observability snapshots, post-merge
 * results, #2678 cumulative evidence, and wake/PR evidence; emit
 * `lgfc-workflow-health-event:v1` envelopes. Pure mapping — no GitHub
 * mutation, no derived authority. Work unit #2887 / parent #2680.
 */

import {
  BLOCKER_CLASSES,
  CONTROLLER_TRANSITION_KINDS,
  CUMULATIVE_EVIDENCE_MARKER,
  STAGES,
  getAuthoritativeSources,
  summarizeInventoryGaps,
} from './event-inventory.mjs';
import { buildEnvelope, transactionIdFor } from './envelope.mjs';

/** Fixed first-line Bridge prefixes from the #2886 inventory. */
export const BRIDGE_MARKERS = Object.freeze({
  ACK: 'CURSOR BRIDGE ACK: delivered',
  STARTED: 'CURSOR BRIDGE STARTED',
  COMPLETED: 'CURSOR BRIDGE COMPLETED',
  FALLBACK: 'CURSOR BRIDGE FALLBACK:',
});

export const LOCAL_CURSOR_RESUME_MARKER = 'LOCAL CURSOR RESUME';
export const POST_MERGE_CLOSEOUT_COMPLETE =
  'Post-merge source issue closeout completed.';
export const POST_MERGE_CLOSEOUT_FAILED =
  'Post-merge source issue closeout did not complete.';

/**
 * #2677 observability kind → stage / phase / result mapping.
 * Administrative kinds (duplicate_suppression, reconciliation_scan,
 * mutation_disabled) do not advance the stage sequence; they emit blocked
 * or deferred results that stay component-local.
 */
export const CONTROLLER_KIND_MAP = Object.freeze({
  handoff_received: {
    stage: 'authority_ready',
    phase: 'start',
    result: 'pass',
    blockerClass: null,
  },
  evidence_complete: {
    stage: 'review',
    phase: 'start',
    result: 'pass',
    blockerClass: null,
  },
  disposition: {
    stage: 'review',
    phase: 'start',
    result: 'pass',
    blockerClass: null,
  },
  resume: {
    stage: 'remediation',
    phase: 'start',
    result: 'pass',
    blockerClass: null,
  },
  integration: {
    stage: 'integration',
    phase: 'start',
    result: 'pass',
    blockerClass: null,
  },
  verification: {
    stage: 'verification',
    phase: 'end',
    result: 'pass',
    blockerClass: null,
  },
  closeout: {
    stage: 'closeout',
    phase: 'end',
    result: 'pass',
    blockerClass: null,
  },
  successor_activation: {
    stage: 'continuation',
    phase: 'start',
    result: 'pass',
    blockerClass: null,
  },
  duplicate_suppression: {
    stage: 'authority_ready',
    phase: 'blocked',
    result: 'deferred',
    blockerClass: 'controller',
  },
  blocker: {
    stage: 'integration',
    phase: 'blocked',
    result: 'blocked',
    blockerClass: 'controller',
  },
  escalation: {
    stage: 'integration',
    phase: 'blocked',
    result: 'blocked',
    blockerClass: 'controller',
  },
  reconciliation_scan: {
    stage: 'verification',
    phase: 'start',
    result: 'deferred',
    blockerClass: null,
  },
  mutation_disabled: {
    stage: 'integration',
    phase: 'blocked',
    result: 'deferred',
    blockerClass: 'controller',
  },
});

function commentBody(comment) {
  return String(comment?.body || comment?.bodyText || '');
}

function commentMeta(comment) {
  return {
    id: String(comment?.id ?? comment?.databaseId ?? ''),
    author: comment?.user?.login || comment?.author?.login || 'unknown',
    createdAt: comment?.created_at || comment?.createdAt || null,
  };
}

function firstLine(body) {
  return String(body || '').split(/\r?\n/, 1)[0].trim();
}

function nextActionForStage(stageId, phase) {
  const stage = STAGES.find((s) => s.id === stageId);
  if (!stage) return null;
  if (phase === 'end') {
    const idx = STAGES.findIndex((s) => s.id === stageId);
    const next = STAGES[idx + 1];
    if (!next) return { owner: 'administration_communications', action: 'activate_successor' };
    return { owner: next.owner, action: `begin_${next.id}` };
  }
  return { owner: stage.owner, action: `complete_${stage.id}` };
}

/**
 * @param {object} params
 * @returns {{ ok: boolean, event: object|null, errors: string[] }}
 */
function emit(params) {
  return buildEnvelope({
    ...params,
    transactionId: params.transactionId || transactionIdFor(params.sourceIssue, params.workUnitId),
  });
}

/**
 * Adapt Bridge issue comments into envelopes.
 * @param {{ comments?: object[], sourceIssue: number, project?: number|null, workUnitId?: string|null, lane?: string, pr?: number|null }} params
 */
export function adaptBridgeComments({
  comments = [],
  sourceIssue,
  project = null,
  workUnitId = null,
  lane = 'development',
  pr = null,
} = {}) {
  const events = [];
  const errors = [];

  for (const comment of comments) {
    const body = commentBody(comment);
    const line = firstLine(body);
    const meta = commentMeta(comment);
    if (!meta.createdAt) continue;

    const base = {
      sourceIssue,
      project,
      workUnitId,
      lane,
      pr,
      occurredAt: meta.createdAt,
      actor: meta.author,
      actorComponent: 'bridge',
      evidenceQuality: 'deterministic',
    };

    if (line.startsWith(BRIDGE_MARKERS.ACK)) {
      const deliveryIdMatch = body.match(/Delivery id:\s*(\S+)/i);
      const deliveryId = deliveryIdMatch?.[1] || meta.id;
      const built = emit({
        ...base,
        stage: 'delivery',
        phase: 'end',
        result: 'pass',
        blockerClass: null,
        nextExpectedAction: nextActionForStage('delivery', 'end'),
        idempotencyKey: `bridge-ack:${deliveryId}`,
        evidence: {
          channel: 'issue_comment',
          ref: `comment:${meta.id}`,
          marker: BRIDGE_MARKERS.ACK,
        },
      });
      if (built.ok) events.push(built.event);
      else errors.push(...built.errors.map((e) => `bridge-ack:${e}`));

      // ACK is also eligibility start evidence per inventory.
      const eligibilityStart = emit({
        ...base,
        stage: 'eligibility',
        phase: 'start',
        result: 'pass',
        blockerClass: null,
        nextExpectedAction: nextActionForStage('eligibility', 'start'),
        idempotencyKey: `bridge-eligibility-start:${deliveryId}`,
        evidence: {
          channel: 'issue_comment',
          ref: `comment:${meta.id}`,
          marker: BRIDGE_MARKERS.ACK,
        },
      });
      if (eligibilityStart.ok) events.push(eligibilityStart.event);
      else errors.push(...eligibilityStart.errors.map((e) => `bridge-eligibility-start:${e}`));
      continue;
    }

    if (line.startsWith(BRIDGE_MARKERS.FALLBACK)) {
      const reasonMatch = line.match(/validation_failed:([a-z0-9_,:-]+)/i);
      const reason = reasonMatch?.[1] || 'unspecified';
      const built = emit({
        ...base,
        stage: 'eligibility',
        phase: 'end',
        result: 'fail',
        blockerClass: reason.includes('auth') ? 'authentication' : 'eligibility',
        nextExpectedAction: {
          owner: 'implementation_operations',
          action: 'manual_pickup_or_restore_eligibility',
        },
        idempotencyKey: `bridge-fallback:${meta.id}:${reason}`,
        evidence: {
          channel: 'issue_comment',
          ref: `comment:${meta.id}`,
          marker: BRIDGE_MARKERS.FALLBACK,
        },
      });
      if (built.ok) events.push(built.event);
      else errors.push(...built.errors.map((e) => `bridge-fallback:${e}`));
      continue;
    }

    if (line.startsWith(BRIDGE_MARKERS.STARTED)) {
      // Inventory: eligibility pass-path claim is host-local; it becomes
      // GitHub-visible only via CURSOR BRIDGE STARTED. Emit eligibility end
      // from that comment so the materializer can advance without inventing
      // a healthy state from labels.
      const eligibilityEnd = emit({
        ...base,
        stage: 'eligibility',
        phase: 'end',
        result: 'pass',
        blockerClass: null,
        nextExpectedAction: nextActionForStage('eligibility', 'end'),
        idempotencyKey: `bridge-eligibility-end:${meta.id}`,
        evidence: {
          channel: 'issue_comment',
          ref: `comment:${meta.id}`,
          marker: BRIDGE_MARKERS.STARTED,
        },
      });
      if (eligibilityEnd.ok) events.push(eligibilityEnd.event);
      else errors.push(...eligibilityEnd.errors.map((e) => `bridge-eligibility-end:${e}`));

      const built = emit({
        ...base,
        stage: 'execution',
        phase: 'start',
        result: 'pass',
        blockerClass: null,
        nextExpectedAction: nextActionForStage('execution', 'start'),
        idempotencyKey: `bridge-started:${meta.id}`,
        evidence: {
          channel: 'issue_comment',
          ref: `comment:${meta.id}`,
          marker: BRIDGE_MARKERS.STARTED,
        },
      });
      if (built.ok) events.push(built.event);
      else errors.push(...built.errors.map((e) => `bridge-started:${e}`));
      continue;
    }

    if (line.startsWith(BRIDGE_MARKERS.COMPLETED)) {
      const exitMatch = body.match(/exit(?:Code)?:\s*(-?\d+)/i);
      const exitCode = exitMatch ? Number(exitMatch[1]) : 0;
      const pass = exitCode === 0;
      const built = emit({
        ...base,
        stage: 'execution',
        phase: 'end',
        result: pass ? 'pass' : 'fail',
        blockerClass: pass ? null : 'execution',
        nextExpectedAction: nextActionForStage('execution', 'end'),
        idempotencyKey: `bridge-completed:${meta.id}`,
        evidence: {
          channel: 'issue_comment',
          ref: `comment:${meta.id}`,
          marker: BRIDGE_MARKERS.COMPLETED,
        },
      });
      if (built.ok) events.push(built.event);
      else errors.push(...built.errors.map((e) => `bridge-completed:${e}`));
    }
  }

  return { ok: errors.length === 0, events, errors };
}

/**
 * Adapt #2677 controller observability snapshots.
 * @param {{ snapshots?: object[], sourceIssue: number, project?: number|null, workUnitId?: string|null, lane?: string, pr?: number|null, candidateSha?: string|null }} params
 */
export function adaptControllerSnapshots({
  snapshots = [],
  sourceIssue,
  project = null,
  workUnitId = null,
  lane = 'development',
  pr = null,
  candidateSha = null,
} = {}) {
  const events = [];
  const errors = [];

  for (const snap of snapshots) {
    const kind = snap?.kind;
    if (!CONTROLLER_TRANSITION_KINDS.includes(kind)) {
      errors.push(`unknown_controller_kind:${String(kind)}`);
      continue;
    }
    const map = CONTROLLER_KIND_MAP[kind];
    if (!map) {
      errors.push(`unmapped_controller_kind:${kind}`);
      continue;
    }
    const occurredAt = snap.at || snap.occurredAt;
    if (!occurredAt) {
      errors.push(`controller_missing_timestamp:${kind}`);
      continue;
    }
    const runId = snap.runId || 'unknown';
    const built = emit({
      sourceIssue,
      project,
      workUnitId,
      lane,
      pr,
      candidateSha: candidateSha ?? snap.candidateSha ?? null,
      stage: map.stage,
      phase: map.phase,
      occurredAt,
      actor: snap.source || 'controller',
      actorComponent: 'controller',
      result: map.result,
      blockerClass: map.blockerClass,
      nextExpectedAction: nextActionForStage(map.stage, map.phase),
      idempotencyKey: `controller:${kind}:${runId}:${sourceIssue}`,
      evidence: {
        channel: 'workflow_artifact',
        ref: `run:${runId}`,
        marker: `observability.kind=${kind}`,
      },
      evidenceQuality: 'deterministic',
    });
    if (built.ok) events.push(built.event);
    else errors.push(...built.errors.map((e) => `controller:${kind}:${e}`));
  }

  return { ok: errors.length === 0, events, errors };
}

/**
 * Adapt post-merge validation result artifacts and closeout comments.
 * @param {{
 *   result?: object|null,
 *   closeoutComments?: object[],
 *   sourceIssue: number,
 *   project?: number|null,
 *   workUnitId?: string|null,
 *   lane?: string,
 * }} params
 */
export function adaptPostMergeEvidence({
  result = null,
  closeoutComments = [],
  sourceIssue,
  project = null,
  workUnitId = null,
  lane = 'development',
} = {}) {
  const events = [];
  const errors = [];

  if (result && typeof result === 'object') {
    const pr = result.pr ?? result.prNumber ?? null;
    const mergeSha = result.merge_sha || result.mergeSha || null;
    const status = String(result.status || '').toLowerCase();
    const pass = status === 'pass' || status === 'success' || status === 'ok';
    const runUrl = result.workflow_run_url || result.workflowRunUrl || null;
    const occurredAt = result.completed_at || result.completedAt || result.at || new Date().toISOString();
    const built = emit({
      sourceIssue: Number(result.source_issue || result.sourceIssue || sourceIssue),
      project,
      workUnitId,
      lane,
      pr: pr == null ? null : Number(pr),
      candidateSha: mergeSha,
      stage: 'verification',
      phase: 'end',
      occurredAt,
      actor: 'post-merge-validator',
      actorComponent: 'post_merge_validator',
      result: pass ? 'pass' : 'fail',
      blockerClass: pass ? null : 'verification',
      nextExpectedAction: nextActionForStage('verification', 'end'),
      idempotencyKey: `post-merge-result:${pr || 'none'}:${mergeSha || 'none'}`,
      evidence: {
        channel: 'workflow_artifact',
        ref: runUrl || `post-merge-result:${pr}`,
        marker: 'post-merge-validation-result / post-merge-result.json',
      },
      evidenceQuality: 'deterministic',
    });
    if (built.ok) events.push(built.event);
    else errors.push(...built.errors.map((e) => `post-merge-result:${e}`));
  }

  for (const comment of closeoutComments) {
    const body = commentBody(comment);
    const line = firstLine(body);
    const meta = commentMeta(comment);
    if (!meta.createdAt) continue;
    let resultKind = null;
    if (line.startsWith(POST_MERGE_CLOSEOUT_COMPLETE)) resultKind = 'pass';
    else if (line.startsWith(POST_MERGE_CLOSEOUT_FAILED)) resultKind = 'fail';
    if (!resultKind) continue;

    const built = emit({
      sourceIssue,
      project,
      workUnitId,
      lane,
      stage: 'verification',
      phase: 'end',
      occurredAt: meta.createdAt,
      actor: meta.author,
      actorComponent: 'post_merge_validator',
      result: resultKind,
      blockerClass: resultKind === 'pass' ? null : 'verification',
      nextExpectedAction: nextActionForStage('verification', 'end'),
      idempotencyKey: `post-merge-closeout-comment:${meta.id}`,
      evidence: {
        channel: 'issue_comment',
        ref: `comment:${meta.id}`,
        marker:
          resultKind === 'pass' ? POST_MERGE_CLOSEOUT_COMPLETE : POST_MERGE_CLOSEOUT_FAILED,
      },
      evidenceQuality: 'deterministic',
    });
    if (built.ok) events.push(built.event);
    else errors.push(...built.errors.map((e) => `post-merge-closeout-comment:${e}`));
  }

  return { ok: errors.length === 0, events, errors };
}

/**
 * Adapt #2678 cumulative lane evidence comments into closeout-stage envelopes.
 * Uses getAuthoritativeSources semantics: only the cumulative marker is
 * canonical; legacy checklist bodies are ignored here.
 *
 * @param {{ comments?: object[], sourceIssue: number, project?: number|null, workUnitId?: string|null }} params
 */
export function adaptCumulativeEvidenceComments({
  comments = [],
  sourceIssue,
  project = null,
  workUnitId = null,
} = {}) {
  const events = [];
  const errors = [];

  for (const comment of comments) {
    const body = commentBody(comment).trimStart();
    if (!body.startsWith(CUMULATIVE_EVIDENCE_MARKER)) continue;
    const meta = commentMeta(comment);
    const payload = body.slice(CUMULATIVE_EVIDENCE_MARKER.length).trim();
    let parsed;
    try {
      parsed = JSON.parse(payload);
    } catch {
      errors.push(`cumulative_evidence_malformed:${meta.id}`);
      continue;
    }
    if (!parsed || typeof parsed !== 'object') {
      errors.push(`cumulative_evidence_not_object:${meta.id}`);
      continue;
    }

    const issue = Number(parsed.sourceIssue || sourceIssue);
    const lane = parsed.lane || 'development';
    const occurredAt = parsed.timestamp || meta.createdAt;
    if (!occurredAt) {
      errors.push(`cumulative_evidence_missing_timestamp:${meta.id}`);
      continue;
    }

    const built = emit({
      sourceIssue: issue,
      project,
      workUnitId: workUnitId || parsed.workUnitId || null,
      lane,
      pr: parsed.pr ?? null,
      candidateSha: parsed.candidateSha ?? null,
      stage: 'closeout',
      phase: 'start',
      occurredAt,
      actor: parsed.actorRole || meta.author || 'unknown',
      actorComponent: 'closeout',
      result: parsed.result || 'pass',
      blockerClass: Array.isArray(parsed.protectedStops) && parsed.protectedStops.length
        ? 'closeout'
        : null,
      nextExpectedAction: nextActionForStage('closeout', 'start'),
      idempotencyKey: `cumulative:${parsed.idempotencyKey || meta.id}`,
      supersedes: parsed.supersedes
        ? `cumulative:${parsed.supersedes}`
        : null,
      evidence: {
        channel: 'issue_comment',
        ref: `comment:${meta.id}`,
        marker: CUMULATIVE_EVIDENCE_MARKER,
      },
      evidenceQuality: 'deterministic',
    });
    if (built.ok) events.push(built.event);
    else errors.push(...built.errors.map((e) => `cumulative:${e}`));
  }

  return { ok: errors.length === 0, events, errors };
}

/**
 * Adapt LOCAL CURSOR RESUME handoff comments (authority_ready / remediation).
 */
export function adaptLocalCursorResumeComments({
  comments = [],
  sourceIssue,
  project = null,
  workUnitId = null,
  lane = 'development',
  stage = 'authority_ready',
} = {}) {
  const events = [];
  const errors = [];
  const allowed = new Set(['authority_ready', 'remediation']);
  if (!allowed.has(stage)) {
    return { ok: false, events: [], errors: [`invalid_resume_stage:${stage}`] };
  }

  for (const comment of comments) {
    const body = commentBody(comment);
    if (!body.includes(LOCAL_CURSOR_RESUME_MARKER)) continue;
    const meta = commentMeta(comment);
    if (!meta.createdAt) continue;
    const built = emit({
      sourceIssue,
      project,
      workUnitId,
      lane,
      stage,
      phase: 'start',
      occurredAt: meta.createdAt,
      actor: meta.author,
      actorComponent: 'human',
      result: 'pass',
      blockerClass: null,
      nextExpectedAction: nextActionForStage(stage, 'start'),
      idempotencyKey: `local-cursor-resume:${stage}:${meta.id}`,
      evidence: {
        channel: 'issue_comment',
        ref: `comment:${meta.id}`,
        marker: LOCAL_CURSOR_RESUME_MARKER,
      },
      evidenceQuality: 'deterministic',
    });
    if (built.ok) events.push(built.event);
    else errors.push(...built.errors.map((e) => `local-cursor-resume:${e}`));
  }

  return { ok: errors.length === 0, events, errors };
}

/**
 * Adapt a wake workflow run into delivery start (+ authority_ready end).
 */
export function adaptWakeWorkflowRun({
  run,
  sourceIssue,
  project = null,
  workUnitId = null,
  lane = 'development',
} = {}) {
  if (!run || typeof run !== 'object') {
    return { ok: false, events: [], errors: ['wake_run_missing'] };
  }
  const runId = run.id || run.runId || run.databaseId;
  const occurredAt = run.created_at || run.createdAt || run.run_started_at;
  if (!runId || !occurredAt) {
    return { ok: false, events: [], errors: ['wake_run_incomplete'] };
  }

  const events = [];
  const errors = [];
  const actor = run.actor?.login || run.triggering_actor?.login || 'wake_workflow';

  const authorityEnd = emit({
    sourceIssue,
    project,
    workUnitId,
    lane,
    stage: 'authority_ready',
    phase: 'end',
    occurredAt,
    actor,
    actorComponent: 'wake_workflow',
    result: 'pass',
    blockerClass: null,
    nextExpectedAction: nextActionForStage('authority_ready', 'end'),
    idempotencyKey: `wake-authority-end:${runId}`,
    evidence: {
      channel: 'workflow_run',
      ref: `run:${runId}`,
      marker: '.github/workflows/cursor-local-wake.yml',
    },
    evidenceQuality: 'deterministic',
  });
  if (authorityEnd.ok) events.push(authorityEnd.event);
  else errors.push(...authorityEnd.errors.map((e) => `wake-authority-end:${e}`));

  const deliveryStart = emit({
    sourceIssue,
    project,
    workUnitId,
    lane,
    stage: 'delivery',
    phase: 'start',
    occurredAt,
    actor,
    actorComponent: 'wake_workflow',
    result: 'pass',
    blockerClass: null,
    nextExpectedAction: nextActionForStage('delivery', 'start'),
    idempotencyKey: `wake-delivery-start:${runId}`,
    evidence: {
      channel: 'workflow_run',
      ref: `run:${runId}`,
      marker: '.github/workflows/cursor-local-wake.yml',
    },
    evidenceQuality: 'deterministic',
  });
  if (deliveryStart.ok) events.push(deliveryStart.event);
  else errors.push(...deliveryStart.errors.map((e) => `wake-delivery-start:${e}`));

  return { ok: errors.length === 0, events, errors };
}

/**
 * Adapt a task PR open into execution end evidence.
 */
export function adaptTaskPrOpened({
  pr,
  sourceIssue,
  project = null,
  workUnitId = null,
  lane = 'development',
} = {}) {
  if (!pr || typeof pr !== 'object') {
    return { ok: false, events: [], errors: ['pr_missing'] };
  }
  const prNumber = Number(pr.number || pr.prNumber);
  const createdAt = pr.created_at || pr.createdAt;
  const headSha = pr.head?.sha || pr.headSha || null;
  const baseRef = pr.base?.ref || pr.baseRef || null;
  if (!prNumber || !createdAt) {
    return { ok: false, events: [], errors: ['pr_incomplete'] };
  }

  const built = emit({
    sourceIssue,
    project,
    workUnitId,
    lane,
    pr: prNumber,
    candidateSha: headSha,
    stage: 'execution',
    phase: 'end',
    occurredAt: createdAt,
    actor: pr.user?.login || pr.author?.login || 'cursor',
    actorComponent: 'cursor',
    result: 'pass',
    blockerClass: null,
    nextExpectedAction: nextActionForStage('execution', 'end'),
    idempotencyKey: `task-pr-opened:${prNumber}:${headSha || 'none'}`,
    evidence: {
      channel: 'api_object',
      ref: `pr:${prNumber}`,
      marker: 'pulls API',
    },
    evidenceQuality: 'deterministic',
  });

  if (!built.ok) return { ok: false, events: [], errors: built.errors.map((e) => `task-pr:${e}`) };

  // Attach baseRef in evidence.ref for diagnostics without expanding the schema.
  if (baseRef) {
    built.event.evidence.ref = `pr:${prNumber}@${baseRef}`;
  }
  return { ok: true, events: [built.event], errors: [] };
}

/**
 * Adapt a component-branch merge into integration end evidence.
 */
export function adaptComponentMerge({
  pr,
  sourceIssue,
  project = null,
  workUnitId = null,
  lane = 'development',
} = {}) {
  if (!pr?.merged && !pr?.mergedAt && !pr?.merged_at) {
    return { ok: false, events: [], errors: ['pr_not_merged'] };
  }
  const prNumber = Number(pr.number || pr.prNumber);
  const mergedAt = pr.merged_at || pr.mergedAt;
  const mergeSha = pr.merge_commit_sha || pr.mergeSha || pr.mergeCommit?.oid || null;
  const baseRef = pr.base?.ref || pr.baseRef || null;
  if (!prNumber || !mergedAt) {
    return { ok: false, events: [], errors: ['merge_incomplete'] };
  }

  const built = emit({
    sourceIssue,
    project,
    workUnitId,
    lane,
    pr: prNumber,
    candidateSha: mergeSha,
    stage: 'integration',
    phase: 'end',
    occurredAt: mergedAt,
    actor: pr.merged_by?.login || pr.mergedBy?.login || 'integration',
    actorComponent: 'checks',
    result: 'pass',
    blockerClass: null,
    nextExpectedAction: nextActionForStage('integration', 'end'),
    idempotencyKey: `component-merge:${prNumber}:${mergeSha || 'none'}`,
    evidence: {
      channel: 'api_object',
      ref: `pr:${prNumber}:${baseRef || 'component'}`,
      marker: 'pulls API merged=true',
    },
    evidenceQuality: 'deterministic',
  });
  if (!built.ok) return { ok: false, events: [], errors: built.errors.map((e) => `merge:${e}`) };
  return { ok: true, events: [built.event], errors: [] };
}

/**
 * Emit explicit unknown/evidence-missing events for inventory gaps that have
 * no deterministic GitHub-visible alternative at that boundary. Never skips
 * a gap silently — missing instrumentation must be visible.
 *
 * @param {{
 *   sourceIssue: number,
 *   project?: number|null,
 *   workUnitId?: string|null,
 *   lane?: string,
 *   occurredAt?: string,
 *   gaps?: ReturnType<typeof summarizeInventoryGaps>['gaps'],
 *   onlyBoundariesWithoutDeterministic?: boolean,
 * }} params
 */
export function adaptEvidenceMissingGaps({
  sourceIssue,
  project = null,
  workUnitId = null,
  lane = 'development',
  occurredAt = new Date().toISOString(),
  gaps = summarizeInventoryGaps().gaps,
  onlyBoundariesWithoutDeterministic = true,
} = {}) {
  const events = [];
  const errors = [];

  const selected = [];
  for (const gap of gaps) {
    if (!onlyBoundariesWithoutDeterministic) {
      selected.push(gap);
      continue;
    }
    const stage = STAGES.find((s) => s.id === gap.stage);
    if (!stage) continue;
    const sources =
      gap.boundary === 'start' ? stage.startEvidence : stage.endEvidence;
    const authoritative = getAuthoritativeSources(sources);
    const hasDeterministic = authoritative.some((s) => s.evidenceClass === 'deterministic');
    // Emit unknown only when the boundary has no deterministic authoritative
    // alternative; otherwise the gap is informational per-source debt.
    if (!hasDeterministic) selected.push(gap);
  }

  for (const gap of selected) {
    const built = emit({
      sourceIssue,
      project,
      workUnitId,
      lane,
      stage: gap.stage,
      phase: 'unknown',
      occurredAt,
      actor: 'workflow-health-adapter',
      actorComponent: 'controller',
      result: 'unknown',
      blockerClass: 'unknown',
      nextExpectedAction: {
        owner: STAGES.find((s) => s.id === gap.stage)?.owner || 'implementation_operations',
        action: `instrument_${gap.surface}`,
      },
      idempotencyKey: `evidence-missing:${gap.stage}:${gap.boundary}:${gap.surface}`,
      evidence: {
        channel: 'inventory_gap',
        ref: `${gap.stage}/${gap.boundary}/${gap.surface}`,
        marker: gap.surface,
      },
      evidenceQuality: 'unknown_evidence_missing',
    });
    if (built.ok) events.push(built.event);
    else errors.push(...built.errors.map((e) => `evidence-missing:${e}`));
  }

  return { ok: errors.length === 0, events, errors };
}

/**
 * Normalize a mixed evidence bundle into envelopes. Failures in one adapter
 * do not suppress events from other adapters — component failures stay distinct.
 *
 * @param {object} bundle
 */
export function adaptEvidenceBundle(bundle = {}) {
  const parts = [
    adaptWakeWorkflowRun({
      run: bundle.wakeRun,
      sourceIssue: bundle.sourceIssue,
      project: bundle.project,
      workUnitId: bundle.workUnitId,
      lane: bundle.lane,
    }),
    adaptBridgeComments({
      comments: bundle.comments,
      sourceIssue: bundle.sourceIssue,
      project: bundle.project,
      workUnitId: bundle.workUnitId,
      lane: bundle.lane,
      pr: bundle.pr,
    }),
    adaptLocalCursorResumeComments({
      comments: bundle.comments,
      sourceIssue: bundle.sourceIssue,
      project: bundle.project,
      workUnitId: bundle.workUnitId,
      lane: bundle.lane,
      stage: bundle.resumeStage || 'authority_ready',
    }),
    adaptControllerSnapshots({
      snapshots: bundle.controllerSnapshots,
      sourceIssue: bundle.sourceIssue,
      project: bundle.project,
      workUnitId: bundle.workUnitId,
      lane: bundle.lane,
      pr: bundle.pr,
      candidateSha: bundle.candidateSha,
    }),
    adaptPostMergeEvidence({
      result: bundle.postMergeResult,
      closeoutComments: bundle.comments,
      sourceIssue: bundle.sourceIssue,
      project: bundle.project,
      workUnitId: bundle.workUnitId,
      lane: bundle.lane,
    }),
    adaptCumulativeEvidenceComments({
      comments: bundle.comments,
      sourceIssue: bundle.sourceIssue,
      project: bundle.project,
      workUnitId: bundle.workUnitId,
    }),
    adaptTaskPrOpened({
      pr: bundle.taskPr,
      sourceIssue: bundle.sourceIssue,
      project: bundle.project,
      workUnitId: bundle.workUnitId,
      lane: bundle.lane,
    }),
    adaptComponentMerge({
      pr: bundle.mergedPr,
      sourceIssue: bundle.sourceIssue,
      project: bundle.project,
      workUnitId: bundle.workUnitId,
      lane: bundle.lane,
    }),
  ];

  // Optional gap emission — off by default in the bundle so callers that
  // already have deterministic alternatives are not flooded; pass
  // `emitGaps: true` to force visibility of uninstrumented boundaries.
  if (bundle.emitGaps) {
    parts.push(
      adaptEvidenceMissingGaps({
        sourceIssue: bundle.sourceIssue,
        project: bundle.project,
        workUnitId: bundle.workUnitId,
        lane: bundle.lane,
        occurredAt: bundle.now,
      }),
    );
  }

  const events = [];
  const errors = [];
  const adapterResults = [];

  for (const part of parts) {
    // Skip adapters that were not given inputs (e.g. wake_run_missing).
    if (
      part.errors.length === 1 &&
      ['wake_run_missing', 'pr_missing', 'pr_not_merged'].includes(part.errors[0]) &&
      part.events.length === 0
    ) {
      adapterResults.push({ skipped: true, errors: part.errors });
      continue;
    }
    events.push(...part.events);
    errors.push(...part.errors);
    adapterResults.push({ skipped: false, ok: part.ok, eventCount: part.events.length });
  }

  return {
    ok: errors.length === 0,
    events,
    errors,
    adapterResults,
    // Explicit non-authority marker for downstream consumers.
    mutatesExecutionAuthority: false,
  };
}

export { BLOCKER_CLASSES, nextActionForStage, transactionIdFor };
