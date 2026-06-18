import type { Metadata } from "next";
import Link from "next/link";
import DashboardGuide from "@/components/DashboardGuide";
import Disclaimer from "@/components/Disclaimer";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, AlertTriangle } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Panduan & Informasi · Dividen IDX",
  description: "Cara membaca data dividen, istilah penting, sumber, dan disclaimer.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
        >
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
          Riwayat ~5 tahun, skor konsistensi &amp; tren jumlah, yield berjalan dari harga terkini,
          dan perkiraan kapan dividen berikutnya kemungkinan dibagikan. Di bawah ini cara membaca
          datanya, istilah penting, sumber, dan disclaimer.
        </p>
      </header>

      <DashboardGuide open />

      <Disclaimer />

      <Card className="p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-fg">
          <AlertTriangle size={16} className="text-amber-500" /> Disclaimer
        </h2>
        <div className="mt-2 space-y-2 text-sm text-muted">
          <p>
            Data dikumpulkan dari sumber publik (IDX/KSEI/IR perusahaan, media keuangan) dan dapat
            mengandung kekeliruan. Selalu verifikasi ke sumber resmi sebelum mengambil keputusan.
          </p>
          <p>
            Prediksi tanggal bersifat <strong className="text-fg">perkiraan</strong> berbasis pola
            historis, bukan kepastian. Jumlah dividen tidak diprediksi.
          </p>
          <p>
            Halaman ini <strong className="text-fg">bukan saran investasi</strong>.
          </p>
        </div>
      </Card>
    </div>
  );
}
