'use client';
import styles from './social-wall.module.css';

const ELFSIGHT_WIDGET_URL = 'https://static.elfsight.com/platform/platform.js';

export default function SocialWall() {
  return (
    <section className={styles.wall} aria-labelledby="social-wall-title">
      <h2 id="social-wall-title" className={styles.title}>Social Wall</h2>
      <div className={styles.embed}>
        <br />
        <br />
        {ELFSIGHT_WIDGET_URL}
        <br />
        <br />
      </div>
    </section>
  );
}
