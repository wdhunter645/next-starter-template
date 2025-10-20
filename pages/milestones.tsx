import Head from "next/head";
import { supabase } from "../lib/supabaseClient";

type Milestone = { id: string; year: number; title: string; description: string | null };

export async function getStaticProps() {
  if (!supabase) return { props: { items: [], missingEnv: true }, revalidate: 600 };
  const { data, error } = await supabase
    .from("milestones")
    .select("id,year,title,description")
    .order("year", { ascending: true });
  if (error) return { props: { items: [], error: error.message }, revalidate: 600 };
  return { props: { items: data ?? [] }, revalidate: 600 };
}

export default function Milestones({ items, missingEnv, error }: { items: Milestone[]; missingEnv?: boolean; error?: string }) {
  return (
    <>
      <Head><title>Career Milestones — LGFC</title></Head>
      <section className="section">
        <div className="container">
          <h1 className="section-title">Career Milestones</h1>
          {missingEnv && <p className="text-amber-700">Supabase env vars missing.</p>}
          {error && <p className="text-red-700">Error: {error}</p>}
          {!items?.length && !error && !missingEnv && <p>No milestones yet.</p>}
          <ul className="grid md:grid-cols-2 gap-4">
            {items?.map(m => (
              <li key={m.id} className="border p-4 rounded">
                <h2 className="font-semibold">{m.year} — {m.title}</h2>
                {m.description && <p className="text-slate-700 mt-1">{m.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
