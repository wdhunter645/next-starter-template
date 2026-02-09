'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import styles from './MemberHeader.module.css';
import MemberHamburgerMenu from './MemberHamburgerMenu';

type MemberHeaderProps = {
  homeRoute?: string;
  showLogo?: boolean;
};

export default function MemberHeader({ homeRoute = '/', showLogo = true }: MemberHeaderProps = {}) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* LEFT: Logo (small header logo; hidden when FloatingLogo is active) */}
        <div className={styles.left}>
          {showLogo ? (
            <Link href={homeRoute} aria-label="Lou Gehrig Fan Club" className={styles.logoLink}>
              <img className={styles.logoImg} src="/IMG_1946.png" alt="LGFC" />
            </Link>
          ) : (
            <span />
          )}
        </div>

        {/* CENTER: Member buttons + Hamburger grouped together */}
        <nav className={styles.center} aria-label="Member">
          <Link className={styles.btn} href="/fanclub">Club Home</Link>
          <Link className={styles.btn} href="/fanclub/myprofile">My Profile</Link>
          <Link className={styles.btn} href="/search">Search</Link>
          <a
            className={styles.btn}
            href="https://www.bonfire.com/store/lou-gehrig-fan-club/"
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
          >
            Store
          </a>
          <Link className={styles.btn} href="/logout">Logout</Link>

          {/* Hamburger (grouped with buttons) */}
          <div className={styles.right}>
            <button
              ref={toggleRef}
              className={styles.hamburger}
              type="button"
              onClick={() => setOpen(v => !v)}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="member-hamburger-menu"
            >
              <span className={styles.hamburgerBar} />
              <span className={styles.hamburgerBar} />
              <span className={styles.hamburgerBar} />
            </button>

            {open ? <MemberHamburgerMenu onClose={() => setOpen(false)} toggleRef={toggleRef} /> : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
