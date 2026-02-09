'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import styles from './Header.module.css';
import HamburgerMenu from './HamburgerMenu';

type HeaderProps = {
  homeRoute?: string;
  showLogo?: boolean;
};

export default function Header({ homeRoute = '/', showLogo = true }: HeaderProps = {}) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const memberEmail = window.localStorage.getItem('lgfc_member_email');
      setIsLoggedIn(!!memberEmail);
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    try {
      window.localStorage.removeItem('lgfc_member_email');
    } catch {}
    window.location.href = '/';
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* LEFT: Logo (hard constrained hitbox) */}
        <div className={styles.left} style={{ width: 72, maxWidth: 72, flex: '0 0 72px' }}>
          {showLogo ? (
            <Link
              href={homeRoute}
              aria-label="Lou Gehrig Fan Club"
              className={styles.logoLink}
              style={{ display: 'inline-flex', width: 72, maxWidth: 72 }}
            >
              <img
                className={styles.logoImg}
                src="/IMG_1946.png"
                alt="LGFC"
                style={{ display: 'block', height: 44, width: 'auto', maxWidth: 72 }}
              />
            </Link>
          ) : (
            <span />
          )}
        </div>

        {/* CENTER: Page-centered primary buttons */}
        <nav className={styles.center} aria-label="Primary">
          {!isLoggedIn ? (
            <>
              <Link className={styles.btn} href="/join">Join</Link>
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
              <Link className={styles.btn} href="/login">Login</Link>
            </>
          ) : (
            <>
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
              <Link className={styles.btn} href="/fanclub">Club</Link>
              <button className={styles.btn} type="button" onClick={handleLogout}>Logout</button>
            </>
          )}
        

{/* RIGHT: Hamburger */}
        <div className={styles.right}>
          <button
            ref={toggleRef}
            className={styles.hamburger}
            type="button"
            onClick={() => setOpen(v => !v)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="hamburger-menu"
          >
            <span className={styles.hamburgerBar} />
            <span className={styles.hamburgerBar} />
            <span className={styles.hamburgerBar} />
          </button>

          {open ? <HamburgerMenu onClose={() => setOpen(false)} toggleRef={toggleRef} /> : null}
        </div>
</nav>

        
      </div>
    </header>
  );
}
