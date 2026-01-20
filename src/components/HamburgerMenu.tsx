'use client';

import Link from 'next/link';

/**
 * Visitor hamburger menu.
 * Desktop/Tablet: About, Contact, Support (NO Store - it's a header button)
 * Mobile: Home, About, Contact, Support, Store
 */
export default function HamburgerMenu({ onClose }: { onClose: () => void }) {
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
          position: absolute;
          top: 60px;
          right: 0;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 12px;
          z-index: 1002;
          min-width: 200px;
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
          text-align: right;
        }
        .hamburger-menu a {
          color: #000;
          text-decoration: none;
        }
        .hamburger-menu a:hover {
          color: var(--lgfc-blue);
        }
      `}</style>
      <div className="hamburger-dropdown" id="hamburger-menu">
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
