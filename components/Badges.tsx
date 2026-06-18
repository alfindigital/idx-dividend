import { labelTipe } from "@/lib/format";

function Pill({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium leading-tight ${className}`}
    >
      {children}
    </span>
  );
}

const NEUTRAL = "bg-surface-2 text-faint";

export function ConsistencyBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    "Sangat teratur": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    "Cukup teratur": "bg-lime-500/15 text-lime-700 dark:text-lime-300",
    "Tidak teratur": "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    "Data kurang": NEUTRAL,
  };
  return <Pill className={map[value] ?? NEUTRAL}>{value}</Pill>;
}

export function TrendBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    Naik: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    Stabil: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    Turun: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    "Data kurang": NEUTRAL,
  };
  const arrow: Record<string, string> = { Naik: "↑", Stabil: "→", Turun: "↓" };
  return (
    <Pill className={map[value] ?? NEUTRAL}>
      {arrow[value] ? `${arrow[value]} ` : ""}
      {value}
    </Pill>
  );
}

export function TipeBadge({ tipe }: { tipe: string }) {
  const map: Record<string, string> = {
    final: "bg-brand/15 text-brand-strong",
    interim: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
    special: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
  };
  return <Pill className={map[tipe] ?? NEUTRAL}>{labelTipe(tipe)}</Pill>;
}

export function ConfidenceBadge({ value }: { value?: string }) {
  if (!value) return null;
  const map: Record<string, string> = {
    tinggi: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    sedang: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    rendah: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  };
  return <Pill className={map[value] ?? NEUTRAL}>keyakinan {value}</Pill>;
}

export function FlagBadge({ dormant, special }: { dormant: boolean; special: boolean }) {
  return (
    <>
      {dormant && (
        <Pill className="bg-rose-500/15 text-rose-700 dark:text-rose-300">
          dorman / potensi rapel
        </Pill>
      )}
      {special && (
        <Pill className="bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300">
          pernah spesial
        </Pill>
      )}
    </>
  );
}
