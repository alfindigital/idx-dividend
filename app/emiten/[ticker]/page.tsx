import { notFound } from "next/navigation";
import Link from "next/link";
import { getEmiten, getDividends, allTickers } from "@/lib/data";
import {
  annualTotals,
  timingConsistency,
  amountTrend,
  yearsPaid,
  predictNext,
  sortByDateDesc,
  ttmDividend,
  eventDate,
} from "@/lib/derive";
import DividendChart from "@/components/DividendChart";
import DividendTimeline from "@/components/DividendTimeline";
import LiveYield from "@/components/LiveYield";
import { ConsistencyBadge, TrendBadge, FlagBadge } from "@/components/Badges";
import { Card, CardLabel } from "@/components/ui/Card";
import {
  ArrowLeft,
  Download,
  CalendarPlus,
  CalendarDays,
  BarChart3,
} from "@/components/ui/icons";
import { gcalUrl } from "@/lib/ics";
import { BULAN_ID, labelTipe, formatRupiah, formatTanggal } from "@/lib/format";

export const revalidate = 43200;
export const dynamicParams = false;

export function generateStaticParams() {
  return allTickers().map((ticker) => ({ ticker }));
}

function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Card className="p-3">
      <CardLabel>{label}</CardLabel>
      <div className="mt-1 text-sm font-semibold text-fg">{children}</div>
    </Card>
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
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
        >
          <ArrowLeft size={15} /> Kembali ke daftar
        </Link>
      </div>

      <header className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-fg">
            {emiten.ticker}
          </h1>
          <span className="text-muted">{emiten.nama}</span>
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

      {/* prediksi + ekspor berdampingan */}
      <section className="grid gap-3 lg:grid-cols-2">
      <div className="rounded-xl border border-amber-300/50 bg-amber-50 p-3.5 dark:border-amber-400/25 dark:bg-amber-400/10">
        <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          Perkiraan jadwal berikutnya
        </h2>
        {emiten.flags.dormant ? (
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-200/90">
            Emiten ini tidak membagikan dividen secara teratur belakangan ini (potensi rapel).
            Tidak ada prediksi tanggal, pantau pengumuman resmi.
          </p>
        ) : preds.length === 0 ? (
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-200/90">
            Data belum cukup untuk membuat perkiraan.
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

      {/* ekspor kalender */}
      <Card className="p-3.5">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-fg">
          <CalendarDays size={16} className="text-brand" /> Ekspor ke kalender
        </h2>
        <p className="mt-1 text-xs text-muted">
          Tambah jadwal + pengingat 1 hari sebelum ex-date ke kalendermu.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {nextCal && (
            <a
              href={gcalUrl(nextCal)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-glow transition hover:bg-indigo-500"
            >
              <CalendarPlus size={15} /> Tambah ke Google Calendar
            </a>
          )}
          <a
            href={`/api/ics?ticker=${emiten.ticker}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-medium text-fg transition hover:border-brand/40 hover:bg-surface-2"
          >
            <Download size={15} /> Unduh .ics
          </a>
        </div>
      </Card>
      </section>

      {/* grafik */}
      <section>
        <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold text-fg">
          <BarChart3 size={18} className="text-brand" /> Dividen per lembar per tahun (Rp)
        </h2>
        <Card className="p-4">
          <DividendChart data={totals} />
        </Card>
      </section>

      {/* timeline */}
      <section>
        <h2 className="mb-2 font-display text-lg font-semibold text-fg">Riwayat lengkap</h2>
        <DividendTimeline events={divs} />
      </section>
    </div>
  );
}
