import React from "react";

const mockMatchup = {
  title: "Weekly Photo Matchup",
  description:
    "Each week we feature two Lou Gehrig photos. Fans vote for their favorite, and the winner advances in the season-long bracket.",
  photoA: {
    label: "Photo A",
    caption: "Lou in the on-deck circle at Yankee Stadium.",
  },
  photoB: {
    label: "Photo B",
    caption: "Gehrig signing autographs for young fans behind home plate.",
  },
};

export default function WeeklyPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.25rem 3rem" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "2rem", margin: 0 }}>Weekly Matchup</h1>
        <p style={{ marginTop: "0.5rem", color: "#555", maxWidth: 640 }}>
          {mockMatchup.description}
        </p>
      </header>

      <section
        style={{
          border: "1px solid #dde3f5",
          borderRadius: "0.75rem",
          padding: "1.5rem",
          background: "#f8f9ff",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.25rem" }}>
          This Week&apos;s Photos
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          <article
            style={{
              borderRadius: "0.75rem",
              border: "1px solid #ccd3ea",
              padding: "1rem",
              background: "#ffffff",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>{mockMatchup.photoA.label}</h3>
            <div
              style={{
                borderRadius: "0.5rem",
                border: "1px dashed #ccd3ea",
                padding: "1.25rem 0.75rem",
                fontSize: "0.9rem",
                color: "#555",
                marginBottom: "0.75rem",
                textAlign: "center",
              }}
            >
              Image A will appear here once Backblaze B2 and Supabase are wired in.
            </div>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#444" }}>
              {mockMatchup.photoA.caption}
            </p>
          </article>

          <article
            style={{
              borderRadius: "0.75rem",
              border: "1px solid #ccd3ea",
              padding: "1rem",
              background: "#ffffff",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>{mockMatchup.photoB.label}</h3>
            <div
              style={{
                borderRadius: "0.5rem",
                border: "1px dashed #ccd3ea",
                padding: "1.25rem 0.75rem",
                fontSize: "0.9rem",
                color: "#555",
                marginBottom: "0.75rem",
                textAlign: "center",
              }}
            >
              Image B will appear here once Backblaze B2 and Supabase are wired in.
            </div>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#444" }}>
              {mockMatchup.photoB.caption}
            </p>
          </article>
        </div>

        <p style={{ marginTop: "1.25rem", fontSize: "0.9rem", color: "#444" }}>
          Voting will be handled from the members area once the members site is live. For now,
          this page introduces the Weekly Matchup format and gives fans a preview of what&apos;s
          coming.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>How it works</h2>
        <ol style={{ paddingLeft: "1.25rem", marginTop: 0 }}>
          <li style={{ marginBottom: "0.5rem" }}>
            The club posts two Lou Gehrig photos every week.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            Members will be able to vote for their favorite once the members site is live.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            Winners advance in a season-long bracket and may be featured in special club posts.
          </li>
        </ol>
        <p style={{ fontSize: "0.9rem", color: "#555" }}>
          Follow the club on social media and bookmark this page to keep up with the latest
          matchups.
        </p>
      </section>
    </main>
  );
}
