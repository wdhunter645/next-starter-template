import React from "react";

type Milestone = {
  year: string;
  title: string;
  description: string;
};

const milestones: Milestone[] = [
  {
    year: "1923",
    title: "Major League Debut",
    description:
      "Lou Gehrig makes his debut with the New York Yankees, beginning one of the most storied careers in baseball history.",
  },
  {
    year: "1925",
    title: "The Streak Begins",
    description:
      "Gehrig takes over as the Yankees&apos; everyday first baseman, starting his consecutive games played streak.",
  },
  {
    year: "1927",
    title: "Murderers&apos; Row",
    description:
      "As part of the legendary 1927 Yankees, Gehrig hits 47 home runs and drives in 175 runs, helping lead the team to a World Series title.",
  },
  {
    year: "1932",
    title: "Four Home Run Game",
    description:
      "On June 3, 1932, Gehrig hits four home runs in a single game against the Philadelphia Athletics, a feat still rarely matched.",
  },
  {
    year: "1936",
    title: "First Hall of Fame Ballot Class",
    description:
      "Gehrig is still in the prime of his career when the Baseball Hall of Fame opens; many contemporaries from his era are later inducted alongside him.",
  },
  {
    year: "1938",
    title: "First Signs of Illness",
    description:
      "A noticeable decline in Gehrig&apos;s performance marks the beginning of the health issues that would soon end his playing career.",
  },
  {
    year: "1939",
    title: "Farewell and Hall of Fame",
    description:
      "Gehrig ends his streak at 2,130 consecutive games, delivers the &quot;Luckiest Man&quot; speech on July 4, and is elected to the Hall of Fame later that year.",
  },
  {
    year: "1941",
    title: "Legacy Beyond Baseball",
    description:
      "Lou Gehrig passes away at age 37 from ALS, but his courage and dignity continue to inspire generations of fans and advocates.",
  },
];

export default function MilestonesPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.25rem 3rem" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "var(--lgfc-font-size-h1)", margin: 0, color: "var(--lgfc-blue)" }}>Lou Gehrig Milestones</h1>
        <p style={{ marginTop: "0.5rem", color: "var(--lgfc-text-muted)", maxWidth: 680 }}>
          A high-level timeline of key moments in Lou Gehrig&apos;s life and career. The club
          will expand this into a full historical timeline in future phases.
        </p>
      </header>

      <section aria-label="Milestone timeline">
        {milestones.map((m, index) => (
          <article
            key={m.year + m.title}
            style={{
              display: "grid",
              gridTemplateColumns: "84px minmax(0, 1fr)",
              columnGap: "1rem",
              padding: "0.75rem 0",
              borderTop: index === 0 ? "1px solid var(--lgfc-border-light)" : "none",
              borderBottom: "1px solid var(--lgfc-border-light)",
            }}
          >
            <div style={{ fontWeight: 700, color: "var(--lgfc-blue)" }}>{m.year}</div>
            <div>
              <h2 style={{ margin: 0, fontSize: "var(--lgfc-font-size-body)", fontWeight: 600 }}>{m.title}</h2>
              <p style={{ margin: "0.25rem 0 0.4rem", fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)" }}>
                {m.description}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section style={{ marginTop: "1.75rem" }}>
        <p style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-muted)" }}>
          This page is a starting point. The long-term goal is a detailed, source-backed
          historical timeline, with links to articles, books, and archival materials curated by
          the Lou Gehrig Fan Club.
        </p>
      </section>
    </main>
  );
}
