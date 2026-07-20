import fs from 'node:fs';
import path from 'node:path';
import { bridgeHome } from './paths.mjs';

export function claimPath(config) {
  return path.join(bridgeHome(), config.claimPath || 'claim.json');
}

export function readClaim(config) {
  const p = claimPath(config);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

export function isClaimActive(claim, ttlSeconds) {
  if (!claim || !claim.acquiredAt) return false;
  const age = (Date.now() - new Date(claim.acquiredAt).getTime()) / 1000;
  return age < (ttlSeconds || 7200);
}

/**
 * Acquire exclusive serial claim. Returns {ok, reason, claim}.
 */
export function acquireClaim(config, { issueNumber, resumeCommentId, deliveryId }) {
  const ttl = config.claimTtlSeconds || 7200;
  const existing = readClaim(config);
  if (isClaimActive(existing, ttl)) {
    if (
      Number(existing.issueNumber) === Number(issueNumber) &&
      String(existing.resumeCommentId) === String(resumeCommentId)
    ) {
      return { ok: false, reason: 'already_claimed_same_event', claim: existing };
    }
    return { ok: false, reason: 'serial_lane_busy', claim: existing };
  }

  const claim = {
    issueNumber: Number(issueNumber),
    resumeCommentId: String(resumeCommentId),
    deliveryId: deliveryId || null,
    acquiredAt: new Date().toISOString(),
    pid: process.pid,
  };
  const p = claimPath(config);
  fs.writeFileSync(p, JSON.stringify(claim, null, 2), { mode: 0o600 });
  return { ok: true, reason: 'acquired', claim };
}

export function releaseClaim(config) {
  const p = claimPath(config);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

export function consumedPath(config, resumeCommentId) {
  return path.join(bridgeHome(), config.consumedDir || 'consumed', `${resumeCommentId}.json`);
}

export function isConsumed(config, resumeCommentId) {
  return fs.existsSync(consumedPath(config, resumeCommentId));
}

export function markConsumed(config, resumeCommentId, meta) {
  const p = consumedPath(config, resumeCommentId);
  fs.writeFileSync(
    p,
    JSON.stringify({ resumeCommentId: String(resumeCommentId), ...meta, at: new Date().toISOString() }, null, 2),
    { mode: 0o600 },
  );
}
