'use client';
import Link from "next/link";
import "../styles/header.css";

export default function Header() {
  return (
    <>
      <header className="lgfc-header site-header" role="banner">
        <div className="lgfc-header-inner">
          {/* BEGIN:HEADER_LOGO */}
          <Link href="/" className="lgfc-link" aria-label="LGFC home">LGFC</Link>
          {/* END:HEADER_LOGO */}
          {/* BEGIN:HEADER_NAV */}
          <nav className="lgfc-nav" aria-label="Main">
            <Link className="lgfc-link" href="/about">About</Link>
            <Link className="lgfc-link" href="/store">Store</Link>
            <Link className="lgfc-link" href="/search">Search</Link>
            <Link className="lgfc-link" href="/login">Login</Link>
          </nav>
          {/* END:HEADER_NAV */}
        </div>
      </header>
    </>
  );
}
