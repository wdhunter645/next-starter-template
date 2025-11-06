'use client';

import Link from 'next/link';
import { useState } from 'react';
import HamburgerMenu from './HamburgerMenu';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mast">
      <div className="mast-inner">
        <Link href="/" aria-label="Lou Gehrig Fan Club">
          <img className="mast-logo" src="/IMG_1946.png" alt="LGFC" />
        </Link>
        <button 
          className="mast-menu" 
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
      </div>
    </div>
  );
}
