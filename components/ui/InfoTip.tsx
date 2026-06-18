"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Info } from "./icons";

const WIDTH = 240;

/**
 * Tooltip penjelas istilah — ramah pemula & aksesibel.
 * Diposisikan `fixed` lalu di-clamp ke viewport agar tidak pernah keluar layar
 * (anti-offside) dan tidak terpotong oleh kontainer yang overflow.
 */
export default function InfoTip({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
  /** dipertahankan demi kompatibilitas pemanggil lama; tidak lagi dipakai */
  align?: "center" | "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: -9999, top: -9999 });
  const btnRef = useRef<HTMLButtonElement>(null);

  function place() {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    // selalu buka ke kanan (tepi kiri tooltip sejajar ikon), clamp agar tak keluar layar
    let left = r.left;
    left = Math.max(8, Math.min(left, vw - WIDTH - 8));
    setPos({ left, top: r.bottom + 6 });
  }

  useEffect(() => {
    if (!open) return;
    place();
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDoc = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [open]);

  return (
    <span className="inline-flex align-middle">
      <button
        ref={btnRef}
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
          style={{ position: "fixed", left: pos.left, top: pos.top, width: WIDTH }}
          className="z-50 rounded-lg border border-line bg-surface p-2 text-left text-xs font-normal normal-case leading-relaxed text-muted shadow-card"
        >
          {children}
        </span>
      )}
    </span>
  );
}
