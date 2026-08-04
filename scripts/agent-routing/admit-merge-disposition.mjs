#!/usr/bin/env node

/**
 * Classify non-production admit merge outcomes for source-Issue evidence (#2622).
 *
 * Gate failure, merge refused (API OK, merged:false), and merge API failure
 * (exception / transport error) must remain distinct.
 */

/**
 * @param {{ merged?: boolean, message?: string, error?: Error|string|null }} result
 * @returns {{ disposition: 'merged'|'refused'|'api_failure', merged: boolean, mergeSha: string, message: string }}
 */
export function classifyPullsMergeResult(result = {}) {
  if (result.error) {
    const message = result.error instanceof Error
      ? (result.error.message || String(result.error))
      : String(result.error || 'pulls.merge threw');
    return {
      disposition: 'api_failure',
      merged: false,
      mergeSha: '',
      message,
    };
  }

  if (result.merged === true) {
    return {
      disposition: 'merged',
      merged: true,
      mergeSha: String(result.sha || ''),
      message: String(result.message || ''),
    };
  }

  return {
    disposition: 'refused',
    merged: false,
    mergeSha: '',
    message: String(result.message || 'pulls.merge returned merged:false'),
  };
}

/**
 * @param {{
 *   gatesPassed: boolean,
 *   merged: boolean,
 *   mergeDisposition?: string,
 *   mergeMessage?: string,
 *   mergeSha?: string,
 * }} input
 * @returns {string} single evidence line for Automatically merged: …
 */
export function formatAdmitMergeEvidenceLine({
  gatesPassed,
  merged,
  mergeDisposition = '',
  mergeMessage = '',
  mergeSha = '',
} = {}) {
  if (merged) {
    return `Automatically merged: YES (merge SHA ${mergeSha})`;
  }
  if (!gatesPassed) {
    return 'Automatically merged: NO — a required gate failed or was unavailable; the PR remains open for disposition.';
  }
  if (mergeDisposition === 'refused') {
    const detail = mergeMessage ? ` (${mergeMessage})` : '';
    return `Automatically merged: NO — MERGE REFUSED${detail}; the PR remains open for disposition.`;
  }
  if (mergeDisposition === 'api_failure') {
    const detail = mergeMessage ? ` (${mergeMessage})` : '';
    return `Automatically merged: NO — MERGE API FAILURE${detail}; the PR remains open for disposition.`;
  }
  return 'Automatically merged: NO — required inline gates passed, but merge did not complete; the PR remains open for disposition.';
}
