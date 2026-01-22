'use client';

import Link from 'next/link';
import { useRef, RefObject } from 'react';
import { useClickAway } from '@/hooks/useClickAway';
import { getCurrentPath } from '@/lib/urlUtils';

/**
 * Member hamburger menu.
 * Desktop/Tablet order (NO Store - it's a header button):
 * 1) My Profile
 * 2) Obtain Membership Card
 * 3) About
 * 4) Contact
 * 5) Support
 *
 * Mobile member hamburger order (locked):
 * 1) Search
 * 2) Home
 * 3) Member Home
 * 4) My Profile
 * 5) Obtain Membership Card
 * 6) About
 * 7) Contact
 * 8) Store (mobile only - replaces header button)
 * 9) Support
 * 10) Login
 * 11) Logout
 */
export default function MemberHamburgerMenu({ 
  onClose, 
  toggleRef 
}: { 
  onClose: () => void;
  toggleRef: RefObject<HTMLButtonElement | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useClickAway(containerRef, toggleRef, onClose, true);
  return (
    <>
      <style jsx>{`
        .only-mobile { display: block; }
        .only-desktop { display: none; }
        @media (min-width: 768px) {
          .only-mobile { display: none; }
          .only-desktop { display: block; }
        }
      `}</style>

      <div className="mast-drawer" id="hamburger-menu" ref={containerRef}>
        <button className="mast-drawer-close" onClick={onClose} aria-label="Close menu">×</button>

        <ul className="mast-drawer-menu">
          {/* Mobile-specific top items */}
          <li className="only-mobile"><Link href="/search" onClick={onClose}>Search</Link></li>
          <li className="only-mobile"><Link href="/" onClick={onClose}>Home</Link></li>
          <li className="only-mobile"><Link href="/member" onClick={onClose}>Member Home</Link></li>

          {/* Desktop/tablet (and also present on mobile lower in list) */}
          <li><Link href="/member/profile" onClick={onClose}>My Profile</Link></li>
          <li><Link href="/member/card" onClick={onClose}>Obtain Membership Card</Link></li>
          <li><Link href="/about" onClick={onClose}>About</Link></li>
          <li><Link href="/contact" onClick={onClose}>Contact</Link></li>
          
          {/* Store: MOBILE ONLY (desktop/tablet has it as header button) */}
          <li className="only-mobile">
            <a
              href="https://www.bonfire.com/store/lou-gehrig-fan-club/"
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              onClick={onClose}
            >
              Store
            </a>
          </li>
          
          <li>
            <Link href={`/support?from=${encodeURIComponent(getCurrentPath())}`} onClick={onClose}>
              Support
            </Link>
          </li>

          {/* Mobile-only bottom items */}
          <li className="only-mobile"><Link href="/login" onClick={onClose}>Login</Link></li>
          <li className="only-mobile"><Link href="/logout" onClick={onClose}>Logout</Link></li>
        </ul>
      </div>
    </>
  );
}
