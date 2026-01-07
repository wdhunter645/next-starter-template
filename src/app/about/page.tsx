import React from "react";
import { fetchPageContent } from "@/lib/pageContent";

export default async function Page() {
  const data = await fetchPageContent("/about");
  const sections = data?.sections;

  const title = sections?.title?.content ?? "About the Lou Gehrig Fan Club";
  const leadHtml = sections?.lead_html?.content ?? null;
  const bodyHtml = sections?.body_html?.content ?? null;

  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>{title}</h1>

      {leadHtml ? (
        <p style={{ ...styles.lead }} dangerouslySetInnerHTML={{ __html: leadHtml }} />
      ) : (
        <p style={{ ...styles.lead }}>
          We’re building a fan-run home for Lou Gehrig’s legacy: baseball history, ALS awareness, and a growing archive
          of stories and media curated by the community.
        </p>
      )}

      {bodyHtml ? (
        <div style={{ ...styles.body }} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      ) : (
        <>
          <p style={{ ...styles.p }}>
            This site is about the <strong>Fan Club</strong>—how we operate, what we publish, and how you can
            participate. Lou Gehrig is the reason we’re here, and the rest of the site focuses on his story, timeline,
            and impact.
          </p>

          <h2 style={{ ...styles.h2 }}>What we’re building</h2>
          <ul style={{ ...styles.ul }}>
            <li style={{ ...styles.li }}>
              A photo and memorabilia archive with simple browsing today and richer tagging/search as we scale.
            </li>
            <li style={{ ...styles.li }}>
              A milestones timeline that makes it easy to explore key dates in Gehrig’s life and the ALS story.
            </li>
            <li style={{ ...styles.li }}>
              A news &amp; Q&amp;A area for updates, community notes, and short explainers (with sources when possible).
            </li>
            <li style={{ ...styles.li }}>
              A lightweight “Join” flow so we can keep members informed as features roll out.
            </li>
          </ul>

          <h2 style={{ ...styles.h2 }}>How you can help</h2>
          <p style={{ ...styles.p }}>
            If you have photos, memorabilia, clippings, or personal stories connected to Lou Gehrig (or the broader ALS
            awareness effort), you can contribute through the Library and Photo Archive sections. We’ll keep improving
            structure and attribution over time.
          </p>

          <h2 style={{ ...styles.h2 }}>Contact</h2>
          <p style={{ ...styles.p }}>
            The simplest way to reach the club is email: <strong>LouGehrigFanClub@gmail.com</strong>.
          </p>
        </>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { padding: "40px 16px", maxWidth: 900, margin: "0 auto" },
  h1: { fontSize: 34, lineHeight: 1.15, margin: "0 0 12px 0" },
  h2: { fontSize: 22, lineHeight: 1.25, margin: "22px 0 10px 0" },
  lead: { fontSize: 18, lineHeight: 1.6, margin: "0 0 18px 0" },
  body: { fontSize: 16, lineHeight: 1.7 },
  p: { fontSize: 16, lineHeight: 1.7, margin: "0 0 14px 0" },
  ul: { paddingLeft: 18, margin: "0 0 14px 0" },
  li: { margin: "0 0 8px 0", lineHeight: 1.6 },
};
