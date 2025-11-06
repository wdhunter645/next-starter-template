'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import HamburgerMenu from './HamburgerMenu';
import styles from './Header.module.css';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        <Link href="/" className={styles.logoLink} aria-label="LGFC home">
          <Image 
            src="/IMG_1946.png" 
            alt="Lou Gehrig Fan Club Logo" 
            width={192} 
            height={192}
            priority
          />
        </Link>
        <button 
          className={styles.hamburger} 
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="hamburger-menu"
        >
          <span className={styles.line}></span>
          <span className={styles.line}></span>
          <span className={styles.line}></span>
        </button>
        {open && <HamburgerMenu onClose={() => setOpen(false)} />}
      </div>
    </header>
  );
}
