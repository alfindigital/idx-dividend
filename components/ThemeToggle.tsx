"use client";

import { useEffect, useState } from "react";

/**
 * Tombol ganti tema terang/gelap.
 * - Status awal dibaca dari class `.dark` di <html> (sudah diset oleh skrip
 *   anti-flash di layout sebelum React hydrate).
 * - Pilihan disimpan ke localStorage agar persisten antar kunjungan.
 */
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* localStorage tidak tersedia — abaikan */
    }
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      title={dark ? "Mode terang" : "Mode gelap"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-base text-white/90 transition hover:bg-white/10"
    >
      <span suppressHydrationWarning>{mounted ? (dark ? "☀️" : "🌙") : "🌙"}</span>
    </button>
  );
}
