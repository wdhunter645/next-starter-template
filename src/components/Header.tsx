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
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/session/me', { cache: 'no-store' });
        const data = await res.json().catch(() => ({} as any));
        if (!alive) return;
        setIsLoggedIn(!!data?.ok && (data?.role === 'member' || data?.role === 'admin'));
      } catch {
        if (!alive) return;
        setIsLoggedIn(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch {}
    window.location.href = '/';
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* LEFT: Logo */}
        <div className={styles.left}>
          {showLogo ? (
            <Link aria-label="Lou Gehrig Fan Club" className={styles.logoLink} href={homeRoute}>
              <img className={styles.logoImg} src="/IMG_1946.png" alt="LGFC" />
            </Link>
          ) : null}
        </div>

        {/* CENTER: buttons */}
        <nav className={styles.center} aria-label="Primary">
          {/* Public header per locked design:
              Not logged in: Join, Search, Store, Login
              Logged in: Join, Search, Store, Login, Club, Logout (6 total)
          */}
          <Link className={styles.btn} href="/join">
            Join
          </Link>
          <Link className={styles.btn} href="/search">
            Search
          </Link>
          <a
            className={styles.btn}
            href="https://www.bonfire.com/store/lou-gehrig-fan-club/"
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
          >
            Store
          </a>
          <Link className={styles.btn} href="/login">
            Login
          </Link>

          {isLoggedIn ? (
            <>
              <Link className={styles.btn} href="/fanclub">
                Club
              </Link>
              <button className={styles.btn} type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : null}

          {/* Hamburger (mobile / overflow) */}
          <div className={styles.right}>
            <button
              ref={toggleRef}
              className={styles.hamburger}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Open menu"
              aria-expanded={open ? 'true' : 'false'}
              aria-controls="hamburger-menu"
            >
              <span className={styles.hamburgerBar}></span>
              <span className={styles.hamburgerBar}></span>
              <span className={styles.hamburgerBar}></span>
            </button>
          </div>
        </nav>

        <HamburgerMenu open={open} setOpen={setOpen} toggleRef={toggleRef} />
      </div>
    </header>
  );
}
