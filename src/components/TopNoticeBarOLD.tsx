"use client";

import styles from "./TopNoticeBar.module.css";

export default function TopNoticeBar() {
  return (
    <div className={styles.notice} role="region" aria-label="Site notice">
      <div className={styles.container}>
        <span className={styles.text}>
          🎗️ 100% of proceeds support ALS research via ALS Cure Project.
        </span>
        <a className={styles.link} href="/charities">
          Learn more
        </a>
      </div>
    </div>
  );
}
