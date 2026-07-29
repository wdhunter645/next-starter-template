import { stableHash } from './lib/stable.mjs';

export function createDeadLetter(input) {
  return {
    id: stableHash({ eventId: input.eventId, subject: input.subject, revision: input.revision, step: input.step }, 'dead-letter'),
    ...input,
    attempts: 0,
    status: 'open',
  };
}

export function replayDeadLetter(record, { now, maxAttempts }) {
  if (record.attempts >= maxAttempts) throw new Error('dead-letter replay limit reached');
  return { ...record, attempts: record.attempts + 1, lastReplayAt: now, status: 'replaying' };
}

export function resolveDeadLetter(record, resolution, now = new Date().toISOString()) {
  return { ...record, status: 'resolved', resolution, resolvedAt: now };
}
