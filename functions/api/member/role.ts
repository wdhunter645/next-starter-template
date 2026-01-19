// Cloudflare Pages Function for GET /api/member/role
// Returns the role of the logged-in member

function json(data: any, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getMemberRole(db: any, email: string): Promise<string | null> {
  try {
    const row = await db
      .prepare(`SELECT role FROM members WHERE lower(email) = lower(?1) LIMIT 1`)
      .bind(email)
      .first();
    return (row as any)?.role || null;
  } catch (e) {
    console.error('Failed to get member role:', e);
    return null;
  }
}

export async function onRequestGet(context: any): Promise<Response> {
  const { request, env } = context;

  try {
    // Get email from query parameter (passed from client localStorage)
    const url = new URL(request.url);
    const email = url.searchParams.get('email')?.trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return json({ ok: false, error: 'Email is required.' }, 400);
    }

    const role = await getMemberRole(env.DB, email);
    
    if (!role) {
      // Member not found in members table
      return json({ ok: true, role: 'visitor' }, 200);
    }

    return json({ ok: true, role }, 200);
  } catch (e: any) {
    console.error('Error in /api/member/role:', e);
    return json({ ok: false, error: 'Server error' }, 500);
  }
}
