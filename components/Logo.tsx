import Image from "next/image";
import Link from "next/link";

export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <Link href="/" aria-label="Lou Gehrig Fan Club — Home" className="flex items-center gap-3">
      <Image
        src="/lgfc-logo.png"
        alt="Lou Gehrig Fan Club logo"
        width={size}
        height={size}
        priority
        className="h-8 w-8 md:h-9 md:w-9 object-contain select-none"
      />
      <span className="font-semibold text-base md:text-lg tracking-tight">Lou Gehrig Fan Club</span>
    </Link>
  );
}
