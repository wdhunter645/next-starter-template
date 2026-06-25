import { fetchClubHomeContent } from '../../_lib/content-inventory-club-home';
import { requireD1 } from '../../_lib/d1';
import {
  aiReviewDeniedResponse,
  aiReviewJsonResponse,
  aiReviewMutationDeniedResponse,
  contentSourcesForClubHome,
  normalizeAiReviewPath,
  readAiReviewEnv,
  sectionsForAiReviewPath,
  validateAiReviewAccess,
} from '../../../src/lib/aiReviewAccess';

function extractToken(request: Request): string | null {
  const url = new URL(request.url);
  return url.searchParams.get('token');
}

function extractPath(request: Request): string | null {
  const url = new URL(request.url);
  return url.searchParams.get('path');
}

async function buildSnapshot(context: {
  request: Request;
  env: Record<string, unknown>;
}): Promise<Response> {
  const env = readAiReviewEnv(context.env);
  const token = extractToken(context.request);
  const path = normalizeAiReviewPath(extractPath(context.request));
  if (!path) return aiReviewDeniedResponse({ ok: false, status: 404 });

  const access = validateAiReviewAccess({ env, token, path });
  if (!access.ok) return aiReviewDeniedResponse(access);

  const payload: Record<string, unknown> = {
    path,
    reviewMode: true,
    adminReview: access.adminReview,
    sections: [...sectionsForAiReviewPath(path)],
  };

  if (path === '/fanclub') {
    const d1 = requireD1(context.env);
    if (!d1.ok) {
      payload.contentSources = contentSourcesForClubHome('static');
      payload.clubHome = {
        ok: true,
        source: 'static',
        lead_story: null,
        rail_stories: [],
        archive_spotlight: null,
        media_feature: null,
      };
      return aiReviewJsonResponse(payload);
    }

    try {
      const clubHome = await fetchClubHomeContent(d1.db, {
        request: context.request,
        publicB2BaseUrl: context.env.PUBLIC_B2_BASE_URL,
      });
      payload.contentSources = contentSourcesForClubHome(clubHome.source);
      payload.clubHome = clubHome;
      payload.headlines = {
        lead: clubHome.lead_story?.headline ?? clubHome.lead_story?.title ?? null,
        rail: (clubHome.rail_stories ?? []).map((story) => story.headline ?? story.title ?? null),
        archiveSpotlight:
          clubHome.archive_spotlight?.headline ?? clubHome.archive_spotlight?.title ?? null,
      };
    } catch {
      payload.contentSources = contentSourcesForClubHome('static');
      payload.clubHome = {
        ok: true,
        source: 'static',
        lead_story: null,
        rail_stories: [],
        archive_spotlight: null,
        media_feature: null,
      };
    }
  }

  if (path === '/admin') {
    payload.readOnly = true;
    payload.mutationControls = 'disabled';
  }

  return aiReviewJsonResponse(payload);
}

export const onRequestGet = async (context: {
  request: Request;
  env: Record<string, unknown>;
}): Promise<Response> => buildSnapshot(context);

export const onRequestPost = async (): Promise<Response> => aiReviewMutationDeniedResponse();
export const onRequestPut = async (): Promise<Response> => aiReviewMutationDeniedResponse();
export const onRequestPatch = async (): Promise<Response> => aiReviewMutationDeniedResponse();
export const onRequestDelete = async (): Promise<Response> => aiReviewMutationDeniedResponse();
