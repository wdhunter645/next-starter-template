'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type SessionState =
  | { status: 'unknown' }
  | { status: 'guest' }
  | { status: 'member'; email?: string; role?: string };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function asString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

function asBoolean(v: unknown): boolean | undefined {
  return typeof v === 'boolean' ? v : undefined;
}

export default function Header() {
  const [session, setSession] = useState<SessionState>({ status: 'unknown' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/session/me', { credentials: 'include' });
        const json: unknown = await res.json().catch(() => null);

        if (!isRecord(json)) {
          if (!cancelled) setSession({ status: 'guest' });
          return;
        }

        const ok = asBoolean(json.ok) === true;
        const email = asString(json.email);
        const role = asString(json.role);

        if (ok && email) {
          if (!cancelled) setSession({ status: 'member', email, role });
        } else {
          if (!cancelled) setSession({ status: 'guest' });
        }
      } catch {
        if (!cancelled) setSession({ status: 'guest' });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const isLoggedIn = session.status === 'member';

  return (
    <header style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img
            src="/logo.png"
            alt="Lou Gehrig Fan Club"
            width={38}
            height={38}
            style={{ display: 'block' }}
          />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#0033cc' }}>Lou Gehrig Fan Club</div>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>Character • Courage • Community</div>
          </div>
        </Link>

        <nav style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Link href="/join">Join</Link>
          <Link href="/search">Search</Link>
          <a href="https://www.bonfire.com/" target="_blank" rel="noreferrer">Store</a>
          {!isLoggedIn && <Link href="/login">Login</Link>}
          {isLoggedIn && <Link href="/fanclub">Club</Link>}
          {isLoggedIn && <Link href="/logout">Logout</Link>}
        </nav>
      </div>
    </header>
  );
}
