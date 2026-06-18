import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNav from "@/components/BottomNav";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dividen IDX — History & Kalender",
  description:
    "Riwayat dividen 5 tahun & perkiraan jadwal dividen berikutnya untuk emiten IDX berdividen besar.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f766e" },
    { media: "(prefers-color-scheme: dark)", color: "#080c16" },
  ],
};

// Set tema sebelum paint pertama → tidak ada kedipan (flash) saat reload.
const themeInit = `(function(){try{var t=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&m)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

function Logo() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="url(#lg)" />
      <path
        d="M8 20.5l5-5 3.5 3.5L24 11"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="11" r="2.6" fill="#fde68a" />
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0f766e" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={jakarta.variable} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <header className="sticky top-0 z-20 bg-gradient-to-r from-teal-900 to-teal-700 text-white shadow-md dark:from-teal-950 dark:to-teal-800">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold tracking-tight"
            >
              <Logo />
              <span>Dividen IDX</span>
            </Link>
            <div className="flex items-center gap-1 sm:gap-2">
              <nav className="hidden items-center gap-1 text-sm font-medium sm:flex">
                <Link href="/" className="rounded-full px-3 py-1.5 transition hover:bg-white/10">
                  Beranda
                </Link>
                <Link
                  href="/kalender"
                  className="rounded-full px-3 py-1.5 transition hover:bg-white/10"
                >
                  Kalender
                </Link>
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mt-12 border-t border-line pb-24 pt-6 text-xs text-muted sm:pb-6">
          <div className="mx-auto max-w-6xl space-y-1 px-4">
            <p>
              ⚠️ Data dikumpulkan dari sumber publik dan dapat mengandung kekeliruan. Selalu
              verifikasi ke sumber resmi (IDX/KSEI/IR perusahaan) sebelum mengambil keputusan.
            </p>
            <p>
              Prediksi tanggal bersifat <strong>perkiraan</strong> berbasis pola historis, bukan
              kepastian. Halaman ini <strong>bukan saran investasi</strong>.
            </p>
          </div>
        </footer>
        <BottomNav />
      </body>
    </html>
  );
}
