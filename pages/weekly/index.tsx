import Head from "next/head";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

type WeeklyPost = { id: string; title: string; slug: string; excerpt: string | null; published_at: string | null };

export async function getStaticProps() {
  if (!supabase) return { props: { posts: [], missingEnv: true }, revalidate: 300 };
  const { data, error } = await supabase
    .from("weekly_posts")
    .select("id,title,slug,excerpt,published_at")
    .order("published_at", { ascending: false })
    .limit(20);
  if (error) {
    return { props: { posts: [], error: error.message }, revalidate: 300 };
  }
  return { props: { posts: data ?? [] }, revalidate: 300 };
}

export default function Weekly({ posts, missingEnv, error }: { posts: WeeklyPost[]; missingEnv?: boolean; error?: string }) {
  return (
    <>
      <Head><title>Weekly — LGFC</title></Head>
      <section className="section">
        <div className="container">
          <h1 className="section-title">This Week&apos;s Features</h1>

          {missingEnv && <p className="text-amber-700">Supabase env vars missing. Add NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.</p>}
          {error && <p className="text-red-700">Error: {error}</p>}
          {!posts?.length && !error && !missingEnv && <p>No posts yet. Check back soon.</p>}

          <ul className="space-y-4">
            {posts?.map(p => (
              <li key={p.id} className="border p-4 rounded">
                <h2 className="text-xl font-semibold">
                  <Link href={`/weekly/${p.slug}`}>{p.title}</Link>
                </h2>
                {p.excerpt && <p className="text-slate-700 mt-1">{p.excerpt}</p>}
                {p.published_at && <p className="text-xs text-slate-500 mt-2">Published: {new Date(p.published_at).toLocaleDateString()}</p>}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
