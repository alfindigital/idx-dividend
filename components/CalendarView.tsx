"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BULAN_ID, HARI_ID_SINGKAT } from "@/lib/format";
import { ChevronLeft, ChevronRight } from "./ui/icons";

export interface CalEvent {
  date: string; // ISO YYYY-MM-DD
  ticker: string;
  tipe: string;
  kind: "historis" | "prediksi";
}

export default function CalendarView({
  events,
  initialYear,
  initialMonth,
  todayIso,
}: {
  events: CalEvent[];
  initialYear: number;
  initialMonth: number; // 0-11
  todayIso: string;
}) {
  const [y, setY] = useState(initialYear);
  const [m, setM] = useState(initialMonth);

  const byDate = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    for (const e of events) {
      const arr = map.get(e.date);
      if (arr) arr.push(e);
      else map.set(e.date, [e]);
    }
    return map;
  }, [events]);

  const startWeekday = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function shift(delta: number) {
    let nm = m + delta;
    let ny = y;
    while (nm < 0) {
      nm += 12;
      ny -= 1;
    }
    while (nm > 11) {
      nm -= 12;
      ny += 1;
    }
    setM(nm);
    setY(ny);
  }

  function goToday() {
    const t = new Date(todayIso);
    setY(t.getFullYear());
    setM(t.getMonth());
  }

  const monthCount = events.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === y && d.getMonth() === m;
  }).length;

  const navBtn =
    "inline-flex h-9 w-9 items-center justify-center rounded-md border border-line text-muted transition hover:border-brand/40 hover:text-fg";

  return (
    <div className="rounded-xl border border-line bg-surface p-3 shadow-card sm:p-4">
      {/* nav bulan */}
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => shift(-1)} aria-label="Bulan sebelumnya" className={navBtn}>
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="font-display text-lg font-semibold text-fg sm:text-xl">
            {BULAN_ID[m]} <span className="text-muted">{y}</span>
          </h2>
          <button
            onClick={goToday}
            className="rounded-md border border-line px-2 py-0.5 text-xs text-muted transition hover:border-brand/40 hover:text-brand"
          >
            Hari ini
          </button>
        </div>
        <button onClick={() => shift(1)} aria-label="Bulan berikutnya" className={navBtn}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* hari */}
      <div className="grid grid-cols-7 gap-1.5">
        {HARI_ID_SINGKAT.map((h, i) => (
          <div
            key={h}
            className={`pb-1 text-center text-[11px] font-semibold uppercase tracking-wide ${
              i === 0 ? "text-rose-400" : "text-faint"
            }`}
          >
            {h}
          </div>
        ))}

        {cells.map((d, i) => {
          if (d == null) return <div key={i} className="min-h-[78px] rounded-lg" />;
          const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const evs = byDate.get(iso) ?? [];
          const isToday = iso === todayIso;
          const weekend = i % 7 === 0;
          return (
            <div
              key={i}
              className={`flex min-h-[78px] flex-col gap-1 rounded-lg border p-1.5 transition ${
                isToday
                  ? "border-brand bg-brand/5"
                  : "border-line bg-surface hover:border-brand/30"
              }`}
            >
              <div
                className={`flex h-5 w-5 items-center justify-center self-start rounded-full text-[11px] font-semibold ${
                  isToday
                    ? "bg-brand text-white"
                    : weekend
                      ? "text-rose-400"
                      : "text-faint"
                }`}
              >
                {d}
              </div>
              <div className="flex flex-col gap-0.5">
                {evs.slice(0, 3).map((e, j) => (
                  <Link
                    key={j}
                    href={`/emiten/${e.ticker}`}
                    title={`${e.ticker} · ${e.tipe} (${e.kind})`}
                    className={`truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight transition ${
                      e.kind === "prediksi"
                        ? "border border-dashed border-violet-400 text-violet-600 hover:bg-violet-500/10 dark:text-violet-300"
                        : "bg-brand/15 text-brand-strong hover:bg-brand/25"
                    }`}
                  >
                    {e.ticker}
                    {e.kind === "prediksi" ? " ?" : ""}
                  </Link>
                ))}
                {evs.length > 3 && (
                  <div className="px-1 text-[10px] text-faint">+{evs.length - 3} lagi</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* legenda */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 text-xs text-muted">
        {monthCount === 0 && <span className="text-faint">Tidak ada event dividen bulan ini.</span>}
        <span className="ml-auto flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-brand/25" /> ex-date historis
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-dashed border-violet-400" />{" "}
          perkiraan (tanda ?)
        </span>
      </div>
    </div>
  );
}
