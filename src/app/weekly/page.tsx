import React from "react";
import styles from "./page.module.css";

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
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>Weekly Matchup</h1>
        <p className={styles.description}>
          {mockMatchup.description}
        </p>
      </header>

      <section className={styles.matchupSection}>
        <h2 className={styles.sectionTitle}>
          This Week&apos;s Photos
        </h2>
        <div className={styles.photosGrid}>
          <article className={styles.photoCard}>
            <h3 className={styles.photoTitle}>{mockMatchup.photoA.label}</h3>
            <div className={styles.photoPlaceholder}>
              Image A will appear here once Backblaze B2 and Supabase are wired in.
            </div>
            <p className={styles.photoCaption}>
              {mockMatchup.photoA.caption}
            </p>
          </article>

          <article className={styles.photoCard}>
            <h3 className={styles.photoTitle}>{mockMatchup.photoB.label}</h3>
            <div className={styles.photoPlaceholder}>
              Image B will appear here once Backblaze B2 and Supabase are wired in.
            </div>
            <p className={styles.photoCaption}>
              {mockMatchup.photoB.caption}
            </p>
          </article>
        </div>

        <p className={styles.votingNote}>
          Voting will be handled from the members area once the members site is live. For now,
          this page introduces the Weekly Matchup format and gives fans a preview of what&apos;s
          coming.
        </p>
      </section>

      <section>
        <h2 className={styles.howItWorksTitle}>How it works</h2>
        <ol className={styles.howItWorksList}>
          <li>
            The club posts two Lou Gehrig photos every week.
          </li>
          <li>
            Members will be able to vote for their favorite once the members site is live.
          </li>
          <li>
            Winners advance in a season-long bracket and may be featured in special club posts.
          </li>
        </ol>
        <p className={styles.followNote}>
          Follow the club on social media and bookmark this page to keep up with the latest
          matchups.
        </p>
      </section>
    </main>
  );
}
