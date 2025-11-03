'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import "../styles/header.css";

export default function Header() {
  const pathname = usePathname();

  return (
    <>
      <header className="lgfc-header site-header" role="banner">
        <div className="lgfc-header-inner">
          {/* BEGIN:HEADER_LOGO */}
          <Link href="/" className="lgfc-link" aria-label="LGFC home">LGFC</Link>
          {/* END:HEADER_LOGO */}
          {/* BEGIN:HEADER_NAV */}
          <nav className="lgfc-nav" aria-label="Main">
            <Link className="lgfc-link" href="/matchup" aria-current={pathname === "/matchup" ? "page" : undefined}>Matchup</Link>
            <Link className="lgfc-link" href="/charities" aria-current={pathname === "/charities" ? "page" : undefined}>Charities</Link>
            <Link className="lgfc-link" href="/news" aria-current={pathname === "/news" ? "page" : undefined}>News</Link>
            <Link className="lgfc-link" href="/calendar" aria-current={pathname === "/calendar" ? "page" : undefined}>Calendar</Link>
            <Link className="lgfc-link" href="/join" aria-current={pathname === "/join" ? "page" : undefined}>Join</Link>
          </nav>
          {/* END:HEADER_NAV */}
        </div>
      </header>
    </>
  );
}
