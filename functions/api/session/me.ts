import { requireMember, getMemberRole } from '../../_lib/session';

export const onRequestGet = async (context: any): Promise<Response> => {
  const m = await requireMember(context);
  if (!m.ok) {
    return new Response(JSON.stringify(m.body), {
      status: m.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const role = await getMemberRole(m.db, m.email);
  return new Response(JSON.stringify({ ok: true, email: m.email, role }, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
