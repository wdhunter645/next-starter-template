'use client';

import Link from 'next/link';

export default function HamburgerMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="mast-drawer" id="hamburger-menu">
      <button className="mast-drawer-close" onClick={onClose} aria-label="Close menu">
        ×
      </button>
      <ul className="mast-drawer-menu">
        <li>
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
          <a href="https://www.bonfire.com/store/lou-gehrig-fan-club/" target="_blank" rel="noopener noreferrer">
            Store
          </a>
        </li>
        <li>
          <Link href="/member" onClick={onClose}>
            Members Area
          </Link>
        </li>
        <li>
          <Link href="/admin" onClick={onClose}>
            Admin
          </Link>
        </li>
      </ul>
    </div>
  );
}
