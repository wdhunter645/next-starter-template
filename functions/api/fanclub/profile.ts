import { requireMember } from '../../_lib/session';

function profileFromRow(row: any, sessionEmail: string) {
  return {
    email: sessionEmail,
    first_name: row?.first_name ?? null,
    last_name: row?.last_name ?? null,
    screen_name: row?.screen_name ?? null,
    email_opt_in: row?.email_opt_in == null ? true : Boolean(row?.email_opt_in),
  };
}

async function ensureMemberRecord(db: any, email: string) {
  await db
    .prepare("INSERT OR IGNORE INTO members (email, role) VALUES (?1, 'member')")
    .bind(email)
    .run();
}

export const onRequestGet = async (context: any): Promise<Response> => {
  const auth = await requireMember(context);
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), {
      status: auth.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await ensureMemberRecord(auth.db, auth.email);

    const row = await auth.db
      .prepare(
        `SELECT first_name, last_name, screen_name, email_opt_in
         FROM join_requests
         WHERE lower(email) = lower(?1)
         LIMIT 1`
      )
      .bind(auth.email)
      .first();

    return new Response(JSON.stringify({ ok: true, profile: profileFromRow(row, auth.email) }, null, 2), {
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

export const onRequestPost = async (context: any): Promise<Response> => {
  const auth = await requireMember(context);
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), {
      status: auth.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await context.request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON body' }, null, 2), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const firstName = String((body as any).first_name ?? '').trim();
    const lastName = String((body as any).last_name ?? '').trim();
    const screenName = String((body as any).screen_name ?? '').trim();
    const emailOptIn = (body as any).email_opt_in == null ? true : Boolean((body as any).email_opt_in);

    if (!firstName || !lastName) {
      return new Response(JSON.stringify({ ok: false, error: 'first_name and last_name are required' }, null, 2), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const name = `${firstName} ${lastName}`.trim();

    await ensureMemberRecord(auth.db, auth.email);

    const upsert = await auth.db
      .prepare(
        `UPDATE join_requests
         SET name = ?1,
             first_name = ?2,
             last_name = ?3,
             screen_name = ?4,
             email_opt_in = ?5
         WHERE lower(email) = lower(?6)`
      )
      .bind(name, firstName, lastName, screenName || null, emailOptIn ? 1 : 0, auth.email)
      .run();

    if (Number((upsert as any)?.meta?.changes || 0) === 0) {
      await auth.db
        .prepare(
          `INSERT INTO join_requests (name, email, first_name, last_name, screen_name, email_opt_in, created_at)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, datetime('now'))`
        )
        .bind(name, auth.email, firstName, lastName, screenName || null, emailOptIn ? 1 : 0)
        .run();
    }

    const row = await auth.db
      .prepare(
        `SELECT first_name, last_name, screen_name, email_opt_in
         FROM join_requests
         WHERE lower(email) = lower(?1)
         LIMIT 1`
      )
      .bind(auth.email)
      .first();

    return new Response(JSON.stringify({ ok: true, profile: profileFromRow(row, auth.email) }, null, 2), {
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
