// GET /api/admin/d1-inspect
// Returns D1 table list with row counts, or table schema + sample rows.
// Protected by ADMIN_TOKEN.

import { requireAdmin } from "../../_lib/auth";

export const onRequestGet = async (context: any): Promise<Response> => {
  const { request, env } = context;

  const deny = requireAdmin(request, env);
  if (deny) return deny;

  const url = new URL(request.url);
  const tableName = url.searchParams.get("table");
  const limit = parseInt(url.searchParams.get("limit") || "5", 10);

  try {
    const db = env.DB as any;

    if (!tableName) {
      // Return list of all tables with row counts
      const tablesResult = await db
        .prepare(
          `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
        )
        .all();

      const tables = [];
      for (const row of tablesResult.results || []) {
        const name = (row as any).name;
        const countResult = await db.prepare(`SELECT COUNT(*) as n FROM ${name}`).all();
        const count = Number((countResult?.results?.[0] as any)?.n || 0);
        tables.push({ name, count });
      }

      return new Response(JSON.stringify({ ok: true, tables }, null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Return schema and sample rows for the specified table
      const schemaResult = await db.prepare(`PRAGMA table_info(${tableName})`).all();
      const schema = schemaResult.results || [];

      const rowsResult = await db.prepare(`SELECT * FROM ${tableName} LIMIT ${limit}`).all();
      const rows = rowsResult.results || [];

      return new Response(
        JSON.stringify({ ok: true, table: tableName, schema, rows }, null, 2),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (err: any) {
    console.error("d1-inspect error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err?.message || "D1 inspection failed." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
