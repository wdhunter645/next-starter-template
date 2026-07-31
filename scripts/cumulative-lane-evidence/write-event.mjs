#!/usr/bin/env node
/**
 * Append-only writer for cumulative lane evidence events.
 * Never edits or deletes an existing event comment; a correction is
 * authored as a new `correct` transition event with `supersedes` set.
 * Work unit #2883 / parent #2678.
 */

import { githubRepoRequest } from '../ci/github_issue_api.mjs';
import { validateCumulativeEvidenceEvent } from './validate-event.mjs';
import { EVENT_MARKER, parseCumulativeEvidenceEvents } from './adapters.mjs';

export function renderEventComment(event) {
  return `${EVENT_MARKER}\n${JSON.stringify(event, null, 2)}`;
}

/**
 * @param {{
 *   token: string,
 *   repository: string,
 *   issueNumber: number,
 *   event: object,
 *   existingComments: object[],
 *   requestFn?: Function,
 * }} params
 * @returns {Promise<{ ok: boolean, written: boolean, commentId: string, errors: string[] }>}
 */
export async function writeCumulativeEvidenceEvent({
  token,
  repository,
  issueNumber,
  event,
  existingComments = [],
  requestFn = githubRepoRequest,
} = {}) {
  const parsedExisting = parseCumulativeEvidenceEvents(existingComments);

  // Idempotent no-op: an event with this idempotencyKey already exists.
  // History is append-only, so a repeated write request never creates a
  // duplicate comment and never edits the original.
  const duplicate = parsedExisting.find(
    (entry) => entry.event?.idempotencyKey === event?.idempotencyKey,
  );
  if (duplicate) {
    return { ok: true, written: false, commentId: duplicate.commentId, errors: [] };
  }

  const validation = validateCumulativeEvidenceEvent(event, {});
  if (!validation.ok) {
    return { ok: false, written: false, commentId: '', errors: validation.errors };
  }

  const body = renderEventComment(event);
  const created = await requestFn({
    token,
    repository,
    path: `/issues/${issueNumber}/comments`,
    method: 'POST',
    body: { body },
    userAgent: 'lgfc-cumulative-lane-evidence-writer',
  });

  return { ok: true, written: true, commentId: String(created?.id ?? ''), errors: [] };
}
