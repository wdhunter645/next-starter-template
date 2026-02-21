'use client';

import styles from './social-wall.module.css';

export default function SocialWall() {
  return (
    <section id="social-wall" className="container section-gap">
      <h2 className={styles.sectionTitle}>Social Wall</h2>

      <div className={styles.embed}>
        <div
          className="elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8"
          data-elfsight-app-lazy
        />
      </div>
    </section>
  );
}
