import { NextResponse } from "next/server";

function getUpstreamBase(): string {
  // Used during `next dev` so API calls still reach the deployed Cloudflare Pages Functions.
  // In production (Cloudflare Pages build), these Next.js API routes may not be used.
  return (
    process.env.PAGES_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://next-starter-template-6yr.pages.dev"
  ).replace(/\/$/, "");
}

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ ok: false, error: "Name and email are required." }, { status: 400 });
    }

    const res = await fetch(`${getUpstreamBase()}/api/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    const text = await res.text();
    let data: unknown = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { ok: false, error: text || "Upstream returned non-JSON response." };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("API /api/join error:", err);
    return NextResponse.json({ ok: false, error: "Internal server error." }, { status: 500 });
  }
}
