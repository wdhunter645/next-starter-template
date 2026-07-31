#!/usr/bin/env node
/**
 * Idempotent derived summary for cumulative lane evidence. A pure view over
 * authoritative events; it never mutates, edits, or supersedes history —
 * the upsert below only ever updates its own single summary comment.
 * Work unit #2883 / parent #2678.
 */

import { githubRepoRequest } from '../ci/github_issue_api.mjs';
import { parseCumulativeEvidenceEvents, resolveAuthoritativeEventsBySlot } from './adapters.mjs';
import { EXIT_TRANSITIONS } from './validate-event.mjs';

export const SUMMARY_MARKER = '<!-- lgfc-cumulative-evidence-summary:v1 -->';

const LANE_ORDER = ['sandbox', 'development', 'promotion_candidate', 'production'];

/**
 * @param {{ commentId: string, createdAt: string, event: object }[]} parsedEvents
 * @returns {{ lane: string, transition: string, result: string, exited: boolean }[]}
 */
export function deriveLaneSummary(parsedEvents = []) {
  const authoritative = resolveAuthoritativeEventsBySlot(parsedEvents);

  const byLane = new Map();
  for (const entry of authoritative) {
    const e = entry.event;
    const existing = byLane.get(e.lane);
    if (!existing || new Date(entry.createdAt) >= new Date(existing.createdAt)) {
      byLane.set(e.lane, entry);
    }
  }

  return LANE_ORDER.filter((lane) => byLane.has(lane)).map((lane) => {
    const e = byLane.get(lane).event;
    const exited =
      EXIT_TRANSITIONS.has(e.transition) &&
      (!Array.isArray(e.protectedStops) || e.protectedStops.length === 0);
    return { lane, transition: e.transition, result: e.result, exited };
  });
}

export function renderSummaryComment(parsedEvents = []) {
  const rows = deriveLaneSummary(parsedEvents);
  const lines = [
    SUMMARY_MARKER,
    '',
    '## Cumulative Lane Evidence Summary',
    '',
    '_Derived view only. The authoritative history is the append-only event',
    'comments above; this summary never supersedes or rewrites them._',
    '',
    '| Lane | Latest transition | Result | Exited |',
    '| --- | --- | --- | --- |',
  ];
  for (const row of rows) {
    lines.push(`| ${row.lane} | ${row.transition} | ${row.result} | ${row.exited ? 'yes' : 'no'} |`);
  }
  if (rows.length === 0) lines.push('| _(no events yet)_ |  |  |  |');
  return lines.join('\n');
}

/**
 * Idempotently upsert the single derived summary comment on an Issue: update
 * it in place if it already exists, otherwise create it once.
 *
 * @param {{
 *   token: string, repository: string, issueNumber: number, comments: object[],
 *   requestFn?: Function,
 * }} params
 */
export async function upsertSummaryComment({
  token,
  repository,
  issueNumber,
  comments = [],
  requestFn = githubRepoRequest,
} = {}) {
  const parsedEvents = parseCumulativeEvidenceEvents(comments);
  const body = renderSummaryComment(parsedEvents);

  const existing = comments.find((c) => (c.body || c.bodyText || '').trimStart().startsWith(SUMMARY_MARKER));
  if (existing) {
    await requestFn({
      token,
      repository,
      path: `/issues/comments/${existing.id}`,
      method: 'PATCH',
      body: { body },
      userAgent: 'lgfc-cumulative-lane-evidence-summary',
    });
    return { ok: true, updated: true, commentId: String(existing.id) };
  }

  const created = await requestFn({
    token,
    repository,
    path: `/issues/${issueNumber}/comments`,
    method: 'POST',
    body: { body },
    userAgent: 'lgfc-cumulative-lane-evidence-summary',
  });
  return { ok: true, updated: false, commentId: String(created?.id ?? '') };
}
