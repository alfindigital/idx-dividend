"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Info } from "./icons";

/**
 * Tooltip penjelas istilah — ramah pemula & aksesibel.
 * - Desktop: muncul saat hover.
 * - Mobile: ketuk ikon "i" untuk buka/tutup (tap di luar / Esc menutup).
 * - Aman dipakai di dalam elemen yang bisa diklik (stopPropagation).
 */
export default function InfoTip({
  label,
  children,
  align = "center",
}: {
  label?: string;
  children: ReactNode;
  align?: "center" | "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

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

  const pos =
    align === "left"
      ? "left-0"
      : align === "right"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";

  return (
    <span ref={ref} className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label ? `Penjelasan: ${label}` : "Penjelasan"}
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex items-center justify-center text-faint transition hover:text-brand"
      >
        <Info size={14} />
      </button>
      {open && (
        <span
          role="tooltip"
          className={`absolute top-full z-40 mt-1 w-56 max-w-[75vw] rounded-lg border border-line bg-surface p-2 text-left text-xs font-normal normal-case leading-relaxed text-muted shadow-card ${pos}`}
        >
          {children}
        </span>
      )}
    </span>
  );
}
