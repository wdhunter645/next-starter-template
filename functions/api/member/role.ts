// Cloudflare Pages Function for GET /api/member/role
// Returns the role of the authenticated member session only.

import { requireMember, getMemberRole } from '../../_lib/session';

function json(data: any, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestGet(context: any): Promise<Response> {
  const auth = await requireMember(context);
  if (!auth.ok) {
    return json(auth.body, auth.status);
  }

  try {
    const role = await getMemberRole(auth.db, auth.email);
    return json({ ok: true, role }, 200);
  } catch (e: any) {
    console.error('Error in /api/member/role:', e);
    return json({ ok: false, error: 'Server error' }, 500);
  }
}
