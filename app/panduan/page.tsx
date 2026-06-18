import type { Metadata } from "next";
import Link from "next/link";
import DashboardGuide from "@/components/DashboardGuide";
import Disclaimer from "@/components/Disclaimer";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, AlertTriangle } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Panduan & Informasi — Dividen IDX",
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

      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-fg">
          Panduan &amp; Informasi
        </h1>
        <p className="text-sm text-muted">
          Cara membaca data, istilah penting, sumber, dan disclaimer.
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
