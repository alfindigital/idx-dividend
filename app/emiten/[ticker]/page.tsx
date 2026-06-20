import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getEmiten, getDividends, allTickers, emitenList } from "@/lib/data";
import {
  annualTotals,
  timingConsistency,
  amountTrend,
  yearsPaid,
  predictNext,
  sortByDateDesc,
  ttmDividend,
  eventDate,
  dpsCagr,
  yieldStats,
  avgAnnualTotal,
  payingStreak,
  favoriteExMonth,
} from "@/lib/derive";
import ChartSwitcher from "@/components/ChartSwitcher";
import DividendTimeline from "@/components/DividendTimeline";
import LiveYield from "@/components/LiveYield";
import WatchlistButton from "@/components/WatchlistButton";
import DetailExportButtons from "@/components/DetailExportButtons";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { ConsistencyBadge, TrendBadge, FlagBadge } from "@/components/Badges";
import { Card, CardLabel } from "@/components/ui/Card";
import { CalendarDays, BarChart3, ArrowUpRight } from "@/components/ui/icons";
import { gcalUrl } from "@/lib/ics";
import { BULAN_ID, labelTipe, formatRupiah, formatPersen, formatTanggal } from "@/lib/format";

export const revalidate = 43200;
export const dynamicParams = false;

export function generateStaticParams() {
  return allTickers().map((ticker) => ({ ticker }));
}

