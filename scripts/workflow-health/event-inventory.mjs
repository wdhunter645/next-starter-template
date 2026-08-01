#!/usr/bin/env node
/**
 * Workflow event inventory and adapter contract for end-to-end workflow
 * health observability. Work unit #2886 (2680-001) / parent #2680.
 *
 * Maps every required workflow stage to its authoritative, deterministic
 * evidence sources, or classifies the gap explicitly. Label-only state is
 * never accepted as stage evidence. Read-only reference data — no GitHub
 * mutation, no derived authority.
 */

export const INVENTORY_SCHEMA_VERSION = 'lgfc-workflow-event-inventory:v1';

/** Normalized envelope for workflow-health events (adapter output contract). */
export const ENVELOPE_SCHEMA_VERSION = 'lgfc-workflow-health-event:v1';

export const ENVELOPE_REQUIRED_FIELDS = Object.freeze([
  'schemaVersion',
  'transactionId',
  'sourceIssue',
  'project',
  'lane',
  'pr',
  'candidateSha',
  'stage',
  'phase',
  'occurredAt',
  'actor',
  'actorComponent',
  'result',
  'blockerClass',
  'nextExpectedAction',
  'sloDeadline',
  'idempotencyKey',
  'supersedes',
  'evidence',
  'evidenceQuality',
]);

export const ENVELOPE_PHASES = Object.freeze(['start', 'end', 'blocked', 'unknown']);

export const ENVELOPE_RESULTS = Object.freeze([
  'pass',
  'fail',
  'blocked',
  'deferred',
  'unknown',
]);

export const BLOCKER_CLASSES = Object.freeze([
  'authentication',
  'capacity',
  'eligibility',
  'execution',
  'review',
  'controller',
  'integration',
  'verification',
  'closeout',
  'continuation',
  'unknown',
]);

export const ACTOR_COMPONENTS = Object.freeze([
  'runner',
  'wake_workflow',
  'bridge',
  'cursor',
  'controller',
  'checks',
  'post_merge_validator',
  'closeout',
  'human',
]);

/** Evidence classifications for inventory sources. */
export const EVIDENCE_CLASSES = Object.freeze([
  // Machine-parseable marker/artifact with stable identity fields.
  'deterministic',
  // Exists only on the emitting host; not observable from GitHub evidence.
  'local_only',
  // No structured emission exists today; adapters must emit an explicit
  // unknown/evidence-missing event, never a healthy state.
  'evidence_missing',
]);

/** Where a source's code/contract currently lives. */
export const SOURCE_LOCATIONS = Object.freeze({
  MAIN: 'main',
  CONTROLLER_COMPONENT: 'component/deterministic-handoff-controller',
  EVIDENCE_COMPONENT: 'component/cumulative-lane-evidence',
  HOST: 'bridge-host',
});

/**
 * The thirteen #2677 controller transition kinds
 * (scripts/agent-routing/lib/observability.mjs, OBSERVABILITY_SCHEMA_VERSION 1).
 */
export const CONTROLLER_TRANSITION_KINDS = Object.freeze([
  'handoff_received',
  'evidence_complete',
  'disposition',
  'resume',
  'integration',
  'verification',
  'closeout',
  'successor_activation',
  'duplicate_suppression',
  'blocker',
  'escalation',
  'reconciliation_scan',
  'mutation_disabled',
]);

/** #2678 cumulative lane evidence comment marker. */
export const CUMULATIVE_EVIDENCE_MARKER = '<!-- lgfc-cumulative-evidence:v1 -->';

/**
 * The ten required stages from the #2680 project contract, in order.
 * Each stage lists start/end evidence sources. A source is:
 * { surface, channel, location, marker, identityFields, evidenceClass, notes? }
 */
