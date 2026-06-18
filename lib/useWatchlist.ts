"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "idx-watchlist-v1";
const EVT = "idx-watchlist-change";

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/**
 * Watchlist/favorit berbasis localStorage. Sinkron antar komponen di tab yang
 * sama (custom event) maupun antar-tab (storage event).
 */
export function useWatchlist() {
  const [list, setList] = useState<string[]>([]);

  useEffect(() => {
    setList(read());
    const sync = () => setList(read());
    window.addEventListener("storage", sync);
    window.addEventListener(EVT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVT, sync);
    };
  }, []);

  const toggle = useCallback((ticker: string) => {
    const cur = read();
    const next = cur.includes(ticker) ? cur.filter((t) => t !== ticker) : [...cur, ticker];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* abaikan */
    }
    setList(next);
    window.dispatchEvent(new Event(EVT));
  }, []);

  const has = useCallback((t: string) => list.includes(t), [list]);

  return { list, has, toggle };
}
