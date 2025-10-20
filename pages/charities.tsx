import Head from "next/head";
import { supabase } from "../lib/supabaseClient";

type Charity = { id: string; name: string; url: string | null; blurb: string | null };

export async function getStaticProps() {
  if (!supabase) return { props: { items: [], missingEnv: true }, revalidate: 600 };
  const { data, error } = await supabase
    .from("charities")
    .select("id,name,url,blurb")
    .order("name", { ascending: true });
  if (error) return { props: { items: [], error: error.message }, revalidate: 600 };
  return { props: { items: data ?? [] }, revalidate: 600 };
}

export default function Charities({ items, missingEnv, error }: { items: Charity[]; missingEnv?: boolean; error?: string }) {
  return (
    <>
      <Head><title>Charitable Work — LGFC</title></Head>
      <section className="section">
        <div className="container">
          <h1 className="section-title">Charitable Work</h1>
          {missingEnv && <p className="text-amber-700">Supabase env vars missing.</p>}
          {error && <p className="text-red-700">Error: {error}</p>}
          {!items?.length && !error && !missingEnv && <p>No charities yet.</p>}
          <ul className="space-y-4">
            {items?.map(c => (
              <li key={c.id} className="border p-4 rounded">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{c.name}</h2>
                  {c.url && <a href={c.url} className="text-lgfc-primary" target="_blank" rel="noreferrer">Visit →</a>}
                </div>
                {c.blurb && <p className="text-slate-700 mt-1">{c.blurb}</p>}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