export const STAGES = Object.freeze([
  {
    id: 'authority_ready',
    order: 1,
    name: 'Authority ready',
    owner: 'pmo_engineering',
    definition: 'Source Issue and bounded action are executable.',
    startEvidence: [
      {
        surface: 'dispatch-comment',
        channel: 'issue_comment',
        location: SOURCE_LOCATIONS.MAIN,
        marker: null,
        identityFields: ['issueNumber', 'commentId', 'createdAt', 'author'],
        evidenceClass: 'evidence_missing',
        notes:
          'Engineering dispatch comments are free-form prose today. Labels ' +
          '(agent:cursor + handoff:ready + pmo:active) gate eligibility but are ' +
          'label-only state and never accepted as stage evidence.',
      },
      {
        surface: 'controller-handoff',
        channel: 'workflow_artifact',
        location: SOURCE_LOCATIONS.CONTROLLER_COMPONENT,
        marker: 'observability.kind=handoff_received',
        identityFields: ['schemaVersion', 'kind', 'outcome', 'at', 'runId', 'source'],
        evidenceClass: 'deterministic',
        notes: 'Available once component/deterministic-handoff-controller is promoted.',
      },
      {
        surface: 'canonical-handoff-comment',
        channel: 'issue_comment',
        location: SOURCE_LOCATIONS.MAIN,
        marker: 'LOCAL CURSOR RESUME',
        identityFields: ['Issue', 'Source handoff', 'Resume from', 'Next local action'],
        evidenceClass: 'deterministic',
      },
    ],
    endEvidence: [
      {
        surface: 'wake-trigger',
        channel: 'workflow_run',
        location: SOURCE_LOCATIONS.MAIN,
        marker: '.github/workflows/cursor-local-wake.yml',
        identityFields: ['runId', 'issueNumber', 'eventName'],
        evidenceClass: 'deterministic',
        notes: 'Stage ends when a delivery attempt begins.',
      },
    ],
  },
  {
    id: 'delivery',
    order: 2,
    name: 'Delivery',
    owner: 'deterministic_ci',
    definition: 'Wake workflow accepted the trigger and wrote a packet.',
    startEvidence: [
      {
        surface: 'wake-workflow-run',
        channel: 'workflow_run',
        location: SOURCE_LOCATIONS.MAIN,
        marker: '.github/workflows/cursor-local-wake.yml',
        identityFields: ['runId', 'issueNumber', 'eventName', 'actor'],
        evidenceClass: 'deterministic',
      },
    ],
    endEvidence: [
      {
        surface: 'bridge-ack-comment',
        channel: 'issue_comment',
        location: SOURCE_LOCATIONS.MAIN,
        marker: 'CURSOR BRIDGE ACK: delivered',
        identityFields: ['deliveryId'],
        evidenceClass: 'deterministic',
        notes: 'Delivery id format: wake-<runId>-<issue>-<commentId|nolabel>.',
      },
      {
        surface: 'wake-packet',
        channel: 'host_file',
        location: SOURCE_LOCATIONS.HOST,
        marker: 'queue/<deliveryId>.json',
        identityFields: [
          'schemaVersion',
          'issueNumber',
          'deliveryId',
          'eventName',
          'actor',
          'resumeHint',
          'deliveredAt',
          'runId',
        ],
        evidenceClass: 'local_only',
        notes: 'GitHub-visible only through the ACK comment.',
      },
    ],
  },
  {
    id: 'eligibility',
    order: 3,
    name: 'Eligibility',
    owner: 'implementation_operations',
    definition: 'Bridge validation passed or produced an explicit fallback.',
    startEvidence: [
      {
        surface: 'bridge-ack-comment',
        channel: 'issue_comment',
        location: SOURCE_LOCATIONS.MAIN,
        marker: 'CURSOR BRIDGE ACK: delivered',
        identityFields: ['deliveryId'],
        evidenceClass: 'deterministic',
      },
    ],
    endEvidence: [
      {
        surface: 'bridge-fallback-comment',
        channel: 'issue_comment',
        location: SOURCE_LOCATIONS.MAIN,
        marker: 'CURSOR BRIDGE FALLBACK:',
        identityFields: ['reasonCodes'],
        evidenceClass: 'deterministic',
        notes:
          'Variants: unclaimed, launch-retry, accepted-run-failure. Reason codes ' +
          'are deterministic strings, e.g. validation_failed:missing_chatgpt_response.',
      },
      {
        surface: 'bridge-claim-record',
        channel: 'host_file',
        location: SOURCE_LOCATIONS.HOST,
        marker: 'claim.json',
        identityFields: ['issueNumber', 'resumeCommentId', 'deliveryId', 'acquiredAt', 'pid'],
        evidenceClass: 'local_only',
        notes:
          'Pass-path has no GitHub emission of its own; it becomes visible only ' +
          'via the subsequent CURSOR BRIDGE STARTED comment. Explicit gap.',
      },
    ],
  },
  {
    id: 'execution',
    order: 4,
    name: 'Execution',
    owner: 'implementation_operations',
    definition: 'Cursor started, acknowledged, completed, failed, or timed out.',
    startEvidence: [
      {
        surface: 'bridge-started-comment',
        channel: 'issue_comment',
        location: SOURCE_LOCATIONS.MAIN,
        marker: 'CURSOR BRIDGE STARTED',
        identityFields: ['issueNumber', 'resumeCommentId', 'sessionId', 'action'],
        evidenceClass: 'deterministic',
      },
      {
        surface: 'manual-pickup',
        channel: 'mixed',
        location: SOURCE_LOCATIONS.MAIN,
        marker: null,
        identityFields: ['commitSha', 'prNumber', 'commentId'],
        evidenceClass: 'evidence_missing',
        notes:
          'Manual/poll-wake pickup has no structured start marker. Pickup must ' +
          'be inferred from a commit, PR creation/update, or claim comment on ' +
          'the source Issue; adapters must classify which artifact proved pickup.',
      },
    ],
    endEvidence: [
      {
        surface: 'bridge-completed-comment',
        channel: 'issue_comment',
        location: SOURCE_LOCATIONS.MAIN,
        marker: 'CURSOR BRIDGE COMPLETED',
        identityFields: ['issueNumber', 'exitCode'],
        evidenceClass: 'deterministic',
      },
      {
        surface: 'task-pr-opened',
        channel: 'api_object',
        location: SOURCE_LOCATIONS.MAIN,
        marker: 'pulls API',
        identityFields: ['prNumber', 'headSha', 'baseRef', 'createdAt'],
        evidenceClass: 'deterministic',
      },
    ],
  },
  {
    id: 'review',
    order: 5,
    name: 'Review',
    owner: 'pr_approver_engineering',
    definition: 'Implementation handoff acknowledged; current-head evidence collected.',
    startEvidence: [
      {
        surface: 'pr-review-objects',
        channel: 'api_object',
        location: SOURCE_LOCATIONS.MAIN,
        marker: 'reviews API',
        identityFields: ['prNumber', 'reviewId', 'author', 'state', 'commitSha'],
        evidenceClass: 'deterministic',
      },
      {
        surface: 'controller-evidence-complete',
        channel: 'workflow_artifact',
        location: SOURCE_LOCATIONS.CONTROLLER_COMPONENT,
        marker: 'observability.kind=evidence_complete|disposition',
        identityFields: ['schemaVersion', 'kind', 'outcome', 'at', 'runId'],
        evidenceClass: 'deterministic',
      },
    ],
    endEvidence: [
      {
        surface: 'reviewer-response-gate',
        channel: 'check_run',
        location: SOURCE_LOCATIONS.MAIN,
        marker: 'GATE — Reviewer Response Completion',
        identityFields: ['prNumber', 'conclusion', 'headSha'],
        evidenceClass: 'deterministic',
      },
      {
        surface: 'advisory-comments',
        channel: 'pr_comment',
        location: SOURCE_LOCATIONS.MAIN,
        marker: '<!-- diff-scope-advisory --> | <!-- pr-hygiene-advisory -->',
        identityFields: ['prNumber', 'commentId'],
        evidenceClass: 'deterministic',
      },
    ],
  },
  {
    id: 'remediation',
    order: 6,
    name: 'Remediation',
    owner: 'implementation_operations',
    definition: 'Bounded correction was routed and completed, if required.',
    startEvidence: [
      {
        surface: 'resume-instruction-comment',
        channel: 'issue_comment',
        location: SOURCE_LOCATIONS.MAIN,
        marker: 'LOCAL CURSOR RESUME',
        identityFields: ['Issue', 'Next local action'],
        evidenceClass: 'deterministic',
        notes: 'Exactly one "- " action bullet is required by Bridge eligibility.',
      },
      {
        surface: 'controller-resume',
        channel: 'workflow_artifact',
        location: SOURCE_LOCATIONS.CONTROLLER_COMPONENT,
        marker: 'observability.kind=resume',
        identityFields: ['schemaVersion', 'kind', 'outcome', 'at', 'runId'],
        evidenceClass: 'deterministic',
      },
    ],
    endEvidence: [
      {
        surface: 'correction-commit-or-reply',
        channel: 'mixed',
        location: SOURCE_LOCATIONS.MAIN,
        marker: null,
        identityFields: ['commitSha', 'commentId'],
        evidenceClass: 'evidence_missing',
        notes:
          'Completion of a bounded correction has no dedicated marker; adapters ' +
          'must pair the resume instruction with subsequent commit/PR/thread-reply ' +
          'evidence and otherwise report unknown.',
      },
    ],
  },
  {
    id: 'integration',
    order: 7,
    name: 'Integration',
    owner: 'deterministic_ci',
    definition: 'Authorized non-main integration occurred or a precise blocker was recorded.',
    startEvidence: [
      {
        surface: 'controller-integration',
        channel: 'workflow_artifact',
        location: SOURCE_LOCATIONS.CONTROLLER_COMPONENT,
        marker: 'observability.kind=integration',
        identityFields: ['schemaVersion', 'kind', 'outcome', 'at', 'runId'],
        evidenceClass: 'deterministic',
      },
    ],
    endEvidence: [
      {
        surface: 'component-merge',
        channel: 'api_object',
        location: SOURCE_LOCATIONS.MAIN,
        marker: 'pulls API merged=true',
        identityFields: ['prNumber', 'mergeSha', 'baseRef', 'mergedAt', 'mergedBy'],
        evidenceClass: 'deterministic',
      },
      {
        surface: 'controller-blocker',
        channel: 'workflow_artifact',
        location: SOURCE_LOCATIONS.CONTROLLER_COMPONENT,
        marker: 'observability.kind=blocker|escalation',
        identityFields: ['schemaVersion', 'kind', 'outcome', 'at', 'runId'],
        evidenceClass: 'deterministic',
      },
    ],
  },
  {
    id: 'verification',
    order: 8,
    name: 'Verification',
    owner: 'deterministic_ci',
    definition: 'Merge SHA, checks, and source-Issue state were reconciled.',
    startEvidence: [
      {
        surface: 'post-merge-detection-run',
        channel: 'workflow_run',
        location: SOURCE_LOCATIONS.MAIN,
        marker: '.github/workflows/post-merge-closeout.yml',
        identityFields: ['runId', 'prNumber'],
        evidenceClass: 'deterministic',
      },
    ],
    endEvidence: [
      {
        surface: 'post-merge-result-artifact',
        channel: 'workflow_artifact',
        location: SOURCE_LOCATIONS.MAIN,
        marker: 'post-merge-validation-result / post-merge-result.json',
        identityFields: [
          'status',
          'pr',
          'merge_sha',
          'source_issue',
          'sync_action',
          'workflow_run_url',
        ],
        evidenceClass: 'deterministic',
      },
      {
        surface: 'source-issue-closeout-comment',
        channel: 'issue_comment',
        location: SOURCE_LOCATIONS.MAIN,
        marker: 'Post-merge source issue closeout completed.',
        identityFields: ['PR', 'Merge SHA', 'Source issue', 'Validator status'],
        evidenceClass: 'deterministic',
        notes: 'Failure variant: "Post-merge source issue closeout did not complete."',
      },
    ],
  },
  {
    id: 'closeout',
    order: 9,
    name: 'Closeout',
    owner: 'implementation_operations',
    definition: 'Lane-required evidence was complete.',
    startEvidence: [
      {
        surface: 'cumulative-evidence-event',
        channel: 'issue_comment',
        location: SOURCE_LOCATIONS.EVIDENCE_COMPONENT,
        marker: CUMULATIVE_EVIDENCE_MARKER,
        identityFields: [
          'schemaVersion',
          'idempotencyKey',
          'sourceIssue',
          'workUnitId',
          'lane',
          'transition',
          'candidateSha',
          'timestamp',
          'result',
          'supersedes',
        ],
        evidenceClass: 'deterministic',
        notes:
          'The #2678 event model is the canonical closeout input. Schema and ' +
          'read-side adapters live on component/cumulative-lane-evidence pending promotion.',
      },
      {
        surface: 'legacy-closeout-checklist',
        channel: 'pr_body',
        location: SOURCE_LOCATIONS.MAIN,
        marker: '## POST-MERGE CLOSEOUT CHECKLIST',
        identityFields: ['prNumber', 'mergeSha'],
        evidenceClass: 'deterministic',
        notes: 'Legacy compatibility surface; non-authoritative under #2678 migration.',
      },
    ],
    endEvidence: [
      {
        surface: 'controller-closeout',
        channel: 'workflow_artifact',
        location: SOURCE_LOCATIONS.CONTROLLER_COMPONENT,
        marker: 'observability.kind=closeout',
        identityFields: ['schemaVersion', 'kind', 'outcome', 'at', 'runId'],
        evidenceClass: 'deterministic',
      },
      {
        surface: 'source-issue-closed',
        channel: 'api_object',
        location: SOURCE_LOCATIONS.MAIN,
        marker: 'issues API state=closed',
        identityFields: ['issueNumber', 'closedAt'],
        evidenceClass: 'deterministic',
        notes: 'Issue closure alone is insufficient; must pair with closeout evidence.',
      },
    ],
  },
  {
    id: 'continuation',
    order: 10,
    name: 'Continuation',
    owner: 'administration_communications',
    definition: 'Eligible successor was activated and delivered.',
    startEvidence: [
      {
        surface: 'controller-successor-activation',
        channel: 'workflow_artifact',
        location: SOURCE_LOCATIONS.CONTROLLER_COMPONENT,
        marker: 'observability.kind=successor_activation',
        identityFields: ['schemaVersion', 'kind', 'outcome', 'at', 'runId'],
        evidenceClass: 'deterministic',
      },
      {
        surface: 'manual-successor-dispatch',
        channel: 'issue_comment',
        location: SOURCE_LOCATIONS.MAIN,
        marker: null,
        identityFields: ['issueNumber', 'commentId'],
        evidenceClass: 'evidence_missing',
        notes:
          'Manual successor dispatch comments are free-form; a handoff:ready label ' +
          'flip alone is label-only state and never accepted as activation evidence.',
      },
    ],
    endEvidence: [
      {
        surface: 'successor-wake-ack',
        channel: 'issue_comment',
        location: SOURCE_LOCATIONS.MAIN,
        marker: 'CURSOR BRIDGE ACK: delivered',
        identityFields: ['deliveryId'],
        evidenceClass: 'deterministic',
        notes: 'Continuation end chains into the successor transaction delivery stage.',
      },
    ],
  },
]);

