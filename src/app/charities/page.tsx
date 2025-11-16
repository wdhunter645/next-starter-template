import React from "react";

type Charity = {
  name: string;
  url: string;
  focus: string;
  summary: string;
};

const charities: Charity[] = [
  {
    name: "ALS Cure Project",
    url: "https://www.alscure.org/",
    focus: "Research",
    summary:
      "Family-driven nonprofit organization focused on funding cutting-edge ALS research and accelerating paths to a cure.",
  },
  {
    name: "LiveLikeLou",
    url: "https://livelikelou.org/",
    focus: "Support & Legacy",
    summary:
      "Honors Lou Gehrig&apos;s legacy by supporting ALS families, funding research, and raising awareness about the disease.",
  },
  {
    name: "Additional Partners",
    url: "#",
    focus: "Future Collaborations",
    summary:
      "The Lou Gehrig Fan Club plans to highlight additional ALS-focused charities and initiatives as the club grows.",
  },
];

export default function CharitiesPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.25rem 3rem" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "2rem", margin: 0 }}>Charity Partners</h1>
        <p style={{ marginTop: "0.5rem", color: "#555", maxWidth: 700 }}>
          The Lou Gehrig Fan Club exists to celebrate Lou&apos;s legacy and support organizations
          working to defeat ALS and support families affected by the disease.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {charities.map((charity) => (
          <article
            key={charity.name}
            style={{
              borderRadius: "0.9rem",
              border: "1px solid #dde3f5",
              background: "#ffffff",
              padding: "1.25rem 1.1rem",
              boxShadow: "0 2px 4px rgba(0, 30, 80, 0.06)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "0.35rem", fontSize: "1.15rem" }}>
              {charity.name}
            </h2>
            <div
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#0033cc",
                marginBottom: "0.4rem",
              }}
            >
              {charity.focus}
            </div>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#444" }}>{charity.summary}</p>
            {charity.url !== "#" && (
              <p style={{ marginTop: "0.75rem" }}>
                <a
                  href={charity.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: "0.9rem",
                    color: "#0033cc",
                    textDecoration: "underline",
                    textUnderlineOffset: "0.1rem",
                  }}
                >
                  Visit website →
                </a>
              </p>
            )}
          </article>
        ))}
      </section>

      <section style={{ marginTop: "1.75rem" }}>
        <p style={{ fontSize: "0.9rem", color: "#555" }}>
          The club will not promote any ALS charity casually. Each organization featured here is
          vetted for mission alignment, transparency, and real-world impact. As the fan club
          grows, this page will become the central hub for our fundraising and awareness efforts.
        </p>
      </section>
    </main>
  );
}
