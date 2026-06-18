"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ConsistencyBadge, TrendBadge, FlagIcons } from "./Badges";
import InfoTip from "./ui/InfoTip";
import MultiSelect from "./MultiSelect";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronRight,
  ArrowUpDown,
  ArrowUpRight,
} from "./ui/icons";
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

type SortKey = "ticker" | "sektor" | "yield" | "div" | "lastEx" | "next" | "yearsPaid";
type Dir = "asc" | "desc";

interface Col {
  id: string;
  label: string;
  w: number;
  min: number;
  align?: "right";
  sortKey?: SortKey;
  tip?: string;
}

const COLUMNS: Col[] = [
  { id: "emiten", label: "Emiten", w: 210, min: 150, sortKey: "ticker" },
  { id: "sektor", label: "Sektor", w: 150, min: 110, sortKey: "sektor" },
  {
    id: "yield",
    label: "Yield",
    w: 110,
    min: 80,
    align: "right",
    sortKey: "yield",
    tip: "Dividen 12 bln terakhir dibagi harga sekarang. Hijau = ≥ 6%.",
  },
  {
    id: "div",
    label: "Div.",
    w: 120,
    min: 90,
    align: "right",
    sortKey: "div",
    tip: "Total dividen per lembar tahun pembayaran terakhir.",
  },
  {
    id: "konsistensi",
    label: "Konsist.",
    w: 130,
    min: 100,
    tip: "Keteraturan waktu pembagian dividen tiap tahun.",
  },
  { id: "tren", label: "Tren", w: 120, min: 90, tip: "Arah besaran dividen per lembar antar tahun." },
  {
    id: "ex",
    label: "Ex",
    w: 110,
    min: 80,
    sortKey: "lastEx",
    tip: "Tanggal ex-dividend terakhir yang tercatat.",
  },
  {
    id: "pred",
    label: "Perkiraan",
    w: 140,
    min: 110,
    sortKey: "next",
    tip: "Perkiraan bulan ex-date berikutnya (pola historis, bukan kepastian).",
  },
];

const SORT_PRESETS: { value: string; label: string }[] = [
  { value: "yield:desc", label: "Yield tertinggi" },
  { value: "next:asc", label: "Dividen terdekat" },
  { value: "lastEx:desc", label: "Pembagian terakhir" },
  { value: "div:desc", label: "Dividen terbesar" },
  { value: "yearsPaid:desc", label: "Paling konsisten" },
  { value: "ticker:asc", label: "Kode A-Z" },
];

const STORAGE_KEY = "idx-colfrac-v1";

function predLabel(dateIso: string | null, bulanLabel: string | null): string {
  if (!dateIso) return "-";
  const d = new Date(dateIso);
  return `${bulanLabel ?? BULAN_ID_SINGKAT[d.getMonth()]} ${d.getFullYear()}`;
}

function defaultDir(key: SortKey): Dir {
  return key === "ticker" || key === "sektor" || key === "next" ? "asc" : "desc";
}

const DEFAULT_FRACS = (() => {
  const t = COLUMNS.reduce((a, c) => a + c.w, 0);
  return COLUMNS.map((c) => c.w / t);
})();

