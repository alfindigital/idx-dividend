import type { DividendEvent, Emiten } from "./types";
import { bulanID } from "./format";
import { parseISODate } from "./date";

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

// ---------- statistik bulan melingkar (circular) ----------
// Bulan itu siklik: Desember (11) & Januari (0) hanya berjarak 1 bulan, bukan 11.
// Statistik linear biasa salah menilai pembayar yang mengangkangi pergantian tahun
// sebagai "tidak teratur". Helper di bawah memetakan bulan ke sudut lingkaran.

const TAU = Math.PI * 2;

/** Rata-rata bulan melingkar (0–11, dibulatkan). */
function circularMeanMonth(months: number[]): number {
  if (months.length === 0) return 0;
  let c = 0;
  let s = 0;
  for (const m of months) {
    const a = (TAU * m) / 12;
    c += Math.cos(a);
    s += Math.sin(a);
  }
  const ang = Math.atan2(s / months.length, c / months.length);
  const m = ((ang / TAU) * 12 + 12) % 12;
  return Math.round(m) % 12;
}

/**
 * Simpangan baku bulan dalam skala "bulan", tapi dihitung melingkar.
 * 0 = selalu di bulan sama; makin besar = makin tersebar. Ambang tetap memakai
 * skala bulan (≈0.8 / ≈1.8) seperti versi linear sebelumnya.
 */
function circularMonthStd(months: number[]): number {
  if (months.length < 2) return 0;
  let c = 0;
  let s = 0;
  for (const m of months) {
    const a = (TAU * m) / 12;
    c += Math.cos(a);
    s += Math.sin(a);
  }
  c /= months.length;
  s /= months.length;
  const R = Math.min(1, Math.max(1e-9, Math.sqrt(c * c + s * s)));
  const stdRad = Math.sqrt(-2 * Math.log(R)); // simpangan baku melingkar (radian)
  return (stdRad * 12) / TAU; // konversi ke skala bulan
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
  const months = pool.map((e) => parseISODate(eventDate(e)!)!.getMonth());
  if (months.length < 2) return "Data kurang";
  const sd = circularMonthStd(months);
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
    const dates = recent.map((e) => parseISODate(eventDate(e)!)!);
    const months = dates.map((dt) => dt.getMonth());
    const m = circularMeanMonth(months); // rata-rata bulan melingkar (aman Des↔Jan)
    // hari: median hanya dari event di bulan rata-rata (±1) agar tak rata-rata
    // antar bulan berbeda; fallback ke median semua bila kosong.
    const monthDist = (a: number, b: number) =>
      Math.min((a - b + 12) % 12, (b - a + 12) % 12);
    const near = dates.filter((dt) => monthDist(dt.getMonth(), m) <= 1);
    const dayPool = (near.length ? near : dates).map((dt) => dt.getDate());
    const d = Math.round(median(dayPool));

    let year = today.getFullYear();
    let cand = new Date(year, m, Math.min(d || 15, 28));
    if (cand <= today) cand = new Date(year + 1, m, Math.min(d || 15, 28));

    const sd = circularMonthStd(months);
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

// ---------- analitik tambahan ----------

/** CAGR total DPS tahunan dari tahun pertama ke tahun terakhir (persen/tahun). */
export function dpsCagr(events: DividendEvent[]): number | null {
  const t = annualTotals(events);
  if (t.length < 2) return null;
  const first = t[0];
  const last = t[t.length - 1];
  const years = last.tahun - first.tahun;
  if (years <= 0 || first.total <= 0 || last.total <= 0) return null;
  return (Math.pow(last.total / first.total, 1 / years) - 1) * 100;
}

/** Statistik yield tercatat: rata-rata, minimum, maksimum. */
export function yieldStats(
  events: DividendEvent[],
): { avg: number; min: number; max: number; n: number } | null {
  const ys = events.map((e) => e.yield_pct).filter((y): y is number => typeof y === "number");
  if (!ys.length) return null;
  return {
    avg: ys.reduce((a, b) => a + b, 0) / ys.length,
    min: Math.min(...ys),
    max: Math.max(...ys),
    n: ys.length,
  };
}

/** Rata-rata total dividen per tahun. */
export function avgAnnualTotal(events: DividendEvent[]): number | null {
  const t = annualTotals(events);
  if (!t.length) return null;
  return t.reduce((a, b) => a + b.total, 0) / t.length;
}

/** Tahun beruntun membagikan dividen, dihitung mundur dari tahun terakhir. */
export function payingStreak(events: DividendEvent[]): number {
  const years = new Set(events.filter((e) => e.dps_idr != null).map((e) => e.tahun));
  if (!years.size) return 0;
  let y = Math.max(...years);
  let streak = 0;
  while (years.has(y)) {
    streak++;
    y--;
  }
  return streak;
}

/**
 * Yield indikatif (forward) = total DPS tahun pembayaran terakhir ÷ harga terkini.
 * Lebih stabil daripada TTM untuk pembayar tahunan (TTM bisa terbaca ~0 di celah
 * antar pembayaran). Dipakai sebagai headline alternatif.
 */
export function indicativeYield(events: DividendEvent[], price: number | null): number | null {
  if (!price || price <= 0) return null;
  const la = latestAnnual(events);
  if (!la || la.total <= 0) return null;
  return (la.total / price) * 100;
}

/** Tarif PPh final dividen orang pribadi (PP 9/2021). */
export const DIVIDEND_TAX_RATE = 0.1;

/** Yield setelah pajak final 10% (bila tak direinvestasi). */
export function afterTaxYield(yieldPct: number | null, rate: number = DIVIDEND_TAX_RATE): number | null {
  if (yieldPct == null) return null;
  return yieldPct * (1 - rate);
}

/** Bulan ex-date yang paling sering muncul (final diutamakan). */
export function favoriteExMonth(events: DividendEvent[]): string | null {
  const finals = events.filter((e) => e.tipe === "final" && eventDate(e));
  const pool = finals.length ? finals : events.filter((e) => eventDate(e));
  if (!pool.length) return null;
  const counts = new Map<number, number>();
  for (const e of pool) {
    const m = parseISODate(eventDate(e)!)!.getMonth();
    counts.set(m, (counts.get(m) ?? 0) + 1);
  }
  let best = -1;
  let bestC = 0;
  for (const [m, c] of counts) {
    if (c > bestC) {
      bestC = c;
      best = m;
    }
  }
  return best >= 0 ? bulanID(best) : null;
}
