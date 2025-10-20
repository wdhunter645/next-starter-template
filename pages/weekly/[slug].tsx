import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";
import { supabase } from "../../lib/supabaseClient";

type WeeklyPost = { id: string; title: string; slug: string; content: string | null; published_at: string | null };

export const getStaticPaths: GetStaticPaths = async () => {
  if (!supabase) return { paths: [], fallback: "blocking" };
  const { data } = await supabase.from("weekly_posts").select("slug").limit(50);
  const paths = (data ?? []).filter((x: { slug?: string }) => x.slug).map((x: { slug: string }) => ({ params: { slug: x.slug } }));
  return { paths, fallback: "blocking" };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!supabase) return { notFound: true, revalidate: 300 };
  const slug = String(params?.slug || "");
  const { data, error } = await supabase
    .from("weekly_posts")
    .select("id,title,slug,content,published_at")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return { notFound: true, revalidate: 300 };
  return { props: { post: data }, revalidate: 300 };
};

export default function WeeklyArticle({ post }: { post: WeeklyPost }) {
  return (
    <>
      <Head><title>{post.title} — LGFC</title></Head>
      <section className="section">
        <div className="container">
          <h1 className="text-3xl font-bold">{post.title}</h1>
          {post.published_at && <p className="text-xs text-slate-500 mt-2">Published: {new Date(post.published_at).toLocaleDateString()}</p>}
          {post.content ? (
            <article className="prose max-w-none mt-6" dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <p className="text-slate-700 mt-6">No content yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
