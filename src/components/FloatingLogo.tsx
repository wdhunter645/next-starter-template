'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './FloatingLogo.module.css';

type FloatingLogoProps = {
  homeRoute?: string;
};

/**
 * FloatingLogo
 * - Independent overlay layer (NOT part of the sticky header)
 * - Visible at top of "/" and "/fanclub"
 * - Disappears only after the user scrolls past the hero area (threshold tuned)
 */
export default function FloatingLogo({ homeRoute = '/' }: FloatingLogoProps = {}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const THRESHOLD_PX = 320; // tune here if needed (higher = stays longer)
    const onScroll = () => {
      setShow((window.scrollY || 0) < THRESHOLD_PX);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <div className={styles.wrap}>
      <Link href={homeRoute} aria-label="Lou Gehrig Fan Club" className={styles.link}>
        <img className={styles.img} src="/IMG_1946.png" alt="LGFC" />
      </Link>
    </div>
  );
}
