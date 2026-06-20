"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { ConsistencyBadge, TrendBadge } from "./Badges";
import { Search, X, ArrowUpRight, Layers } from "./ui/icons";
import { Skeleton } from "./ui/Skeleton";
import EmptyState from "./ui/EmptyState";
import { formatPersen, formatRupiah } from "@/lib/format";

export interface CompareEmiten {
  ticker: string;
  nama: string;
  sektor: string;
  ttm: number;
  lastYield: number | null;
  lastAnnualTotal: number | null;
  lastYear: number | null;
  cagr: number | null;
  timing: string;
  trend: string;
  streak: number;
  favMonth: string | null;
  yearsPaid: number;
  dpsSeries: { tahun: number; total: number }[];
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e"];
const MAX = 4;

export default function CompareView({ all }: { all: CompareEmiten[] }) {
  const byTicker = useMemo(() => Object.fromEntries(all.map((e) => [e.ticker, e])), [all]);
  const [selected, setSelected] = useState<string[]>([]);
  const [prices, setPrices] = useState<Record<string, number | null>>({});
  const [priceLoading, setPriceLoading] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("t");
    if (t) {
      const arr = t
        .split(",")
        .map((x) => x.trim().toUpperCase())
        .filter((x) => byTicker[x]);
      setSelected(Array.from(new Set(arr)).slice(0, MAX));
    }
  }, [byTicker]);

  function setSel(next: string[]) {
    setSelected(next);
    const url = next.length ? `/banding?t=${next.join(",")}` : "/banding";
    window.history.replaceState(null, "", url);
  }
  function add(t: string) {
    if (selected.includes(t) || selected.length >= MAX) return;
    setSel([...selected, t]);
    setQ("");
  }
  function remove(t: string) {
    setSel(selected.filter((x) => x !== t));
  }

  useEffect(() => {
    if (!selected.length) return;
    // hanya tampilkan skeleton bila ada emiten terpilih yang harganya belum dimuat
    const needFetch = selected.some((t) => !(t in prices));
    if (needFetch) setPriceLoading(true);
    let alive = true;
    fetch(`/api/price?tickers=${selected.join(",")}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        const m: Record<string, number | null> = {};
        for (const p of d.prices ?? []) m[p.ticker] = p.price;
        setPrices((prev) => ({ ...prev, ...m }));
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setPriceLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const chosen = selected.map((t) => byTicker[t]).filter(Boolean) as CompareEmiten[];

  const suggestions = q
    ? all
        .filter((e) => !selected.includes(e.ticker))
        .filter((e) => (e.ticker + " " + e.nama).toLowerCase().includes(q.toLowerCase()))
        .slice(0, 6)
    : [];

  function runningYield(e: CompareEmiten): number | null {
    const price = prices[e.ticker];
    if (price && e.ttm > 0) return (e.ttm / price) * 100;
    return e.lastYield;
  }

  const years = Array.from(new Set(chosen.flatMap((e) => e.dpsSeries.map((d) => d.tahun)))).sort();
  const chartData = years.map((y) => {
    const row: Record<string, number | null> = { tahun: y };
    for (const e of chosen) row[e.ticker] = e.dpsSeries.find((d) => d.tahun === y)?.total ?? null;
    return row;
  });

  const rows: { label: string; render: (e: CompareEmiten) => React.ReactNode }[] = [
    { label: "Sektor", render: (e) => <span className="text-muted">{e.sektor}</span> },
    {
      label: "Yield berjalan",
      render: (e) => {
        if (priceLoading && !(e.ticker in prices)) return <Skeleton className="h-4 w-12" />;
        const y = runningYield(e);
        return y != null ? (
          <span className="font-semibold tabular text-fg">{formatPersen(y)}</span>
        ) : (
          <span className="text-faint">-</span>
        );
      },
    },
    {
      label: "Div. terakhir",
      render: (e) => (
        <span className="tabular text-fg">
          {formatRupiah(e.lastAnnualTotal)}
          {e.lastYear ? <span className="ml-1 text-[10px] text-faint">{e.lastYear}</span> : null}
        </span>
      ),
    },
    {
      label: "Pertumbuhan DPS",
      render: (e) =>
        e.cagr != null ? (
          <span
            className={`tabular font-medium ${e.cagr > 0 ? "text-emerald-600 dark:text-emerald-400" : e.cagr < 0 ? "text-rose-600 dark:text-rose-400" : "text-fg"}`}
          >
            {e.cagr >= 0 ? "+" : ""}
            {formatPersen(e.cagr)}/th
          </span>
        ) : (
          <span className="text-faint">-</span>
        ),
    },
    { label: "Konsistensi", render: (e) => <ConsistencyBadge value={e.timing} /> },
    { label: "Tren jumlah", render: (e) => <TrendBadge value={e.trend} /> },
    { label: "Beruntun bagi", render: (e) => <span className="text-fg">{e.streak} tahun</span> },
    { label: "Bulan ex favorit", render: (e) => <span className="text-fg">{e.favMonth ?? "-"}</span> },
    { label: "Tahun membagikan", render: (e) => <span className="text-fg">{e.yearsPaid} tahun</span> },
  ];

  return (
    <div className="space-y-5">
      {/* picker */}
      <div>
        <div className="relative max-w-md">
          <Search
            size={15}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              selected.length >= MAX ? `Maksimal ${MAX} emiten` : "Tambah emiten untuk dibandingkan…"
            }
            disabled={selected.length >= MAX}
            className="w-full rounded-lg border border-line bg-surface py-2 pl-8 pr-3 text-sm text-fg placeholder:text-faint disabled:opacity-60"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-line bg-surface shadow-card">
              {suggestions.map((e) => (
                <button
                  key={e.ticker}
                  type="button"
                  onClick={() => add(e.ticker)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-surface-2"
                >
                  <span>
                    <span className="font-semibold text-brand-strong">{e.ticker}</span>{" "}
                    <span className="text-muted">{e.nama}</span>
                  </span>
                  <span className="shrink-0 text-xs text-faint">{e.sektor}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {chosen.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {chosen.map((e, i) => (
              <span
                key={e.ticker}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2 py-0.5 text-xs"
              >
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />
                <span className="font-medium text-fg">{e.ticker}</span>
                <button
                  type="button"
                  onClick={() => remove(e.ticker)}
                  aria-label={`Hapus ${e.ticker}`}
                  className="text-faint hover:text-rose-500"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {chosen.length === 0 ? (
        <EmptyState
          icon={<Layers size={22} />}
          title="Belum ada emiten dipilih"
          description="Pilih 2-4 emiten di atas untuk membandingkan yield, konsistensi, tren, dan riwayat DPS berdampingan."
        />
      ) : (
        <>
          {/* kartu banding — layar < sm (tabel sempit di hp) */}
          <div className="grid gap-2.5 sm:hidden">
            {chosen.map((e, i) => (
              <div
                key={e.ticker}
                className="overflow-hidden rounded-xl border border-line bg-surface shadow-card"
              >
                <div
                  className="flex items-center justify-between gap-2 border-l-4 px-3 py-2"
                  style={{ borderColor: COLORS[i] }}
                >
                  <Link
                    href={`/emiten/${e.ticker}`}
                    className="inline-flex items-center gap-1 font-display font-bold hover:underline"
                    style={{ color: COLORS[i] }}
                  >
                    {e.ticker}
                    <ArrowUpRight size={13} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(e.ticker)}
                    aria-label={`Hapus ${e.ticker}`}
                    className="text-faint transition hover:text-rose-500"
                  >
                    <X size={15} />
                  </button>
                </div>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5 px-3 py-3 text-sm">
                  {rows.map((row) => (
                    <div key={row.label} className="min-w-0">
                      <dt className="text-[11px] uppercase tracking-wide text-faint">{row.label}</dt>
                      <dd className="mt-0.5">{row.render(e)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          {/* tabel banding — layar >= sm */}
          <div className="hidden overflow-x-auto rounded-xl border border-line bg-surface shadow-card sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-2">
                  <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-faint">
                    Metrik
                  </th>
                  {chosen.map((e, i) => (
                    <th key={e.ticker} className="px-3 py-2 text-left">
                      <Link
                        href={`/emiten/${e.ticker}`}
                        className="inline-flex items-center gap-1 font-display font-bold hover:underline"
                        style={{ color: COLORS[i] }}
                      >
                        {e.ticker}
                        <ArrowUpRight size={12} />
                      </Link>
                      <div className="max-w-[160px] truncate text-[11px] font-normal text-muted">
                        {e.nama}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-line/70 last:border-0">
                    <td className="whitespace-nowrap px-3 py-2 text-xs font-medium text-faint">
                      {row.label}
                    </td>
                    {chosen.map((e) => (
                      <td key={e.ticker} className="px-3 py-2 align-middle">
                        {row.render(e)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* grafik riwayat DPS */}
          {chartData.length > 0 && (
            <div>
              <h2 className="mb-2 font-display text-lg font-semibold text-fg">
                Riwayat DPS per tahun (Rp)
              </h2>
              <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                      <XAxis
                        dataKey="tahun"
                        tick={{ fontSize: 12, fill: "var(--chart-axis)" }}
                        tickLine={{ stroke: "var(--chart-grid)" }}
                        axisLine={{ stroke: "var(--chart-grid)" }}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "var(--chart-axis)" }}
                        tickLine={{ stroke: "var(--chart-grid)" }}
                        axisLine={{ stroke: "var(--chart-grid)" }}
                        width={46}
                        tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgb(var(--surface))",
                          border: "1px solid rgb(var(--border))",
                          borderRadius: 12,
                          color: "rgb(var(--fg))",
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "rgb(var(--muted))" }}
                        formatter={(val: number) => "Rp " + val.toLocaleString("id-ID")}
                        labelFormatter={(l) => `Tahun ${l}`}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      {chosen.map((e, i) => (
                        <Line
                          key={e.ticker}
                          type="monotone"
                          dataKey={e.ticker}
                          stroke={COLORS[i]}
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
