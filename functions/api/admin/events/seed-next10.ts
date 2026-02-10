import { requireAdmin } from "../../../_lib/auth";

export const onRequestPost = async (context: any): Promise<Response> => {
  const { env, request } = context;

  const deny = requireAdmin(request, env);
  if (deny) return deny;

  try {
    // Insert 10 events for the next 10 days (UTC), posted status.
    // Safe for day-1: duplicates are acceptable; this is placeholders.
    const sql = `
      INSERT INTO events (title, start_date, end_date, location, host, fees, description, external_url, status)
      VALUES
        ('LGFC Placeholder Event 01', date('now','+1 day'), date('now','+1 day'), 'LGFC', 'Fan Club', 'Free', 'Placeholder event for calendar display (replace with real content later).', 'https://www.lougehrigfanclub.com', 'posted'),
        ('LGFC Placeholder Event 02', date('now','+2 day'), date('now','+2 day'), 'LGFC', 'Fan Club', 'Free', 'Placeholder event for calendar display (replace with real content later).', 'https://www.lougehrigfanclub.com', 'posted'),
        ('LGFC Placeholder Event 03', date('now','+3 day'), date('now','+3 day'), 'LGFC', 'Fan Club', 'Free', 'Placeholder event for calendar display (replace with real content later).', 'https://www.lougehrigfanclub.com', 'posted'),
        ('LGFC Placeholder Event 04', date('now','+4 day'), date('now','+4 day'), 'LGFC', 'Fan Club', 'Free', 'Placeholder event for calendar display (replace with real content later).', 'https://www.lougehrigfanclub.com', 'posted'),
        ('LGFC Placeholder Event 05', date('now','+5 day'), date('now','+5 day'), 'LGFC', 'Fan Club', 'Free', 'Placeholder event for calendar display (replace with real content later).', 'https://www.lougehrigfanclub.com', 'posted'),
        ('LGFC Placeholder Event 06', date('now','+6 day'), date('now','+6 day'), 'LGFC', 'Fan Club', 'Free', 'Placeholder event for calendar display (replace with real content later).', 'https://www.lougehrigfanclub.com', 'posted'),
        ('LGFC Placeholder Event 07', date('now','+7 day'), date('now','+7 day'), 'LGFC', 'Fan Club', 'Free', 'Placeholder event for calendar display (replace with real content later).', 'https://www.lougehrigfanclub.com', 'posted'),
        ('LGFC Placeholder Event 08', date('now','+8 day'), date('now','+8 day'), 'LGFC', 'Fan Club', 'Free', 'Placeholder event for calendar display (replace with real content later).', 'https://www.lougehrigfanclub.com', 'posted'),
        ('LGFC Placeholder Event 09', date('now','+9 day'), date('now','+9 day'), 'LGFC', 'Fan Club', 'Free', 'Placeholder event for calendar display (replace with real content later).', 'https://www.lougehrigfanclub.com', 'posted'),
        ('LGFC Placeholder Event 10', date('now','+10 day'), date('now','+10 day'), 'LGFC', 'Fan Club', 'Free', 'Placeholder event for calendar display (replace with real content later).', 'https://www.lougehrigfanclub.com', 'posted');
    `;

    await env.DB.prepare(sql).run();

    const countRow = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM events WHERE status='posted' AND start_date >= date('now');"
    ).first();

    return new Response(JSON.stringify({ ok: true, inserted: 10, upcoming_posted: Number((countRow as any)?.n || 0) }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err?.message ?? err) }, null, 2), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
