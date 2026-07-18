import { evaluateLaneEligibility } from './lane-eligibility.mjs';
import { stableHash } from './lib/stable.mjs';

export function reconcileSnapshots(snapshots = [], policy = {}) {
  const ordered = [...snapshots].sort((a, b) => {
    const project = Number(a.identity?.projectIssue || 0) - Number(b.identity?.projectIssue || 0);
    return project || Number(a.identity?.taskIssue || 0) - Number(b.identity?.taskIssue || 0);
  });
  const dispositions = ordered.map((snapshot) => ({
    snapshot,
    eligibility: evaluateLaneEligibility(snapshot, ordered, { now: policy.now }),
  }));
  const selected = dispositions.find((item) => item.eligibility.eligible)?.snapshot || null;
  const result = {
    mode: policy.mode || 'observe',
    selected,
    dispositions: dispositions.map(({ snapshot, eligibility }) => ({ identity: snapshot.identity, revision: snapshot.revision, ...eligibility })),
    inventedWork: false,
  };
  return { ...result, reconciliationKey: stableHash(result, 'reconcile') };
}
