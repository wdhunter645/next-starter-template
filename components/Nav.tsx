import Link from "next/link";
import { useRouter } from "next/router";
import Logo from "./Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/weekly", label: "Weekly" },
  { href: "/milestones", label: "Milestones" },
  { href: "/charities", label: "Charities" },
  { href: "/about", label: "About" }
];

export default function Nav() {
  const { pathname } = useRouter();
  return (
    <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="container mx-auto px-4 max-w-6xl h-14 flex items-center justify-between">
        <Logo />
        <nav className="flex gap-4 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-2 py-1 rounded ${pathname === l.href ? "text-lgfc-accent font-semibold" : "text-slate-700 hover:text-slate-900"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
