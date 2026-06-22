"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ConsistencyBadge, TrendBadge, FlagIcons } from "./Badges";
import InfoTip from "./ui/InfoTip";
import MultiSelect from "./MultiSelect";
import MobileFilterSheet from "./MobileFilterSheet";
import { Sparkline } from "./ui/Sparkline";
import { Skeleton } from "./ui/Skeleton";
import EmptyState from "./ui/EmptyState";
import {
  Search,
  SearchX,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronRight,
  ArrowUpRight,
  Download,
  Star,
} from "./ui/icons";
import { useWatchlist } from "@/lib/useWatchlist";
import { toast } from "@/lib/toast";
import { track } from "@/lib/track";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
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
  dpsSeries: number[];
}

export interface EnrichedRow extends DashboardRow {
  price: number | null;
  displayYield: number | null;
  yieldFromLive: boolean;
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
  { id: "emiten", label: "Emiten", w: 220, min: 160, sortKey: "ticker" },
  { id: "sektor", label: "Sektor", w: 150, min: 110, sortKey: "sektor" },
  {
    id: "yield",
    label: "Yield",
    w: 110,
    min: 80,
    align: "right",
    sortKey: "yield",
    tip: "Dividen 12 bln terakhir dibagi harga sekarang. Warna makin hijau = makin tinggi.",
  },
  {
    id: "div",
    label: "Div.",
    w: 130,
    min: 100,
    align: "right",
    sortKey: "div",
    tip: "Total dividen per lembar tahun pembayaran terakhir + tren mini DPS.",
  },
  {
    id: "konsistensi",
    label: "Konsist.",
    w: 130,
    min: 100,
    tip: "Keteraturan waktu pembagian dividen tiap tahun.",
  },
  { id: "tren", label: "Tren", w: 110, min: 90, tip: "Arah besaran dividen per lembar antar tahun." },
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

function csvCell(v: string | number): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function yieldColor(y: number): string {
  if (y >= 10) return "text-emerald-500 dark:text-emerald-300";
  if (y >= 7) return "text-emerald-600 dark:text-emerald-400";
  if (y >= 5) return "text-lime-600 dark:text-lime-400";
  if (y >= 3) return "text-sky-600 dark:text-sky-400";
  return "text-muted";
}

function sparkColor(s: number[]): string {
  if (s.length < 2) return "text-faint";
  const d = s[s.length - 1] - s[0];
  if (d > 0) return "text-emerald-500/60 group-hover:text-emerald-500";
  if (d < 0) return "text-rose-500/60 group-hover:text-rose-500";
  return "text-faint group-hover:text-muted";
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
  const [onlyWatchlist, setOnlyWatchlist] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: Dir }>({ key: "yield", dir: "desc" });
  const [fracs, setFracs] = useState<number[]>(DEFAULT_FRACS);
  const [removingChip, setRemovingChip] = useState<string | null>(null);
  const [popped, setPopped] = useState<string | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const watchlist = useWatchlist();
  const reduced = usePrefersReducedMotion();

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
  const loading = priceState === "loading";

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
    .filter((r) => (trend ? r.trend === trend : true))
    .filter((r) => (onlyWatchlist ? watchlist.has(r.ticker) : true));

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

  // preset cepat satu-klik (entry point untuk pengguna non-power)
  const PRESETS: { id: string; label: string; sort?: { key: SortKey; dir: Dir }; wl?: boolean }[] = [
    { id: "yield", label: "Yield tertinggi", sort: { key: "yield", dir: "desc" } },
    { id: "next", label: "Terdekat bagi dividen", sort: { key: "next", dir: "asc" } },
    { id: "yearsPaid", label: "Paling konsisten", sort: { key: "yearsPaid", dir: "desc" } },
    { id: "div", label: "Dividen terbesar", sort: { key: "div", dir: "desc" } },
    { id: "wl", label: "★ Watchlist", wl: true },
  ];
  function applyPreset(p: (typeof PRESETS)[number]) {
    if (p.wl) {
      setOnlyWatchlist((v) => !v);
    } else if (p.sort) {
      setSort(p.sort);
    }
    track("use_preset", { preset: p.id });
  }
  function presetActive(p: (typeof PRESETS)[number]) {
    if (p.wl) return onlyWatchlist;
    return p.sort ? sort.key === p.sort.key && sort.dir === p.sort.dir : false;
  }

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

