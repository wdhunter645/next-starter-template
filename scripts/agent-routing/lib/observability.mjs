/**
 * Structured observability for the deterministic handoff controller (#2774).
 *
 * Emits machine-consumable transition records for #2680 / daily SLO reporting.
 * Observability never mutates GitHub state and never invents authority.
 */

export const OBSERVABILITY_SCHEMA_VERSION = 1;

export const TRANSITION_KINDS = Object.freeze([
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

/**
 * Create a mutable observability recorder bound to one controller/reconcile run.
 * @param {{ runId?: string|null, source?: string|null, enabled?: boolean }} [options]
 */
export function createObservabilityRecorder({
  runId = null,
  source = 'agent-routing-controller',
  enabled = true,
} = {}) {
  const startedAt = new Date().toISOString();
  const events = [];

  function emit(kind, outcome, details = {}) {
    if (!enabled) return null;
    if (!TRANSITION_KINDS.includes(kind)) {
      throw new Error(`unsupported_observability_kind:${kind}`);
    }
    const event = {
      schemaVersion: OBSERVABILITY_SCHEMA_VERSION,
      kind,
      outcome: String(outcome || 'unknown'),
      at: new Date().toISOString(),
      runId: runId || null,
      source,
      ...sanitizeDetails(details),
    };
    events.push(event);
    return event;
  }

  function snapshot() {
    return {
      schemaVersion: OBSERVABILITY_SCHEMA_VERSION,
      enabled: Boolean(enabled),
      source,
      runId: runId || null,
      startedAt,
      completedAt: new Date().toISOString(),
      eventCount: events.length,
      events: events.map((event) => ({ ...event })),
    };
  }

  return {
    enabled: Boolean(enabled),
    emit,
    snapshot,
    events,
  };
}

/**
 * Attach a frozen observability snapshot onto a controller/reconcile result.
 * @param {object} result
 * @param {{ snapshot: Function }} recorder
 */
export function attachObservability(result, recorder) {
  if (!result || typeof result !== 'object' || !recorder) return result;
  return {
    ...result,
    observability: recorder.snapshot(),
  };
}

/**
 * Map a controller result into the required transition kinds for one run.
 * @param {object} result
 * @param {{ emit: Function }} recorder
 * @param {{ path?: string }} [context]
 */
export function recordControllerTransitions(result, recorder, context = {}) {
  if (!recorder?.enabled || !result) return;
  const path = context.path || 'event-driven';

  if (result.packet?.event) {
    recorder.emit('handoff_received', result.ok ? 'accepted' : 'rejected', {
      path,
      eventType: result.packet.event.eventType || null,
      eventCommentId: result.packet.event.eventCommentId || null,
      actionIdentity: result.packet.idempotency?.actionIdentity || null,
    });
    recorder.emit('evidence_complete', result.ok ? 'collected' : 'failed', {
      path,
      source: result.packet.reread?.source || null,
      headSha: result.packet.pullRequest?.headSha || null,
      prNumber: result.packet.pullRequest?.number || null,
      sourceIssueNumber: result.packet.sourceIssue?.number || null,
    });
  }

  const classification = result.remediation?.classification?.classification || null;
  if (classification) {
    recorder.emit('disposition', classification, {
      path,
      dispositionIdentity: result.remediation?.dispositionIdentity || null,
      findingCount: Array.isArray(result.remediation?.findings)
        ? result.remediation.findings.length
        : null,
    });
  }

  const actions = result.remediation?.actions || [];
  for (const action of actions) {
    const type = String(action?.type || '');
    if (type.includes('resume')) {
      recorder.emit('resume', action.suppressed ? 'suppressed' : 'emitted', {
        path,
        identity: action.identity || action.resumeIdentity || null,
        suppressed: Boolean(action.suppressed),
      });
    } else if (type.includes('escalation')) {
      recorder.emit('escalation', action.suppressed ? 'suppressed' : 'emitted', {
        path,
        identity: action.identity || action.escalationIdentity || null,
        suppressed: Boolean(action.suppressed),
      });
    } else if (action.suppressed || action.duplicate) {
      recorder.emit('duplicate_suppression', type || 'remediation', {
        path,
        identity: action.identity || null,
        reason: action.code || action.reason || 'duplicate_or_suppressed',
      });
    }
  }

  if (result.integration) {
    const integration = result.integration;
    if (integration.suppressed || integration.code?.includes('already')) {
      recorder.emit('duplicate_suppression', 'integration', {
        path,
        code: integration.code || null,
        identity: integration.identity || null,
      });
    }
    recorder.emit(
      'integration',
      integration.ok && integration.eligible
        ? 'eligible'
        : integration.ok
          ? 'not_eligible'
          : 'blocked',
      {
        path,
        code: integration.code || null,
        identity: integration.identity || null,
        eligible: Boolean(integration.eligible),
        authorityKind: integration.authority?.kind || null,
      },
    );
  }

  if (result.verification) {
    const verification = result.verification;
    recorder.emit(
      'verification',
      verification.verified ? 'verified' : verification.suppressed ? 'deferred' : 'blocked',
      {
        path,
        code: verification.code || null,
        identity: verification.identity || null,
        verified: Boolean(verification.verified),
      },
    );
  }

  if (result.closeout) {
    recorder.emit(
      'closeout',
      result.closeout.ok && result.closeout.eligible ? 'eligible' : 'blocked',
      {
        path,
        code: result.closeout.code || null,
        identity: result.closeout.identity || null,
      },
    );
  }

  if (result.successor || result.closeout?.successor) {
    const successor = result.successor || result.closeout.successor;
    recorder.emit(
      'successor_activation',
      successor.ok && successor.eligible ? 'eligible' : 'blocked',
      {
        path,
        code: successor.code || null,
        identity: successor.identity || null,
        successorIssueNumber: successor.successorIssueNumber || null,
      },
    );
  }

  if (!result.ok) {
    recorder.emit('blocker', result.code || 'fail_closed', {
      path,
      message: result.message || null,
      code: result.code || null,
    });
  }

  if (result.mutationDisabled === true || result.diagnosticsOnly === true) {
    recorder.emit('mutation_disabled', 'diagnostics_only', {
      path,
      switches: result.mutationSwitches || null,
    });
  }
}

function sanitizeDetails(details = {}) {
  const out = {};
  for (const [key, value] of Object.entries(details || {})) {
    if (value === undefined) continue;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = { ...value };
    } else {
      out[key] = value;
    }
  }
  return out;
}
