'use client';

import Link from 'next/link';
import { useRef, RefObject } from 'react';
import { useClickAway } from '@/hooks/useClickAway';

/**
 * Visitor hamburger menu.
 * All headers: About, Contact
 * (Support page eliminated by design; Store remains a header button)
 */
export default function HamburgerMenu({
  onClose,
  toggleRef
}: {
  onClose: () => void;
  toggleRef: RefObject<HTMLButtonElement | null>;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useClickAway(menuRef, toggleRef, () => onClose(), true);
  return (
    <div style={styles.overlay} role="dialog" aria-label="Menu">
      <div id="hamburger-menu" ref={menuRef} style={styles.menu}>
        <nav aria-label="Primary">
          <ul style={styles.ul}>
            <li style={styles.li}>
              <Link href="/about" onClick={onClose} style={styles.link}>
                About
              </Link>
            </li>
            <li style={styles.li}>
              <Link href="/contact" onClick={onClose} style={styles.link}>
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.25)',
    zIndex: 50
  },
  menu: {
    position: 'absolute',
    top: 68,
    right: 12,
    width: 220,
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.12)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
    padding: 12
  },
  ul: { listStyle: 'none', margin: 0, padding: 0 },
  li: { margin: 0, padding: 0 },
  link: {
    display: 'block',
    padding: '10px 10px',
    borderRadius: 10,
    textDecoration: 'none',
    color: 'inherit'
  }
};
