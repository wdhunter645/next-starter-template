'use client';

import { useEffect, useState } from 'react';

// Member area layout with proper header per spec
export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Get member email from localStorage
    try {
      const memberEmail = window.localStorage.getItem('lgfc_member_email') || '';
      setEmail(memberEmail);
      
      // Check if user is admin
      if (memberEmail) {
        fetch(`/api/member/role?email=${encodeURIComponent(memberEmail)}`)
          .then(res => res.json())
          .then(data => {
            if (data.ok && data.role === 'admin') {
              setIsAdmin(true);
            }
          })
          .catch(() => {
            setIsAdmin(false);
          });
      }
    } catch {
      setEmail('');
    }
  }, []);

  const handleLogout = () => {
    try {
      window.localStorage.removeItem('lgfc_member_email');
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  };

  return (
    <div>
      {/* Member Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        background: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
      }}>
        {/* Logo (left) */}
        <a href="/memberpage" aria-label="Member home">
          <img 
            src="/IMG_1946.png" 
            alt="Lou Gehrig Fan Club" 
            style={{ height: 56, width: 'auto', display: 'block' }} 
          />
        </a>

        {/* Right-side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Logout button */}
          {email && (
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--lgfc-blue)',
                background: 'transparent',
                border: '1px solid var(--lgfc-blue)',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          )}

          {/* Hamburger menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              padding: 8,
              fontSize: 24,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              lineHeight: 1,
            }}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Hamburger menu dropdown */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 90,
            right: 20,
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: 180,
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={() => window.location.href = '/'}
              style={{ color: '#000', textDecoration: 'none', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, font: 'inherit' }}
            >
              Home
            </button>
            <a href="/about" style={{ color: '#000', textDecoration: 'none', fontWeight: 600 }}>
              About
            </a>
            <a href="/contact" style={{ color: '#000', textDecoration: 'none', fontWeight: 600 }}>
              Contact
            </a>
            <a 
              href="mailto:Support@LouGehrigFanClub.com?subject=Support%20Request"
              style={{ color: '#000', textDecoration: 'none', fontWeight: 600 }}
            >
              Support
            </a>
            <a
              href="https://lougehrigfanclub.myshopify.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#000', textDecoration: 'none', fontWeight: 600 }}
            >
              Store
            </a>
            <a
              href="/memberpage"
              style={{
                color: 'var(--lgfc-blue)',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              Members
            </a>
            {isAdmin && (
              <a
                href="/admin"
                style={{ color: '#000', textDecoration: 'none', fontWeight: 600 }}
              >
                Admin
              </a>
            )}
          </nav>
        </div>
      )}

      {/* Click outside to close menu */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
          }}
        />
      )}

      {/* Main content */}
      {children}
    </div>
  );
}
