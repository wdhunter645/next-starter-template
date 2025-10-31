'use client';
import Link from "next/link";
import "../styles/header.css";

type HeaderProps = {
  noticeText?: string;
};

export default function Header({ noticeText }: HeaderProps) {
  return (
    <>
      {noticeText ? (
        <div className="lgfc-notice">{noticeText}</div>
      ) : null}

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
