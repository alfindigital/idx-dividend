import type { Metadata } from "next";
import Link from "next/link";
import { emitenList, getDividends } from "@/lib/data";
import {
  latestAnnual,
  timingConsistency,
  payingStreak,
  dpsCagr,
  sortByDateDesc,
} from "@/lib/derive";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Leaderboard, { type LeaderItem } from "@/components/Leaderboard";
import { Trophy } from "@/components/ui/icons";
import { formatPersen, formatRupiah } from "@/lib/format";

export const revalidate = 43200;

const N = 8;

const DESC =
  "Peringkat emiten dividen IDX: yield tercatat tertinggi, beruntun membagikan terpanjang, pertumbuhan DPS tercepat, dividen terakhir terbesar, dan paling konsisten. Bukan saran investasi.";

export const metadata: Metadata = {
  title: "Leaderboard Dividen IDX",
  description: DESC,
  alternates: { canonical: "/leaderboard" },
  openGraph: {
    type: "website",
    url: "/leaderboard",
    title: "Leaderboard Dividen IDX · Dividen IDX",
    description: DESC,
  },
  twitter: { card: "summary_large_image", title: "Leaderboard Dividen IDX · Dividen IDX", description: DESC },
};

const TIMING_RANK: Record<string, number> = { "Sangat teratur": 2, "Cukup teratur": 1 };

export default function Page() {
  const data = emitenList.map((e) => {
    const divs = getDividends(e.ticker);
    const sorted = sortByDateDesc(divs);
    const lastYield = sorted.find((d) => d.yield_pct != null)?.yield_pct ?? null;
    return {
      e,
      lastYield,
      timing: timingConsistency(divs),
      streak: payingStreak(divs),
      cagr: dpsCagr(divs),
      la: latestAnnual(divs),
    };
  });

  const topYield: LeaderItem[] = [...data]
    .filter((d) => d.lastYield != null)
    .sort((a, b) => (b.lastYield ?? 0) - (a.lastYield ?? 0))
    .slice(0, N)
    .map((d) => ({ ticker: d.e.ticker, nama: d.e.nama, value: formatPersen(d.lastYield) }));

  const topStreak: LeaderItem[] = [...data]
    .filter((d) => d.streak > 0)
    .sort((a, b) => b.streak - a.streak || (b.lastYield ?? -1) - (a.lastYield ?? -1))
    .slice(0, N)
    .map((d) => ({ ticker: d.e.ticker, nama: d.e.nama, value: `${d.streak} th` }));

  const topCagr: LeaderItem[] = [...data]
    .filter((d) => d.cagr != null)
    .sort((a, b) => (b.cagr ?? 0) - (a.cagr ?? 0))
    .slice(0, N)
    .map((d) => ({
      ticker: d.e.ticker,
      nama: d.e.nama,
      value: `${(d.cagr ?? 0) >= 0 ? "+" : ""}${formatPersen(d.cagr)}/th`,
    }));

  const topLast: LeaderItem[] = [...data]
    .filter((d) => d.la != null)
    .sort((a, b) => (b.la?.total ?? 0) - (a.la?.total ?? 0))
    .slice(0, N)
    .map((d) => ({ ticker: d.e.ticker, nama: d.e.nama, value: formatRupiah(d.la?.total) }));

  const topConsistent: LeaderItem[] = [...data]
    .filter((d) => TIMING_RANK[d.timing])
    .sort(
      (a, b) =>
        (TIMING_RANK[b.timing] ?? 0) - (TIMING_RANK[a.timing] ?? 0) ||
        b.streak - a.streak ||
        (b.cagr ?? -999) - (a.cagr ?? -999),
    )
    .slice(0, N)
    .map((d) => ({ ticker: d.e.ticker, nama: d.e.nama, value: d.timing }));

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Leaderboard" }]} />

      <header className="space-y-2">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-fg">
          <Trophy size={22} className="text-brand" /> Leaderboard dividen
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          Peringkat emiten berdasarkan data tercatat. Yield berjalan dari harga terkini dapat dilihat
          di{" "}
          <Link href="/" className="text-brand hover:underline">
            beranda
          </Link>{" "}
          dan tiap halaman emiten. Bukan saran investasi.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        <Leaderboard title="Yield tercatat tertinggi" hint="yield saat dividen dibagikan" items={topYield} />
        <Leaderboard title="Beruntun membagikan terpanjang" hint="tahun berturut-turut" items={topStreak} />
        <Leaderboard title="Pertumbuhan DPS tercepat" hint="CAGR total dividen per tahun" items={topCagr} />
        <Leaderboard title="Dividen terakhir terbesar" hint="total per lembar tahun terakhir" items={topLast} />
        <Leaderboard title="Paling konsisten waktunya" hint="kestabilan bulan ex-date" items={topConsistent} />
      </div>
    </div>
  );
}
