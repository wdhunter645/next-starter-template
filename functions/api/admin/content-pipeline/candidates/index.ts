// GET /api/admin/content-pipeline/candidates
// Lists or fetches LGFC content pipeline candidates. Protected by ADMIN_TOKEN.

import {
  isValidCandidateId,
  parseCandidateListQuery,
  serializeCandidateForAdmin,
  CANDIDATE_ID_VALIDATION_MESSAGE,
} from '../../../../_lib/content-pipeline-candidate-admin';
import {
  getCandidateByCandidateId,
  listCandidates,
  requireContentPipelineCandidateTables,
} from '../../../../_lib/content-pipeline-candidate-repository';
import { requireAdmin } from '../../../../_lib/auth';
import { jsonResponse, requireD1 } from '../../../../_lib/d1';

export const onRequestGet = async (context: any): Promise<Response> => {
  const { request, env } = context;

  const deny = requireAdmin(request, env);
  if (deny) return deny;

  const d1 = requireD1(env);
  if (!d1.ok) return jsonResponse(d1.body, d1.status);

  const tables = await requireContentPipelineCandidateTables(d1.db);
  if (!tables.ok) return jsonResponse(tables.body, tables.status);

  try {
    const url = new URL(request.url);
    const candidateId = url.searchParams.get('candidate_id')?.trim() || '';

    if (candidateId) {
      if (!isValidCandidateId(candidateId)) {
        return jsonResponse({ ok: false, error: CANDIDATE_ID_VALIDATION_MESSAGE }, 400);
      }

      const includeDeleted =
        url.searchParams.get('include_deleted') === '1' ||
        url.searchParams.get('include_deleted') === 'true';
      const candidate = await getCandidateByCandidateId(d1.db, candidateId, { includeDeleted });
      if (!candidate) {
        return jsonResponse({ ok: false, error: 'Candidate not found.' }, 404);
      }
      return jsonResponse(
        {
          ok: true,
          candidate: serializeCandidateForAdmin(candidate as unknown as Record<string, unknown>),
        },
        200,
      );
    }

    const parsed = parseCandidateListQuery(url);
    if (!parsed.ok) {
      return jsonResponse({ ok: false, error: parsed.error }, 400);
    }

    const candidates = await listCandidates(d1.db, parsed.filter);
    return jsonResponse(
      {
        ok: true,
        count: candidates.length,
        candidates: candidates.map((candidate) =>
          serializeCandidateForAdmin(candidate as unknown as Record<string, unknown>),
        ),
      },
      200,
    );
  } catch (err: any) {
    console.error('admin content-pipeline candidates error:', err);
    return jsonResponse({ ok: false, error: 'Candidate query failed.' }, 500);
  }
};
