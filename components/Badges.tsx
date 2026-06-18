import type { ReactNode } from "react";
import { labelTipe } from "@/lib/format";
import { ArrowUpRight, ArrowDownRight, ArrowRight } from "./ui/icons";

function Pill({
  children,
  className,
  dot,
  icon,
}: {
  children: ReactNode;
  className: string;
  dot?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-tight ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />}
      {icon}
      {children}
    </span>
  );
}

const NEUTRAL = "border-line bg-surface-2 text-faint";

const TONE = {
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  lime: "border-lime-500/30 bg-lime-500/10 text-lime-700 dark:text-lime-300",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  sky: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  rose: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  violet: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  fuchsia: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
  brand: "border-brand/30 bg-brand/10 text-brand-strong",
} as const;

export function ConsistencyBadge({ value }: { value: string }) {
  const map: Record<string, { c: string; dot: string }> = {
    "Sangat teratur": { c: TONE.emerald, dot: "bg-emerald-500" },
    "Cukup teratur": { c: TONE.lime, dot: "bg-lime-500" },
    "Tidak teratur": { c: TONE.amber, dot: "bg-amber-500" },
    "Data kurang": { c: NEUTRAL, dot: "bg-faint" },
  };
  const m = map[value] ?? map["Data kurang"];
  return (
    <Pill className={m.c} dot={m.dot}>
      {value}
    </Pill>
  );
}

export function TrendBadge({ value }: { value: string }) {
  const map: Record<string, { c: string; Icon?: (p: { size?: number }) => JSX.Element }> = {
    Naik: { c: TONE.emerald, Icon: ArrowUpRight },
    Stabil: { c: TONE.sky, Icon: ArrowRight },
    Turun: { c: TONE.rose, Icon: ArrowDownRight },
    "Data kurang": { c: NEUTRAL },
  };
  const m = map[value] ?? map["Data kurang"];
  return (
    <Pill className={m.c} icon={m.Icon ? <m.Icon size={12} /> : undefined}>
      {value}
    </Pill>
  );
}

export function TipeBadge({ tipe }: { tipe: string }) {
  const map: Record<string, { c: string; dot: string }> = {
    final: { c: TONE.brand, dot: "bg-brand" },
    interim: { c: TONE.violet, dot: "bg-violet-500" },
    special: { c: TONE.fuchsia, dot: "bg-fuchsia-500" },
  };
  const m = map[tipe] ?? { c: NEUTRAL, dot: "bg-faint" };
  return (
    <Pill className={m.c} dot={m.dot}>
      {labelTipe(tipe)}
    </Pill>
  );
}

export function ConfidenceBadge({ value }: { value?: string }) {
  if (!value) return null;
  const map: Record<string, { c: string; dot: string }> = {
    tinggi: { c: TONE.emerald, dot: "bg-emerald-500" },
    sedang: { c: TONE.amber, dot: "bg-amber-500" },
    rendah: { c: TONE.rose, dot: "bg-rose-500" },
  };
  const m = map[value] ?? { c: NEUTRAL, dot: "bg-faint" };
  return (
    <Pill className={m.c} dot={m.dot}>
      keyakinan {value}
    </Pill>
  );
}

export function FlagBadge({ dormant, special }: { dormant: boolean; special: boolean }) {
  return (
    <>
      {dormant && (
        <Pill className={TONE.rose} dot="bg-rose-500">
          dorman / potensi rapel
        </Pill>
      )}
      {special && (
        <Pill className={TONE.fuchsia} dot="bg-fuchsia-500">
          pernah spesial
        </Pill>
      )}
    </>
  );
}
