import { stableHash } from './lib/stable.mjs';

export function upsertAlert(alerts = [], input) {
  const id = stableHash({ subject: input.subject, revision: input.revision, code: input.code }, 'alert');
  const existing = alerts.find((alert) => alert.id === id && alert.status !== 'resolved');
  if (existing) return { created: false, alert: existing, alerts };
  const alert = { id, subject: input.subject, revision: input.revision, authority: input.authority, code: input.code, status: 'open', createdAt: input.now, updatedAt: input.now };
  return { created: true, alert, alerts: [...alerts, alert] };
}

export function resolveAlert(alerts = [], id, reason, now = new Date().toISOString()) {
  return alerts.map((alert) => alert.id === id ? { ...alert, status: 'resolved', resolution: reason, updatedAt: now } : alert);
}
