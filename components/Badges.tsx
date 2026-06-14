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

export function ConsistencyBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    "Sangat teratur": "bg-emerald-100 text-emerald-800",
    "Cukup teratur": "bg-lime-100 text-lime-800",
    "Tidak teratur": "bg-amber-100 text-amber-800",
    "Data kurang": "bg-slate-100 text-slate-500",
  };
  return <Pill className={map[value] ?? "bg-slate-100 text-slate-600"}>{value}</Pill>;
}

export function TrendBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    Naik: "bg-emerald-100 text-emerald-800",
    Stabil: "bg-sky-100 text-sky-800",
    Turun: "bg-rose-100 text-rose-800",
    "Data kurang": "bg-slate-100 text-slate-500",
  };
  const arrow: Record<string, string> = { Naik: "↑", Stabil: "→", Turun: "↓" };
  return (
    <Pill className={map[value] ?? "bg-slate-100 text-slate-600"}>
      {arrow[value] ? `${arrow[value]} ` : ""}
      {value}
    </Pill>
  );
}

export function TipeBadge({ tipe }: { tipe: string }) {
  const map: Record<string, string> = {
    final: "bg-brand/10 text-brand-dark",
    interim: "bg-indigo-100 text-indigo-800",
    special: "bg-fuchsia-100 text-fuchsia-800",
  };
  return <Pill className={map[tipe] ?? "bg-slate-100 text-slate-600"}>{labelTipe(tipe)}</Pill>;
}

export function ConfidenceBadge({ value }: { value?: string }) {
  if (!value) return null;
  const map: Record<string, string> = {
    tinggi: "bg-emerald-100 text-emerald-700",
    sedang: "bg-amber-100 text-amber-700",
    rendah: "bg-rose-100 text-rose-700",
  };
  return <Pill className={map[value] ?? "bg-slate-100 text-slate-600"}>keyakinan {value}</Pill>;
}

export function FlagBadge({ dormant, special }: { dormant: boolean; special: boolean }) {
  return (
    <>
      {dormant && <Pill className="bg-rose-100 text-rose-700">dorman / potensi rapel</Pill>}
      {special && <Pill className="bg-fuchsia-100 text-fuchsia-700">pernah spesial</Pill>}
    </>
  );
}
