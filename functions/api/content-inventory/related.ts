import { requireMember } from '../../_lib/session';
import { jsonResponse, requireTables } from '../../_lib/d1';
import { resolveRelatedStories } from '../../_lib/content-inventory-public';

function parseLimit(raw: string | null): number {
  const n = Number(raw || '5');
  return Number.isFinite(n) && n > 0 ? Math.min(20, Math.floor(n)) : 5;
}

function parseEventYear(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : null;
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
    const tables = await requireTables(auth.db, ['content_inventory']);
    if (!tables.ok) return jsonResponse(tables.body, tables.status);

    const url = new URL(context.request.url);
    const q = String(url.searchParams.get('q') || '').trim();
    const tag = String(url.searchParams.get('tag') || '').trim();
    const rotationGroup = String(url.searchParams.get('rotation_group') || '').trim();
    const eventYear = parseEventYear(url.searchParams.get('event_year'));
    const excludeId = Number(url.searchParams.get('exclude_id') || '');
    const limit = parseLimit(url.searchParams.get('limit'));

    const resolved = await resolveRelatedStories(auth.db, {
      q,
      tag: tag || undefined,
      rotationGroup: rotationGroup || undefined,
      eventYear,
      excludeId: Number.isFinite(excludeId) ? excludeId : undefined,
      limit,
    });

    return new Response(
      JSON.stringify(
        {
          ok: true,
          items: resolved.items,
          source: resolved.source,
        },
        null,
        2,
      ),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err?.message || err) }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
