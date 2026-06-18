import EmitenTable, { DashboardRow } from "@/components/EmitenTable";
import StatsBar, { DashboardStats } from "@/components/StatsBar";
import { emitenList, dividendList, getDividends } from "@/lib/data";
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

  // statistik ringkas untuk baris di atas tabel
  const todayIso = new Date().toISOString().slice(0, 10);
  const cap = new Date();
  cap.setDate(cap.getDate() + 60);
  const capIso = cap.toISOString().slice(0, 10);

  let topYield: { ticker: string; pct: number } | null = null;
  for (const r of rows) {
    if (r.lastYieldPct != null && (!topYield || r.lastYieldPct > topYield.pct)) {
      topYield = { ticker: r.ticker, pct: r.lastYieldPct };
    }
  }

  let nextEx: { ticker: string; date: string } | null = null;
  for (const d of dividendList) {
    const iso = eventDate(d);
    if (iso && iso >= todayIso && (!nextEx || iso < nextEx.date)) {
      nextEx = { ticker: d.ticker, date: iso };
    }
  }

  const stats: DashboardStats = {
    emiten: rows.length,
    events: dividendList.length,
    teratur: rows.filter((r) => r.timing === "Sangat teratur" || r.timing === "Cukup teratur").length,
    topYield,
    nextEx,
    pred60: rows.filter((r) => r.nextPredDate && r.nextPredDate >= todayIso && r.nextPredDate <= capIso)
      .length,
  };

  return (
    <div className="space-y-4">
      <h1 className="sr-only">Data dividen saham IDX: history, yield, dan jadwal</h1>
      <StatsBar stats={stats} />
      <EmitenTable rows={rows} />
    </div>
  );
}
