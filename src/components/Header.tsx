'use client';
import Link from "next/link";
import Image from "next/image";
import "../styles/header.css";

type HeaderProps = {
  noticeText?: string | null; // optional top notice copy
};

export default function Header({ noticeText }: HeaderProps) {
  const hasNotice = Boolean((noticeText ?? "").trim());
  return (
    <>
      <div className="lgfc-header-wrap" data-has-notice={hasNotice}>
        {hasNotice && (
          <div className="lgfc-notice" style={{ display: 'flex' }}>
            {noticeText}
          </div>
        )}
        <header className="lgfc-header">
          <Link href="/" className="lgfc-logo" aria-label="Lou Gehrig Fan Club">
            <Image src="/logo.svg" alt="LGFC Logo" width={28} height={28} />
            <span>LGFC</span>
          </Link>
          <nav className="lgfc-menu" aria-label="Main navigation">
            <Link href="/weekly">Weekly Matchup</Link>
            <Link href="/charities">Charities</Link>
            <Link href="/news">News &amp; Q&amp;A</Link>
            <Link href="/calendar">Calendar</Link>
            <Link href="/member" className="lgfc-login">Join</Link>
          </nav>
        </header>
      </div>
      {/* spacer to offset fixed header */}
      <div className="lgfc-header-spacer" />
    </>
  );
}
