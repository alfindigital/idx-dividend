import { dividendList, emitenList } from "./data";
import { eventDate } from "./derive";
import { parseISODate, toISODate } from "./date";

/**
 * Tanggal kurasi data terakhir (di-bump manual saat `data/*.json` diperbarui).
 * Ditampilkan sebagai "Data diperbarui …" untuk transparansi kesegaran.
 * NOTE untuk kurator: perbarui konstanta ini setiap kali menambah/mengoreksi data.
 */
export const DATA_UPDATED = "2026-06-17";

export interface DataMeta {
  /** Tanggal kurasi data terakhir (ISO). */
  updated: string;
  /** Tanggal event paling akhir yang tercatat di dataset (ISO) — cakupan data. */
  latestEvent: string | null;
  /** Tahun pembayaran paling awal & paling akhir di dataset. */
  minYear: number | null;
  maxYear: number | null;
  emitenCount: number;
  eventCount: number;
}

let cached: DataMeta | null = null;

export function getDataMeta(): DataMeta {
  if (cached) return cached;
  let latest: string | null = null;
  let minYear: number | null = null;
  let maxYear: number | null = null;
  for (const d of dividendList) {
    if (typeof d.tahun === "number") {
      minYear = minYear == null ? d.tahun : Math.min(minYear, d.tahun);
      maxYear = maxYear == null ? d.tahun : Math.max(maxYear, d.tahun);
    }
    const iso = eventDate(d);
    if (iso && (latest == null || iso > latest)) latest = iso;
  }
  cached = {
    updated: DATA_UPDATED,
    latestEvent: latest,
    minYear,
    maxYear,
    emitenCount: emitenList.length,
    eventCount: dividendList.length,
  };
  return cached;
}

/** "17 Jun 2026" dari ISO, ringkas untuk badge. */
export function formatShortID(iso: string | null): string {
  const d = parseISODate(iso);
  if (!d) return "-";
  const bulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

export { toISODate };
