import type { DividendEvent } from "@/lib/types";
import { formatTanggal, formatRupiah, formatPersen } from "@/lib/format";
import { sortByDateDesc } from "@/lib/derive";
import { TipeBadge, ConfidenceBadge } from "./Badges";

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "sumber";
  }
}

export default function DividendTimeline({ events }: { events: DividendEvent[] }) {
  const sorted = sortByDateDesc(events);
  if (!sorted.length) {
    return <p className="text-sm text-slate-400">Belum ada riwayat dividen.</p>;
  }
  return (
    <ol className="space-y-3">
      {sorted.map((e, i) => (
        <li key={i} className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex flex-wrap items-center gap-2">
            <TipeBadge tipe={e.tipe} />
            <span className="font-semibold text-slate-800">{e.tahun}</span>
            <span className="ml-auto text-right">
              <span className="text-lg font-bold text-brand-dark">{formatRupiah(e.dps_idr)}</span>
              <span className="text-xs text-slate-400"> / lembar</span>
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600 sm:grid-cols-4">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-slate-400">Cum date</div>
              {formatTanggal(e.cum_date)}
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-slate-400">Ex date</div>
              {formatTanggal(e.ex_date)}
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-slate-400">Pembayaran</div>
              {formatTanggal(e.payment_date)}
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-slate-400">Yield</div>
              {formatPersen(e.yield_pct)}
            </div>
          </div>
          {(e.notes || (e.sumber_url && e.sumber_url.length > 0)) && (
            <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2">
              <ConfidenceBadge value={e.confidence} />
              {e.sumber_url?.slice(0, 4).map((u, j) => (
                <a
                  key={j}
                  href={u}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand hover:underline"
                >
                  🔗 {hostname(u)}
                </a>
              ))}
            </div>
          )}
          {e.notes && <p className="mt-1 text-xs text-slate-400">{e.notes}</p>}
        </li>
      ))}
    </ol>
  );
}
