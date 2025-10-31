'use client';
import Link from "next/link";
import "../styles/header.css";

export default function Header() {
  return (
    <>
      {/* Optional notice bar (env-controlled later) */}
      <div className="lgfc-notice" hidden>
        Site announcement…
      </div>

      <header className="lgfc-header" role="banner">
        <div className="lgfc-header-inner">
          <Link href="/" className="lgfc-link" aria-label="LGFC home">LGFC</Link>
          <nav className="lgfc-nav" aria-label="Main">
            <Link className="lgfc-link" href="/weekly">Weekly Matchup</Link>
            <Link className="lgfc-link" href="/charities">Charities</Link>
            <Link className="lgfc-link" href="/news">News & Q&A</Link>
            <Link className="lgfc-link" href="/calendar">Calendar</Link>
            <Link className="lgfc-link" href="/member">Join</Link>
          </nav>
        </div>
      </header>
    </>
  );
}