export function generateMetadata({ params }: { params: { ticker: string } }): Metadata {
  const e = getEmiten(params.ticker);
  if (!e) return { title: "Emiten tidak ditemukan" };
  const divs = getDividends(e.ticker);
  const totals = annualTotals(divs);
  const la = totals.length ? totals[totals.length - 1] : null;
  const lastYield = sortByDateDesc(divs).find((d) => d.yield_pct != null)?.yield_pct ?? null;
  const title = `${e.ticker} — ${e.nama}`;
  const divTxt = la ? ` Dividen terakhir ${formatRupiah(la.total)}/lembar (${la.tahun}).` : "";
  const yieldTxt =
    lastYield != null
      ? ` Yield ~${lastYield.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%.`
      : "";
  const description = `Riwayat dividen, yield berjalan, konsistensi & perkiraan jadwal dividen ${e.ticker} (${e.nama}).${divTxt}${yieldTxt} Bukan saran investasi.`;
  const url = `/emiten/${e.ticker}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title: `${title} · Dividen IDX`, description },
    twitter: { card: "summary_large_image", title: `${title} · Dividen IDX`, description },
  };
}

function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Card className="p-3">
      <CardLabel>{label}</CardLabel>
      <div className="mt-1 text-sm font-semibold text-fg">{children}</div>
    </Card>
  );
}

function Metric({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  className?: string;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-faint">{label}</div>
      <div className={`mt-0.5 font-display text-base font-semibold tabular ${className ?? "text-fg"}`}>
        {value}
      </div>
      {sub ? <div className="text-[11px] text-muted">{sub}</div> : null}
    </div>
  );
}

export default function Page({ params }: { params: { ticker: string } }) {
  const emiten = getEmiten(params.ticker);
  if (!emiten) notFound();

  const divs = getDividends(emiten.ticker);
  const totals = annualTotals(divs);
  const timing = timingConsistency(divs);
  const trend = amountTrend(divs);
  const yp = yearsPaid(divs);
  const preds = predictNext(divs, emiten);
  const sorted = sortByDateDesc(divs);
  const lastYield = sorted.find((d) => d.yield_pct != null)?.yield_pct ?? null;
  const ttm = ttmDividend(divs);

  // seri yield historis (per tahun) untuk grafik DY
  const yieldByYear = new Map<number, number>();
  for (const d of divs) {
    if (d.yield_pct != null) yieldByYear.set(d.tahun, (yieldByYear.get(d.tahun) ?? 0) + d.yield_pct);
  }
  const yieldSeries = Array.from(yieldByYear.entries())
    .map(([tahun, y]) => ({ tahun, yield: Math.round(y * 100) / 100 }))
    .sort((a, b) => a.tahun - b.tahun);

  // analitik mendalam
  const cagr = dpsCagr(divs);
  const yStats = yieldStats(divs);
  const avgAnnual = avgAnnualTotal(divs);
  const streak = payingStreak(divs);
  const favMonth = favoriteExMonth(divs);

  // tampilkan kotak perkiraan (amber) hanya bila ada isinya
  const showPredBox = emiten.flags.dormant || preds.length > 0;

  // emiten serupa di sektor yang sama (untuk navigasi cepat)
  const similar = emitenList
    .filter((e) => e.sektor === emiten.sektor && e.ticker !== emiten.ticker)
    .slice(0, 4);

  // Event terdekat untuk tombol "Tambah ke Google Calendar":
  // utamakan event terumumkan yang belum lewat, jika tak ada pakai perkiraan terdekat.
  const todayIso = new Date().toISOString().slice(0, 10);
  const nextAnnounced = sorted
    .map((d) => ({ d, iso: eventDate(d) }))
    .filter((x) => x.iso != null && x.iso >= todayIso)
    .sort((a, b) => a.iso!.localeCompare(b.iso!))[0];
  let nextCal: { title: string; dateIso: string; details: string } | null = null;
  if (nextAnnounced) {
    const d = nextAnnounced.d;
    const t = labelTipe(d.tipe).toLowerCase();
    nextCal = {
      title: `${emiten.ticker} ex-dividen ${t}${d.dps_idr != null ? " " + formatRupiah(d.dps_idr) : ""}`,
      dateIso: nextAnnounced.iso!,
      details:
        `Dividen ${t} ${emiten.nama}.` +
        (d.cum_date ? ` Cum-date ${formatTanggal(d.cum_date)} (beli sebelum tanggal ini).` : "") +
        ` Lihat https://idx-dividend.vercel.app/emiten/${emiten.ticker}`,
    };
  } else if (!emiten.flags.dormant && preds.length > 0) {
    const p = preds[0];
    nextCal = {
      title: `${emiten.ticker} ex-dividen ${labelTipe(p.tipe).toLowerCase()} (perkiraan)`,
      dateIso: p.perkiraan,
      details: `Perkiraan ex-date berbasis pola historis (keyakinan ${p.confidence}). Bukan kepastian.`,
    };
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Breadcrumbs
        items={[
          { label: "Beranda", href: "/" },
          { label: emiten.sektor },
          { label: emiten.ticker },
        ]}
      />

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-fg">
            {emiten.ticker}
          </h1>
          <span className="text-muted">{emiten.nama}</span>
          <span className="ml-auto">
            <WatchlistButton ticker={emiten.ticker} withLabel />
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded bg-surface-2 px-2 py-0.5 text-muted">{emiten.sektor}</span>
          <FlagBadge dormant={emiten.flags.dormant} special={emiten.flags.special_history} />
          {emiten.pola_pembayaran && (
            <span className="text-muted">Pola: {emiten.pola_pembayaran}</span>
          )}
        </div>
      </header>

      {/* ringkasan */}
      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatCard label="Yield berjalan (TTM)">
          <LiveYield ticker={emiten.ticker} ttm={ttm} fallbackYield={lastYield} />
        </StatCard>
        <StatCard label="Konsistensi waktu">
          <ConsistencyBadge value={timing} />
        </StatCard>
        <StatCard label="Tren jumlah">
          <TrendBadge value={trend} />
        </StatCard>
        <StatCard label="Tahun membagikan (data)">{yp} tahun</StatCard>
      </section>

      {/* analisis mendalam */}
      <section>
        <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold text-fg">
          <BarChart3 size={18} className="text-brand" /> Analisis dividen
        </h2>
        <Card className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-5">
          <Metric
            label="Yield rata-rata"
            value={yStats ? formatPersen(yStats.avg) : "-"}
            sub={yStats ? `${formatPersen(yStats.min)} s/d ${formatPersen(yStats.max)}` : undefined}
          />
          <Metric
            label="Pertumbuhan DPS"
            value={cagr != null ? `${cagr >= 0 ? "+" : ""}${formatPersen(cagr)}/th` : "-"}
            className={
              cagr == null
                ? "text-fg"
                : cagr > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : cagr < 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-fg"
            }
            sub="CAGR antar tahun"
          />
          <Metric label="Rata-rata dividen/th" value={formatRupiah(avgAnnual)} sub="per lembar" />
          <Metric label="Beruntun membagikan" value={`${streak} tahun`} sub="terkini" />
          <Metric label="Bulan ex favorit" value={favMonth ?? "-"} sub="paling sering" />
        </Card>
      </section>

      {/* prediksi + ekspor berdampingan */}
      <section className="grid gap-3 lg:grid-cols-2">
        {showPredBox ? (
          <div className="rounded-xl border border-amber-300/50 bg-amber-50 p-3.5 dark:border-amber-400/25 dark:bg-amber-400/10">
            <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Perkiraan jadwal berikutnya
            </h2>
            {emiten.flags.dormant ? (
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-200/90">
                Emiten ini tidak membagikan dividen secara teratur belakangan ini (potensi rapel).
                Tidak ada prediksi tanggal, pantau pengumuman resmi.
              </p>
            ) : (
              <ul className="mt-1 space-y-1 text-sm text-amber-900 dark:text-amber-200/90">
                {preds.map((p, i) => {
                  const d = new Date(p.perkiraan);
                  return (
                    <li key={i}>
                      <strong className="capitalize">{p.tipe}</strong>: perkiraan ex-date sekitar{" "}
                      <strong>
                        {BULAN_ID[d.getMonth()]} {d.getFullYear()}
                      </strong>{" "}
                      <span className="text-amber-600 dark:text-amber-300/80">
                        (keyakinan {p.confidence})
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-300/70">
              Perkiraan pola historis; jumlah tidak diprediksi. Bukan saran investasi.
            </p>
          </div>
        ) : (
          <Card className="flex items-center p-3.5">
            <p className="text-xs text-muted">
              Belum ada perkiraan jadwal · data historis belum cukup untuk emiten ini.
            </p>
          </Card>
        )}

        {/* ekspor kalender */}
        <Card className="p-3.5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-fg">
            <CalendarDays size={16} className="text-brand" /> Ekspor ke kalender
          </h2>
          <p className="mt-1 text-xs text-muted">
            Tambah jadwal + pengingat 1 hari sebelum ex-date ke kalendermu.
          </p>
          <DetailExportButtons
            ticker={emiten.ticker}
            gcalHref={nextCal ? gcalUrl(nextCal) : null}
          />
        </Card>
      </section>

      {/* grafik */}
      <section>
        <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold text-fg">
          <BarChart3 size={18} className="text-brand" /> Grafik historis
        </h2>
        <Card className="p-4">
          <ChartSwitcher dps={totals} yieldData={yieldSeries} />
        </Card>
      </section>

      {/* timeline */}
      <section>
        <h2 className="mb-2 font-display text-lg font-semibold text-fg">Riwayat lengkap</h2>
        <DividendTimeline events={divs} />
      </section>

      {/* emiten serupa */}
      {similar.length >= 2 && (
        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-fg">Emiten serupa</h2>
          <p className="mb-3 text-sm text-muted">Emiten lain di sektor {emiten.sektor}.</p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {similar.map((e) => (
              <Link
                key={e.ticker}
                href={`/emiten/${e.ticker}`}
                className="group rounded-xl border border-line bg-surface p-3 shadow-card transition hover:border-brand/40 active:bg-surface-2"
              >
                <div className="flex items-center gap-1">
                  <span className="font-display font-bold text-brand-strong">{e.ticker}</span>
                  <ArrowUpRight
                    size={13}
                    className="text-brand opacity-0 transition group-hover:opacity-100"
                  />
                </div>
                <div className="mt-0.5 truncate text-xs text-muted">{e.nama}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
