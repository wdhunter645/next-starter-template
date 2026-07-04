export const DEFAULT_TRUSTED_BOT_LOGINS = [
  'copilot-pull-request-reviewer[bot]',
  'copilot-pull-request-reviewer',
  'cubic-dev-ai[bot]',
  'cubic-dev-ai',
  'chatgpt-codex-connector[bot]',
  'chatgpt-codex-connector',
];

export const TRUSTED_REVIEWERS = DEFAULT_TRUSTED_BOT_LOGINS;

const RESOLVED_MARKER = /✅\s*Addressed|addressed in|\bresolved\b|all checks passed|no warnings detected/i;
const UNRESOLVED_MARKER = /\bunresolved\b|\bnot\s+resolved\b|\bstill\s+open\b|\bstill\s+blocking\b/i;

function normalizeLogin(login = '') {
  return String(login || '').trim().toLowerCase();
}

export function trustedBotSet(logins = DEFAULT_TRUSTED_BOT_LOGINS) {
  return new Set(logins.map(normalizeLogin).filter(Boolean));
}

export function parseTrustedBotLogins(value = '') {
  if (!value) return DEFAULT_TRUSTED_BOT_LOGINS;
  return value.split(',').map((entry) => entry.trim()).filter(Boolean);
}

export function isTrustedReviewer(login = '', trustedBots = trustedBotSet()) {
  return trustedBots.has(normalizeLogin(login));
}

export function isResolvedReviewText(body = '') {
  return RESOLVED_MARKER.test(body || '') && !UNRESOLVED_MARKER.test(body || '');
}
