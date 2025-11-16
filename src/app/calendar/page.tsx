import React from "react";

type EventItem = {
  date: string;
  name: string;
  location: string;
  description: string;
};

const events: EventItem[] = [
  {
    date: "Dec 15, 2025",
    name: "Annual Lou Gehrig Memorial Event",
    location: "Yankee Stadium / Virtual",
    description:
      "A day to remember Lou Gehrig&apos;s life and legacy, featuring fan stories, historical content, and ALS awareness.",
  },
  {
    date: "Jan 8, 2026",
    name: "Virtual Q&amp;A with Baseball Historians",
    location: "Online",
    description:
      "Planned session with historians to discuss Gehrig&apos;s career, the 1927 Yankees, and the evolution of first base.",
  },
  {
    date: "Feb 3, 2026",
    name: "Fan Club Meet &amp; Greet",
    location: "New York / Hybrid",
    description:
      "Informal gathering for club members and supporters, with an emphasis on community building and charitable planning.",
  },
];

export default function CalendarPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.25rem 3rem" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "var(--lgfc-font-size-h1)", margin: 0, color: "var(--lgfc-blue)" }}>Club Calendar</h1>
        <p style={{ marginTop: "0.5rem", color: "var(--lgfc-text-muted)", maxWidth: 720 }}>
          A snapshot of upcoming Lou Gehrig Fan Club events. As the club grows, this page will
          sync with the member calendar and event registration tools.
        </p>
      </header>

      <section aria-label="Upcoming events">
        {events.map((event) => (
          <article
            key={event.date + event.name}
            style={{
              padding: "0.9rem 0",
              borderBottom: "1px solid var(--lgfc-border-light)",
            }}
          >
            <div
              style={{
                fontSize: "var(--lgfc-font-size-small)",
                color: "var(--lgfc-blue)",
                fontWeight: 600,
                marginBottom: "0.2rem",
              }}
            >
              {event.date}
            </div>
            <h2 style={{ margin: 0, fontSize: "var(--lgfc-font-size-h3)" }}>{event.name}</h2>
            <div style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-muted)", marginBottom: "0.25rem" }}>
              {event.location}
            </div>
            <p style={{ margin: 0, fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-main)" }}>{event.description}</p>
          </article>
        ))}
      </section>

      <section style={{ marginTop: "1.75rem" }}>
        <p style={{ fontSize: "var(--lgfc-font-size-small)", color: "var(--lgfc-text-muted)" }}>
          Dates and details are subject to change. Final information will always be shared via
          the News &amp; Q&amp;A page and club email announcements.
        </p>
      </section>
    </main>
  );
}
