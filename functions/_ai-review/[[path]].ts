import {
  aiReviewDeniedResponse,
  normalizeAiReviewPath,
  readAiReviewEnv,
  validateAiReviewAccess,
} from '../../src/lib/aiReviewAccess';

const SEGMENT_TO_PATH: Record<string, '/' | '/fanclub' | '/admin'> = {
  home: '/',
  fanclub: '/fanclub',
  admin: '/admin',
};

function reviewPathFromRequest(request: Request): '/' | '/fanclub' | '/admin' | null {
  const pathname = new URL(request.url).pathname.replace(/\/$/, '');
  const segment = pathname.replace(/^\/_ai-review\/?/, '').split('/')[0] || 'home';
  return SEGMENT_TO_PATH[segment] ?? null;
}

export async function onRequest(context: {
  request: Request;
  env: Record<string, unknown>;
  next: () => Promise<Response>;
}): Promise<Response> {
  const reviewPath = reviewPathFromRequest(context.request);
  if (!reviewPath) return aiReviewDeniedResponse({ ok: false, status: 404 });

  const token = new URL(context.request.url).searchParams.get('token');
  const access = validateAiReviewAccess({
    env: readAiReviewEnv(context.env),
    token,
    path: reviewPath,
  });
  if (!access.ok) return aiReviewDeniedResponse(access);

  return context.next();
}
