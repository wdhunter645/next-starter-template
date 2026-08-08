export class GitHubApiTransientError extends Error {
  constructor({
    method = 'GET',
    url = '',
    status = 0,
    body = '',
    attempts = 0,
    attemptLog = [],
  } = {}) {
    super(`${method} ${url} failed after ${attempts} transient GitHub API attempts: ${status} ${body}`.trim());
    this.name = 'GitHubApiTransientError';
    this.method = method;
    this.url = url;
    this.status = status;
    this.body = body;
    this.attempts = attempts;
    this.attemptLog = attemptLog;
    this.classification = 'infrastructure-transient';
  }
}

export function isRetryableGitHubApiStatus(status) {
  return Number(status) >= 500 && Number(status) < 600;
}

export function computeBackoffDelayMs(attempt, initialBackoffMs = 1000, maxBackoffMs = 4000) {
  return Math.min(initialBackoffMs * 2 ** Math.max(attempt - 1, 0), maxBackoffMs);
}

export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseSuccessfulResponse(response, responseText, parse) {
  if (response.status === 204 || parse === 'none') return null;
  if (typeof parse === 'function') return parse(responseText, response);
  if (parse === 'text') return responseText;
  return responseText ? JSON.parse(responseText) : null;
}

export async function githubApiRequestWithRetry({
  url,
  method = 'GET',
  headers = {},
  body,
  parse = 'json',
  maxAttempts = 3,
  initialBackoffMs = 1000,
  maxBackoffMs = 4000,
  fetchFn = fetch,
  sleepFn = sleep,
} = {}) {
  const attemptLog = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetchFn(url, {
      method,
      headers,
      ...(body !== undefined ? { body } : {}),
    });
    const responseText = response.status === 204 ? '' : await response.text();

    if (response.ok) {
      attemptLog.push({
        attempt,
        status: response.status,
        outcome: 'success',
      });
      return {
        data: parseSuccessfulResponse(response, responseText, parse),
        status: response.status,
        attempts: attempt,
        attemptLog,
      };
    }

    if (!isRetryableGitHubApiStatus(response.status)) {
      throw new Error(`${method} ${url} failed: ${response.status} ${responseText}`.trim());
    }

    const retryableAttempt = {
      attempt,
      status: response.status,
      outcome: attempt < maxAttempts ? 'retrying' : 'exhausted',
      classification: 'infrastructure-transient',
    };
    if (attempt < maxAttempts) {
      retryableAttempt.delayMs = computeBackoffDelayMs(attempt, initialBackoffMs, maxBackoffMs);
    }
    attemptLog.push(retryableAttempt);

    if (attempt < maxAttempts) {
      await sleepFn(retryableAttempt.delayMs);
      continue;
    }

    throw new GitHubApiTransientError({
      method,
      url,
      status: response.status,
      body: responseText,
      attempts: attempt,
      attemptLog,
    });
  }

  throw new Error(`Unreachable retry state for ${method} ${url}`);
}
