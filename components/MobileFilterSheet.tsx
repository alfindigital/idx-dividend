"use client";

import { useRef, useState, type ReactNode } from "react";
import MultiSelect from "./MultiSelect";
import { ChevronDown, SlidersHorizontal, Star } from "./ui/icons";
import { useFocusTrap } from "@/lib/useFocusTrap";

interface Props {
  sectors: string[];
  sektors: string[];
  setSektors: (v: string[]) => void;
  minYield: string;
  setMinYield: (v: string) => void;
  minDiv: string;
  setMinDiv: (v: string) => void;
  trend: string;
  setTrend: (v: string) => void;
  sortValue: string;
  setSortValue: (v: string) => void;
  sortPresets: { value: string; label: string }[];
  onlyWatchlist: boolean;
  setOnlyWatchlist: (v: boolean) => void;
  watchlistCount: number;
  activeCount: number;
  resultCount: number;
  onReset: () => void;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted">{label}</label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-line bg-surface px-3 py-2 pr-8 text-sm text-fg"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-faint"
      />
    </div>
  );
}

/** Bottom-sheet filter untuk layar kecil (menggantikan kontrol menumpuk). */
export default function MobileFilterSheet(props: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useFocusTrap(panelRef, open, () => setOpen(false));
  const inputCls =
    "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-faint";

  const presetMatch = props.sortPresets.some((p) => p.value === props.sortValue);
  const sortOpts: [string, string][] = presetMatch
    ? props.sortPresets.map((p) => [p.value, p.label])
    : [...props.sortPresets.map((p) => [p.value, p.label] as [string, string]), [props.sortValue, "Urutan kolom"]];

  return (
    <div className="w-full sm:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-surface py-2 text-sm font-medium text-fg transition active:bg-surface-2"
      >
        <SlidersHorizontal size={16} /> Filter
        {props.activeCount > 0 && (
          <span className="rounded-full bg-brand px-1.5 text-[11px] font-semibold text-white">
            {props.activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Filter emiten"
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-auto rounded-t-2xl border-t border-line bg-bg p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-fg">Filter</h3>
              <button onClick={() => setOpen(false)} className="text-sm text-brand">
                Tutup
              </button>
            </div>
            <div className="space-y-3">
              <Field label="Sektor">
                <MultiSelect
                  options={props.sectors}
                  selected={props.sektors}
                  onChange={props.setSektors}
                  allLabel="Semua sektor"
                  className="w-full"
                />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Yield minimal (%)">
                  <input
                    value={props.minYield}
                    onChange={(e) => props.setMinYield(e.target.value)}
                    inputMode="decimal"
                    placeholder="cth 6"
                    className={inputCls}
                  />
                </Field>
                <Field label="Dividen minimal (Rp)">
                  <input
                    value={props.minDiv}
                    onChange={(e) => props.setMinDiv(e.target.value)}
                    inputMode="decimal"
                    placeholder="cth 100"
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="Tren jumlah">
                <Select
                  value={props.trend}
                  onChange={props.setTrend}
                  options={[
                    ["", "Semua tren"],
                    ["Naik", "Tren naik"],
                    ["Stabil", "Tren stabil"],
                    ["Turun", "Tren turun"],
                  ]}
                />
              </Field>
              <Field label="Urutkan">
                <Select value={props.sortValue} onChange={props.setSortValue} options={sortOpts} />
              </Field>
              <button
                type="button"
                onClick={() => props.setOnlyWatchlist(!props.onlyWatchlist)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                  props.onlyWatchlist
                    ? "border-amber-400/50 bg-amber-400/10 text-fg"
                    : "border-line bg-surface text-muted"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Star
                    size={16}
                    filled={props.onlyWatchlist}
                    className={props.onlyWatchlist ? "text-amber-400" : ""}
                  />
                  Hanya watchlist
                </span>
                <span className="text-xs text-faint">{props.watchlistCount}</span>
              </button>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={props.onReset}
                className="flex-1 rounded-lg border border-line bg-surface py-2 text-sm font-medium text-fg transition active:bg-surface-2"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white shadow-glow transition active:bg-indigo-700"
              >
                Lihat {props.resultCount} emiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
