import React from "react";
import { fetchPageContent } from "@/lib/pageContent";

export default async function Page() {
  const data = await fetchPageContent("/support");
  const sections = data?.sections;

  const title = sections?.title?.content ?? "Support";
  const leadHtml = sections?.lead_html?.content ?? null;
  const bodyHtml = sections?.body_html?.content ?? null;

  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>{title}</h1>

      {leadHtml ? (
        <p style={{ ...styles.lead }} dangerouslySetInnerHTML={{ __html: leadHtml }} />
      ) : (
        <p style={{ ...styles.lead }}>
          Need help or have questions? We&apos;re here to assist you.
        </p>
      )}

      {bodyHtml ? (
        <div style={{ ...styles.body }} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      ) : (
        <>
          <h2 style={{ ...styles.h2 }}>How to Get Support</h2>
          <p style={{ ...styles.p }}>
            Email us at: <strong>admin@lougehrigfanclub.com</strong>
          </p>

          <h2 style={{ ...styles.h2 }}>What We Can Help With</h2>
          <ul style={{ ...styles.ul }}>
            <li style={{ ...styles.li }}>Account and membership questions</li>
            <li style={{ ...styles.li }}>Technical issues with the website</li>
            <li style={{ ...styles.li }}>General inquiries about the Fan Club</li>
            <li style={{ ...styles.li }}>Event information and participation</li>
          </ul>

          <h2 style={{ ...styles.h2 }}>Response Time</h2>
          <p style={{ ...styles.p }}>
            We aim to respond to all support requests within 2-3 business days. For urgent matters,
            please mention &quot;URGENT&quot; in your subject line.
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
