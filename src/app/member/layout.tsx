import type { ReactNode } from "react";

// Member area layout - header rendered by root layout
// No custom layout needed; just pass through children
export default function MemberLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
