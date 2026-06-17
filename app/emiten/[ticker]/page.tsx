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
} from "@/lib/derive";
import DividendChart from "@/components/DividendChart";
import DividendTimeline from "@/components/DividendTimeline";
import LiveYield from "@/components/LiveYield";
import { ConsistencyBadge, TrendBadge, FlagBadge } from "@/components/Badges";
import { BULAN_ID } from "@/lib/format";

export const revalidate = 43200;
export const dynamicParams = false;

export function generateStaticParams() {
  return allTickers().map((ticker) => ({ ticker }));
}

function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-800">{children}</div>
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

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-brand hover:underline">
          ← Kembali ke daftar
        </Link>
      </div>

      <header className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="text-2xl font-bold text-slate-900">{emiten.ticker}</h1>
          <span className="text-slate-500">{emiten.nama}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {emiten.sektor}
          </span>
          <FlagBadge dormant={emiten.flags.dormant} special={emiten.flags.special_history} />
        </div>
        {emiten.pola_pembayaran && (
          <p className="text-sm text-slate-500">Pola: {emiten.pola_pembayaran}</p>
        )}
      </header>

      {/* ringkasan */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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

      {/* prediksi */}
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h2 className="text-sm font-semibold text-amber-900">Perkiraan jadwal berikutnya</h2>
        {emiten.flags.dormant ? (
          <p className="mt-1 text-sm text-amber-800">
            Emiten ini tidak membagikan dividen secara teratur belakangan ini (potensi rapel).
            Tidak ada prediksi tanggal — pantau pengumuman resmi.
          </p>
        ) : preds.length === 0 ? (
          <p className="mt-1 text-sm text-amber-800">Data belum cukup untuk membuat perkiraan.</p>
        ) : (
          <ul className="mt-1 space-y-1 text-sm text-amber-900">
            {preds.map((p, i) => {
              const d = new Date(p.perkiraan);
              return (
                <li key={i}>
                  <strong className="capitalize">{p.tipe}</strong>: perkiraan ex-date sekitar{" "}
                  <strong>
                    {BULAN_ID[d.getMonth()]} {d.getFullYear()}
                  </strong>{" "}
                  <span className="text-amber-600">(keyakinan {p.confidence})</span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-2 text-xs text-amber-600">
          Perkiraan berbasis pola historis. Jumlah dividen TIDAK diprediksi (tergantung kinerja &
          keputusan RUPS). Bukan saran investasi.
        </p>
      </section>

      {/* grafik */}
      <section>
        <h2 className="mb-2 text-lg font-semibold text-slate-800">
          Dividen per lembar per tahun (Rp)
        </h2>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <DividendChart data={totals} />
        </div>
      </section>

      {/* timeline */}
      <section>
        <h2 className="mb-2 text-lg font-semibold text-slate-800">Riwayat lengkap</h2>
        <DividendTimeline events={divs} />
      </section>

      {emiten.sumber && emiten.sumber.length > 0 && (
        <section className="text-xs text-slate-400">
          <span className="font-medium">Sumber emiten: </span>
          {emiten.sumber.map((u, i) => (
            <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline mr-2">
              🔗 sumber {i + 1}
            </a>
          ))}
        </section>
      )}
    </div>
  );
}
