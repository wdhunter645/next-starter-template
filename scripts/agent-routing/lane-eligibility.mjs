function scopesOverlap(a = [], b = []) {
  return a.some((left) => b.some((right) => {
    const l = left.replace(/\*\*?$/, '');
    const r = right.replace(/\*\*?$/, '');
    return l === r || l.startsWith(r) || r.startsWith(l);
  }));
}

export function evaluateLaneEligibility(snapshot, allSnapshots = [], { now = new Date().toISOString() } = {}) {
  if (!snapshot || snapshot.ambiguous) return { eligible: false, reason: 'ambiguous_state' };
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
