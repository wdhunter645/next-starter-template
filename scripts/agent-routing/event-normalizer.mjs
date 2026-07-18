import { stableHash } from './lib/stable.mjs';

const SUBJECTS = ['issue', 'pull_request', 'workflow_run', 'review'];

export function normalizeEvent(payload = {}, context = {}) {
  const eventName = String(context.eventName || 'unknown');
  const subjectType = SUBJECTS.find((key) => payload[key]) || (payload.issue ? 'issue' : 'repository');
  const subject = payload[subjectType] || payload.repository || {};
  const subjectNumber = subject.number ?? subject.id ?? payload.issue?.number ?? null;
  const action = String(payload.action || context.action || 'observed');
  const timestamp = context.timestamp || payload.updated_at || payload.created_at || null;
  const deliveryId = context.deliveryId || null;
  const payloadRevision = stableHash({ eventName, action, subjectType, subjectNumber, payload }, 'event-revision');
  return {
    id: deliveryId || stableHash({ eventName, action, subjectType, subjectNumber, payloadRevision }, 'event'),
    eventName,
    action,
    subject: { type: subjectType, number: subjectNumber },
    timestamp,
    trusted: context.trusted !== false,
    payloadRevision,
  };
}
