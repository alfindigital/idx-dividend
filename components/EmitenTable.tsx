"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ConsistencyBadge, TrendBadge, FlagBadge } from "./Badges";
import { formatPersen, formatTanggalSingkat, formatRupiah, BULAN_ID_SINGKAT } from "@/lib/format";

export interface DashboardRow {
  ticker: string;
  nama: string;
  sektor: string;
  dormant: boolean;
  special: boolean;
  lastYear: number | null;
  lastAnnualTotal: number | null;
  ttm: number;
  lastYieldPct: number | null;
  timing: string;
  trend: string;
  yearsPaid: number;
  lastExDate: string | null;
  nextPredDate: string | null;
  nextPredLabel: string | null;
}

type SortKey = "yield" | "next" | "lastEx" | "ticker" | "yearsPaid";

function predLabel(dateIso: string | null, bulanLabel: string | null): string {
  if (!dateIso) return "—";
  const d = new Date(dateIso);
  return `${bulanLabel ?? BULAN_ID_SINGKAT[d.getMonth()]} ${d.getFullYear()}`;
}

const inputClass =
  "rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-fg placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-brand/40";

export default function EmitenTable({ rows }: { rows: DashboardRow[] }) {
  const [prices, setPrices] = useState<Record<string, number | null>>({});
  const [priceState, setPriceState] = useState<"loading" | "ok" | "fail">("loading");
  const [updatedTs, setUpdatedTs] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [sektor, setSektor] = useState("");
  const [onlyDormant, setOnlyDormant] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("yield");

  useEffect(() => {
    const tickers = rows.map((r) => r.ticker).join(",");
    if (!tickers) return;
    let alive = true;
    const load = () => {
      fetch(`/api/price?tickers=${tickers}`)
        .then((r) => r.json())
        .then((d) => {
          if (!alive) return;
          const map: Record<string, number | null> = {};
          let any = false;
          for (const p of d.prices ?? []) {
            map[p.ticker] = p.price;
            if (p.price != null) any = true;
          }
          setPrices(map);
          setPriceState(any ? "ok" : "fail");
          setUpdatedTs(d.ts ?? Date.now());
        })
        .catch(() => {
          if (alive) setPriceState("fail");
        });
    };
    load();
    // refresh otomatis tiap 15 menit + saat tab kembali difokus → harga selalu segar
    const id = setInterval(load, 15 * 60 * 1000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [rows]);

  const sectors = useMemo(() => Array.from(new Set(rows.map((r) => r.sektor))).sort(), [rows]);

  const enriched = rows.map((r) => {
    const price = prices[r.ticker] ?? null;
    const runningYield = price && r.ttm > 0 ? (r.ttm / price) * 100 : null;
    const displayYield = runningYield ?? r.lastYieldPct;
    const yieldFromLive = runningYield != null;
    return { ...r, price, runningYield, displayYield, yieldFromLive };
  });

  const filtered = enriched
    .filter((r) => (q ? (r.ticker + " " + r.nama).toLowerCase().includes(q.toLowerCase()) : true))
    .filter((r) => (sektor ? r.sektor === sektor : true))
    .filter((r) => (onlyDormant ? r.dormant : true));

  const sorted = [...filtered].sort((a, b) => {
    switch (sortKey) {
      case "yield":
        return (b.displayYield ?? -1) - (a.displayYield ?? -1);
      case "next":
        return (a.nextPredDate ?? "9999").localeCompare(b.nextPredDate ?? "9999");
      case "lastEx":
        return (b.lastExDate ?? "").localeCompare(a.lastExDate ?? "");
      case "yearsPaid":
        return b.yearsPaid - a.yearsPaid;
      case "ticker":
        return a.ticker.localeCompare(b.ticker);
      default:
        return 0;
    }
  });

  type Row = (typeof sorted)[number];

  const yieldClass = (y: number) =>
    y >= 6 ? "text-emerald-600 dark:text-emerald-400" : "text-fg";

  const statusNote =
    priceState === "loading"
      ? "memuat harga…"
      : priceState === "ok"
        ? `yield = berjalan (harga terkini${
            updatedTs
              ? " · diperbarui " +
                new Date(updatedTs).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""
          })`
        : "harga live tak tersedia — yield = data terakhir";

  return (
    <div className="space-y-3">
      {/* kontrol — menempel di bawah header saat di-scroll */}
      <div className="sticky top-14 z-10 -mx-4 border-b border-line/60 bg-bg/85 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-bg/65">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari kode / nama…"
            className={`${inputClass} w-full sm:w-44`}
          />
          <div className="flex gap-2">
            <select
              value={sektor}
              onChange={(e) => setSektor(e.target.value)}
              className={`${inputClass} min-w-0 flex-1 sm:flex-none`}
            >
              <option value="">Semua sektor</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className={`${inputClass} min-w-0 flex-1 sm:flex-none`}
            >
              <option value="yield">Urut: Yield tertinggi</option>
              <option value="next">Urut: Dividen terdekat</option>
              <option value="lastEx">Urut: Pembagian terakhir</option>
              <option value="yearsPaid">Urut: Paling konsisten</option>
              <option value="ticker">Urut: Kode (A–Z)</option>
            </select>
          </div>
          <label className="flex items-center gap-1 text-sm text-muted">
            <input
              type="checkbox"
              checked={onlyDormant}
              onChange={(e) => setOnlyDormant(e.target.checked)}
              className="accent-brand"
            />
            Hanya dorman / rapel
          </label>
          <span className="text-xs text-faint sm:ml-auto">{statusNote}</span>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-6 text-center text-sm text-faint shadow-card">
          Tidak ada emiten yang cocok dengan filter.
        </div>
      ) : (
        <>
          {/* tabel — layar ≥ sm */}
          <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface shadow-card sm:block">
            <table className="min-w-full text-sm">
              <thead className="bg-surface-2 text-muted">
                <tr className="text-left">
                  <th className="px-3 py-2 font-semibold">Emiten</th>
                  <th className="px-3 py-2 font-semibold">Sektor</th>
                  <th className="px-3 py-2 text-right font-semibold">Yield</th>
                  <th className="px-3 py-2 text-right font-semibold">Div. terakhir</th>
                  <th className="px-3 py-2 font-semibold">Konsistensi</th>
                  <th className="px-3 py-2 font-semibold">Tren jumlah</th>
                  <th className="px-3 py-2 font-semibold">Ex terakhir</th>
                  <th className="px-3 py-2 font-semibold">Perkiraan berikutnya</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.ticker} className="border-t border-line hover:bg-surface-2">
                    <td className="px-3 py-2">
                      <Link
                        href={`/emiten/${r.ticker}`}
                        className="font-semibold text-brand-strong hover:underline"
                      >
                        {r.ticker}
                      </Link>
                      <div className="max-w-[200px] truncate text-xs text-muted">{r.nama}</div>
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        <FlagBadge dormant={r.dormant} special={r.special} />
                      </div>
                    </td>
                    <td className="px-3 py-2 text-muted">{r.sektor}</td>
                    <td className="px-3 py-2 text-right font-semibold tabular">
                      {r.displayYield != null ? (
                        <span className={yieldClass(r.displayYield)}>
                          {formatPersen(r.displayYield)}
                        </span>
                      ) : (
                        "—"
                      )}
                      {!r.yieldFromLive && r.displayYield != null && (
                        <div className="text-[10px] font-normal text-faint">terakhir</div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right text-fg tabular">
                      {formatRupiah(r.lastAnnualTotal)}
                      {r.lastYear && <div className="text-[10px] text-faint">{r.lastYear}</div>}
                    </td>
                    <td className="px-3 py-2">
                      <ConsistencyBadge value={r.timing} />
                    </td>
                    <td className="px-3 py-2">
                      <TrendBadge value={r.trend} />
                    </td>
                    <td className="px-3 py-2 text-muted">{formatTanggalSingkat(r.lastExDate)}</td>
                    <td className="px-3 py-2">
                      {r.dormant ? (
                        <span className="text-xs text-rose-600 dark:text-rose-400">
                          tak ada pola — potensi rapel
                        </span>
                      ) : (
                        <span className="text-fg">
                          {predLabel(r.nextPredDate, r.nextPredLabel)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* kartu — layar < sm */}
          <div className="grid gap-2 sm:hidden">
            {sorted.map((r) => (
              <MobileCard key={r.ticker} r={r} yieldClass={yieldClass} />
            ))}
          </div>
        </>
      )}

      <p className="text-xs text-faint">
        Ketuk kode emiten untuk lihat riwayat lengkap, grafik, dan sumber data.
      </p>
    </div>
  );

  function MobileCard({ r, yieldClass }: { r: Row; yieldClass: (y: number) => string }) {
    return (
      <Link
        href={`/emiten/${r.ticker}`}
        className="block rounded-2xl border border-line bg-surface p-3 shadow-card active:bg-surface-2"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-bold text-brand-strong">{r.ticker}</div>
            <div className="truncate text-xs text-muted">{r.nama}</div>
          </div>
          <div className="shrink-0 text-right">
            <div className={`text-lg font-bold tabular ${r.displayYield != null ? yieldClass(r.displayYield) : "text-fg"}`}>
              {r.displayYield != null ? formatPersen(r.displayYield) : "—"}
            </div>
            <div className="text-[10px] text-faint">
              {r.yieldFromLive ? "yield berjalan" : "yield terakhir"}
            </div>
          </div>
        </div>

        {(r.timing !== "Data kurang" || r.trend !== "Data kurang" || r.dormant || r.special) && (
          <div className="mt-2 flex flex-wrap gap-1">
            <ConsistencyBadge value={r.timing} />
            <TrendBadge value={r.trend} />
            <FlagBadge dormant={r.dormant} special={r.special} />
          </div>
        )}

        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-faint">Div. terakhir</div>
            <div className="tabular text-fg">
              {formatRupiah(r.lastAnnualTotal)}
              {r.lastYear ? <span className="text-faint"> · {r.lastYear}</span> : ""}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-faint">Ex terakhir</div>
            <div className="text-muted">{formatTanggalSingkat(r.lastExDate)}</div>
          </div>
          <div className="col-span-2">
            <div className="text-[11px] uppercase tracking-wide text-faint">Perkiraan berikutnya</div>
            {r.dormant ? (
              <div className="text-rose-600 dark:text-rose-400">tak ada pola — potensi rapel</div>
            ) : (
              <div className="text-fg">{predLabel(r.nextPredDate, r.nextPredLabel)}</div>
            )}
          </div>
        </div>
      </Link>
    );
  }
}
