// functions/api/csp-report.ts
// ZIP 5: CSP violation reporting endpoint (used during Report-Only rollout).
//
// Browsers send JSON reports here when the CSP header includes:
//   report-uri /api/csp-report
//
// We intentionally do not persist these reports in D1 in ZIP #5.
// If you want persistence later, add a table + write path as a separate, approved change.

export async function onRequest(context: {
  request: Request;
}): Promise<Response> {
  const { request } = context;

  if (request.method.toUpperCase() !== "POST") {
    return new Response("method_not_allowed", { status: 405 });
  }

  // Read and discard (we rely on Cloudflare request logs during rollout).
  try {
    await request.json();
  } catch {
    // Some user agents send invalid JSON; do not fail hard.
  }

  return new Response(null, { status: 204 });
}
