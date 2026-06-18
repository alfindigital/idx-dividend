"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BULAN_ID, HARI_ID_SINGKAT } from "@/lib/format";

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

  const firstDay = new Date(y, m, 1);
  const startWeekday = firstDay.getDay(); // 0=Min
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

  const monthHasEvents = events.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === y && d.getMonth() === m;
  }).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => shift(-1)}
          className="rounded-lg border border-line px-3 py-1 text-sm text-fg transition hover:bg-surface-2"
        >
          ← Sebelumnya
        </button>
        <div className="text-center">
          <div className="text-lg font-semibold text-fg">
            {BULAN_ID[m]} {y}
          </div>
          <button onClick={goToday} className="text-xs text-brand hover:underline">
            ke bulan ini
          </button>
        </div>
        <button
          onClick={() => shift(1)}
          className="rounded-lg border border-line px-3 py-1 text-sm text-fg transition hover:bg-surface-2"
        >
          Berikutnya →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-faint">
        {HARI_ID_SINGKAT.map((h) => (
          <div key={h}>{h}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d == null)
            return <div key={i} className="min-h-[64px] rounded-lg bg-surface-2/40" />;
          const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const evs = byDate.get(iso) ?? [];
          const isToday = iso === todayIso;
          return (
            <div
              key={i}
              className={`min-h-[64px] rounded-lg border p-1 ${
                isToday ? "border-brand bg-brand/10" : "border-line bg-surface"
              }`}
            >
              <div className="text-[11px] text-faint">{d}</div>
              <div className="mt-0.5 space-y-0.5">
                {evs.slice(0, 4).map((e, j) => (
                  <Link
                    key={j}
                    href={`/emiten/${e.ticker}`}
                    title={`${e.ticker} — ${e.tipe} (${e.kind})`}
                    className={`block truncate rounded px-1 text-[10px] leading-tight ${
                      e.kind === "prediksi"
                        ? "border border-dashed border-amber-400 text-amber-700 dark:text-amber-300"
                        : "bg-brand/10 text-brand-strong"
                    }`}
                  >
                    {e.ticker}
                    {e.kind === "prediksi" ? " ?" : ""}
                  </Link>
                ))}
                {evs.length > 4 && (
                  <div className="text-[10px] text-faint">+{evs.length - 4} lagi</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {monthHasEvents === 0 && (
        <p className="text-center text-sm text-faint">Tidak ada event dividen di bulan ini.</p>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-brand/20" /> ex-date historis
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border border-dashed border-amber-400" />{" "}
          perkiraan (tanda ?)
        </span>
      </div>
    </div>
  );
}
