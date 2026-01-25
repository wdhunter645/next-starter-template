// Member area layout - header rendered by root layout
// No custom layout needed; just pass through children
export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
