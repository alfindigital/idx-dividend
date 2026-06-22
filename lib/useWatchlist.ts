"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "./toast";

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
    // impor watchlist dari URL share (?w=BBRI,PTBA) lalu gabungkan
    try {
      const w = new URLSearchParams(window.location.search).get("w");
      if (w) {
        const incoming = w
          .split(",")
          .map((t) => t.trim().toUpperCase())
          .filter(Boolean);
        if (incoming.length) {
          const merged = Array.from(new Set([...read(), ...incoming]));
          localStorage.setItem(KEY, JSON.stringify(merged));
          // bersihkan param agar URL rapi
          const url = new URL(window.location.href);
          url.searchParams.delete("w");
          window.history.replaceState(null, "", url.toString());
          const added = incoming.filter((t) => !read().includes(t));
          if (added.length === 0) toast("Watchlist dari tautan ditambahkan.", { tone: "success" });
        }
      }
    } catch {
      /* abaikan */
    }
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
    const added = !cur.includes(ticker);
    const next = added ? [...cur, ticker] : cur.filter((t) => t !== ticker);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* abaikan */
    }
    setList(next);
    window.dispatchEvent(new Event(EVT));
    toast(
      added ? `${ticker} ditambahkan ke watchlist.` : `${ticker} dihapus dari watchlist.`,
      { tone: "info" },
    );
  }, []);

  const has = useCallback((t: string) => list.includes(t), [list]);

  const shareUrl = useCallback(() => {
    if (typeof window === "undefined" || list.length === 0) return "";
    return `${window.location.origin}/?w=${list.join(",")}`;
  }, [list]);

  return { list, has, toggle, shareUrl };
}
