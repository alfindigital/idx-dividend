import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { emitenList, dividendList, getDividends, getEmiten } from "@/lib/data";
import { eventDate, predictNext } from "@/lib/derive";
import { getDataMeta } from "@/lib/dataMeta";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { TipeBadge } from "@/components/Badges";
import { ChevronLeft, ChevronRight, CalendarDays } from "@/components/ui/icons";
import { BULAN_ID, formatTanggalSingkat, formatRupiah } from "@/lib/format";
import { parseISODate } from "@/lib/date";
import { SITE_URL } from "@/lib/site";

export const revalidate = 43200;
export const dynamicParams = false;

const pad = (n: number) => String(n).padStart(2, "0");

export function generateStaticParams() {
  const meta = getDataMeta();
  const min = meta.minYear ?? new Date().getFullYear();
  const max = (meta.maxYear ?? new Date().getFullYear()) + 1; // +1 untuk perkiraan
  const params: { year: string; month: string }[] = [];
  for (let y = min; y <= max; y++) {
    for (let m = 1; m <= 12; m++) params.push({ year: String(y), month: pad(m) });
  }
  return params;
}

function parseParams(params: { year: string; month: string }) {
  const year = Number(params.year);
  const month = Number(params.month); // 1-12
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return null;
  const meta = getDataMeta();
  const min = meta.minYear ?? year;
  const max = (meta.maxYear ?? year) + 1;
  if (year < min || year > max) return null;
  return { year, month };
}

interface MonthEvent {
  iso: string;
  ticker: string;
  nama: string;
  tipe: string;
  cum: string | null;
  dps: number | null;
  kind: "historis" | "prediksi";
}

function eventsForMonth(year: number, month: number): MonthEvent[] {
  const prefix = `${year}-${pad(month)}`;
  const out: MonthEvent[] = [];
  for (const d of dividendList) {
    const iso = eventDate(d);
    if (iso && iso.startsWith(prefix)) {
      out.push({
        iso,
        ticker: d.ticker,
        nama: getEmiten(d.ticker)?.nama ?? d.ticker,
        tipe: d.tipe,
        cum: d.cum_date,
        dps: d.dps_idr,
        kind: "historis",
      });
    }
  }
  for (const e of emitenList) {
    for (const p of predictNext(getDividends(e.ticker), e)) {
      if (p.perkiraan.startsWith(prefix)) {
        out.push({
          iso: p.perkiraan,
          ticker: e.ticker,
          nama: e.nama,
          tipe: p.tipe,
          cum: null,
          dps: null,
          kind: "prediksi",
        });
      }
    }
  }
  return out.sort((a, b) => a.iso.localeCompare(b.iso) || a.ticker.localeCompare(b.ticker));
}

export function generateMetadata({ params }: { params: { year: string; month: string } }): Metadata {
  const p = parseParams(params);
  if (!p) return { title: "Kalender tidak ditemukan" };
  const label = `${BULAN_ID[p.month - 1]} ${p.year}`;
  const title = `Kalender Dividen ${label}`;
  const n = eventsForMonth(p.year, p.month).length;
  const description = `Jadwal ex-dividend & cum-date saham IDX pada ${label}: ${n} event/perkiraan. Tanggal historis dan perkiraan jadwal dividen. Bukan saran investasi.`;
  const url = `/kalender/${p.year}/${pad(p.month)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: `${title} · Dividen IDX`, description },
    twitter: { card: "summary_large_image", title: `${title} · Dividen IDX`, description },
  };
}

export default function Page({ params }: { params: { year: string; month: string } }) {
  const p = parseParams(params);
  if (!p) notFound();
  const { year, month } = p;
  const label = `${BULAN_ID[month - 1]} ${year}`;
  const events = eventsForMonth(year, month);

  const meta = getDataMeta();
  const min = meta.minYear ?? year;
  const max = (meta.maxYear ?? year) + 1;
  const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };
  const hasPrev = prev.y >= min;
  const hasNext = next.y <= max;

  const historis = events.filter((e) => e.kind === "historis");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Kalender dividen ${label}`,
    numberOfItems: historis.length,
    itemListElement: historis.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${e.ticker} ex-dividen ${e.tipe} ${formatTanggalSingkat(e.iso)}`,
      url: `${SITE_URL}/emiten/${e.ticker}`,
    })),
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs
        items={[
          { label: "Beranda", href: "/" },
          { label: "Kalender", href: "/kalender" },
          { label: label },
        ]}
      />

      <header className="space-y-2">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-fg">
          <CalendarDays size={22} className="text-brand" /> Kalender dividen {label}
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          {events.length > 0
            ? `${historis.length} event tercatat${events.length - historis.length > 0 ? ` + ${events.length - historis.length} perkiraan` : ""} pada ${label}. Acuan tanggal = ex-date (beli sebelum cum-date agar dapat dividen).`
            : `Belum ada event ex-dividend tercatat untuk ${label}.`}
        </p>
      </header>

      <div className="flex items-center justify-between text-sm">
        {hasPrev ? (
          <Link
            href={`/kalender/${prev.y}/${pad(prev.m)}`}
            className="inline-flex items-center gap-1 text-brand hover:underline"
          >
            <ChevronLeft size={16} /> {BULAN_ID[prev.m - 1]} {prev.y}
          </Link>
        ) : (
          <span />
        )}
        <Link href="/kalender" className="text-xs text-muted hover:text-fg">
          Tampilan kalender penuh
        </Link>
        {hasNext ? (
          <Link
            href={`/kalender/${next.y}/${pad(next.m)}`}
            className="inline-flex items-center gap-1 text-brand hover:underline"
          >
            {BULAN_ID[next.m - 1]} {next.y} <ChevronRight size={16} />
          </Link>
        ) : (
          <span />
        )}
      </div>

      {events.length > 0 ? (
        <ul className="space-y-2">
          {events.map((e, i) => (
            <li key={`${e.ticker}-${e.iso}-${e.tipe}-${i}`}>
              <Link
                href={`/emiten/${e.ticker}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3 shadow-card transition hover:border-brand/40"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-brand-strong">{e.ticker}</span>
                    <TipeBadge tipe={e.tipe} />
                    {e.kind === "prediksi" && (
                      <span className="rounded border border-dashed border-violet-400 px-1 text-[10px] text-violet-500">
                        perkiraan
                      </span>
                    )}
                  </div>
                  <div className="truncate text-xs text-muted">{e.nama}</div>
                </div>
                <div className="shrink-0 text-right text-sm">
                  <div className="font-medium text-fg">{formatTanggalSingkat(e.iso)}</div>
                  <div className="text-[11px] text-faint">
                    {e.dps != null ? `${formatRupiah(e.dps)}/lbr` : "ex-date"}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-line py-10 text-center text-sm text-faint">
          Tidak ada event dividen di {label}.
        </div>
      )}
    </div>
  );
}
