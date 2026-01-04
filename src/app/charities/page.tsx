import React from "react";
import { fetchPageContent } from "@/lib/pageContent";

export default async function Page() {
  const data = await fetchPageContent("/charities");
  const sections = data?.sections;

  const title = sections?.title?.content ?? "Charities";
  const leadHtml = sections?.lead_html?.content ?? null;
  const bodyHtml = sections?.body_html?.content ?? null;

  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>{title}</h1>

      {leadHtml ? (
        <p style={{ ...styles.lead }} dangerouslySetInnerHTML={{ __html: leadHtml }} />
      ) : (
        <p style={{ ...styles.lead }}>
          Lou Gehrig’s story is inseparable from ALS awareness. This page is the club’s starting point for reputable
          places to learn, donate, and participate in fundraisers.
        </p>
      )}

      {bodyHtml ? (
        <div style={{ ...styles.body }} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      ) : (
        <>
          <h2 style={{ ...styles.h2 }}>How we choose what to list</h2>
          <p style={{ ...styles.p }}>
            We prioritize established ALS research and patient-support organizations, clear financial reporting, and
            transparency about how funds are used. If you have a suggestion, send it to the club email with a link and
            a short rationale.
          </p>

          <h2 style={{ ...styles.h2 }}>Recommended starting points</h2>
          <ul style={{ ...styles.ul }}>
            <li style={{ ...styles.li }}>
              National ALS organizations supporting research, advocacy, and patient services (start with the biggest,
              most established groups; we’ll add vetted options over time).
            </li>
            <li style={{ ...styles.li }}>
              Local chapters and clinics (often the most direct help for families—especially for equipment and care
              navigation).
            </li>
            <li style={{ ...styles.li }}>
              Lou Gehrig Day initiatives and related MLB/community events that raise funds and awareness.
            </li>
          </ul>

          <h2 style={{ ...styles.h2 }}>Fundraisers and recognition</h2>
          <p style={{ ...styles.p }}>
            The club plans periodic fundraisers and an annual recognition tradition tied to our community’s impact.
            Details will live here as soon as the first campaign is published.
          </p>

          <h2 style={{ ...styles.h2 }}>Donation safety</h2>
          <ul style={{ ...styles.ul }}>
            <li style={{ ...styles.li }}>Donate using the charity’s official website (avoid look‑alike links).</li>
            <li style={{ ...styles.li }}>Keep your receipt and note the campaign name/date for your records.</li>
            <li style={{ ...styles.li }}>If something feels off, pause—then confirm through the charity directly.</li>
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
