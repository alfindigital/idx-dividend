import { getDataMeta, formatShortID } from "@/lib/dataMeta";
import { CalendarDays } from "./ui/icons";

/**
 * Badge transparansi kesegaran data. Menampilkan tanggal kurasi terakhir &
 * cakupan tahun. Penting untuk kepercayaan di situs dividen.
 */
export default function DataFreshness({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const meta = getDataMeta();
  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] text-faint ${className}`}>
        <CalendarDays size={12} />
        Data diperbarui {formatShortID(meta.updated)}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] text-muted ${className}`}
      title={`Data dividen mencakup ${meta.minYear}–${meta.maxYear}. Harga & yield berjalan diambil terpisah secara live.`}
    >
      <span className="inline-flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
        Data diperbarui <strong className="font-semibold text-fg">{formatShortID(meta.updated)}</strong>
      </span>
      <span aria-hidden="true" className="text-faint">
        ·
      </span>
      <span>
        cakupan {meta.minYear}–{meta.maxYear}
      </span>
    </span>
  );
}
