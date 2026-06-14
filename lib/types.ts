export type DividendType = "final" | "interim" | "special";

export type Confidence = "tinggi" | "sedang" | "rendah";

export interface EmitenFlags {
  /** true bila emiten sudah berhenti membagi dividen beberapa tahun terakhir */
  dormant: boolean;
  /** true bila pernah ada special / jumbo dividend */
  special_history: boolean;
}

export interface Emiten {
  ticker: string;
  nama: string;
  sektor: string;
  papan?: string | null;
  flags: EmitenFlags;
  /** ringkasan bulan ex-date tipikal, mis. "final ~Mei, interim ~Des" */
  pola_pembayaran?: string | null;
  /** URL sumber tingkat emiten */
  sumber?: string[];
}

export interface DividendEvent {
  ticker: string;
  tahun: number;
  tipe: DividendType;
  cum_date: string | null;
  ex_date: string | null;
  record_date?: string | null;
  payment_date: string | null;
  /** dividen per lembar (Rupiah) */
  dps_idr: number | null;
  /** harga acuan saat pengumuman (untuk hitung yield), bila ada */
  harga_ref?: number | null;
  /** yield (%) saat itu bila diketahui */
  yield_pct: number | null;
  confidence?: Confidence;
  notes?: string;
  /** URL sumber per event — wajib untuk transparansi */
  sumber_url?: string[];
}

/** Harga terkini dari API (untuk yield berjalan) */
export interface LivePrice {
  ticker: string;
  price: number | null;
  currency?: string;
  ts?: number;
  ok: boolean;
}
