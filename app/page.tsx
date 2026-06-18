import EmitenTable, { DashboardRow } from "@/components/EmitenTable";
import { emitenList, getDividends } from "@/lib/data";
import {
  latestAnnual,
  ttmDividend,
  timingConsistency,
  amountTrend,
  yearsPaid,
  predictNext,
  sortByDateDesc,
  eventDate,
} from "@/lib/derive";

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
    };
  });

  return (
    <div className="space-y-5">
      <section className="hero-glow pt-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
          Data Dividen IDX
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold leading-[1.1] tracking-tight text-fg sm:text-[2.6rem]">
          Lacak history &amp; jadwal dividen saham IDX
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">
          Riwayat ~5 tahun, skor konsistensi &amp; tren jumlah, yield berjalan dari harga terkini,
          dan perkiraan kapan dividen berikutnya kemungkinan dibagikan.
        </p>
      </section>

      <EmitenTable rows={rows} />
    </div>
  );
}
