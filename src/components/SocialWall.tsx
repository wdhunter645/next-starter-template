'use client';

import styles from './social-wall.module.css';

export default function SocialWall() {
  return (
    <section id="social-wall" className="section-gap">
      <div className="container">
        <h2 className="section-title">Social Wall</h2>
        <p className="sub" style={{ textAlign: 'center', marginTop: 0 }}>
          Live fan posts from Facebook, Instagram, X, and Pinterest.
        </p>

        <div className={styles.embed} aria-label="Social wall embed">
          <div
            className="elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8"
            data-elfsight-app-lazy
          />
          <p className={styles.fallback}>Loading social wall content…</p>
        </div>
      </div>
    </section>
  );
}
