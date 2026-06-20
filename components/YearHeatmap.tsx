"use client";

import { useMemo } from "react";
import { BULAN_ID } from "@/lib/format";
import type { CalEvent } from "./CalendarView";

function intensity(count: number): string {
  if (count <= 0) return "bg-surface-2";
  if (count === 1) return "bg-brand/20";
  if (count === 2) return "bg-brand/40";
  if (count === 3) return "bg-brand/60";
  return "bg-brand/80";
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Heatmap setahun bergaya kontribusi: 12 mini-grid bulanan, intensitas warna
 * mengikuti jumlah event dividen per hari. Memakai data CalEvent yang sama
 * dengan tampilan bulanan. Klik hari berisi event untuk lompat ke bulan itu.
 */
export default function YearHeatmap({
  events,
  year,
  todayIso,
  onPickDay,
}: {
  events: CalEvent[];
  year: number;
  todayIso: string;
  onPickDay: (iso: string) => void;
}) {
  const byDate = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    const prefix = `${year}-`;
    for (const e of events) {
      if (!e.date.startsWith(prefix)) continue;
      const arr = map.get(e.date);
      if (arr) arr.push(e);
      else map.set(e.date, [e]);
    }
    return map;
  }, [events, year]);

  const yearCount = Array.from(byDate.values()).reduce((n, a) => n + a.length, 0);

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }, (_, month) => {
          const startWeekday = new Date(year, month, 1).getDay();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const cells: (number | null)[] = [];
          for (let i = 0; i < startWeekday; i++) cells.push(null);
          for (let d = 1; d <= daysInMonth; d++) cells.push(d);
          while (cells.length % 7 !== 0) cells.push(null);

          return (
            <div key={month}>
              <div className="mb-1.5 text-xs font-semibold text-fg">{BULAN_ID[month]}</div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((d, i) => {
                  if (d == null) return <div key={i} className="aspect-square" />;
                  const iso = `${year}-${pad(month + 1)}-${pad(d)}`;
                  const evs = byDate.get(iso) ?? [];
                  const count = evs.length;
                  const allPred = count > 0 && evs.every((e) => e.kind === "prediksi");
                  const isToday = iso === todayIso;
                  const ring = isToday ? "ring-1 ring-brand" : "";
                  const tone =
                    count === 0
                      ? "bg-surface-2"
                      : allPred
                        ? "border border-dashed border-violet-400 bg-violet-500/10"
                        : intensity(count);

                  if (count === 0) {
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-[3px] ${tone} ${ring}`}
                        title={`${d} ${BULAN_ID[month]} ${year}`}
                      />
                    );
                  }

                  const label = `${count} event - ${d} ${BULAN_ID[month]} ${year}`;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onPickDay(iso)}
                      aria-label={label}
                      title={label}
                      className={`aspect-square rounded-[3px] transition hover:scale-110 motion-reduce:transition-none motion-reduce:hover:scale-100 ${tone} ${ring}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {yearCount === 0 && (
        <div className="mt-3 text-center text-sm text-faint">Tidak ada event dividen di {year}.</div>
      )}

      {/* skala intensitas */}
      <div className="mt-4 flex items-center justify-end gap-1.5 text-[11px] text-muted">
        <span>sedikit</span>
        <span className="inline-block h-3 w-3 rounded-[3px] bg-surface-2" />
        <span className="inline-block h-3 w-3 rounded-[3px] bg-brand/20" />
        <span className="inline-block h-3 w-3 rounded-[3px] bg-brand/40" />
        <span className="inline-block h-3 w-3 rounded-[3px] bg-brand/60" />
        <span className="inline-block h-3 w-3 rounded-[3px] bg-brand/80" />
        <span>banyak</span>
      </div>
    </div>
  );
}
