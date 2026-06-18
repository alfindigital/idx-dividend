"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "./ui/icons";

/** Dropdown pilihan ganda (checkbox) — mis. filter sektor. */
export default function MultiSelect({
  options,
  selected,
  onChange,
  allLabel = "Semua",
  className = "",
}: {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  allLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle(opt: string) {
    onChange(selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt]);
  }

  const label =
    selected.length === 0 ? allLabel : selected.length === 1 ? selected[0] : `${selected.length} dipilih`;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-fg"
      >
        <span className="truncate">{label}</span>
        <ChevronDown size={15} className="shrink-0 text-faint" />
      </button>
      {open && (
        <div className="absolute left-0 z-30 mt-1 max-h-64 w-60 overflow-auto rounded-lg border border-line bg-surface p-1 shadow-card">
          <button
            type="button"
            onClick={() => onChange([])}
            className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-surface-2 ${
              selected.length === 0 ? "text-brand" : "text-muted"
            }`}
          >
            {allLabel}
          </button>
          {options.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-fg hover:bg-surface-2"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="accent-brand"
              />
              <span className="truncate">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
