import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { ok: false, error: "Name and email are required." },
        { status: 400 }
      );
    }

    // Forward request to Cloudflare Pages Function
    const res = await fetch(
      "https://21656888.next-starter-template-6yr.pages.dev/api/join",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      }
    );

const text = await res.text();

let data: any;
if (text) {
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error("API /api/join non-JSON body:", err, text);
    data = { error: "Invalid response from join service" };
  }
} else {
  data = {};
}

return NextResponse.json(data, { status: res.status });
