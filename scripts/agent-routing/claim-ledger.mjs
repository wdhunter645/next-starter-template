export function claimAction(claims = [], { actionKey, watcherId, now, leaseMinutes }) {
  const nowMs = new Date(now).getTime();
  const active = claims.find((claim) => claim.actionKey === actionKey && claim.status === 'active' && new Date(claim.expiresAt).getTime() > nowMs);
  if (active) return { acquired: false, reason: 'active_claim_exists', claim: active, claims };
  const claim = {
    actionKey,
    watcherId,
    claimedAt: now,
    expiresAt: new Date(nowMs + leaseMinutes * 60000).toISOString(),
    status: 'active',
    result: null,
  };
  return { acquired: true, claim, claims: [...claims.filter((item) => item.actionKey !== actionKey || item.status !== 'active'), claim] };
}

export function completeClaim(claims = [], actionKey, result) {
  return claims.map((claim) => claim.actionKey === actionKey ? { ...claim, status: 'complete', result } : claim);
}
