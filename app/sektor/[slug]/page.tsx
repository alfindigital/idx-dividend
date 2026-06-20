import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDividends } from "@/lib/data";
import { allSektorSlugs, sektorFromSlug, sektorEmiten, sektorSlug } from "@/lib/slug";
import {
  latestAnnual,
  timingConsistency,
  amountTrend,
  payingStreak,
  sortByDateDesc,
} from "@/lib/derive";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { ConsistencyBadge, TrendBadge, FlagIcons } from "@/components/Badges";
import { ArrowUpRight } from "@/components/ui/icons";
import { formatRupiah, formatPersen } from "@/lib/format";
import { SITE_URL } from "@/lib/site";

export const revalidate = 43200;
export const dynamicParams = false;

export function generateStaticParams() {
  return allSektorSlugs().map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const sektor = sektorFromSlug(params.slug);
  if (!sektor) return { title: "Sektor tidak ditemukan" };
  const n = sektorEmiten(sektor).length;
  const title = `Saham Dividen Sektor ${sektor}`;
  const description = `Daftar ${n} emiten IDX sektor ${sektor} beserta yield tercatat, konsistensi waktu, tren jumlah, dan beruntun membagikan dividen. Bukan saran investasi.`;
  const url = `/sektor/${params.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: `${title} · Dividen IDX`, description },
    twitter: { card: "summary_large_image", title: `${title} · Dividen IDX`, description },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const sektor = sektorFromSlug(params.slug);
  if (!sektor) notFound();

  const rows = sektorEmiten(sektor)
    .map((e) => {
      const divs = getDividends(e.ticker);
      const sorted = sortByDateDesc(divs);
      const lastYield = sorted.find((d) => d.yield_pct != null)?.yield_pct ?? null;
      return {
        e,
        lastYield,
        timing: timingConsistency(divs),
        trend: amountTrend(divs),
        streak: payingStreak(divs),
        la: latestAnnual(divs),
      };
    })
    .sort((a, b) => (b.lastYield ?? -1) - (a.lastYield ?? -1));

  const url = `${SITE_URL}/sektor/${params.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Sektor", item: `${SITE_URL}/sektor` },
        { "@type": "ListItem", position: 3, name: sektor, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Saham dividen sektor ${sektor}`,
      numberOfItems: rows.length,
      itemListElement: rows.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${r.e.ticker} - ${r.e.nama}`,
        url: `${SITE_URL}/emiten/${r.e.ticker}`,
      })),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: "Beranda", href: "/" },
          { label: "Sektor", href: "/sektor" },
          { label: sektor },
        ]}
      />

      <header className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight text-fg">
          Saham dividen sektor {sektor}
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          {rows.length} emiten. Diurutkan dari yield tercatat tertinggi. Yield berjalan dari harga
          terkini tersedia di tiap halaman emiten.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {rows.map(({ e, lastYield, timing, trend, streak, la }) => (
          <Link
            key={e.ticker}
            href={`/emiten/${e.ticker}`}
            className="group flex flex-col rounded-xl border border-line bg-surface p-3.5 shadow-card transition hover:border-brand/40 active:bg-surface-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-brand-strong">{e.ticker}</span>
                  <FlagIcons dormant={e.flags.dormant} special={e.flags.special_history} />
                  <ArrowUpRight
                    size={13}
                    className="text-brand opacity-0 transition group-hover:opacity-100"
                  />
                </div>
                <div className="mt-0.5 truncate text-xs text-muted">{e.nama}</div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-display text-base font-semibold tabular text-fg">
                  {formatPersen(lastYield)}
                </div>
                <div className="text-[11px] text-faint">yield tercatat</div>
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <ConsistencyBadge value={timing} />
              <TrendBadge value={trend} />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted">
              <span>
                Terakhir{" "}
                <span className="font-medium text-fg">{la ? formatRupiah(la.total) : "-"}</span>
                {la ? ` (${la.tahun})` : ""}
              </span>
              <span>
                Beruntun <span className="font-medium text-fg">{streak} th</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
