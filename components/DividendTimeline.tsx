import type { DividendEvent } from "@/lib/types";
import { formatTanggal, formatRupiah, formatPersen } from "@/lib/format";
import { sortByDateDesc } from "@/lib/derive";
import { TipeBadge, ConfidenceBadge } from "./Badges";
import { ExternalLink } from "./ui/icons";

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
    return <p className="text-sm text-faint">Belum ada riwayat dividen.</p>;
  }

  // kelompokkan per tahun (urut menurun), simpan total DPS per tahun
  const groups: { tahun: number; total: number; events: DividendEvent[] }[] = [];
  for (const e of sorted) {
    let g = groups.find((x) => x.tahun === e.tahun);
    if (!g) {
      g = { tahun: e.tahun, total: 0, events: [] };
      groups.push(g);
    }
    g.events.push(e);
    if (e.dps_idr != null) g.total += e.dps_idr;
  }

  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <div key={g.tahun}>
          <div className="mb-2 flex items-baseline justify-between border-b border-line pb-1">
            <span className="font-display text-sm font-semibold tracking-wide text-fg">
              {g.tahun}
            </span>
            <span className="text-xs text-faint">
              total{" "}
              <span className="tabular font-semibold text-muted">{formatRupiah(g.total)}</span> /
              lembar
            </span>
          </div>
          <ol className="space-y-3">
            {g.events.map((e, i) => (
              <li key={i} className="rounded-xl border border-line bg-surface p-3 shadow-card">
                <div className="flex flex-wrap items-center gap-2">
                  <TipeBadge tipe={e.tipe} />
                  {e.confidence && <ConfidenceBadge value={e.confidence} />}
                  <span className="ml-auto text-right">
                    <span className="font-display tabular text-lg font-bold text-brand-strong">
                      {formatRupiah(e.dps_idr)}
                    </span>
                    <span className="text-xs text-faint"> / lembar</span>
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted sm:grid-cols-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-faint">
                      Cum date <span className="normal-case text-amber-600 dark:text-amber-400">· beli sebelum</span>
                    </div>
                    <span className="font-medium text-fg">{formatTanggal(e.cum_date)}</span>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-faint">Ex date</div>
                    {formatTanggal(e.ex_date)}
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-faint">Pembayaran</div>
                    {formatTanggal(e.payment_date)}
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-faint">Yield</div>
                    <span className="tabular">{formatPersen(e.yield_pct)}</span>
                  </div>
                </div>
                {e.sumber_url && e.sumber_url.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-line pt-2">
                    {e.sumber_url.slice(0, 4).map((u, j) => (
                      <a
                        key={j}
                        href={u}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
                      >
                        <ExternalLink size={12} /> {hostname(u)}
                      </a>
                    ))}
                  </div>
                )}
                {e.notes && <p className="mt-1 text-xs text-faint">{e.notes}</p>}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
