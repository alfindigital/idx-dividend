"use client";

import { useEffect, useState } from "react";

/**
 * Mengembalikan true bila pengguna meminta animasi diminimalkan
 * (prefers-reduced-motion: reduce). Aman SSR: default false lalu
 * disinkronkan di effect. Sumber tunggal untuk animasi yang digerakkan JS.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
