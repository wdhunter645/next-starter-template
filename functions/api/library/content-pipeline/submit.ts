// POST /api/library/content-pipeline/submit
// Member-authenticated intake for LGFC content pipeline member submissions (#2316).

import {
  parseMemberSubmissionIntakeBody,
  persistMemberSubmissionIntake,
  requireMemberSubmissionIntakeTables,
  serializeMemberSubmissionIntakeResponse,
} from '../../../_lib/content-pipeline-member-submission-intake';
import { jsonResponse } from '../../../_lib/d1';
import { requireMember } from '../../../_lib/session';

export const onRequestPost = async (context: any): Promise<Response> => {
  const auth = await requireMember(context);
  if (!auth.ok) {
    return jsonResponse(auth.body, auth.status);
  }

  const tables = await requireMemberSubmissionIntakeTables(auth.db);
  if (!tables.ok) {
    return jsonResponse(tables.body, tables.status);
  }

  try {
    const body = await context.request.json().catch(() => null);
    const parsed = parseMemberSubmissionIntakeBody(body);
    if (!parsed.ok) {
      return jsonResponse({ ok: false, error: parsed.error }, 400);
    }

    const result = await persistMemberSubmissionIntake(auth.db, parsed.request, {
      submitterContact: auth.email,
      memberSubmitterId: auth.email,
    });

    return jsonResponse(serializeMemberSubmissionIntakeResponse(result), 200);
  } catch (err: any) {
    console.error('member content-pipeline submit error:', err);
    return jsonResponse({ ok: false, error: 'Member submission intake failed.' }, 500);
  }
};
