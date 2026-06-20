"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Columns, HelpCircle } from "./ui/icons";

const base =
  "h-9 w-9 items-center justify-center rounded-md border transition";

function tone(active: boolean) {
  return active
    ? "border-brand/50 bg-brand/10 text-brand"
    : "border-line bg-surface text-muted hover:border-brand/40 hover:text-fg";
}

/** Navigasi header berbasis ikon + tombol bantuan (?) ke halaman panduan. */
export default function HeaderNav() {
  const path = usePathname();
  const homeActive = path === "/" || path.startsWith("/emiten");
  const calActive = path.startsWith("/kalender");
  const bandingActive = path.startsWith("/banding");
  const panduanActive = path.startsWith("/panduan");

  return (
    <>
      <Link
        href="/"
        aria-label="Beranda"
        title="Beranda"
        aria-current={homeActive ? "page" : undefined}
        className={`hidden sm:inline-flex ${base} ${tone(homeActive)}`}
      >
        <Home size={18} />
      </Link>
      <Link
        href="/kalender"
        aria-label="Kalender"
        title="Kalender"
        aria-current={calActive ? "page" : undefined}
        className={`hidden sm:inline-flex ${base} ${tone(calActive)}`}
      >
        <CalendarDays size={18} />
      </Link>
      <Link
        href="/banding"
        aria-label="Bandingkan emiten"
        title="Bandingkan emiten"
        aria-current={bandingActive ? "page" : undefined}
        className={`hidden sm:inline-flex ${base} ${tone(bandingActive)}`}
      >
        <Columns size={18} />
      </Link>
      <Link
        href="/panduan"
        aria-label="Panduan & informasi"
        title="Panduan & informasi"
        aria-current={panduanActive ? "page" : undefined}
        className={`inline-flex ${base} ${tone(panduanActive)}`}
      >
        <HelpCircle size={18} />
      </Link>
    </>
  );
}
