import React from "react";

type NewsItem = {
  date: string;
  title: string;
  type: "Announcement" | "Q&A" | "Update";
  summary: string;
};

const newsItems: NewsItem[] = [
  {
    date: "Nov 1, 2025",
    title: "Lou Gehrig Fan Club Website Build Progress",
    type: "Update",
    summary:
      "We are actively building the new Lou Gehrig Fan Club website, starting with the public homepage and key informational pages.",
  },
  {
    date: "Jul 4, 2025",
    title: "Annual &quot;Luckiest Man&quot; Day Plans",
    type: "Announcement",
    summary:
      "Each year the club will recognize July 4th with content focused on Gehrig&apos;s famous speech, ALS awareness, and fan reflections.",
  },
  {
    date: "TBD",
    title: "Fan Q&A Sessions",
    type: "Q&A",
    summary:
      "Future phases include moderated Q&A sessions with historians, authors, and ALS advocates. Details will be posted here once scheduled.",
  },
];

export default function NewsPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.25rem 3rem" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "var(--lgfc-font-size-h1)", margin: 0, color: "var(--lgfc-blue)" }}>News &amp; Q&amp;A</h1>
        <p style={{ marginTop: "0.5rem", color: "var(--lgfc-text-muted)", maxWidth: 720 }}>
          Updates from the Lou Gehrig Fan Club, including project progress, upcoming events, and
          future plans for fan Q&amp;A and member conversations.
        </p>
      </header>

      <section>
        {newsItems.map((item) => (
          <article
            key={item.date + item.title}
            style={{
              padding: "0.9rem 0",
              borderBottom: "1px solid var(--lgfc-border-light)",
            }}
          >
            <div
              style={{
                fontSize: "var(--lgfc-font-size-fine)",
                color: "var(--lgfc-text-muted)",
                marginBottom: "0.15rem",
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              <span>{item.date}</span>
              <span>•</span>
              <span>{item.type}</span>
            </div>
            <h2 style={{ margin: 0, fontSize: "var(--lgfc-font-size-h3)" }}>{item.title}</h2>
            <p style={{ margin: "0.25rem 0 0.4rem", fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)" }}>
              {item.summary}
            </p>
          </article>
        ))}
      </section>

      <section style={{ marginTop: "1.75rem" }}>
        <h2 style={{ fontSize: "var(--lgfc-font-size-h2)", marginBottom: "0.5rem", color: "var(--lgfc-blue)" }}>Future Q&amp;A</h2>
        <p style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-muted)" }}>
          Member-only Q&amp;A sessions will eventually live in the members area, but this page
          will always serve as the public front door for major announcements and summaries of
          those discussions.
        </p>
      </section>
    </main>
  );
}
