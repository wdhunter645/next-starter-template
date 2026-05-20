import { requireAdmin } from '../../../_lib/auth';
import { parsePositiveInt } from '../../../_lib/faqModeration';

export const onRequestPost = async (context: { request: Request; env: { DB?: unknown } }): Promise<Response> => {
  const { request, env } = context;
  const deny = requireAdmin(request, env);
  if (deny) return deny;

  try {
    const body = await request.json().catch(() => ({}));
    const id = parsePositiveInt(body?.id);
    if (!id) {
      return new Response(JSON.stringify({ ok: false, error: 'Valid FAQ entry ID required.' }, null, 2), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = env.DB as {
      prepare: (sql: string) => { bind: (...args: unknown[]) => { run: () => Promise<unknown> } };
    };

    await db
      .prepare("UPDATE faq_entries SET status = 'denied', updated_at = datetime('now') WHERE id = ?")
      .bind(id)
      .run();

    return new Response(JSON.stringify({ ok: true, id }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    console.error('admin faq/delete error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'Failed to delete FAQ entry.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
