'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./Header.module.css";

type SessionMe = {
  ok?: boolean;
  role?: string;
};

function parseSessionMe(value: unknown): SessionMe {
  if (!value || typeof value !== "object") return {};
  const v = value as Record<string, unknown>;
  return {
    ok: v.ok === true,
    role: typeof v.role === "string" ? v.role : undefined,
  };
}

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const res = await fetch("/api/session/me", { cache: "no-store" });
        const raw: unknown = await res.json().catch(() => ({}));
        const data = parseSessionMe(raw);

        if (!mounted) return;

        const role = data.role || "";
        setIsLoggedIn(data.ok === true && (role === "member" || role === "admin"));
      } catch {
        if (!mounted) return;
        setIsLoggedIn(false);
      }
    }

    checkSession();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link className={styles.logoLink} href="/" aria-label="Lou Gehrig Fan Club Home">
            <img
              className={styles.logoImg}
              src="/img/lgfc-logo.png"
              alt="Lou Gehrig Fan Club"
              loading="eager"
              decoding="async"
            />
          </Link>
        </div>

        <nav className={styles.nav} aria-label="Primary">
          <Link className={styles.navLink} href="/join">
            Join
          </Link>
          <Link className={styles.navLink} href="/search">
            Search
          </Link>
          <a className={styles.navLink} href="https://www.bonfire.com/store/lou-gehrig-fan-club/" target="_blank" rel="noreferrer">
            Store
          </a>
          {!isLoggedIn ? (
            <Link className={styles.navLink} href="/login">
              Login
            </Link>
          ) : (
            <>
              <Link className={styles.navLink} href="/fanclub">
                Club
              </Link>
              <Link className={styles.navLink} href="/logout">
                Logout
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
