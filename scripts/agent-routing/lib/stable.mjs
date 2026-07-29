import { createHash } from 'node:crypto';

export function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

export function stableStringify(value) {
  return JSON.stringify(canonicalize(value));
}

export function stableHash(value, prefix = '') {
  const digest = createHash('sha256').update(stableStringify(value)).digest('hex');
  return prefix ? `${prefix}:${digest.slice(0, 24)}` : digest;
}

export function minutesBetween(start, end) {
  if (!start || !end) return null;
  const delta = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(delta)) return null;
  return Math.max(0, Math.round(delta / 60000));
}
