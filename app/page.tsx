import EmitenTable, { DashboardRow } from "@/components/EmitenTable";
import StatsBar, { DashboardStats } from "@/components/StatsBar";
import UpcomingDividends, { UpcomingItem } from "@/components/UpcomingDividends";
import DataFreshness from "@/components/DataFreshness";
import { emitenList, dividendList, getDividends, getEmiten } from "@/lib/data";
import {
  latestAnnual,
  annualTotals,
  ttmDividend,
  timingConsistency,
  amountTrend,
  yearsPaid,
  predictNext,
  sortByDateDesc,
  eventDate,
} from "@/lib/derive";
import { todayISO } from "@/lib/date";

export const revalidate = 43200; // recompute prediksi ~12 jam sekali

export default function Page() {
  const rows: DashboardRow[] = emitenList.map((e) => {
    const divs = getDividends(e.ticker);
    const la = latestAnnual(divs);
    const sorted = sortByDateDesc(divs);
    const lastEvent = sorted[0];
    const lastYield = sorted.find((d) => d.yield_pct != null)?.yield_pct ?? null;
    const preds = predictNext(divs, e);
    const nextPred = preds[0] ?? null;
    return {
      ticker: e.ticker,
      nama: e.nama,
      sektor: e.sektor,
      dormant: e.flags.dormant,
      special: e.flags.special_history,
      lastYear: la?.tahun ?? null,
      lastAnnualTotal: la?.total ?? null,
      ttm: ttmDividend(divs),
      lastYieldPct: lastYield,
      timing: timingConsistency(divs),
      trend: amountTrend(divs),
      yearsPaid: yearsPaid(divs),
      lastExDate: lastEvent ? eventDate(lastEvent) : null,
      nextPredDate: nextPred?.perkiraan ?? null,
      nextPredLabel: nextPred?.bulanLabel ?? null,
      dpsSeries: annualTotals(divs).map((a) => a.total),
    };
  });

  // statistik ringkas untuk baris di atas tabel
  const todayIso = todayISO();
  const cap = new Date();
  cap.setDate(cap.getDate() + 60);
  const capIso = cap.toISOString().slice(0, 10);

  let nextEx: { ticker: string; date: string } | null = null;
  for (const d of dividendList) {
    const iso = eventDate(d);
    if (iso && iso >= todayIso && (!nextEx || iso < nextEx.date)) {
      nextEx = { ticker: d.ticker, date: iso };
    }
  }

  // feed "akan ex-dividend": event resmi yang belum lewat, urut terdekat
  const upcoming: UpcomingItem[] = dividendList
    .map((d) => ({ d, iso: eventDate(d) }))
    .filter((x) => x.iso != null && x.iso >= todayIso)
    .sort((a, b) => a.iso!.localeCompare(b.iso!))
    .slice(0, 12)
    .map(({ d }) => ({
      ticker: d.ticker,
      nama: getEmiten(d.ticker)?.nama ?? d.ticker,
      tipe: d.tipe,
      tahun: d.tahun,
      cumDate: d.cum_date,
      exDate: d.ex_date ?? d.cum_date ?? d.payment_date,
      dps: d.dps_idr,
    }));

  const stats: DashboardStats = {
    emiten: rows.length,
    events: dividendList.length,
    teratur: rows.filter((r) => r.timing === "Sangat teratur" || r.timing === "Cukup teratur").length,
    nextEx,
    pred60: rows.filter((r) => r.nextPredDate && r.nextPredDate >= todayIso && r.nextPredDate <= capIso)
      .length,
  };

  return (
    <div className="space-y-6">
      {/* hero — value-prop terlihat (sebelumnya hanya sr-only) */}
      <section className="hero-glow space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand-strong">
            {stats.emiten} emiten · {stats.events} event dividen
          </span>
          <DataFreshness />
        </div>
        <h1 className="max-w-3xl font-display text-2xl font-bold leading-tight tracking-tight text-fg sm:text-3xl">
          Riwayat, yield & kalender dividen saham IDX dalam satu tempat
        </h1>
        <p className="max-w-2xl text-sm text-muted sm:text-base">
          Pantau <strong className="font-semibold text-fg">yield berjalan</strong> dari harga terkini,
          nilai <strong className="font-semibold text-fg">konsistensi & tren</strong> tiap emiten, dan
          lihat <strong className="font-semibold text-fg">perkiraan jadwal</strong> dividen berikutnya —
          gratis, tanpa daftar. Bukan saran investasi.
        </p>
      </section>

      <UpcomingDividends items={upcoming} />

      <StatsBar stats={stats} />
      <EmitenTable rows={rows} />
    </div>
  );
}
