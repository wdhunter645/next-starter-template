'use client';

import Link from 'next/link';
import { useState } from 'react';
import HamburgerMenu from './HamburgerMenu';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <style jsx>{`
        header {
          position: relative;
          height: 64px;
        }
        .logo-link {
          position: absolute;
          top: 12px;
          left: 16px;
          display: block;
        }
        .logo-img {
          height: 48px;
          width: auto;
        }
        .burger-btn {
          position: absolute;
          top: 12px;
          right: 16px;
        }
      `}</style>
      <header>
        <Link href="/" aria-label="Lou Gehrig Fan Club" className="logo-link">
          <img className="logo-img" src="/IMG_1946.png" alt="LGFC" />
        </Link>
        <button 
          className="burger-btn"
          onClick={() => setOpen(!open)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="hamburger-menu"
        >
          {/* simple hamburger icon */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        {open && <HamburgerMenu onClose={() => setOpen(false)} />}
      </header>
      <div className="topWhitespace" />
    </>
  );
}
