import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.log({ ok: false, error: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY" });
  process.exit(1);
}

const s = createClient(url, key);

try {
  const { data, error } = await s.from("milestones").select("*").limit(1);
  console.log({ ok: !error, rows: data?.length || 0, error: error?.message || null });
  
  if (error) {
    process.exit(1);
  }
} catch (err) {
  console.log({ ok: false, error: err.message });
  process.exit(1);
}
