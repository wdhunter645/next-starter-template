import { requireMember } from '../../_lib/session';

export const onRequestGet = async (context: any): Promise<Response> => {
  const auth = await requireMember(context);
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), {
      status: auth.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const row = await auth.db
      .prepare(
        `SELECT id, title, body_md, updated_at
         FROM membership_card_content
         WHERE status = 'posted'
         ORDER BY updated_at DESC, id DESC
         LIMIT 1`
      )
      .first();

    return new Response(JSON.stringify({ ok: true, content: row || null }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err?.message || err) }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
