import React from "react";

export default function Page() {
  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>News &amp; Q&amp;A</h1>

      <p style={{ ...styles.lead }}>
        This is where the club posts site updates, answers common questions, and publishes short, readable notes about Lou Gehrig’s
        history and the ongoing ALS awareness effort.
      </p>

      <p style={{ ...styles.p }}>
        During Phase 7, this page is “draft-first”: we’d rather publish clear, useful starting content and then improve it through
        review than wait for perfection.
      </p>

      <h2 style={{ ...styles.h2 }}>What to expect</h2>
      <ul style={{ ...styles.ul }}>
        <li style={{ ...styles.li }}>Site updates and new sections as they go live.</li>
        <li style={{ ...styles.li }}>Short historical notes (dates, context, and why it matters).</li>
        <li style={{ ...styles.li }}>Charity and fundraiser spotlights tied to ALS awareness.</li>
        <li style={{ ...styles.li }}>Community Q&amp;A and clarifications when there’s confusion or conflicting sources.</li>
      </ul>

      <hr style={{ ...styles.hr }} />

      <p style={{ ...styles.p }}>
        If you have a question you’d like answered publicly (or a correction with a source), email{" "}
        <strong>admin@lougehrigfanclub.com</strong>.
      </p>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { padding: "40px 16px", maxWidth: 900, margin: "0 auto" },
  h1: { fontSize: 34, lineHeight: 1.15, margin: "0 0 12px 0" },
  h2: { fontSize: 22, lineHeight: 1.25, margin: "22px 0 10px 0" },
  lead: { fontSize: 18, lineHeight: 1.6, margin: "0 0 18px 0" },
  p: { fontSize: 16, lineHeight: 1.7, margin: "0 0 14px 0" },
  ul: { paddingLeft: 18, margin: "0 0 14px 0" },
  li: { margin: "0 0 8px 0", lineHeight: 1.6 },
  hr: { margin: "26px 0", opacity: 0.25 },
};
