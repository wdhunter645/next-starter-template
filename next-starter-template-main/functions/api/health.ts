// GET /api/health
// Lightweight healthcheck used for Phase 7 monitoring.

export const onRequestGet = async (context: any): Promise<Response> => {
  const { env } = context;

  // Best-effort DB ping (do not leak details)
  let dbOk = false;
  try {
    const db = env.DB as any;
    await db.prepare("SELECT 1 as ok").all();
    dbOk = true;
  } catch {
    dbOk = false;
  }

  return new Response(
    JSON.stringify(
      {
        ok: true,
        db_ok: dbOk,
        ts: new Date().toISOString(),
      },
      null,
      2
    ),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
