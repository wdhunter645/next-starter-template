import React from "react";
import { fetchPageContent } from "@/lib/pageContent";

export default async function Page() {
  const data = await fetchPageContent("/privacy");
  const sections = data?.sections;

  const title = sections?.title?.content ?? "Privacy";
  const leadHtml = sections?.lead_html?.content ?? null;
  const bodyHtml = sections?.body_html?.content ?? null;

  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>{title}</h1>

      {leadHtml ? (
        <p style={{ ...styles.lead }} dangerouslySetInnerHTML={{ __html: leadHtml }} />
      ) : (
        <p style={{ ...styles.lead }}>
          This is a fan‑run site. We collect the minimum information needed to operate the Join list and accept
          submissions.
        </p>
      )}

      {bodyHtml ? (
        <div style={{ ...styles.body }} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      ) : (
        <>
          <h2 style={{ ...styles.h2 }}>What we collect</h2>
          <ul style={{ ...styles.ul }}>
            <li style={{ ...styles.li }}>Join form: name and email address.</li>
            <li style={{ ...styles.li }}>
              Library submissions: the content you submit, your provided name/email, and timestamps.
            </li>
            <li style={{ ...styles.li }}>
              Photo submissions (when enabled): the media URL, description/caption text you provide, and timestamps.
            </li>
            <li style={{ ...styles.li }}>
              Basic technical logs (e.g., request timing/errors) used for reliability and abuse prevention.
            </li>
          </ul>

          <h2 style={{ ...styles.h2 }}>How we use it</h2>
          <ul style={{ ...styles.ul }}>
            <li style={{ ...styles.li }}>To send email updates you explicitly requested via the Join form.</li>
            <li style={{ ...styles.li }}>To publish and manage user submissions (Library and photo/media captions).</li>
            <li style={{ ...styles.li }}>To keep the site secure and functioning (rate limiting, troubleshooting).</li>
          </ul>

          <h2 style={{ ...styles.h2 }}>What we do not do</h2>
          <p style={{ ...styles.p }}>We do not sell personal information.</p>

          <h2 style={{ ...styles.h2 }}>Removal requests</h2>
          <p style={{ ...styles.p }}>
            To request removal of your email or a submission, contact: <strong>LouGehrigFanClub@gmail.com</strong>.
          </p>

          <p style={{ ...styles.p }}>
            This policy will be refined as features expand. When we add new data collection, we’ll update this page.
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
