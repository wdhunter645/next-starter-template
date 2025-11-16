'use client';

import Link from 'next/link';
import { useState } from 'react';
import HamburgerMenu from './HamburgerMenu';

type HeaderProps = {
  homeRoute?: string; // where logo should point
  showLogo?: boolean; // allow hiding logo for admin
};

export default function Header({ homeRoute = '/', showLogo = true }: HeaderProps = {}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <style jsx>{`
        header {
          position: relative;
          height: 96px;
        }
        .logo-link {
          position: absolute;
          top: 8px;
          left: 16px;
          display: block;
        }
        .logo-img {
          height: 80px;
          width: auto;
        }
        .header-right {
          position: absolute;
          top: 8px;
          right: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .login-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 16px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.15);
          background: #fff;
          color: var(--brand-blue);
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s;
          font-size: 14px;
        }
        .login-btn:hover {
          opacity: 0.9;
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
          <Link href="/member" className="login-btn">
            Login
          </Link>
          <button 
            className="burger-btn"
            onClick={() => setOpen(!open)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="hamburger-menu"
          >
            {/* simple hamburger icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {open && <HamburgerMenu onClose={() => setOpen(false)} />}
      </header>
      <div className="topWhitespace" />
    </>
  );
}
