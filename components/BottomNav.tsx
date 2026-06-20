"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Columns } from "./ui/icons";

const items = [
  { href: "/", label: "Beranda", Icon: Home },
  { href: "/kalender", label: "Kalender", Icon: CalendarDays },
  { href: "/banding", label: "Banding", Icon: Columns },
];

/** Navigasi bawah khusus layar kecil (thumb-reach). Disembunyikan di ≥ sm. */
export default function BottomNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/85 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-bg/70 sm:hidden"
    >
      <div className="mx-auto flex max-w-6xl">
        {items.map(({ href, label, Icon }) => {
          const active =
            href === "/" ? path === "/" || path.startsWith("/emiten") : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition ${
                active ? "text-brand" : "text-muted"
              }`}
            >
              <Icon size={21} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
