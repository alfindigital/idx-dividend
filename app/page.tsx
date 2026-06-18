import EmitenTable, { DashboardRow } from "@/components/EmitenTable";
import Disclaimer from "@/components/Disclaimer";
import DashboardGuide from "@/components/DashboardGuide";
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
      <section className="rounded-2xl border border-line bg-surface bg-gradient-to-br from-brand/10 to-accent/10 p-5 shadow-card sm:p-6">
        <h1 className="text-2xl font-bold text-fg sm:text-[28px]">
          History &amp; Kalender Dividen Saham IDX
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Riwayat dividen ~5 tahun terakhir untuk emiten IDX berdividen besar, lengkap dengan
          skor konsistensi waktu &amp; jumlah, yield berjalan (harga terkini), dan perkiraan kapan
          dividen berikutnya kemungkinan dibagikan. Klik kode emiten untuk detail, atau buka{" "}
          <a href="/kalender" className="font-medium text-brand hover:underline">
            tampilan kalender
          </a>
          .
        </p>
      </section>

      <Disclaimer />

      <DashboardGuide />

      <EmitenTable rows={rows} />
    </div>
  );
}
