import React from "react";
import CharitiesTiles from "@/components/CharitiesTiles";
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
          Lou Gehrig&rsquo;s legacy extends far beyond baseball—his battle with ALS brought global attention to the disease, now commonly known as &ldquo;Lou Gehrig&rsquo;s disease.&rdquo; This page connects fans with reputable organizations advancing ALS research, patient support, and advocacy.
        </p>
      )}

      {bodyHtml ? (
        <div style={{ ...styles.body }} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      ) : (
        <>
          <h2 style={{ ...styles.h2 }}>The Lou Gehrig Connection</h2>
          <p style={{ ...styles.p }}>
            After Lou Gehrig was diagnosed with amyotrophic lateral sclerosis (ALS) in 1939, his name became synonymous with the disease. His courage and dignity in facing this devastating illness inspired generations of advocates and researchers. Today, the fight against ALS honors his memory and continues the mission of finding treatments and a cure.
          </p>
          <p style={{ ...styles.p }}>
            Since MLB established <strong>Lou Gehrig Day</strong> in 2021 (observed annually on June 2), the baseball community has rallied to raise awareness and funds for ALS research. The 2014 Ice Bucket Challenge alone generated over $115 million globally, demonstrating the power of collective action in the fight against this disease.
          </p>

          <h2 style={{ ...styles.h2 }}>How we choose what to list</h2>
          <p style={{ ...styles.p }}>
            We prioritize established ALS research and patient-support organizations with clear financial reporting and transparency about how funds are used. If you have a suggestion, send it to the club email with a link and a short rationale.
          </p>

          <h2 style={{ ...styles.h2 }}>Recommended starting points</h2>
          <ul style={{ ...styles.ul }}>
            <li style={{ ...styles.li }}>
              <strong>National ALS organizations</strong> — Supporting research, advocacy, and patient services. Start with the largest, most established groups; we&rsquo;ll add vetted options over time.
            </li>
            <li style={{ ...styles.li }}>
              <strong>Local chapters and clinics</strong> — Often the most direct help for families, especially for equipment and care navigation.
            </li>
            <li style={{ ...styles.li }}>
              <strong>Lou Gehrig Day initiatives</strong> — MLB and community events that raise funds and awareness, directly honoring Gehrig&rsquo;s legacy.
            </li>
          </ul>

          <h2 style={{ ...styles.h2 }}>Take Action: Support ALS Research and Care</h2>
          <p style={{ ...styles.p }}>
            Whether you choose to donate, volunteer, or participate in awareness campaigns, your contribution helps advance the mission Lou Gehrig inspired. Every dollar supports research breakthroughs, patient care improvements, and family support services. Consider making a donation to a reputable ALS organization, joining a Lou Gehrig Day event, or participating in community fundraisers.
          </p>
          <p style={{ ...styles.p }}>
            The club plans periodic fundraisers and an annual recognition tradition tied to our community&rsquo;s impact. Details will be published here as campaigns are launched.
          </p>

          <h2 style={{ ...styles.h2 }}>Donation safety</h2>
          <ul style={{ ...styles.ul }}>
            <li style={{ ...styles.li }}>Donate using the charity&rsquo;s official website (avoid look‑alike links).</li>
            <li style={{ ...styles.li }}>Keep your receipt and note the campaign name/date for your records.</li>
            <li style={{ ...styles.li }}>If something feels off, pause—then confirm through the charity directly.</li>
          </ul>
        </>
      )}
    
      <section style={{ marginTop: 40 }}><CharitiesTiles /></section>
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