  const timeStr = updatedTs
    ? new Date(updatedTs).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : "";
  const statusFull = loading
    ? "mengambil harga…"
    : priceState === "ok"
      ? `yield = dividen 12bln ÷ harga terkini${timeStr ? ` · ${timeStr}` : ""}`
      : "harga live tak tersedia · yield = data terakhir";
  const statusShort = loading
    ? "memuat…"
    : priceState === "ok"
      ? timeStr
        ? `harga ${timeStr}`
        : "harga live"
      : "harga tak tersedia";

  // chip filter aktif
  const activeFilters: { key: string; label: string; clear: () => void }[] = [];
  if (q) activeFilters.push({ key: "q", label: `Cari: "${q}"`, clear: () => setQ("") });
  for (const s of sektors)
    activeFilters.push({ key: `sek-${s}`, label: s, clear: () => setSektors(sektors.filter((x) => x !== s)) });
  if (minYield && !Number.isNaN(minY))
    activeFilters.push({ key: "my", label: `Yield ≥ ${minYield}%`, clear: () => setMinYield("") });
  if (minDiv && !Number.isNaN(minD))
    activeFilters.push({ key: "md", label: `Div ≥ Rp${minDiv}`, clear: () => setMinDiv("") });
  if (trend) activeFilters.push({ key: "tr", label: `Tren ${trend.toLowerCase()}`, clear: () => setTrend("") });
  if (onlyWatchlist)
    activeFilters.push({ key: "wl", label: "★ Watchlist", clear: () => setOnlyWatchlist(false) });

  function resetAll() {
    const had = activeFilters.length > 0;
    setQ("");
    setSektors([]);
    setMinYield("");
    setMinDiv("");
    setTrend("");
    setOnlyWatchlist(false);
    if (had) toast("Filter direset.", { tone: "info" });
  }

  /** Hapus satu chip filter dengan animasi collapse (kecuali reduced-motion). */
  function removeChip(f: { key: string; clear: () => void }) {
    if (reduced) {
      f.clear();
      return;
    }
    setRemovingChip(f.key);
    window.setTimeout(() => {
      f.clear();
      setRemovingChip(null);
    }, 150);
  }

  function exportCsv() {
    const header = [
      "Ticker",
      "Nama",
      "Sektor",
      "Yield (%)",
      "Yield live",
      "Div terakhir (Rp)",
      "Tahun",
      "Konsistensi",
      "Tren",
      "Ex terakhir",
      "Perkiraan berikutnya",
    ];
    const body = sorted.map((r) => [
      r.ticker,
      r.nama,
      r.sektor,
      r.displayYield != null ? r.displayYield.toFixed(2) : "",
      r.yieldFromLive ? "ya" : "tidak",
      r.lastAnnualTotal != null ? String(r.lastAnnualTotal) : "",
      r.lastYear ?? "",
      r.timing,
      r.trend,
      r.lastExDate ?? "",
      r.dormant ? "tak ada pola" : predLabel(r.nextPredDate, r.nextPredLabel),
    ]);
    const csv = [header, ...body].map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dividen-idx-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast(`CSV diunduh (${sorted.length} emiten sesuai filter).`, { tone: "success" });
    track("export_csv", { count: sorted.length });
  }

