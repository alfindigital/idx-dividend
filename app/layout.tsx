import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
import HeaderNav from "@/components/HeaderNav";
import BottomNav from "@/components/BottomNav";
import SiteFooter from "@/components/SiteFooter";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dividen IDX · History & Kalender",
  description:
    "Riwayat dividen 5 tahun & perkiraan jadwal dividen berikutnya untuk emiten IDX berdividen besar.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4f46e5" },
    { media: "(prefers-color-scheme: dark)", color: "#08080d" },
  ],
};

// Set tema sebelum paint pertama → tidak ada kedipan (flash) saat reload.
const themeInit = `(function(){try{var t=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&m)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="url(#lg)" />
      <path
        d="M8 20.5l4.5-4.5 3 3 5.5-6.5"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="21" cy="12.5" r="2.1" fill="white" />
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f46e5" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${jakarta.variable} ${grotesk.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <header className="sticky top-0 z-20 border-b border-line bg-bg/70 backdrop-blur supports-[backdrop-filter]:bg-bg/60">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5">
            <Link href="/" className="flex items-center gap-2">
              <LogoMark />
              <span className="font-display text-lg font-bold tracking-tight text-fg">
                Dividen<span className="text-brand">IDX</span>
              </span>
            </Link>
            <div className="flex items-center gap-1.5">
              <HeaderNav />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        <SiteFooter />
        <BottomNav />
      </body>
    </html>
  );
}
