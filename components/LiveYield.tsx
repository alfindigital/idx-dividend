"use client";

import { useEffect, useState } from "react";
import { formatPersen } from "@/lib/format";
import { Skeleton } from "./ui/Skeleton";

const REFRESH_MS = 15 * 60 * 1000; // refetch harga tiap 15 menit selama tab terbuka

/**
 * Yield berjalan (TTM) live untuk satu emiten.
 * - Mengambil harga terkini dari /api/price (client-side), dihitung ulang otomatis
 *   tiap 15 menit & saat tab kembali difokus → harga selalu segar tanpa rebuild.
 * - `ttm` = total dividen 12 bulan terakhir (dihitung server-side, di-pass sbg prop).
 * - Fallback anggun ke `fallbackYield` (yield tercatat) bila harga live tak tersedia.
 */
export default function LiveYield({
  ticker,
  ttm,
  fallbackYield,
}: {
  ticker: string;
  ttm: number;
  fallbackYield: number | null;
}) {
  const [price, setPrice] = useState<number | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "fail">("loading");
  const [ts, setTs] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch(`/api/price?tickers=${ticker}`)
        .then((r) => r.json())
        .then((d) => {
          if (!alive) return;
          const p = d?.prices?.[0]?.price;
          const valid = typeof p === "number";
          setPrice(valid ? p : null);
          setState(valid ? "ok" : "fail");
          setTs(d?.ts ?? Date.now());
        })
        .catch(() => {
          if (alive) setState("fail");
        });
    };
    load();
    const id = setInterval(load, REFRESH_MS);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [ticker]);

  const running = price && ttm > 0 ? (ttm / price) * 100 : null;
  const shown = running ?? fallbackYield;
  const jam = ts
    ? new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : null;

  const loadingNoData = state === "loading" && shown == null;

  return (
    <div>
      {loadingNoData ? (
        <Skeleton className="h-5 w-16 align-middle" />
      ) : (
        <span
          className={
            running != null && running >= 6
              ? "tabular text-emerald-600 dark:text-emerald-400"
              : "tabular"
          }
        >
          {shown != null ? formatPersen(shown) : "—"}
        </span>
      )}
      <div className="text-[10px] font-normal text-faint">
        {loadingNoData && <Skeleton className="mt-1 h-2 w-24" />}
        {state === "loading" && shown != null && "memuat harga…"}
        {running != null && `harga terkini Rp ${price?.toLocaleString("id-ID")}${jam ? " · " + jam : ""}`}
        {running == null && state === "ok" && ttm <= 0 && "tak ada dividen 12 bln terakhir — yield tercatat"}
        {running == null && state === "fail" &&
          (fallbackYield != null ? "harga live tak tersedia — yield tercatat" : "harga live tak tersedia")}
      </div>
    </div>
  );
}
