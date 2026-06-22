import Link from "next/link";
import { TipeBadge } from "./Badges";
import { ArrowUpRight, CalendarDays } from "./ui/icons";
import { formatRupiah, formatTanggalSingkat } from "@/lib/format";
import { relativeLabel } from "@/lib/date";

export interface UpcomingItem {
  ticker: string;
  nama: string;
  tipe: string;
  tahun: number;
  cumDate: string | null;
  exDate: string | null;
  dps: number | null;
}

/**
 * Feed "Akan ex-dividend" — event yang SUDAH resmi diumumkan & belum lewat.
 * Menonjolkan cum-date (tanggal terakhir beli agar dapat dividen) karena itulah
 * tanggal yang actionable untuk investor.
 */
export default function UpcomingDividends({ items }: { items: UpcomingItem[] }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="upcoming-title" className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h2
          id="upcoming-title"
          className="flex items-center gap-2 font-display text-lg font-semibold text-fg"
        >
          <CalendarDays size={18} className="text-brand" /> Akan ex-dividend
        </h2>
        <Link href="/kalender" className="text-xs font-medium text-brand hover:underline">
          Lihat kalender →
        </Link>
      </div>
      <div className="-mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((it) => {
          const actDate = it.cumDate ?? it.exDate;
          const rel = actDate ? relativeLabel(actDate) : "";
          return (
            <Link
              key={`${it.ticker}-${it.tahun}-${it.tipe}-${it.exDate}`}
              href={`/emiten/${it.ticker}`}
              className="group min-w-[230px] shrink-0 snap-start rounded-xl border border-line bg-surface p-3 shadow-card transition hover:border-brand/40 active:bg-surface-2 sm:min-w-0"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 font-display font-bold text-brand-strong">
                  {it.ticker}
                  <ArrowUpRight
                    size={12}
                    className="text-brand opacity-0 transition group-hover:opacity-100"
                  />
                </span>
                <TipeBadge tipe={it.tipe} />
              </div>
              <div className="mt-0.5 truncate text-xs text-muted">{it.nama}</div>

              <div className="mt-2 rounded-lg bg-amber-50 px-2 py-1.5 dark:bg-amber-400/10">
                <div className="text-[10px] uppercase tracking-wide text-amber-700/80 dark:text-amber-300/80">
                  Beli sebelum (cum-date)
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-sm font-bold text-amber-900 dark:text-amber-200">
                    {formatTanggalSingkat(it.cumDate ?? it.exDate)}
                  </span>
                  {rel && (
                    <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
                      {rel}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-muted">
                  Ex <span className="text-fg">{formatTanggalSingkat(it.exDate)}</span>
                </span>
                <span className="tabular font-semibold text-fg">
                  {it.dps != null ? `${formatRupiah(it.dps)}/lbr` : "jumlah TBA"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
