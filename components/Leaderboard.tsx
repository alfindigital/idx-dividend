import Link from "next/link";
import { Card, CardLabel } from "@/components/ui/Card";

export interface LeaderItem {
  ticker: string;
  nama: string;
  value: string;
}

/**
 * Kartu peringkat (top-N) yang dapat dipakai ulang. Setiap baris menautkan ke
 * halaman emiten. Server component, nilai sudah diformat oleh pemanggil.
 */
export default function Leaderboard({
  title,
  hint,
  items,
}: {
  title: string;
  hint?: string;
  items: LeaderItem[];
}) {
  return (
    <Card className="p-4">
      <CardLabel>{title}</CardLabel>
      {hint ? <p className="mt-0.5 text-[11px] text-faint">{hint}</p> : null}
      <ol className="mt-3 space-y-1">
        {items.map((it, i) => (
          <li key={it.ticker}>
            <Link
              href={`/emiten/${it.ticker}`}
              className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 transition hover:bg-surface-2"
            >
              <span className="w-5 shrink-0 text-center font-display text-sm font-semibold tabular text-faint">
                {i + 1}
              </span>
              <span className="font-display font-bold text-brand-strong">{it.ticker}</span>
              <span className="min-w-0 flex-1 truncate text-xs text-muted">{it.nama}</span>
              <span className="shrink-0 text-sm font-semibold tabular text-fg">{it.value}</span>
            </Link>
          </li>
        ))}
      </ol>
    </Card>
  );
}
