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
      // Validate tableName to prevent SQL injection
      // Step 1: Check length
      if (tableName.length > 64) {
        return new Response(
          JSON.stringify({ ok: false, error: "Invalid table name: exceeds maximum length" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Step 2: Check regex pattern (alphanumeric and underscore only)
      const tableNameRegex = /^[A-Za-z0-9_]+$/;
      if (!tableNameRegex.test(tableName)) {
        return new Response(
          JSON.stringify({ ok: false, error: "Invalid table name: contains forbidden characters" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Step 3: Whitelist against actual D1 tables (excluding SQLite internal tables)
      const tablesResult = await db
        .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`)
        .all();
      const allowedTables = new Set(
        (tablesResult.results || []).map((row: any) => (row.name as string).toLowerCase())
      );

      // Case-insensitive comparison for SQLite compatibility
      if (!allowedTables.has(tableName.toLowerCase())) {
        return new Response(
          JSON.stringify({ ok: false, error: "Invalid table name: table does not exist" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Validate limit to prevent resource exhaustion
      if (limit < 1 || limit > 100) {
        return new Response(
          JSON.stringify({ ok: false, error: "Invalid limit: must be between 1 and 100" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Return schema and sample rows for the specified table
      // Note: PRAGMA statements don't support parameterized queries in SQLite,
      // but tableName has been validated above (regex + whitelist) to ensure safety.
      const schemaResult = await db.prepare(`PRAGMA table_info(${tableName})`).all();
      const schema = schemaResult.results || [];

      // Note: Table identifiers cannot be parameterized in SQL, but tableName
      // has been validated above (regex + whitelist + length) to ensure safety.
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
