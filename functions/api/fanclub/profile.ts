import { requireMember } from '../../_lib/session';

function profileFromRow(row: any, sessionEmail: string) {
  return {
    email: sessionEmail,
    first_name: row?.first_name ?? null,
    last_name: row?.last_name ?? null,
    screen_name: row?.screen_name ?? null,
    email_opt_in: row?.email_opt_in == null ? true : Boolean(row?.email_opt_in),
    profile_photo_id: row?.profile_photo_id ?? null,
  };
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
    const row = await auth.db
      .prepare(
        `SELECT first_name, last_name, screen_name, email_opt_in, profile_photo_id
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
    const profilePhotoIdRaw = (body as any).profile_photo_id;
    const profilePhotoId =
      profilePhotoIdRaw == null || String(profilePhotoIdRaw).trim() === ''
        ? null
        : Number(profilePhotoIdRaw);

    if (!firstName || !lastName) {
      return new Response(JSON.stringify({ ok: false, error: 'first_name and last_name are required' }, null, 2), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (profilePhotoId != null && (!Number.isFinite(profilePhotoId) || profilePhotoId <= 0)) {
      return new Response(JSON.stringify({ ok: false, error: 'profile_photo_id must be a positive number' }, null, 2), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const name = `${firstName} ${lastName}`.trim();

    // Identity comes from authenticated session email only.
    const upsert = await auth.db
      .prepare(
        `UPDATE join_requests
         SET name = ?1,
             first_name = ?2,
             last_name = ?3,
             screen_name = ?4,
             email_opt_in = ?5,
             profile_photo_id = ?6
         WHERE lower(email) = lower(?7)`
      )
      .bind(name, firstName, lastName, screenName || null, emailOptIn ? 1 : 0, profilePhotoId, auth.email)
      .run();

    if (Number((upsert as any)?.meta?.changes || 0) === 0) {
      await auth.db
        .prepare(
          `INSERT INTO join_requests (name, email, first_name, last_name, screen_name, email_opt_in, profile_photo_id, created_at)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, datetime('now'))`
        )
        .bind(name, auth.email, firstName, lastName, screenName || null, emailOptIn ? 1 : 0, profilePhotoId)
        .run();
    }

    const row = await auth.db
      .prepare(
        `SELECT first_name, last_name, screen_name, email_opt_in, profile_photo_id
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
