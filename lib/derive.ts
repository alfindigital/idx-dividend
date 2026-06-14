import type { DividendEvent, Emiten } from "./types";
import { bulanID } from "./format";

// ---------- helpers ----------

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function stddev(nums: number[]): number {
  if (nums.length < 2) return 0;
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length;
  return Math.sqrt(variance);
}

/** Tanggal acuan sebuah event: ex_date → cum_date → payment_date */
export function eventDate(e: DividendEvent): string | null {
  return e.ex_date ?? e.cum_date ?? e.payment_date ?? null;
}

export function sortByDateDesc(events: DividendEvent[]): DividendEvent[] {
  return [...events].sort((a, b) => {
    const da = eventDate(a) ?? "0000";
    const db = eventDate(b) ?? "0000";
    return db.localeCompare(da);
  });
}

// ---------- agregasi jumlah ----------

export function annualTotals(events: DividendEvent[]): { tahun: number; total: number }[] {
  const byYear = new Map<number, number>();
  for (const e of events) {
    if (e.dps_idr == null) continue;
    byYear.set(e.tahun, (byYear.get(e.tahun) ?? 0) + e.dps_idr);
  }
  return [...byYear.entries()]
    .map(([tahun, total]) => ({ tahun, total }))
    .sort((a, b) => a.tahun - b.tahun);
}

export function latestAnnual(events: DividendEvent[]): { tahun: number; total: number } | null {
  const totals = annualTotals(events);
  return totals.length ? totals[totals.length - 1] : null;
}

/** Total dividen dalam 12 bulan terakhir dari `asOf` (untuk yield berjalan / TTM) */
export function ttmDividend(events: DividendEvent[], asOf: Date = new Date()): number {
  const cutoff = new Date(asOf);
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  let sum = 0;
  for (const e of events) {
    if (e.dps_idr == null) continue;
    const d = eventDate(e);
    if (!d) continue;
    const dt = new Date(d);
    if (dt > cutoff && dt <= asOf) sum += e.dps_idr;
  }
  return sum;
}

/** Jumlah tahun (distinct) yang membagikan dividen */
export function yearsPaid(events: DividendEvent[]): number {
  return new Set(events.filter((e) => e.dps_idr != null).map((e) => e.tahun)).size;
}

// ---------- konsistensi ----------

export type TimingConsistency =
  | "Sangat teratur"
  | "Cukup teratur"
  | "Tidak teratur"
  | "Data kurang";

export function timingConsistency(events: DividendEvent[]): TimingConsistency {
  const finals = events.filter((e) => e.tipe === "final" && eventDate(e));
  const pool = finals.length >= 2 ? finals : events.filter((e) => eventDate(e));
  const months = pool.map((e) => new Date(eventDate(e)!).getMonth());
  if (months.length < 2) return "Data kurang";
  const sd = stddev(months);
  if (sd <= 0.8) return "Sangat teratur";
  if (sd <= 1.8) return "Cukup teratur";
  return "Tidak teratur";
}

export type AmountTrend = "Naik" | "Stabil" | "Turun" | "Data kurang";

export function amountTrend(events: DividendEvent[]): AmountTrend {
  const totals = annualTotals(events);
  if (totals.length < 2) return "Data kurang";
  const n = totals.length;
  const xs = totals.map((t) => t.tahun);
  const ys = totals.map((t) => t.total);
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const rel = my === 0 ? 0 : slope / my;
  if (rel > 0.05) return "Naik";
  if (rel < -0.05) return "Turun";
  return "Stabil";
}

// ---------- prediksi ----------

export interface Prediction {
  tipe: string;
  /** ISO date perkiraan (perkiraan, bukan kepastian) */
  perkiraan: string;
  bulanLabel: string;
  confidence: "tinggi" | "sedang" | "rendah";
}

/**
 * Prediksi tanggal ex-dividend berikutnya berbasis pola musiman 5 tahun.
 * - Emiten dormant: tidak diprediksi (kembalikan []).
 * - Special dividend: tidak diprediksi.
 * - Hanya tanggal, bukan jumlah.
 */
export function predictNext(
  events: DividendEvent[],
  emiten: Emiten,
  today: Date = new Date(),
): Prediction[] {
  if (emiten.flags.dormant) return [];

  const byTipe = new Map<string, DividendEvent[]>();
  for (const e of events) {
    if (!eventDate(e)) continue;
    if (e.tipe === "special") continue;
    const arr = byTipe.get(e.tipe) ?? [];
    arr.push(e);
    byTipe.set(e.tipe, arr);
  }

  const preds: Prediction[] = [];
  for (const [tipe, arr] of byTipe) {
    const recent = arr.filter((e) => e.tahun >= today.getFullYear() - 5);
    if (recent.length < 1) continue;
    const months = recent.map((e) => new Date(eventDate(e)!).getMonth());
    const days = recent.map((e) => new Date(eventDate(e)!).getDate());
    const m = Math.round(median(months));
    const d = Math.round(median(days));

    let year = today.getFullYear();
    let cand = new Date(year, m, Math.min(d || 15, 28));
    if (cand <= today) cand = new Date(year + 1, m, Math.min(d || 15, 28));

    const sd = stddev(months);
    const conf: Prediction["confidence"] =
      recent.length >= 3 && sd <= 1 ? "tinggi" : recent.length >= 2 && sd <= 2 ? "sedang" : "rendah";

    preds.push({
      tipe,
      perkiraan: cand.toISOString().slice(0, 10),
      bulanLabel: bulanID(m),
      confidence: conf,
    });
  }
  return preds.sort((a, b) => a.perkiraan.localeCompare(b.perkiraan));
}

// ---------- yield berjalan ----------

/** Yield TTM berjalan = dividen 12 bulan terakhir / harga terkini × 100 */
export function runningYield(events: DividendEvent[], price: number | null, asOf?: Date): number | null {
  if (!price || price <= 0) return null;
  const ttm = ttmDividend(events, asOf);
  if (ttm <= 0) return null;
  return (ttm / price) * 100;
}