export const STAGE_IDS = Object.freeze(STAGES.map((s) => s.id));

/**
 * Validate the inventory against the #2886 acceptance rules:
 * every stage has start and end evidence; every source is fully classified;
 * label-only sources are never deterministic; every evidence_missing source
 * explains the gap; deterministic GitHub-visible sources carry a marker and
 * identity fields.
 *
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateEventInventory(stages = STAGES) {
  const errors = [];
  const seen = new Set();

  if (!Array.isArray(stages)) {
    return { ok: false, errors: ['inventory_not_an_array'] };
  }

  for (const stage of stages) {
    if (!stage || typeof stage !== 'object' || typeof stage.id !== 'string' || !stage.id) {
      errors.push('malformed_stage_entry');
      continue;
    }
    if (seen.has(stage.id)) errors.push(`duplicate_stage:${stage.id}`);
    seen.add(stage.id);

    for (const [group, sources] of [
      ['startEvidence', stage.startEvidence],
      ['endEvidence', stage.endEvidence],
    ]) {
      if (!Array.isArray(sources) || sources.length === 0) {
        errors.push(`missing_${group}:${stage.id}`);
        continue;
      }
      for (const source of sources) {
        if (!source || typeof source !== 'object' || typeof source.surface !== 'string' || !source.surface) {
          errors.push(`malformed_source_entry:${stage.id}/${group}`);
          continue;
        }
        const label = `${stage.id}/${group}/${source.surface}`;
        if (!EVIDENCE_CLASSES.includes(source.evidenceClass)) {
          errors.push(`invalid_evidence_class:${label}`);
        }
        if (!Object.values(SOURCE_LOCATIONS).includes(source.location)) {
          errors.push(`invalid_location:${label}`);
        }
        if (source.evidenceClass === 'deterministic') {
          if (!source.marker) errors.push(`deterministic_without_marker:${label}`);
          if (!Array.isArray(source.identityFields) || source.identityFields.length === 0) {
            errors.push(`deterministic_without_identity_fields:${label}`);
          }
        }
        if (source.evidenceClass === 'evidence_missing' && !source.notes) {
          errors.push(`missing_gap_explanation:${label}`);
        }
        if (source.channel === 'label' || /label-only/.test(source.surface)) {
          errors.push(`label_only_source_not_permitted:${label}`);
        }
      }
    }
  }

  const orders = stages.map((s) => s?.order);
  const expected = Array.from({ length: stages.length }, (_, i) => i + 1);
  if (JSON.stringify(orders) !== JSON.stringify(expected)) {
    errors.push('stage_order_not_contiguous');
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Summarize inventory coverage for reporting: per-stage deterministic
 * coverage and the explicit gap list that adapters must surface as
 * unknown/evidence-missing conditions.
 */
export function summarizeInventoryGaps(stages = STAGES) {
  const gaps = [];
  for (const stage of stages) {
    for (const [group, sources] of [
      ['start', stage.startEvidence],
      ['end', stage.endEvidence],
    ]) {
      for (const source of sources) {
        if (source.evidenceClass !== 'deterministic') {
          gaps.push({
            stage: stage.id,
            boundary: group,
            surface: source.surface,
            evidenceClass: source.evidenceClass,
            notes: source.notes || null,
          });
        }
      }
    }
  }
  return { schemaVersion: INVENTORY_SCHEMA_VERSION, gapCount: gaps.length, gaps };
}
