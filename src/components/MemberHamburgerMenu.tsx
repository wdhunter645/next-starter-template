'use client';

import Link from 'next/link';

/**
 * Member hamburger menu.
 * Desktop/Tablet order:
 * 1) My Profile
 * 2) Obtain Membership Card
 * 3) About
 * 4) Contact
 * 5) Support
 *
 * Mobile: include Member Home first.
 */
export default function MemberHamburgerMenu({ onClose }: { onClose: () => void }) {
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
          <li className="only-mobile">
            <Link href="/member" onClick={onClose}>
              Member Home
            </Link>
          </li>
          <li>
            <Link href="/member/profile" onClick={onClose}>
              My Profile
            </Link>
          </li>
          <li>
            <Link href="/member/card" onClick={onClose}>
              Obtain Membership Card
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
        </ul>
      </div>
    </>
  );
}
