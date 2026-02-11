import { requireD1, jsonResponse } from '../_lib/d1';
import { getSessionId, clearSessionCookie } from '../_lib/session';

async function doLogout(context: any): Promise<Response> {
  const d1 = requireD1(context.env);
  if (!d1.ok) return jsonResponse(d1.body, d1.status);
  const db = d1.db;

  const sid = getSessionId(context.request);
  if (sid) {
    try {
      await db.prepare('DELETE FROM member_sessions WHERE id=?1').bind(sid).run();
    } catch {}
  }

  return new Response(JSON.stringify({ ok: true }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearSessionCookie(),
      'Cache-Control': 'no-store',
    },
  });
}

// Support both POST (preferred) and GET (for simple link-based logout).
export const onRequestPost = async (context: any): Promise<Response> => doLogout(context);
export const onRequestGet = async (context: any): Promise<Response> => doLogout(context);
