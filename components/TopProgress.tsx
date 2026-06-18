"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Progress bar tipis di atas saat pindah halaman.
 * Next 14 App Router tak punya router-events, jadi: mulai saat klik link internal,
 * selesai saat pathname berubah.
 */
export default function TopProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const visibleRef = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  function start() {
    window.clearInterval(timer.current);
    visibleRef.current = true;
    setVisible(true);
    setWidth(10);
    timer.current = window.setInterval(() => {
      setWidth((w) => (w < 90 ? w + (90 - w) * 0.18 : w));
    }, 220);
  }

  function done() {
    window.clearInterval(timer.current);
    if (!visibleRef.current) return;
    setWidth(100);
    window.setTimeout(() => {
      visibleRef.current = false;
      setVisible(false);
      setWidth(0);
    }, 260);
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const a = (e.target as HTMLElement)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      const target = a.getAttribute("target");
      if (!href || !href.startsWith("/") || target === "_blank") return;
      if (href === window.location.pathname) return;
      start();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // selesai saat pathname berubah (navigasi tuntas)
  useEffect(() => {
    done();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 transition-opacity duration-150 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full rounded-r-full bg-gradient-to-r from-brand to-accent shadow-[0_0_8px_rgb(var(--brand))] transition-[width] duration-200 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