export default function EmitenTable({ rows }: { rows: DashboardRow[] }) {
  const [prices, setPrices] = useState<Record<string, number | null>>({});
  const [priceState, setPriceState] = useState<"loading" | "ok" | "fail">("loading");
  const [updatedTs, setUpdatedTs] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [sektors, setSektors] = useState<string[]>([]);
  const [minYield, setMinYield] = useState("");
  const [minDiv, setMinDiv] = useState("");
  const [trend, setTrend] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: Dir }>({ key: "yield", dir: "desc" });
  const [fracs, setFracs] = useState<number[]>(DEFAULT_FRACS);
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length === COLUMNS.length) setFracs(arr);
      }
    } catch {
      /* abaikan */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fracs));
    } catch {
      /* abaikan */
    }
  }, [fracs]);

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
    return { ...r, price, displayYield, yieldFromLive: runningYield != null };
  });
  type Row = (typeof enriched)[number];

  const minY = parseFloat(minYield);
  const minD = parseFloat(minDiv);
  const filtered = enriched
    .filter((r) => (q ? (r.ticker + " " + r.nama).toLowerCase().includes(q.toLowerCase()) : true))
    .filter((r) => (sektors.length ? sektors.includes(r.sektor) : true))
    .filter((r) => (!Number.isNaN(minY) ? (r.displayYield ?? -Infinity) >= minY : true))
    .filter((r) => (!Number.isNaN(minD) ? (r.lastAnnualTotal ?? -Infinity) >= minD : true))
    .filter((r) => (trend ? r.trend === trend : true));

  function sortVal(r: Row, key: SortKey): string | number {
    switch (key) {
      case "ticker":
        return r.ticker;
      case "sektor":
        return r.sektor;
      case "yield":
        return r.displayYield ?? -Infinity;
      case "div":
        return r.lastAnnualTotal ?? -Infinity;
      case "lastEx":
        return r.lastExDate ?? "";
      case "next":
        return r.nextPredDate ?? "9999-99-99";
      case "yearsPaid":
        return r.yearsPaid;
    }
  }

  const sorted = [...filtered].sort((a, b) => {
    const av = sortVal(a, sort.key);
    const bv = sortVal(b, sort.key);
    const c =
      typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
    return sort.dir === "asc" ? c : -c;
  });

  function toggleSort(key?: SortKey) {
    if (!key) return;
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: defaultDir(key) },
    );
  }

  // resize kolom: ambil/lepas lebar dari kolom tetangga → total tetap mengisi penuh
  function onResizeDown(e: React.MouseEvent, idx: number) {
    e.preventDefault();
    e.stopPropagation();
    const tableW = tableRef.current?.clientWidth ?? 1000;
    const startX = e.clientX;
    const a = fracs[idx];
    const b = fracs[idx + 1];
    const minA = COLUMNS[idx].min / tableW;
    const minB = COLUMNS[idx + 1].min / tableW;
    const move = (ev: MouseEvent) => {
      let d = (ev.clientX - startX) / tableW;
      d = Math.max(-(a - minA), Math.min(d, b - minB));
      setFracs((f) => {
        const n = [...f];
        n[idx] = a + d;
        n[idx + 1] = b - d;
        return n;
      });
    };
    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
    document.body.style.userSelect = "none";
  }

  const yieldClass = (y: number) => (y >= 6 ? "text-emerald-600 dark:text-emerald-400" : "text-fg");

  const statusNote =
    priceState === "loading"
      ? "mengambil harga…"
      : priceState === "ok"
        ? `yield = dividen 12bln ÷ harga terkini${
            updatedTs
              ? ` · ${new Date(updatedTs).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : ""
          }`
        : "harga live tak tersedia · yield = data terakhir";

  function renderCell(col: Col, r: Row) {
    switch (col.id) {
      case "emiten":
        return (
          <>
            <div className="flex items-center gap-1.5">
              <Link
                href={`/emiten/${r.ticker}`}
                className="group/tk inline-flex items-center gap-0.5 font-display font-semibold text-brand-strong hover:underline"
              >
                {r.ticker}
                <ArrowUpRight
                  size={12}
                  className="text-brand opacity-0 transition group-hover/tk:opacity-100"
                />
              </Link>
              <FlagIcons dormant={r.dormant} special={r.special} />
            </div>
            <div className="truncate text-xs text-muted">{r.nama}</div>
          </>
        );
      case "sektor":
        return <span className="truncate text-muted">{r.sektor}</span>;
      case "yield":
        return r.displayYield != null ? (
          <span className={`font-semibold tabular ${yieldClass(r.displayYield)}`}>
            {formatPersen(r.displayYield)}
            {!r.yieldFromLive && (
              <span className="ml-1 align-middle text-[10px] font-normal text-faint">tct</span>
            )}
          </span>
        ) : (
          <span className="text-faint">-</span>
        );
      case "div":
        return (
          <span className="tabular text-fg">
            {formatRupiah(r.lastAnnualTotal)}
            {r.lastYear ? <span className="ml-1 text-[10px] text-faint">{r.lastYear}</span> : null}
          </span>
        );
      case "konsistensi":
        return <ConsistencyBadge value={r.timing} />;
      case "tren":
        return <TrendBadge value={r.trend} />;
      case "ex":
        return <span className="text-muted">{formatTanggalSingkat(r.lastExDate)}</span>;
      case "pred":
        return r.dormant ? (
          <span className="text-xs text-rose-600 dark:text-rose-400">tak ada pola</span>
        ) : (
          <span className="text-fg">{predLabel(r.nextPredDate, r.nextPredLabel)}</span>
        );
      default:
        return null;
    }
  }

  return (
    <div className="space-y-3">
      {/* kontrol — menempel di bawah header saat di-scroll */}
      <div className="sticky top-12 z-10 -mx-4 border-b border-line/60 bg-bg/85 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-bg/65">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full sm:w-52">
            <Search
              size={15}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari kode / nama…"
              className="w-full rounded-lg border border-line bg-surface py-1.5 pl-8 pr-3 text-sm text-fg placeholder:text-faint"
            />
          </div>
          <MultiSelect
            options={sectors}
            selected={sektors}
            onChange={setSektors}
            allLabel="Semua sektor"
            className="w-full sm:w-44"
          />
          {/* ambang minimal yield & dividen */}
          <div className="flex gap-2">
            <input
              value={minYield}
              onChange={(e) => setMinYield(e.target.value)}
              inputMode="decimal"
              placeholder="Yield ≥ %"
              className="w-full rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-fg placeholder:text-faint sm:w-24"
            />
            <input
              value={minDiv}
              onChange={(e) => setMinDiv(e.target.value)}
              inputMode="decimal"
              placeholder="Div ≥ Rp"
              className="w-full rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-fg placeholder:text-faint sm:w-24"
            />
          </div>
          {/* filter tren */}
          <div className="relative w-full sm:w-36">
            <select
              value={trend}
              onChange={(e) => setTrend(e.target.value)}
              className="w-full appearance-none rounded-lg border border-line bg-surface py-1.5 pl-3 pr-8 text-sm text-fg"
            >
              <option value="">Semua tren</option>
              <option value="Naik">Tren naik</option>
              <option value="Stabil">Tren stabil</option>
              <option value="Turun">Tren turun</option>
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-faint"
            />
          </div>
          {/* urut: hanya di mobile (desktop pakai klik header) */}
          <div className="relative w-full sm:hidden">
            <ArrowUpDown
              size={15}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint"
            />
            <select
              value={`${sort.key}:${sort.dir}`}
              onChange={(e) => {
                const [key, dir] = e.target.value.split(":") as [SortKey, Dir];
                setSort({ key, dir });
              }}
              className="w-full appearance-none rounded-lg border border-line bg-surface py-1.5 pl-8 pr-8 text-sm text-fg"
            >
              {SORT_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
              {!SORT_PRESETS.some((p) => p.value === `${sort.key}:${sort.dir}`) && (
                <option value={`${sort.key}:${sort.dir}`}>Urutan kolom</option>
              )}
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-faint"
            />
          </div>
          <span className="inline-flex flex-wrap items-center gap-x-1.5 text-xs text-faint sm:ml-auto">
            <span className="font-medium text-muted">{sorted.length} emiten</span>
            <span aria-hidden="true">·</span>
            {priceState === "loading" && (
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand/60" aria-hidden="true" />
            )}
            {priceState === "ok" && (
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            )}
            {statusNote}
          </span>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-faint shadow-card">
          Tidak ada emiten yang cocok dengan filter.
        </div>
      ) : (
        <>
          {/* data-grid — layar ≥ sm, mengisi penuh lebar */}
          <div className="hidden overflow-hidden rounded-xl border border-line bg-surface shadow-card sm:block">
            <table
              ref={tableRef}
              className="text-sm"
              style={{ width: "100%", tableLayout: "fixed" }}
            >
              <colgroup>
                {fracs.map((f, i) => (
                  <col key={i} style={{ width: `${(f * 100).toFixed(3)}%` }} />
                ))}
              </colgroup>
              <thead>
                <tr className="border-b border-line bg-brand/5 text-left text-muted">
                  {COLUMNS.map((col, idx) => {
                    const active = sort.key === col.sortKey;
                    return (
                      <th
                        key={col.id}
                        className={`relative select-none px-3 py-2 font-semibold ${
                          col.align === "right" ? "text-right" : ""
                        }`}
                      >
                        <span
                          className={`inline-flex max-w-full items-center gap-1 ${
                            col.align === "right" ? "flex-row-reverse" : ""
                          }`}
                        >
                          {col.sortKey ? (
                            <button
                              type="button"
                              onClick={() => toggleSort(col.sortKey)}
                              className={`inline-flex items-center gap-1 truncate transition hover:text-fg ${
                                active ? "text-brand" : ""
                              }`}
                            >
                              <span className="truncate">{col.label}</span>
                              {active ? (
                                sort.dir === "asc" ? (
                                  <ChevronUp size={13} className="shrink-0" />
                                ) : (
                                  <ChevronDown size={13} className="shrink-0" />
                                )
                              ) : (
                                <ChevronsUpDown size={13} className="shrink-0 text-faint/60" />
                              )}
                            </button>
                          ) : (
                            <span className="truncate">{col.label}</span>
                          )}
                          {col.tip && <InfoTip label={col.label}>{col.tip}</InfoTip>}
                        </span>
                        {idx < COLUMNS.length - 1 && (
                          <span
                            onMouseDown={(e) => onResizeDown(e, idx)}
                            className="absolute right-0 top-0 z-10 h-full w-1.5 cursor-col-resize hover:bg-brand/40"
                            aria-hidden="true"
                          />
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr
                    key={r.ticker}
                    className="group border-b border-line/70 last:border-0 hover:bg-brand/5"
                  >
                    {COLUMNS.map((col) => (
                      <td
                        key={col.id}
                        className={`overflow-hidden px-3 py-2 align-middle ${
                          col.align === "right" ? "text-right" : ""
                        }`}
                      >
                        {renderCell(col, r)}
                      </td>
                    ))}
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
    </div>
  );
}

function MobileCard({ r, yieldClass }: { r: any; yieldClass: (y: number) => string }) {
  return (
    <Link
      href={`/emiten/${r.ticker}`}
      className="block rounded-xl border border-line bg-surface p-3 shadow-card transition hover:border-brand/40 active:bg-surface-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-bold text-brand-strong">{r.ticker}</span>
            <FlagIcons dormant={r.dormant} special={r.special} />
          </div>
          <div className="truncate text-xs text-muted">{r.nama}</div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="text-right">
            <div
              className={`font-display text-lg font-bold tabular ${r.displayYield != null ? yieldClass(r.displayYield) : "text-fg"}`}
            >
              {r.displayYield != null ? formatPersen(r.displayYield) : "-"}
            </div>
            <div className="text-[10px] text-faint">
              {r.yieldFromLive ? "yield berjalan" : "yield terakhir"}
            </div>
          </div>
          <ChevronRight size={16} className="text-faint" />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        <ConsistencyBadge value={r.timing} />
        <TrendBadge value={r.trend} />
      </div>

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
            <div className="text-rose-600 dark:text-rose-400">tak ada pola, potensi rapel</div>
          ) : (
            <div className="text-fg">{predLabel(r.nextPredDate, r.nextPredLabel)}</div>
          )}
        </div>
      </div>
    </Link>
  );
}
