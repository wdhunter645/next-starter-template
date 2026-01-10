/**
 * Test endpoint for CMS read helpers
 * Validates getDraftBlocksByPage function
 */

import { getDraftBlocksByPage, getPublishedBlocksByPage, getBlockByKey } from '@/lib/cmsContent';

export const onRequestGet = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'draft';
    const page = url.searchParams.get('page') || 'home';
    const key = url.searchParams.get('key');

    let result;

    switch (action) {
      case 'draft':
        result = await getDraftBlocksByPage(env.DB, page);
        break;
      case 'published':
        result = await getPublishedBlocksByPage(env.DB, page);
        break;
      case 'key':
        if (!key) {
          return new Response(
            JSON.stringify({ ok: false, error: 'key parameter required for action=key' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        result = await getBlockByKey(env.DB, key);
        break;
      default:
        return new Response(
          JSON.stringify({ ok: false, error: 'Invalid action. Use draft, published, or key' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ ok: true, action, page, key, data: result }, null, 2),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err?.message ?? err) }, null, 2),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
