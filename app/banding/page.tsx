import type { Metadata } from "next";
import Link from "next/link";
import { emitenList, getDividends } from "@/lib/data";
import {
  annualTotals,
  latestAnnual,
  ttmDividend,
  timingConsistency,
  amountTrend,
  yearsPaid,
  dpsCagr,
  payingStreak,
  favoriteExMonth,
  sortByDateDesc,
} from "@/lib/derive";
import CompareView, { CompareEmiten } from "@/components/CompareView";
import { ArrowLeft } from "@/components/ui/icons";

export const revalidate = 43200;

export const metadata: Metadata = {
  title: "Bandingkan Emiten · Dividen IDX",
  description: "Bandingkan yield, konsistensi, tren, dan riwayat dividen beberapa emiten IDX.",
};

export default function Page() {
  const all: CompareEmiten[] = emitenList.map((e) => {
    const divs = getDividends(e.ticker);
    const la = latestAnnual(divs);
    const sorted = sortByDateDesc(divs);
    const lastYield = sorted.find((d) => d.yield_pct != null)?.yield_pct ?? null;
    return {
      ticker: e.ticker,
      nama: e.nama,
      sektor: e.sektor,
      ttm: ttmDividend(divs),
      lastYield,
      lastAnnualTotal: la?.total ?? null,
      lastYear: la?.tahun ?? null,
      cagr: dpsCagr(divs),
      timing: timingConsistency(divs),
      trend: amountTrend(divs),
      streak: payingStreak(divs),
      favMonth: favoriteExMonth(divs),
      yearsPaid: yearsPaid(divs),
      dpsSeries: annualTotals(divs),
    };
  });

  return (
    <div className="space-y-4">
      <div>
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
          <ArrowLeft size={15} /> Kembali ke daftar
        </Link>
      </div>
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Bandingkan emiten</h1>
        <p className="max-w-2xl text-sm text-muted">
          Pilih hingga 4 emiten untuk membandingkan yield, konsistensi, tren, dan riwayat dividen
          berdampingan. Tautan bisa dibagikan (emiten tersimpan di URL).
        </p>
      </header>
      <CompareView all={all} />
    </div>
  );
}
