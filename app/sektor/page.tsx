import type { Metadata } from "next";
import Link from "next/link";
import { allSectors } from "@/lib/data";
import { sektorSlug, sektorEmiten } from "@/lib/slug";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Layers, ArrowUpRight } from "@/components/ui/icons";

export const revalidate = 43200;

const DESC =
  "Jelajahi emiten berdividen di Bursa Efek Indonesia per sektor: batu bara, perbankan, telekomunikasi, konsumer, dan lainnya. Lihat jumlah emiten serta riwayat dividen tiap sektor.";

export const metadata: Metadata = {
  title: "Sektor Saham Dividen IDX",
  description: DESC,
  alternates: { canonical: "/sektor" },
  openGraph: {
    type: "website",
    url: "/sektor",
    title: "Sektor Saham Dividen IDX · Dividen IDX",
    description: DESC,
  },
  twitter: { card: "summary_large_image", title: "Sektor Saham Dividen IDX · Dividen IDX", description: DESC },
};

export default function Page() {
  const sektors = allSectors()
    .map((sektor) => ({ sektor, slug: sektorSlug(sektor), emiten: sektorEmiten(sektor) }))
    .sort((a, b) => b.emiten.length - a.emiten.length || a.sektor.localeCompare(b.sektor));

  const totalEmiten = sektors.reduce((n, s) => n + s.emiten.length, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Sektor" }]} />

      <header className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight text-fg">
          Sektor saham dividen
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          {sektors.length} sektor, {totalEmiten} emiten berdividen. Pilih sektor untuk melihat
          daftar emiten beserta yield tercatat, konsistensi, dan riwayat dividennya.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {sektors.map(({ sektor, slug, emiten }) => (
          <Link
            key={slug}
            href={`/sektor/${slug}`}
            className="group flex flex-col rounded-xl border border-line bg-surface p-3.5 shadow-card transition hover:border-brand/40 active:bg-surface-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Layers size={16} className="text-brand" />
                <span className="font-display font-semibold text-fg">{sektor}</span>
              </div>
              <ArrowUpRight
                size={14}
                className="mt-0.5 shrink-0 text-brand opacity-0 transition group-hover:opacity-100"
              />
            </div>
            <div className="mt-0.5 text-xs text-muted">{emiten.length} emiten</div>
            <div className="mt-2.5 flex flex-wrap gap-1">
              {emiten.slice(0, 6).map((e) => (
                <span
                  key={e.ticker}
                  className="rounded bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-muted"
                >
                  {e.ticker}
                </span>
              ))}
              {emiten.length > 6 && (
                <span className="px-1 py-0.5 text-[11px] text-faint">+{emiten.length - 6}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
