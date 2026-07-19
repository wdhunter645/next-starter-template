/**
 * Trusted production-degradation evidence → deduplicated operational incident.
 * Only trusted, evidence-backed signals may create or elevate incidents.
 */

import { stableHash } from '../lib/stable.mjs';

const TRUSTED_SOURCES = new Set([
  'ci',
  'deployment',
  'route-health',
  'health-check',
  'log-alert',
  'ops-alert',
]);

export function normalizeIncidentEvidence(signal = {}) {
  const source = signal.source || null;
  const trusted = signal.trusted === true && TRUSTED_SOURCES.has(source);
  const evidence = {
    source,
    trusted,
    subject: signal.subject || null,
    summary: signal.summary || null,
    runId: signal.runId || null,
    deploymentId: signal.deploymentId || null,
    route: signal.route || null,
    observedAt: signal.observedAt || null,
    severityHint: signal.severityHint || 'unknown',
  };
  return {
    ...evidence,
    evidenceKey: stableHash({
      source: evidence.source,
      subject: evidence.subject,
      runId: evidence.runId,
      deploymentId: evidence.deploymentId,
      route: evidence.route,
      summary: evidence.summary,
    }, 'incident-evidence'),
  };
}

/**
 * Deduplicate against existing incident ledger entries keyed by evidenceKey / subject.
 */
export function upsertOperationalIncident(existing = [], evidence, { now = new Date().toISOString() } = {}) {
  const normalized = evidence.evidenceKey ? evidence : normalizeIncidentEvidence(evidence);
  if (!normalized.trusted) {
    return {
      ok: false,
      reason: 'untrusted_evidence',
      incidents: existing,
      mutation: null,
    };
  }
  const match = existing.find(
    (item) => item.evidenceKey === normalized.evidenceKey
      || (item.subject && normalized.subject && item.subject === normalized.subject && item.status !== 'closed'),
  );
  if (match) {
    const elevated = {
      ...match,
      lastSeenAt: now,
      occurrenceCount: Number(match.occurrenceCount || 1) + 1,
      priority: 'high',
      status: match.status === 'closed' ? 'reopened' : match.status || 'open',
      evidence: [...(match.evidence || []), normalized].slice(-10),
    };
    return {
      ok: true,
      reason: 'elevated_existing',
      incident: elevated,
      incidents: existing.map((item) => (item.incidentKey === match.incidentKey ? elevated : item)),
      mutation: {
        type: 'post_comment',
        marker: 'OPERATIONAL INCIDENT',
        issue: elevated.issueNumber || null,
        deduplicated: true,
      },
    };
  }
  const incidentKey = stableHash({
    evidenceKey: normalized.evidenceKey,
    subject: normalized.subject,
    createdAt: now,
  }, 'incident');
  const created = {
    incidentKey,
    evidenceKey: normalized.evidenceKey,
    subject: normalized.subject,
    priority: 'high',
    status: 'open',
    createdAt: now,
    lastSeenAt: now,
    occurrenceCount: 1,
    evidence: [normalized],
    issueNumber: null,
  };
  return {
    ok: true,
    reason: 'created',
    incident: created,
    incidents: [...existing, created],
    mutation: {
      type: 'create_issue',
      marker: 'OPERATIONAL INCIDENT',
      title: `[Day-2] Operational incident: ${normalized.subject || normalized.evidenceKey}`,
      labels: ['ops', 'pmo:priority:1', 'day2-operations'],
      priority: 'high',
      deduplicated: false,
    },
  };
}

export function classifyIncidentSeverity(incident, assessment = {}) {
  const severity = assessment.severity || 'unknown';
  const contained = assessment.contained === true;
  const falsePositive = assessment.falsePositive === true;
  const lowImpact = assessment.lowImpact === true;
  return {
    incidentKey: incident?.incidentKey || null,
    severity,
    contained,
    falsePositive,
    lowImpact,
    classified: severity !== 'unknown' || falsePositive || lowImpact || contained,
    assessmentHoldReleaseEligible: falsePositive || lowImpact || contained || assessment.recoveryVerified === true,
  };
}

export function planSafeAutoRemediation(incident, policy = {}) {
  if (policy.fourLaneRuntime?.autoRemediation !== true) {
    return { safe: false, authorized: false, reason: 'auto_remediation_disabled' };
  }
  const evidence = (incident?.evidence || []).at(-1) || {};
  if (evidence.source === 'ci' && evidence.runId && policy.actions?.rerunFailedJob === true) {
    return {
      safe: true,
      authorized: true,
      reversible: true,
      evidenceBacked: true,
      runId: evidence.runId,
      reason: 'transient_ci_rerun',
    };
  }
  return { safe: false, authorized: false, reason: 'no_safe_deterministic_remediation' };
}
