export const onRequestGet = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const url = new URL(request.url);
    const table = url.searchParams.get("table");

    // If a table is specified, return its column info
    if (table) {
      const allowed = [
        "_cf_METADATA",
        "d1_migrations",
        "join_requests",
        "library_entries",
        "photos",
        "sqlite_sequence",
      ];

      if (!allowed.includes(table)) {
        return new Response(
          JSON.stringify(
            {
              ok: false,
              error: `Invalid table name: ${table}`,
            },
            null,
            2
          ),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      const pragma = await env.DB.prepare(`PRAGMA table_info(${table});`).all();

      return new Response(
        JSON.stringify(
          {
            ok: true,
            table,
            columns: pragma.results ?? [],
          },
          null,
          2
        ),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Default: list all tables
    const result = await env.DB.prepare(
      `
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
        ORDER BY name;
      `
    ).all();

    return new Response(
      JSON.stringify(
        {
          ok: true,
          tables: result.results ?? [],
        },
        null,
        2
      ),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify(
        {
          ok: false,
          error: String(err?.message ?? err),
        },
        null,
        2
      ),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
