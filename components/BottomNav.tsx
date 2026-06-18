"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 10.5 12 4l9 6.5M5.5 9.5V19a1 1 0 0 0 1 1H10v-5h4v5h3.5a1 1 0 0 0 1-1V9.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M3.5 9.5h17M8 3.5v3M16 3.5v3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

const items = [
  { href: "/", label: "Beranda", icon: <HomeIcon /> },
  { href: "/kalender", label: "Kalender", icon: <CalIcon /> },
];

/** Navigasi bawah khusus layar kecil (thumb-reach). Disembunyikan di ≥ sm. */
export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-6xl">
        {items.map((it) => {
          const active =
            it.href === "/"
              ? path === "/" || path.startsWith("/emiten")
              : path.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition ${
                active ? "text-brand-strong" : "text-muted"
              }`}
            >
              {it.icon}
              <span>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
