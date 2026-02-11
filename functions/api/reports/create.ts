// POST /api/reports/create
// Creates a user report for moderation.
// Body: { kind: 'discussion'|'photo'|'library'|'memorabilia', target_id: number, reporter_email?: string, reason?: string }

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function asInt(v: unknown): number | null {
  if (typeof v === 'number' && Number.isInteger(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isInteger(Number(v))) return Number(v);
  return null;
}

function isValidKind(kind: string): boolean {
  return kind === 'discussion' || kind === 'photo' || kind === 'library' || kind === 'memorabilia';
}

export const onRequestPost = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    if (!env?.DB) return json(500, { ok: false, error: 'missing_db_binding' });

    const body: unknown = await request.json().catch(() => null);
    if (!isRecord(body)) return json(400, { ok: false, error: 'invalid_json' });

    const kind = asString(body.kind).trim();
    const targetId = asInt(body.target_id);
    const reporterEmail = asString(body.reporter_email).trim().slice(0, 254);
    const reason = asString(body.reason).trim().slice(0, 2000);

    if (!isValidKind(kind)) return json(400, { ok: false, error: 'invalid_kind' });
    if (targetId === null || targetId <= 0) return json(400, { ok: false, error: 'invalid_target_id' });

    await env.DB.prepare(
      `INSERT INTO reports (kind, target_id, reporter_email, reason)
       VALUES (?, ?, ?, ?);`
    )
      .bind(kind, targetId, reporterEmail || null, reason || null)
      .run();

    return json(200, { ok: true });
  } catch (err: any) {
    return json(500, { ok: false, error: String(err?.message ?? err) });
  }
};
