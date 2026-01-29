import React from "react";
import { fetchPageContent } from "@/lib/pageContent";

export default async function Page() {
  const data = await fetchPageContent("/calendar");
  const sections = data?.sections;

  const title = sections?.title?.content ?? "Calendar";
  const leadHtml = sections?.lead_html?.content ?? null;
  const bodyHtml = sections?.body_html?.content ?? null;

  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>{title}</h1>

      {leadHtml ? (
        <p style={{ ...styles.lead }} dangerouslySetInnerHTML={{ __html: leadHtml }} />
      ) : (
        <p style={{ ...styles.lead }}>
          Upcoming events, commemorations, and club notes—especially around Lou Gehrig Day and ALS awareness.
        </p>
      )}

      {bodyHtml ? (
        <div style={{ ...styles.body }} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      ) : (
        <>
          <h2 style={{ ...styles.h2 }}>What you’ll see here</h2>
          <ul style={{ ...styles.ul }}>
            <li style={{ ...styles.li }}>Lou Gehrig Day and related MLB/community initiatives.</li>
            <li style={{ ...styles.li }}>Club fundraisers and online events.</li>
            <li style={{ ...styles.li }}>Museum exhibits, talks, or notable releases relevant to Gehrig history.</li>
          </ul>

          <h2 style={{ ...styles.h2 }}>Submit an event</h2>
          <p style={{ ...styles.p }}>
            If you’re organizing an ALS fundraiser, a remembrance event, or a community gathering connected to Gehrig’s
            legacy, email the details (date/time/timezone, location, link, and organizer) to{" "}
            <strong>admin@lougehrigfanclub.com</strong>.
          </p>

          <p style={{ ...styles.p }}>
            This calendar starts simple. As Phase 7 progresses, we’ll tighten the format and add better filtering.
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
