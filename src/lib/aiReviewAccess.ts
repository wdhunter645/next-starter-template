export type AiReviewPath = '/' | '/fanclub' | '/admin';

export type AiReviewEnv = {
  enabled: boolean;
  token: string;
  allowAdmin: boolean;
};

export type AiReviewAccessRequest = {
  env: AiReviewEnv;
  token: string | null | undefined;
  path: AiReviewPath;
};

export type AiReviewAccessResult =
  | { ok: true; adminReview: boolean }
  | { ok: false; status: 404 | 403 };

export const AI_REVIEW_FANCLUB_SECTIONS = [
  'FloatingLogo',
  'ClubHomeMasthead',
  'Lead Story',
  'Story Rail',
  'Archives Tiles',
  'Media Feature',
  'Post Creation',
  'Discussion Feed',
  'Archive Spotlight',
  'Campaign & Fundraiser',
  'Events & Calendar',
  'Recognition & Partners',
  'Submission CTA',
  'Gehrig Timeline',
  'Admin Link',
] as const;

export const AI_REVIEW_HOME_SECTIONS = [
  'FloatingLogo',
  'Hero Banner',
  'Campaign Spotlight',
  'Weekly Photo Matchup',
  'Membership CTA',
  'About Lou Gehrig',
  'Social Wall',
  'Recent Discussions Teaser',
  'Friends of the Fan Club',
  'Milestones',
  'Calendar',
  'FAQ',
] as const;

export const AI_REVIEW_ADMIN_MODULES = [
  'Page Content',
  'FAQ Admin',
  'Moderation',
  'Audit & Reporting',
  'Join Requests',
  'Worklist',
  'Member Operations',
  'Media Assets',
  'CMS',
  'Editorial Archive',
  'Event Calendar',
  'Weekly Matchup',
  'Fundraiser Preview',
  'D1 Inspect',
] as const;

const TRUTHY = new Set(['1', 'true', 'yes', 'on']);

export function readAiReviewEnv(source: Record<string, unknown> | undefined): AiReviewEnv {
  const raw = source ?? {};
  const enabled = TRUTHY.has(String(raw.AI_REVIEW_ENABLED ?? '').trim().toLowerCase());
  const token = String(raw.AI_REVIEW_TOKEN ?? '').trim();
  const allowAdmin = TRUTHY.has(String(raw.AI_REVIEW_ALLOW_ADMIN ?? '').trim().toLowerCase());
  return { enabled, token, allowAdmin };
}

export function tokensMatch(expected: string, provided: string): boolean {
  if (!expected || !provided || expected.length !== provided.length) return false;
  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) {
    mismatch |= expected.charCodeAt(index) ^ provided.charCodeAt(index);
  }
  return mismatch === 0;
}

export function normalizeAiReviewPath(value: string | null | undefined): AiReviewPath | null {
  const path = String(value ?? '').trim();
  if (path === '/' || path === '/home') return '/';
  if (path === '/fanclub') return '/fanclub';
  if (path === '/admin') return '/admin';
  return null;
}

export function validateAiReviewAccess(request: AiReviewAccessRequest): AiReviewAccessResult {
  const { env, token, path } = request;
  if (!env.enabled) return { ok: false, status: 404 };
  const provided = String(token ?? '').trim();
  if (!provided || !env.token || !tokensMatch(env.token, provided)) {
    return { ok: false, status: 403 };
  }
  if (path === '/admin' && !env.allowAdmin) return { ok: false, status: 403 };
  return { ok: true, adminReview: path === '/admin' };
}

export function aiReviewDeniedResponse(result: Extract<AiReviewAccessResult, { ok: false }>): Response {
  return new Response(null, { status: result.status });
}

export function aiReviewJsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export function aiReviewMutationDeniedResponse(): Response {
  return aiReviewJsonResponse({ ok: false, error: 'method_not_allowed' }, 405);
}

export function sectionsForAiReviewPath(path: AiReviewPath): readonly string[] {
  if (path === '/fanclub') return AI_REVIEW_FANCLUB_SECTIONS;
  if (path === '/admin') return AI_REVIEW_ADMIN_MODULES;
  return AI_REVIEW_HOME_SECTIONS;
}

export function contentSourcesForClubHome(source: 'content_inventory' | 'static') {
  return {
    clubHome: source === 'content_inventory' ? 'content_inventory:club_home' : 'static',
    fallback: 'static',
  };
}
