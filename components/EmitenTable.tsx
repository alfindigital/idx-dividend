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

export default function EmitenTable({ rows }: { rows: DashboardRow[] }) {
  const [prices, setPrices] = useState<Record<string, number | null>>({});
  const [priceState, setPriceState] = useState<"loading" | "ok" | "fail">("loading");
  const [q, setQ] = useState("");
  const [sektor, setSektor] = useState("");
  const [onlyDormant, setOnlyDormant] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("yield");

  useEffect(() => {
    const tickers = rows.map((r) => r.ticker).join(",");
    if (!tickers) return;
    fetch(`/api/price?tickers=${tickers}`)
      .then((r) => r.json())
      .then((d) => {
        const map: Record<string, number | null> = {};
        let any = false;
        for (const p of d.prices ?? []) {
          map[p.ticker] = p.price;
          if (p.price != null) any = true;
        }
        setPrices(map);
        setPriceState(any ? "ok" : "fail");
      })
      .catch(() => setPriceState("fail"));
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

  return (
    <div className="space-y-3">
      {/* kontrol */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari kode / nama…"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm w-44"
        />
        <select
          value={sektor}
          onChange={(e) => setSektor(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
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
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="yield">Urut: Yield tertinggi</option>
          <option value="next">Urut: Dividen terdekat</option>
          <option value="lastEx">Urut: Pembagian terakhir</option>
          <option value="yearsPaid">Urut: Paling konsisten (thn bayar)</option>
          <option value="ticker">Urut: Kode (A–Z)</option>
        </select>
        <label className="flex items-center gap-1 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={onlyDormant}
            onChange={(e) => setOnlyDormant(e.target.checked)}
          />
          Hanya dorman / rapel
        </label>
        <span className="text-xs text-slate-400 ml-auto">
          {priceState === "loading" && "memuat harga…"}
          {priceState === "ok" && "yield = berjalan (harga terkini)"}
          {priceState === "fail" && "harga live tak tersedia — yield = data terakhir"}
        </span>
      </div>

      {/* tabel */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr className="text-left">
              <th className="px-3 py-2 font-semibold">Emiten</th>
              <th className="px-3 py-2 font-semibold">Sektor</th>
              <th className="px-3 py-2 font-semibold text-right">Yield</th>
              <th className="px-3 py-2 font-semibold text-right">Div. terakhir</th>
              <th className="px-3 py-2 font-semibold">Konsistensi</th>
              <th className="px-3 py-2 font-semibold">Tren jumlah</th>
              <th className="px-3 py-2 font-semibold">Ex terakhir</th>
              <th className="px-3 py-2 font-semibold">Perkiraan berikutnya</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.ticker} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2">
                  <Link href={`/emiten/${r.ticker}`} className="font-semibold text-brand-dark hover:underline">
                    {r.ticker}
                  </Link>
                  <div className="text-xs text-slate-500 max-w-[200px] truncate">{r.nama}</div>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    <FlagBadge dormant={r.dormant} special={r.special} />
                  </div>
                </td>
                <td className="px-3 py-2 text-slate-600">{r.sektor}</td>
                <td className="px-3 py-2 text-right font-semibold">
                  {r.displayYield != null ? (
                    <span className={r.displayYield >= 6 ? "text-emerald-700" : "text-slate-700"}>
                      {formatPersen(r.displayYield)}
                    </span>
                  ) : (
                    "—"
                  )}
                  {!r.yieldFromLive && r.displayYield != null && (
                    <div className="text-[10px] font-normal text-slate-400">terakhir</div>
                  )}
                </td>
                <td className="px-3 py-2 text-right text-slate-700">
                  {formatRupiah(r.lastAnnualTotal)}
                  {r.lastYear && <div className="text-[10px] text-slate-400">{r.lastYear}</div>}
                </td>
                <td className="px-3 py-2">
                  <ConsistencyBadge value={r.timing} />
                </td>
                <td className="px-3 py-2">
                  <TrendBadge value={r.trend} />
                </td>
                <td className="px-3 py-2 text-slate-600">{formatTanggalSingkat(r.lastExDate)}</td>
                <td className="px-3 py-2">
                  {r.dormant ? (
                    <span className="text-xs text-rose-600">tak ada pola — potensi rapel</span>
                  ) : (
                    <span className="text-slate-700">{predLabel(r.nextPredDate, r.nextPredLabel)}</span>
                  )}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-slate-400">
                  Tidak ada emiten yang cocok dengan filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">
        Klik kode emiten untuk lihat riwayat lengkap, grafik, dan sumber data.
      </p>
    </div>
  );
}
