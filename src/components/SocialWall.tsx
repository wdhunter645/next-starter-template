'use client';
import { useEffect, useState } from 'react';
import styles from './social-wall.module.css';

const WIDGET_ID = 'ef0af9bb-7f80-416f-a68b-d78b9f9c5697'; // Replace with your real Elfsight widget id

export default function SocialWall() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Prevent duplicate loads
    const existing = document.querySelector('script[data-elfsight-platform]');
    if (!existing) {
      const s = document.createElement('script');
      s.src = 'https://static.elfsight.com/platform/platform.js';
      s.defer = true;
      s.setAttribute('data-elfsight-platform', '1');
      s.onload = () => setLoaded(true);
      s.onerror = () => setLoaded(false);
      document.body.appendChild(s);
    } else {
      setLoaded(true);
    }
  }, []);

  return (
    <section className={styles.wall} aria-labelledby="social-wall-title">
      <h2 id="social-wall-title" className={styles.title}>Social Wall</h2>
      <div className={styles.embed}>
        {/* Elfsight container */}
        <div className={`elfsight-app-${WIDGET_ID}`}></div>

        {/* Fallback if script blocked */}
        {!loaded && (
          <div className={styles.fallback} role="status" aria-live="polite">
            Social feed unavailable right now. Try refreshing or visit our Facebook page.
          </div>
        )}
      </div>
    </section>
  );
}
