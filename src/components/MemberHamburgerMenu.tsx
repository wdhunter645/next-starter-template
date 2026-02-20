'use client';

import Link from 'next/link';
import { RefObject, useRef } from 'react';
import { useClickAway } from '@/hooks/useClickAway';

export default function MemberHamburgerMenu({
  onClose,
  toggleRef
}: {
  onClose: () => void;
  toggleRef: RefObject<HTMLButtonElement>;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  useClickAway(menuRef, toggleRef, () => onClose(), true);
return (
    <div style={styles.overlay} role="dialog" aria-label="Menu">
      <div ref={menuRef} style={styles.menu}>
        <nav aria-label="FanClub menu">
          <ul style={styles.ul}>
            <li style={styles.li}><Link href="/fanclub" onClick={onClose} style={styles.link}>Club Home</Link></li>
            <li style={styles.li}><Link href="/fanclub/myprofile" onClick={onClose} style={styles.link}>My Profile</Link></li>
            <li style={styles.li}><Link href="/search" onClick={onClose} style={styles.link}>Search</Link></li>
            <li style={styles.li}><a href="https://www.bonfire.com/" onClick={onClose} style={styles.link}>Store</a></li>
            <li style={styles.li}><Link href="/logout" onClick={onClose} style={styles.link}>Logout</Link></li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 60 },
  menu: {
    position: 'absolute',
    top: 68,
    right: 12,
    width: 240,
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.12)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
    padding: 12
  },
  ul: { listStyle: 'none', margin: 0, padding: 0 },
  li: { margin: 0, padding: 0 },
  link: { display: 'block', padding: '10px 10px', borderRadius: 10, textDecoration: 'none', color: 'inherit' }
};
