import { parseDate, BULAN_ID_SINGKAT } from "@/lib/format";

export interface DashboardStats {
  emiten: number;
  events: number;
  teratur: number;
  nextEx: { ticker: string; date: string } | null;
  pred60: number;
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3 shadow-card transition hover:border-brand/40">
      <div className="text-[10.5px] font-medium uppercase tracking-wide text-faint">{label}</div>
      <div className="mt-1 font-display text-xl font-bold tabular leading-none text-brand-strong">
        {value}
      </div>
      {sub ? <div className="mt-1 truncate text-[11px] text-muted">{sub}</div> : null}
    </div>
  );
}

function shortDate(iso: string): string {
  const d = parseDate(iso);
  if (!d) return "-";
  return `${d.getDate()} ${BULAN_ID_SINGKAT[d.getMonth()]}`;
}

export default function StatsBar({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      <Stat label="Emiten dipantau" value={stats.emiten} sub="saham berdividen" />
      <Stat label="Event dividen" value={stats.events} sub="tercatat ~5 tahun" />
      <Stat label="Rutin tiap tahun" value={stats.teratur} sub="emiten teratur" />
      <Stat
        label="Ex-date terdekat"
        value={stats.nextEx ? shortDate(stats.nextEx.date) : "-"}
        sub={stats.nextEx?.ticker}
      />
      <Stat label="Perkiraan ≤ 60 hari" value={stats.pred60} sub="jadwal kemungkinan" />
    </div>
  );
}
