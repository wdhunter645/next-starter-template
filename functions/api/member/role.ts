// Cloudflare Pages Function for GET /api/member/role
// Returns the role of the authenticated session member only

import { requireMember, getMemberRole } from '../../_lib/session';

function json(data: any, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestGet(context: any): Promise<Response> {
  try {
    const m = await requireMember(context);
    if (!m.ok) {
      return json(m.body, m.status);
    }

    const role = await getMemberRole(m.db, m.email);
    return json({ ok: true, role }, 200);
  } catch (e: any) {
    console.error('Error in /api/member/role:', e);
    return json({ ok: false, error: 'Server error' }, 500);
  }
}
