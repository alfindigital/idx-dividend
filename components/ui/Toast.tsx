"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TOAST_EVENT, type ToastDetail, type ToastTone } from "@/lib/toast";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { Check, Info, AlertTriangle, X } from "./icons";

interface ToastItem extends ToastDetail {
  id: number;
}

const TONE_CLASS: Record<ToastTone, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  info: "border-brand/30 bg-brand/10 text-brand-strong",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

function ToneIcon({ tone }: { tone: ToastTone }) {
  if (tone === "success") return <Check size={16} />;
  if (tone === "warn") return <AlertTriangle size={16} />;
  return <Info size={16} />;
}

const DURATION = 3500;
let seq = 0;

/**
 * Wadah notifikasi global. Dipasang sekali di layout. Mendengarkan event
 * `idx-toast`, menumpuk pesan, auto-tutup, dan menghormati reduced-motion.
 */
export default function ToastViewport() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastDetail>).detail;
      if (!detail) return;
      const id = ++seq;
      setItems((cur) => [...cur, { id, ...detail }].slice(-4));
      window.setTimeout(() => {
        setItems((cur) => cur.filter((t) => t.id !== id));
      }, DURATION);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  function dismiss(id: number) {
    setItems((cur) => cur.filter((t) => t.id !== id));
  }

  if (!mounted) return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-4 sm:left-auto sm:right-4 sm:items-end sm:px-0"
    >
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium shadow-card backdrop-blur ${
            TONE_CLASS[t.tone]
          } ${reduced ? "" : "animate-toast-in"}`}
        >
          <ToneIcon tone={t.tone} />
          <span className="min-w-0 flex-1">{t.message}</span>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="Tutup notifikasi"
            className="shrink-0 opacity-60 transition hover:opacity-100"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
