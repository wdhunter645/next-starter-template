import React from "react";
import { fetchPageContent } from "@/lib/pageContent";

export default async function Page() {
  const data = await fetchPageContent("/contact");
  const sections = data?.sections;

  const title = sections?.title?.content ?? "Contact";
  const leadHtml = sections?.lead_html?.content ?? null;
  const bodyHtml = sections?.body_html?.content ?? null;

  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>{title}</h1>

      {leadHtml ? (
        <p style={{ ...styles.lead }} dangerouslySetInnerHTML={{ __html: leadHtml }} />
      ) : (
        <p style={{ ...styles.lead }}>
          The club is fan‑run. Email is the fastest way to reach us for questions, contributions, corrections, or
          partnerships.
        </p>
      )}

      {bodyHtml ? (
        <div style={{ ...styles.body }} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      ) : (
        <>
          <p style={{ ...styles.p }}>
            <strong>admin@lougehrigfanclub.com</strong>
          </p>

          <h2 style={{ ...styles.h2 }}>Good reasons to email</h2>
          <ul style={{ ...styles.ul }}>
            <li style={{ ...styles.li }}>You found an error and can provide a source to correct it.</li>
            <li style={{ ...styles.li }}>You want to contribute photos, clippings, memorabilia, or a story.</li>
            <li style={{ ...styles.li }}>You’re coordinating an ALS fundraiser or Lou Gehrig Day–related activity.</li>
            <li style={{ ...styles.li }}>You want to suggest a charity, event, or community partner.</li>
          </ul>

          <h2 style={{ ...styles.h2 }}>What to include</h2>
          <ul style={{ ...styles.ul }}>
            <li style={{ ...styles.li }}>A short subject line (e.g., “Photo submission”, “Correction”, “Partnership”).</li>
            <li style={{ ...styles.li }}>Links to sources or attachments (if you have them).</li>
            <li style={{ ...styles.li }}>
              Any usage notes (credit line, rights, or how we should attribute the item).
            </li>
          </ul>
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
