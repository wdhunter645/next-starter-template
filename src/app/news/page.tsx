import React from "react";
import { fetchPageContent } from "@/lib/pageContent";
import RecentDiscussions from "@/components/news/RecentDiscussions";

export default async function Page() {
  const data = await fetchPageContent("/news");
  const sections = data?.sections;

  const title = sections?.title?.content ?? "News & Q&A";
  const leadHtml = sections?.lead_html?.content ?? null;
  const bodyHtml = sections?.body_html?.content ?? null;

  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>{title}</h1>

      {leadHtml ? (
        <p style={{ ...styles.lead }} dangerouslySetInnerHTML={{ __html: leadHtml }} />
      ) : (
        <p style={{ ...styles.lead }}>
          Updates, Q&amp;A, and short readable notes about Lou Gehrig history—published as the site evolves.
        </p>
      )}

      {bodyHtml ? (
        <div style={{ ...styles.body }} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      ) : (
        <>
          <h2 style={{ ...styles.h2 }}>How this section works</h2>
          <ul style={{ ...styles.ul }}>
            <li style={{ ...styles.li }}>Admins can publish content to D1 without redeploying the site.</li>
            <li style={{ ...styles.li }}>Questions submitted via “Ask a Question” are reviewed, answered, and (if approved) promoted into the FAQ library.</li>
            <li style={{ ...styles.li }}>Discussions are short, readable updates that can be pinned or expanded over time.</li>
          </ul>
        </>
      )}

      <RecentDiscussions limit={6} />
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { padding: "40px 16px", maxWidth: 1100, margin: "0 auto" },
  h1: { fontSize: 34, margin: "0 0 8px 0" },
  lead: { fontSize: 16, lineHeight: 1.7, margin: "0 0 18px 0" },
  body: { marginTop: 18, lineHeight: 1.7, fontSize: 16 },
  h2: { fontSize: 20, margin: "18px 0 8px 0" },
  ul: { margin: "8px 0 0 18px" },
  li: { margin: "8px 0", lineHeight: 1.7 },
};
