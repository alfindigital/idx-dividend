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
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    // fokus opsi pertama saat dibuka (keyboard)
    const first = listRef.current?.querySelector<HTMLElement>('[role="option"]');
    first?.focus();
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
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Filter ${allLabel.toLowerCase()} — ${
          selected.length ? `${selected.length} dipilih` : "tidak ada filter"
        }`}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-fg"
      >
        <span className="truncate">{label}</span>
        <ChevronDown size={15} className="shrink-0 text-faint" />
      </button>
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-multiselectable="true"
          aria-label={allLabel}
          className="absolute left-0 z-30 mt-1 max-h-64 w-60 overflow-auto rounded-lg border border-line bg-surface p-1 shadow-card"
        >
          <li
            role="option"
            aria-selected={selected.length === 0}
            tabIndex={0}
            onClick={() => onChange([])}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChange([]);
              }
            }}
            className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-surface-2 ${
              selected.length === 0 ? "text-brand" : "text-muted"
            }`}
          >
            {allLabel}
          </li>
          {options.map((opt) => {
            const isSel = selected.includes(opt);
            return (
              <li
                key={opt}
                role="option"
                aria-selected={isSel}
                tabIndex={0}
                onClick={() => toggle(opt)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(opt);
                  }
                }}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-fg hover:bg-surface-2"
              >
                <span
                  aria-hidden="true"
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                    isSel ? "border-brand bg-brand text-white" : "border-line"
                  }`}
                >
                  {isSel ? "✓" : ""}
                </span>
                <span className="truncate">{opt}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
