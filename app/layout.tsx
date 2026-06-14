import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dividen IDX — History & Kalender",
  description:
    "Riwayat dividen 5 tahun & perkiraan jadwal dividen berikutnya untuk emiten IDX berdividen besar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <header className="bg-brand-dark text-white sticky top-0 z-20 shadow">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg tracking-tight">
              📈 Dividen IDX
            </Link>
            <nav className="flex gap-5 text-sm font-medium">
              <Link href="/" className="hover:underline underline-offset-4">
                Beranda
              </Link>
              <Link href="/kalender" className="hover:underline underline-offset-4">
                Kalender
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="border-t mt-12 py-6 text-xs text-slate-500">
          <div className="mx-auto max-w-6xl px-4 space-y-1">
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
      </body>
    </html>
  );
}
