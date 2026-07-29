import { isFourLaneEnabled } from './four-lane-runtime.mjs';

function scopesOverlap(a = [], b = []) {
  return a.some((left) => b.some((right) => {
    const l = left.replace(/\*\*?$/, '');
    const r = right.replace(/\*\*?$/, '');
    return l === r || l.startsWith(r) || r.startsWith(l);
  }));
}

export function evaluateLaneEligibility(snapshot, allSnapshots = [], { now = new Date().toISOString(), policy = {} } = {}) {
  if (!snapshot || snapshot.ambiguous) return { eligible: false, reason: 'ambiguous_state' };

  if (isFourLaneEnabled(policy) && snapshot.operatingLanes) {
    const nestedPhase = snapshot.operatingLanes.lanes?.['implementation-operations']?.nestedReview?.phase || 'none';
    // Nested review/admin/integration backlog must not consume the active implementation claim.
    if (['review-pending', 'administration-pending', 'integration-eligible'].includes(nestedPhase)) {
      return { eligible: false, reason: 'nested_review_or_admin_pending' };
    }
    if (snapshot.operatingLanes.lanes?.['administration-communications']?.blocksDelivery === true) {
      return { eligible: false, reason: 'administration_substantive_defect' };
    }
    if (
      snapshot.operatingLanes.operationalHold?.active
      && ['assessment', 'targeted-project'].includes(snapshot.operatingLanes.operationalHold.scope || 'assessment')
    ) {
      return { eligible: false, reason: 'operational_assessment_hold' };
    }
    if (snapshot.dependencyClass === 'administrative-only' && snapshot.dependencyState === 'blocked') {
      // administrative-only relationships never block delivery eligibility on their own
      return { eligible: true, reason: 'administrative_only_non_blocking' };
    }
  }

  if (snapshot.dependencyState !== 'ready') return { eligible: false, reason: `dependency_${snapshot.dependencyState}` };
  const currentTime = new Date(now).getTime();
  for (const other of allSnapshots) {
    if (!other || other === snapshot || other.identity?.taskIssue === snapshot.identity?.taskIssue) continue;
    const activeClaims = (other.activeClaims || []).filter((claim) => !claim.expiresAt || new Date(claim.expiresAt).getTime() > currentTime);
    const sameLane = other.identity?.projectIssue === snapshot.identity?.projectIssue;
    const collision = scopesOverlap(snapshot.fileScope, other.fileScope);
    if (activeClaims.length && (sameLane || collision)) {
      return { eligible: false, reason: sameLane ? 'lane_already_claimed' : 'mutation_scope_collision', conflictingTask: other.identity?.taskIssue ?? null };
    }
  }
  return { eligible: true, reason: 'eligible' };
}

export { scopesOverlap };
