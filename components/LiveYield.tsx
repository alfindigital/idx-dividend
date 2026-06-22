"use client";

import { useEffect, useState } from "react";
import { formatPersen } from "@/lib/format";
import { DIVIDEND_TAX_RATE } from "@/lib/derive";
import { track } from "@/lib/track";
import { Skeleton } from "./ui/Skeleton";

const REFRESH_MS = 15 * 60 * 1000; // refetch harga tiap 15 menit selama tab terbuka

/**
 * Yield berjalan (TTM) live untuk satu emiten + yield forward (indikatif) dan
 * toggle "setelah pajak 10%" (PPh final dividen orang pribadi).
 */
export default function LiveYield({
  ticker,
  ttm,
  fallbackYield,
  lastAnnualTotal,
}: {
  ticker: string;
  ttm: number;
  fallbackYield: number | null;
  lastAnnualTotal?: number | null;
}) {
  const [price, setPrice] = useState<number | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "fail">("loading");
  const [ts, setTs] = useState<number | null>(null);
  const [afterTax, setAfterTax] = useState(false);

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

  const factor = afterTax ? 1 - DIVIDEND_TAX_RATE : 1;
  const running = price && ttm > 0 ? (ttm / price) * 100 : null;
  const forward = price && lastAnnualTotal && lastAnnualTotal > 0 ? (lastAnnualTotal / price) * 100 : null;
  const shownBase = running ?? fallbackYield;
  const shown = shownBase != null ? shownBase * factor : null;
  const jam = ts
    ? new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : null;

  const loadingNoData = state === "loading" && shownBase == null;

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
          {shown != null ? formatPersen(shown) : "-"}
        </span>
      )}
      {forward != null && (
        <div className="text-[11px] text-muted">
          Forward (FY terakhir):{" "}
          <span className="tabular font-medium text-fg">{formatPersen(forward * factor)}</span>
        </div>
      )}
      <div className="text-[10px] font-normal text-faint">
        {loadingNoData && <Skeleton className="mt-1 h-2 w-24" />}
        {state === "loading" && shownBase != null && "memuat harga…"}
        {running != null && `harga terkini Rp ${price?.toLocaleString("id-ID")}${jam ? " · " + jam : ""}`}
        {running == null && state === "ok" && ttm <= 0 && "tak ada dividen 12 bln terakhir, yield tercatat"}
        {running == null && state === "fail" &&
          (fallbackYield != null ? "harga live tak tersedia, yield tercatat" : "harga live tak tersedia")}
      </div>
      {shownBase != null && (
        <button
          type="button"
          onClick={() => {
            setAfterTax((v) => !v);
            track("toggle_after_tax", { ticker, on: !afterTax });
          }}
          aria-pressed={afterTax}
          className={`mt-1 inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium transition ${
            afterTax
              ? "border-brand/40 bg-brand/10 text-brand-strong"
              : "border-line text-faint hover:text-fg"
          }`}
          title="Perkiraan yield setelah PPh final dividen 10% (bila tidak direinvestasi). Edukasi, bukan saran pajak."
        >
          setelah pajak 10%
        </button>
      )}
    </div>
  );
}
