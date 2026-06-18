import type { Metadata } from "next";
import Link from "next/link";
import DashboardGuide from "@/components/DashboardGuide";
import { ArrowLeft, AlertTriangle } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Panduan & Informasi · Dividen IDX",
  description: "Cara membaca data dividen, istilah penting, sumber, dan disclaimer.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
          <ArrowLeft size={15} /> Kembali ke daftar
        </Link>
      </div>

      <header className="space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
          Data Dividen IDX
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-fg">
          Lacak history &amp; jadwal dividen saham IDX
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          Riwayat ~5 tahun, skor konsistensi &amp; tren, yield berjalan dari harga terkini, dan
          perkiraan jadwal dividen berikutnya.
        </p>
      </header>

      <DashboardGuide open />

      {/* satu blok disclaimer yang di-highlight */}
      <div className="flex gap-2.5 rounded-xl border border-amber-300/50 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200/90">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="font-semibold">Catatan &amp; disclaimer</p>
          <p>
            Data dirangkum dari sumber publik (IDX, KSEI, IR perusahaan, media keuangan) dan bisa
            keliru, jadi verifikasi ke sumber resmi sebelum mengambil keputusan. Prediksi tanggal
            adalah perkiraan pola historis, bukan kepastian, dan jumlah dividen tidak diprediksi.{" "}
            <strong>Bukan saran investasi.</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
