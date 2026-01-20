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
      `}</style>
      <div className="mast-drawer" id="hamburger-menu">
        <button className="mast-drawer-close" onClick={onClose} aria-label="Close menu">
          ×
        </button>
        <ul className="mast-drawer-menu">
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
