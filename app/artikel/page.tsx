import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { ARTICLES } from "@/lib/articles";
import { BookOpen, ArrowUpRight } from "@/components/ui/icons";
import { formatTanggal } from "@/lib/format";

export const revalidate = 43200;

const DESC =
  "Panduan & artikel dividen saham IDX: cum-date vs ex-date, cara hitung yield, pajak dividen, dan memilih saham dividen konsisten.";

export const metadata: Metadata = {
  title: "Artikel Dividen",
  description: DESC,
  alternates: { canonical: "/artikel" },
  openGraph: { type: "website", url: "/artikel", title: "Artikel Dividen · Dividen IDX", description: DESC },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Artikel" }]} />
      <header className="space-y-2">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-fg">
          <BookOpen size={22} className="text-brand" /> Artikel dividen
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          Dasar-dasar dividen saham IDX, ditulis ringkas untuk investor ritel. Bukan saran investasi.
        </p>
      </header>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {ARTICLES.map((a) => (
          <Link
            key={a.slug}
            href={`/artikel/${a.slug}`}
            className="group flex flex-col rounded-xl border border-line bg-surface p-4 shadow-card transition hover:border-brand/40 active:bg-surface-2"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display font-semibold text-fg group-hover:text-brand-strong">
                {a.title}
              </h2>
              <ArrowUpRight
                size={15}
                className="shrink-0 text-brand opacity-0 transition group-hover:opacity-100"
              />
            </div>
            <p className="mt-1.5 text-sm text-muted">{a.description}</p>
            <div className="mt-3 text-[11px] text-faint">
              {formatTanggal(a.date)} · {a.readMin} menit baca
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
