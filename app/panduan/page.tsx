import type { Metadata } from "next";
import Link from "next/link";
import DashboardGuide from "@/components/DashboardGuide";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { AlertTriangle } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Panduan & Informasi",
  description: "Cara membaca data dividen, istilah penting, sumber, dan disclaimer.",
  alternates: { canonical: "/panduan" },
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "Apa itu yield berjalan?",
    a: "Yield berjalan (TTM) adalah total dividen 12 bulan terakhir dibagi harga saham terkini, sehingga nilainya berubah mengikuti harga pasar.",
  },
  {
    q: "Apakah perkiraan tanggalnya pasti?",
    a: "Tidak. Perkiraan tanggal ex-date dihitung dari pola historis dan bukan kepastian. Jumlah dividen tidak diprediksi, jadi selalu pantau pengumuman resmi.",
  },
  {
    q: "Dari mana sumber datanya?",
    a: "Data dirangkum dari sumber publik seperti IDX, KSEI, situs hubungan investor perusahaan, dan media keuangan. Verifikasi ke sumber resmi sebelum mengambil keputusan.",
  },
  {
    q: "Apa beda cum date dan ex date?",
    a: "Cum date adalah hari terakhir membeli saham agar masih berhak dividen. Ex date adalah hari pertama saham diperdagangkan tanpa hak dividen, biasanya satu hari bursa setelahnya.",
  },
  {
    q: "Apakah ini saran investasi?",
    a: "Bukan. Seluruh data dan analitik di situs ini hanya untuk informasi dan edukasi.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Panduan" }]} />

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

      {/* FAQ */}
      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-fg">Pertanyaan umum</h2>
        <Card className="divide-y divide-line p-0">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-4 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-fg">
                {f.q}
                <span className="text-faint transition group-open:rotate-180" aria-hidden="true">
                  &#9662;
                </span>
              </summary>
              <p className="mt-2 text-sm text-muted">{f.a}</p>
            </details>
          ))}
        </Card>
      </section>

      {/* jelajah lebih lanjut */}
      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-fg">Jelajah lebih lanjut</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/sektor"
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-muted transition hover:border-brand/40 hover:text-fg"
          >
            Sektor saham
          </Link>
          <Link
            href="/leaderboard"
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-muted transition hover:border-brand/40 hover:text-fg"
          >
            Leaderboard
          </Link>
          <Link
            href="/istilah"
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-muted transition hover:border-brand/40 hover:text-fg"
          >
            Istilah &amp; glosarium
          </Link>
        </div>
      </section>

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
