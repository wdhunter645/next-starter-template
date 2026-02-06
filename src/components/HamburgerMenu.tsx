'use client';

import Link from 'next/link';
import { useEffect, useRef, RefObject, useState } from 'react';
import { useClickAway } from '@/hooks/useClickAway';

/**
 * Visitor hamburger menu.
 * Desktop/Tablet: About, Contact, Support (NO Store - it's a header button)
 * Mobile: Home, About, Contact, Support, Store
 */
export default function HamburgerMenu({ 
  onClose, 
  toggleRef 
}: { 
  onClose: () => void;
  toggleRef: RefObject<HTMLButtonElement | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; minWidth: number } | null>(null);
  
  useClickAway(containerRef, toggleRef, onClose, true);

  useEffect(() => {
    const calc = () => {
      const btn = toggleRef.current;
      if (!btn) return;

      const r = btn.getBoundingClientRect();
      const minWidth = 220;
      const pad = 8;
      const top = Math.round(r.bottom + pad);

      // Prefer left alignment to the button; clamp to viewport.
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
      let left = Math.round(r.left);
      if (left + minWidth + pad > vw) left = Math.max(pad, vw - minWidth - pad);

      setPos({ top, left, minWidth });
    };

    calc();
    window.addEventListener('resize', calc);
    window.addEventListener('scroll', calc, { passive: true });
    return () => {
      window.removeEventListener('resize', calc);
      window.removeEventListener('scroll', calc);
    };
  }, [toggleRef]);

  return (
    <>
      <style jsx>{`
        .only-mobile {
          display: block;
        }
        .only-desktop {
          display: none;
        }
        @media (min-width: 768px) {
          .only-mobile {
            display: none;
          }
          .only-desktop {
            display: block;
          }
        }
        .hamburger-dropdown {
          position: fixed;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 12px;
          z-index: 1002;
          min-width: 220px;
        }
        .hamburger-close {
          position: absolute;
          top: 4px;
          right: 8px;
          font-size: 24px;
          border: none;
          background: transparent;
          cursor: pointer;
        }
        .hamburger-menu {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .hamburger-menu li {
          padding: 8px 0;
          text-align: left;
        }
        .hamburger-menu a {
          color: #000;
          text-decoration: none;
        }
        .hamburger-menu a:hover {
          color: var(--lgfc-blue);
        }
      `}</style>
      <div
        className="hamburger-dropdown"
        id="hamburger-menu"
        ref={containerRef}
        style={pos ? { top: pos.top, left: pos.left, minWidth: pos.minWidth } : { top: 64, left: 16, minWidth: 220 }}
      >
        <button className="hamburger-close" onClick={onClose} aria-label="Close menu">
          ×
        </button>
        <ul className="hamburger-menu">
          <li className="only-mobile">
            <Link href="/" onClick={onClose}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" onClick={onClose}>
              About
            </Link>
          </li>
          <li>
            <Link href="/contact" onClick={onClose}>
              Contact
            </Link>
          </li>
          <li>
            <a href="mailto:Support@LouGehrigFanClub.com?subject=Support%20Needed" aria-label="Contact support via email">
              Support
            </a>
          </li>
          <li className="only-mobile">
            <a href="https://www.bonfire.com/store/lou-gehrig-fan-club/" target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
              Store
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
