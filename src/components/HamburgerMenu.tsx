'use client';

import Link from 'next/link';

export default function HamburgerMenu({ onClose }: { onClose: () => void }) {
  return (
    <>
      <style jsx>{`
        .only-mobile {
          display: block;
        }
        @media (min-width: 768px) {
          .only-mobile {
            display: none;
          }
        }
      `}</style>
      <div className="mast-drawer" id="hamburger-menu">
        <button className="mast-drawer-close" onClick={onClose} aria-label="Close menu">
          ×
        </button>
        <ul className="mast-drawer-menu">
          <li className="only-mobile"><Link href="/" onClick={onClose}>Home</Link></li>
          <li><Link href="/about" onClick={onClose}>About</Link></li>
          <li><Link href="/contact" onClick={onClose}>Contact</Link></li>
          <li>
            <a 
              href="mailto:Support@LouGehrigFanClub.com?subject=Support%20Needed"
              aria-label="Contact support via email"
            >
              Support
            </a>
          </li>
          <li>
            <a href="https://www.bonfire.com/store/lou-gehrig-fan-club/" target="_blank" rel="noopener noreferrer">
              Store
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
