import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { BookOpen } from "@/components/ui/icons";
import { SITE_URL } from "@/lib/site";

export const revalidate = 86400;

const DESC =
  "Glosarium istilah dividen saham IDX: cum date, ex date, record date, DPS, yield berjalan (TTM), payout ratio, CAGR, dividen final, interim, dan spesial. Penjelasan ringkas dalam Bahasa Indonesia.";

export const metadata: Metadata = {
  title: "Istilah & Glosarium Dividen",
  description: DESC,
  alternates: { canonical: "/istilah" },
  openGraph: {
    type: "website",
    url: "/istilah",
    title: "Istilah & Glosarium Dividen · Dividen IDX",
    description: DESC,
  },
  twitter: { card: "summary_large_image", title: "Istilah & Glosarium Dividen · Dividen IDX", description: DESC },
};

interface Term {
  term: string;
  def: string;
}

const GROUPS: { judul: string; terms: Term[] }[] = [
  {
    judul: "Tanggal penting",
    terms: [
      {
        term: "Cum date",
        def: "Hari terakhir untuk membeli saham agar masih berhak menerima dividen yang diumumkan.",
      },
      {
        term: "Ex date",
        def: "Hari pertama saham diperdagangkan tanpa hak dividen, biasanya satu hari bursa setelah cum date.",
      },
      {
        term: "Recording date (record date)",
        def: "Tanggal pencatatan pemegang saham yang berhak atas dividen oleh KSEI.",
      },
      {
        term: "Payment date",
        def: "Tanggal dividen dibayarkan ke rekening pemegang saham yang berhak.",
      },
    ],
  },
  {
    judul: "Ukuran dividen",
    terms: [
      {
        term: "DPS (Dividen per Lembar)",
        def: "Besar dividen untuk setiap lembar saham, dinyatakan dalam Rupiah.",
      },
      {
        term: "Yield tercatat",
        def: "Yield pada saat dividen dibagikan, yaitu DPS dibagi harga acuan ketika itu.",
      },
      {
        term: "Yield berjalan (TTM)",
        def: "Total dividen 12 bulan terakhir dibagi harga saham terkini, sehingga berubah mengikuti harga pasar.",
      },
      {
        term: "TTM (Trailing Twelve Months)",
        def: "Akumulasi nilai selama 12 bulan terakhir, dipakai untuk menghitung yield berjalan.",
      },
      {
        term: "Payout ratio",
        def: "Porsi laba bersih perusahaan yang dibagikan sebagai dividen, dinyatakan dalam persen.",
      },
      {
        term: "CAGR DPS",
        def: "Laju pertumbuhan majemuk total dividen tahunan dari tahun pertama ke tahun terakhir data.",
      },
    ],
  },
  {
    judul: "Jenis dividen",
    terms: [
      {
        term: "Dividen final",
        def: "Dividen utama yang dibagikan setelah tutup buku tahunan dan disetujui dalam RUPS.",
      },
      {
        term: "Dividen interim",
        def: "Dividen yang dibagikan sebelum tutup buku tahunan, diambil dari laba berjalan.",
      },
      {
        term: "Dividen spesial",
        def: "Dividen tambahan di luar pola rutin, sering bersumber dari laba luar biasa atau aksi korporasi.",
      },
    ],
  },
  {
    judul: "Status & skor",
    terms: [
      {
        term: "Dorman",
        def: "Emiten yang berhenti membagikan dividen secara teratur belakangan ini, sehingga jadwalnya tidak diprediksi.",
      },
      {
        term: "Pernah spesial",
        def: "Penanda bahwa emiten pernah membagikan dividen spesial atau jumbo di masa lalu.",
      },
      {
        term: "Konsistensi waktu",
        def: "Seberapa stabil bulan ex-date dari tahun ke tahun. Semakin stabil, semakin mudah diperkirakan.",
      },
      {
        term: "Tren jumlah",
        def: "Arah perubahan total dividen tahunan: naik, stabil, atau turun.",
      },
      {
        term: "Beruntun membagikan",
        def: "Jumlah tahun berturut-turut emiten membagikan dividen, dihitung mundur dari tahun terakhir.",
      },
    ],
  },
];

export default function Page() {
  const allTerms = GROUPS.flatMap((g) => g.terms);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Istilah dividen saham IDX",
    url: `${SITE_URL}/istilah`,
    inLanguage: "id-ID",
    hasDefinedTerm: allTerms.map((t) => ({
      "@type": "DefinedTerm",
      name: t.term,
      description: t.def,
    })),
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Istilah" }]} />

      <header className="space-y-2">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-fg">
          <BookOpen size={22} className="text-brand" /> Istilah &amp; glosarium dividen
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          Penjelasan ringkas istilah yang dipakai di seluruh situs. Lihat juga{" "}
          <Link href="/panduan" className="text-brand hover:underline">
            panduan
          </Link>{" "}
          untuk cara membaca data.
        </p>
      </header>

      {GROUPS.map((g) => (
        <section key={g.judul} className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-fg">{g.judul}</h2>
          <Card className="p-4">
            <dl className="divide-y divide-line">
              {g.terms.map((t) => (
                <div key={t.term} className="py-2.5 first:pt-0 last:pb-0">
                  <dt className="text-sm font-semibold text-fg">{t.term}</dt>
                  <dd className="mt-0.5 text-sm text-muted">{t.def}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </section>
      ))}
    </div>
  );
}
