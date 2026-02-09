'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './FloatingLogo.module.css';

type FloatingLogoProps = {
  homeRoute?: string;
};

export default function FloatingLogo({ homeRoute = '/' }: FloatingLogoProps = {}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      // Visible only at the top of the page; once you scroll, it disappears.
      // This recreates the "non-sticky logo" behavior while keeping the header sticky.
      setShow((window.scrollY || 0) < 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <div className={styles.wrap} aria-hidden="false">
      <Link href={homeRoute} aria-label="Lou Gehrig Fan Club" className={styles.link}>
        <img className={styles.img} src="/IMG_1946.png" alt="LGFC" />
      </Link>
    </div>
  );
}
