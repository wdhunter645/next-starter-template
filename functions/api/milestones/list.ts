export const onRequestGet = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const url = new URL(request.url);
    const limit = Math.max(1, Math.min(100, Number(url.searchParams.get('limit') || '50')));

    const tableInfo = await env.DB.prepare(`PRAGMA table_info(milestones);`).all();
    const milestoneColumns = new Set(((tableInfo.results ?? []) as Array<{ name?: string }>).map((c) => c.name));

    const candidateDateColumns = ['milestone_date', 'date', 'event_date', 'date_iso', 'occurred_on', 'year'];
    const selectedDateColumn = candidateDateColumns.find((column) => milestoneColumns.has(column)) ?? 'year';

    const selectDateSql = selectedDateColumn === 'year'
      ? `NULL AS milestone_date`
      : `m.${selectedDateColumn} AS milestone_date`;

    const orderBySql = selectedDateColumn === 'year'
      ? `CASE WHEN m.year IS NULL THEN 1 ELSE 0 END ASC, m.year ASC, m.id ASC`
      : `CASE WHEN m.${selectedDateColumn} IS NULL OR trim(m.${selectedDateColumn}) = '' THEN 1 ELSE 0 END ASC,
         date(m.${selectedDateColumn}) ASC,
         m.${selectedDateColumn} ASC,
         m.id ASC`;

    const sql = `SELECT m.id,
                        m.year,
                        ${selectDateSql},
                        m.title,
                        m.description,
                        m.photo_id,
                        p.url as photo_url
                 FROM milestones m
                 LEFT JOIN photos p ON p.id = m.photo_id
                 WHERE m.status='posted'
                 ORDER BY ${orderBySql}
                 LIMIT ?;`;

    const rows = await env.DB.prepare(sql).bind(limit).all();

    return new Response(JSON.stringify({ ok: true, items: rows.results ?? [] }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err?.message ?? err) }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
