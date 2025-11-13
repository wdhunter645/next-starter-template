'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HamburgerMenu({ onClose }: { onClose: () => void }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState('');

  useEffect(() => {
    // Check auth cookies
    const cookies = document.cookie.split(';').map(c => c.trim());
    const isLoggedIn = cookies.some(cookie => cookie === 'lgfc_logged_in=true');
    const userRole = cookies.find(cookie => cookie.startsWith('lgfc_role='))?.split('=')[1] || '';
    
    setLoggedIn(isLoggedIn);
    setRole(userRole);
  }, []);

  const isAdmin = role === 'admin' || role === 'moderator';

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
        {!loggedIn && (
          <li>
            <Link href="/member" onClick={onClose}>
              Login
            </Link>
          </li>
        )}
        <li>
          {loggedIn ? (
            <Link href="/member" onClick={onClose}>
              Members Area
            </Link>
          ) : (
            <span className="menu-placeholder" aria-label="Members Area (login required)">Members Area</span>
          )}
        </li>
        <li>
          {loggedIn && isAdmin ? (
            <Link href="/admin" onClick={onClose}>
              Admin
            </Link>
          ) : (
            <span className="menu-placeholder" aria-label="Admin (restricted access)">Admin</span>
          )}
        </li>
      </ul>
    </div>
  );
}
