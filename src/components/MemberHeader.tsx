'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import MemberHamburgerMenu from './MemberHamburgerMenu';

type MemberHeaderProps = {
  homeRoute?: string;
  showLogo?: boolean;
};

export default function MemberHeader({ homeRoute = '/', showLogo = true }: MemberHeaderProps = {}) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <style jsx>{`
        header {
          position: relative;
          height: 104px;
        }
        .logo-link {
          position: absolute;
          top: 8px;
          left: 16px;
          display: block;
          z-index: 999;
        }
        .logo-img {
          height: 240px;
          width: auto;
        }
        .header-right {
          position: fixed;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px;
          border-radius: 14px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(6px);
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          z-index: 1000;
        }
        .header-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 16px;
          border-radius: var(--lgfc-radius-md);
          border: 1px solid rgba(0, 0, 0, 0.15);
          background: var(--lgfc-bg-card);
          color: var(--lgfc-blue);
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s;
          font-size: 14px;
          font-family: var(--lgfc-font-family);
        }
        .header-btn:hover {
          opacity: 0.9;
        }
        .desktop-tablet-only {
          display: none;
        }
        @media (min-width: 768px) {
          .desktop-tablet-only {
            display: inline-flex;
          }
        }
        .burger-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
        }
      `}</style>
      <header>
        {showLogo && (
          <Link href={homeRoute} aria-label="Lou Gehrig Fan Club" className="logo-link">
            <img className="logo-img" src="/IMG_1946.png" alt="LGFC" />
          </Link>
        )}
        <div className="header-right">
          <Link href="/fanclub" className="header-btn desktop-tablet-only">
            Club Home
          </Link>
          <Link href="/fanclub/myprofile" className="header-btn desktop-tablet-only">
            My Profile
          </Link>
          <Link href="/search" className="header-btn desktop-tablet-only">
            Search
          </Link>
          <a
            href="https://www.bonfire.com/store/lou-gehrig-fan-club/"
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className="header-btn desktop-tablet-only"
          >
            Store
          </a>
          <Link href="/logout" className="header-btn desktop-tablet-only">
            Logout
          </Link>
          <button
            ref={toggleRef}
            className="burger-btn"
            onClick={() => setOpen(!open)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="hamburger-menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {open && <MemberHamburgerMenu onClose={() => setOpen(false)} toggleRef={toggleRef} />}
      </header>
    </>
  );
}
