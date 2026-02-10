import { requireD1, jsonResponse } from "../_lib/d1";
import { getSessionId, clearSessionCookie } from "../_lib/session";

export const onRequestPost = async (context: any): Promise<Response> => {
  const { env, request } = context;

  const d1 = requireD1(env);
  if (!d1.ok) return jsonResponse(d1.body, d1.status);
  const db = d1.db;

  const sid = getSessionId(request);
  if (sid) {
    try {
      await db.prepare("DELETE FROM member_sessions WHERE id = ?1").bind(sid).run();
    } catch {
      // ignore
    }
  }

  return new Response(JSON.stringify({ ok: true }, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": clearSessionCookie(),
    },
  });
};
