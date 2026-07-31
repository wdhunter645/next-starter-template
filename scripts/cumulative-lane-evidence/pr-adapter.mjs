#!/usr/bin/env node
/**
 * Bounded adapter: map an authorized merged PR's own declared metadata and
 * check results into a schema-compliant Development-lane exit event. This
 * is a pure data-mapping function — it never posts to GitHub, never grants
 * approval or merge authority, and never touches `main` or Production. The
 * caller supplies `idempotencyKey`; this adapter does not invent identity.
 * Work unit #2883 / parent #2678.
 */

/**
 * @param {{
 *   sourceIssue: number,
 *   workUnitId: string,
 *   idempotencyKey: string,
 *   pr: { number: number, title?: string, htmlUrl?: string, mergeCommitSha?: string,
 *         changedFiles?: string[], body?: string },
 *   checks: { name: string, conclusion: string }[],
 *   actorRole: string,
 *   timestamp?: string,
 * }} params
 * @returns {object} a Development-lane `exit` cumulative evidence event
 */
export function buildDevelopmentExitEventFromPr({
  sourceIssue,
  workUnitId,
  idempotencyKey,
  pr,
  checks = [],
  actorRole,
  timestamp = new Date().toISOString(),
} = {}) {
  const failedChecks = checks.filter((c) => c.conclusion && c.conclusion !== 'success');
  const verification = {
    checks: checks.map((c) => ({ name: c.name, conclusion: c.conclusion })),
    allPassed: failedChecks.length === 0,
  };

  return {
    schemaVersion: 'lgfc-cumulative-evidence:v1',
    idempotencyKey,
    sourceIssue,
    workUnitId,
    lane: 'development',
    transition: 'exit',
    actorRole,
    timestamp,
    result: failedChecks.length === 0 ? 'pass' : 'blocked',
    evidenceRefs: pr?.htmlUrl ? [{ kind: 'pr', uri: pr.htmlUrl }] : [],
    protectedStops: [],
    candidateSha: pr?.mergeCommitSha || null,
    laneFields: {
      sourceIssue,
      objective: pr?.title || '',
      allowlist: pr?.changedFiles || [],
      implementationSummary: pr?.body || '',
      verification,
      reviewDispositions: failedChecks.length === 0 ? 'all required checks passed' : `blocked: ${failedChecks.map((c) => c.name).join(', ')}`,
      limitationsAndRollback: 'revert the merged component-branch PR',
      componentCandidate: pr?.mergeCommitSha
        ? { sha: pr.mergeCommitSha, prNumber: pr.number }
        : { prNumber: pr?.number ?? null },
    },
  };
}