  function renderCell(col: Col, r: Row) {
    const fav = watchlist.has(r.ticker);
    switch (col.id) {
      case "emiten":
        return (
          <>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label={fav ? "Hapus dari watchlist" : "Tambah ke watchlist"}
                aria-pressed={fav}
                title={fav ? "Hapus dari watchlist" : "Tambah ke watchlist"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  watchlist.toggle(r.ticker);
                  setPopped(r.ticker);
                }}
                className={`inline-flex shrink-0 items-center justify-center transition active:scale-90 ${
                  fav ? "text-amber-400" : "text-faint hover:text-amber-400"
                }`}
              >
                <Star
                  size={14}
                  filled={fav}
                  className={popped === r.ticker ? "animate-star-pop" : ""}
                  onAnimationEnd={() => setPopped((p) => (p === r.ticker ? null : p))}
                />
              </button>
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
            <div className="truncate pl-[22px] text-xs text-muted">{r.nama}</div>
          </>
        );
      case "sektor":
        return <span className="truncate text-muted">{r.sektor}</span>;
      case "yield":
        if (loading) return <Skeleton className="h-4 w-12" />;
        return r.displayYield != null ? (
          <span className={`font-semibold tabular ${yieldColor(r.displayYield)}`}>
            {formatPersen(r.displayYield)}
            {!r.yieldFromLive && (
              <abbr
                title="Yield saat dividen terakhir dibagikan (harga live sedang tak tersedia)"
                className="ml-1 align-middle rounded bg-surface-2 px-1 text-[9px] font-medium uppercase tracking-wide text-faint no-underline"
              >
                terakhir
              </abbr>
            )}
          </span>
        ) : (
          <span className="text-faint">-</span>
        );
      case "div":
        return (
          <div className="flex flex-col items-end gap-0.5">
            <span className="tabular text-fg">
              {formatRupiah(r.lastAnnualTotal)}
              {r.lastYear ? <span className="ml-1 text-[10px] text-faint">{r.lastYear}</span> : null}
            </span>
            {r.dpsSeries.length >= 2 && (
              <Sparkline data={r.dpsSeries} className={`${sparkColor(r.dpsSeries)} transition`} />
            )}
          </div>
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

  const inputBar =
    "w-full rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-fg placeholder:text-faint";

  return (
    <div className="space-y-3">
      {/* preset cepat — satu klik untuk pandangan paling diminati */}
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5 sm:mx-0 sm:flex-wrap sm:px-0">
        {PRESETS.map((p) => {
          const active = presetActive(p);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              aria-pressed={active}
              className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition ${
                active
                  ? "border-brand/50 bg-brand/10 text-brand-strong"
                  : "border-line bg-surface text-muted hover:border-brand/40 hover:text-fg"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

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
              className={`${inputBar} pl-8`}
            />
          </div>

          {/* kontrol desktop */}
          <div className="hidden sm:contents">
            <MultiSelect
              options={sectors}
              selected={sektors}
              onChange={setSektors}
              allLabel="Semua sektor"
              className="w-44"
            />
            <input
              value={minYield}
              onChange={(e) => setMinYield(e.target.value)}
              inputMode="decimal"
              placeholder="Yield ≥ %"
              className={`${inputBar} w-24`}
            />
            <input
              value={minDiv}
              onChange={(e) => setMinDiv(e.target.value)}
              inputMode="decimal"
              placeholder="Div ≥ Rp"
              className={`${inputBar} w-24`}
            />
            <div className="relative w-36">
              <select
                value={trend}
                onChange={(e) => setTrend(e.target.value)}
                className={`${inputBar} appearance-none pr-8`}
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
            <button
              type="button"
              onClick={() => setOnlyWatchlist((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition ${
                onlyWatchlist
                  ? "border-amber-400/50 bg-amber-400/10 text-fg"
                  : "border-line bg-surface text-muted hover:text-fg"
              }`}
            >
              <Star size={15} filled={onlyWatchlist} className={onlyWatchlist ? "text-amber-400" : ""} />
              Watchlist
            </button>
          </div>

          {/* filter mobile (bottom-sheet) */}
          <MobileFilterSheet
            sectors={sectors}
            sektors={sektors}
            setSektors={setSektors}
            minYield={minYield}
            setMinYield={setMinYield}
            minDiv={minDiv}
            setMinDiv={setMinDiv}
            trend={trend}
            setTrend={setTrend}
            sortValue={`${sort.key}:${sort.dir}`}
            setSortValue={(v) => {
              const [key, dir] = v.split(":") as [SortKey, Dir];
              setSort({ key, dir });
            }}
            sortPresets={SORT_PRESETS}
            onlyWatchlist={onlyWatchlist}
            setOnlyWatchlist={setOnlyWatchlist}
            watchlistCount={watchlist.list.length}
            activeCount={activeFilters.length}
            resultCount={sorted.length}
            onReset={resetAll}
          />

          <button
            type="button"
            onClick={exportCsv}
            title="Unduh CSV (sesuai filter)"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-muted transition hover:border-brand/40 hover:text-fg sm:w-auto"
          >
            <Download size={15} /> CSV
          </button>

          <span className="inline-flex flex-wrap items-center gap-x-1.5 text-xs text-faint sm:ml-auto">
            <span className="font-medium text-muted">{sorted.length} emiten</span>
            <span aria-hidden="true">·</span>
            {loading && (
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand/60" aria-hidden="true" />
            )}
            {priceState === "ok" && (
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">{statusFull}</span>
            <span className="sm:hidden">{statusShort}</span>
          </span>
        </div>

        {/* chip filter aktif */}
        {activeFilters.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {activeFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => removeChip(f)}
                className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-line bg-surface px-2 py-0.5 text-xs text-muted transition hover:border-brand/40 hover:text-fg ${
                  removingChip === f.key ? "chip-collapsing" : ""
                }`}
              >
                {f.label}
                <span className="text-faint">×</span>
              </button>
            ))}
            <button
              type="button"
              onClick={resetAll}
              className="rounded-full px-2 py-0.5 text-xs font-medium text-brand hover:underline"
            >
              Reset semua
            </button>
            {onlyWatchlist && watchlist.list.length > 0 && (
              <button
                type="button"
                onClick={async () => {
                  const url = watchlist.shareUrl();
                  if (!url) return;
                  try {
                    await navigator.clipboard.writeText(url);
                    toast("Tautan watchlist disalin.", { tone: "success" });
                    track("share_emiten", { method: "watchlist" });
                  } catch {
                    toast("Gagal menyalin tautan.", { tone: "warn" });
                  }
                }}
                className="rounded-full border border-line px-2 py-0.5 text-xs font-medium text-muted transition hover:border-brand/40 hover:text-fg"
              >
                Bagikan watchlist
              </button>
            )}
          </div>
        )}
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<SearchX size={22} />}
          title="Tidak ada emiten yang cocok"
          description="Coba longgarkan filter atau ubah kata kunci pencarian."
          action={
            activeFilters.length > 0 ? (
              <button
                type="button"
                onClick={resetAll}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-brand transition hover:border-brand/40"
              >
                Reset filter
              </button>
            ) : null
          }
        />
      ) : (
        <>
          {/* data-grid — layar ≥ sm, fill penuh + kolom Emiten ter-pin saat scroll */}
          <div className="hidden overflow-x-auto rounded-xl border border-line bg-surface shadow-card sm:block">
            <table
              ref={tableRef}
              className="text-sm"
              style={{ width: "100%", minWidth: 860, tableLayout: "fixed" }}
            >
              <colgroup>
                {fracs.map((f, i) => (
                  <col key={i} style={{ width: `${(f * 100).toFixed(3)}%` }} />
                ))}
              </colgroup>
              <thead>
                <tr className="border-b border-line bg-surface-2 text-left text-muted">
                  {COLUMNS.map((col, idx) => {
                    const active = sort.key === col.sortKey;
                    return (
                      <th
                        key={col.id}
                        aria-sort={
                          col.sortKey
                            ? active
                              ? sort.dir === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                            : undefined
                        }
                        className={`relative select-none px-3 py-2 font-semibold ${
                          col.align === "right" ? "text-right" : ""
                        } ${idx === 0 ? "sticky left-0 z-20 border-r border-line bg-surface-2" : ""}`}
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
                    {COLUMNS.map((col, idx) => (
                      <td
                        key={col.id}
                        className={`overflow-hidden px-3 py-2 align-middle ${
                          col.align === "right" ? "text-right" : ""
                        } ${idx === 0 ? "sticky left-0 z-10 border-r border-line bg-surface group-hover:bg-surface-2" : ""}`}
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
              <MobileCard
                key={r.ticker}
                r={r}
                loading={loading}
                fav={watchlist.has(r.ticker)}
                onToggleFav={() => watchlist.toggle(r.ticker)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MobileCard({
  r,
  loading,
  fav,
  onToggleFav,
}: {
  r: EnrichedRow;
  loading: boolean;
  fav: boolean;
  onToggleFav: () => void;
}) {
  const [pop, setPop] = useState(false);
  return (
    <Link
      href={`/emiten/${r.ticker}`}
      className="block overflow-hidden rounded-xl border border-line bg-surface p-3 shadow-card transition hover:border-brand/40 active:bg-surface-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label={fav ? "Hapus dari watchlist" : "Tambah ke watchlist"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFav();
                setPop(true);
              }}
              className={`shrink-0 transition active:scale-90 ${fav ? "text-amber-400" : "text-faint"}`}
            >
              <Star
                size={15}
                filled={fav}
                className={pop ? "animate-star-pop" : ""}
                onAnimationEnd={() => setPop(false)}
              />
            </button>
            <span className="font-display font-bold text-brand-strong">{r.ticker}</span>
            <FlagIcons dormant={r.dormant} special={r.special} />
          </div>
          <div className="truncate pl-[21px] text-xs text-muted">{r.nama}</div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="text-right">
            {loading ? (
              <Skeleton className="h-5 w-14" />
            ) : (
              <div
                className={`font-display text-lg font-bold tabular ${r.displayYield != null ? yieldColor(r.displayYield) : "text-fg"}`}
              >
                {r.displayYield != null ? formatPersen(r.displayYield) : "-"}
              </div>
            )}
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
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wide text-faint">Div. terakhir</div>
          <div className="truncate tabular text-fg">
            {formatRupiah(r.lastAnnualTotal)}
            {r.lastYear ? <span className="text-faint"> · {r.lastYear}</span> : ""}
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wide text-faint">Ex terakhir</div>
          <div className="truncate text-muted">{formatTanggalSingkat(r.lastExDate)}</div>
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
