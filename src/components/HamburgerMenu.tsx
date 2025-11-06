'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './Header.module.css';

export default function HamburgerMenu({ onClose }: { onClose: () => void }) {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // More precise cookie check - ensure exact match with equals sign
    const cookies = document.cookie.split(';').map(c => c.trim());
    const isMember = cookies.some(cookie => cookie.startsWith('lgfc_session=1'));
    setLoggedIn(isMember);
  }, []);

  const items = [
    { label: 'About', href: '/about', external: false },
    { label: 'Contact', href: '/contact', external: false },
    { label: 'Store', href: 'https://www.bonfire.com/store/lou-gehrig-fan-club/', external: true },
    loggedIn
      ? { label: 'Members Area', href: '/member', external: false }
      : { label: 'Login', href: '/member', external: false },
  ];

  return (
    <div className={styles.drawer}>
      <button className={styles.close} onClick={onClose} aria-label="Close menu">
        ×
      </button>
      <ul className={styles.menu}>
        {items.map((item) => (
          <li key={item.label}>
            {item.external ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer">
                {item.label}
              </a>
            ) : (
              <Link href={item.href} onClick={onClose}>
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
